import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  console.log("📨 User message:", message);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response("Missing OpenAI API key", { status: 500 });
  }

  // Paths to data files
  const productDataPath = path.join(
    process.cwd(),
    "src",
    "data",
    "skincare_products_100.json"
  );
  const maskDataPath = path.join(
    process.cwd(),
    "src",
    "data",
    "skincare_masks.json"
  );
  const supplementDataPath = path.join(
    process.cwd(),
    "src",
    "data",
    "skincare_supplements.json"
  );

  let products = [],
    masks = [],
    supplements = [];

  try {
    const rawProducts = fs.readFileSync(productDataPath, "utf-8");
    products = JSON.parse(rawProducts).slice(0, 15);

    const rawMasks = fs.readFileSync(maskDataPath, "utf-8");
    masks = JSON.parse(rawMasks);

    const rawSupplements = fs.readFileSync(supplementDataPath, "utf-8");
    supplements = JSON.parse(rawSupplements);
  } catch (err) {
    console.error("❌ Failed to load skincare data:", err);
    return new Response("Failed to load skincare data", { status: 500 });
  }

  // Create summaries
  const productSummaries = products
    .map((p: any, i: number) => {
      return `Product ${i + 1}: ${p.product_name} (${p.brand_name})\n![${
        p.product_name
      }](${p.image})\nIngredients: ${p.ingredients.join(
        ", "
      )}\nRecommended use: ${p.recommended_use}`;
    })
    .join("\n\n");

  const maskSummaries = masks
    .map(
      (m: any, i: number) =>
        `Mask ${i + 1}: ${m.name} (${
          m.brand
        })\nIngredients: ${m.ingredients.join(
          ", "
        )}\nSkin types: ${m.skin_types.join(", ")}\nHow to use: ${m.how_to_use}`
    )
    .join("\n\n");

  const supplementSummaries = supplements
    .map(
      (s: any, i: number) =>
        `Supplement ${i + 1}: ${s.name} (${
          s.brand
        })\nBenefits: ${s.benefits.join(", ")}\nHow to use: ${s.how_to_use}`
    )
    .join("\n\n");

  // System prompt
  const systemBase = fs.readFileSync(
    path.join(process.cwd(), "systemPrompt.txt"),
    "utf-8"
  );

  const systemPrompt = `
${systemBase}

You are an expert skincare assistant. You will recommend a short, highly personalized morning and night routine (1–2 products each), one suitable mask, one helpful supplement, and a brief diet/lifestyle tip.
You are highly empathetic when they mention their concerns, just mention 1 line.

Always follow these guidelines:

- Only recommend products, masks, and supplements from the provided lists.
- If the user asks a general question (like "what skincare should I use"), ask gentle follow-up questions about their skin type, concerns, and goals.
- If they mention specific symptoms or goals, suggest 1 product option per category with:
  - Name
  - Image (just the URL)
  - Key ingredients
- Avoid mentioning how to use 
- Avoid scientific jargon unless specifically asked
- When mentioning ingredients, briefly explain what they do in plain terms (1 line max) like "soothes irritation"
- Always explain why chose the products for them (1–2 thoughtful lines).
- Reframe the user's concern or goal in a compassionate and simple way.
- Avoid overwhelming users. Build trust with light, human conversation.
- Do not offer medical advice. Stick to product-based, lifestyle-based guidance.

Output Format:

1. Reframe the user's concern or goal (1–2 thoughtful, caring lines)
2. Suggest 1 product for each category:
   - Morning routine (1–2 products)
   - Evening routine (1–2 products)
   - 1 Mask
   - 1 Supplement
   - 1 Diet or lifestyle tip
3. For each, include:
   - Product name
   - Key ingredients

Use the following product data:

--- PRODUCTS ---
${productSummaries}

--- MASKS ---
${maskSummaries}

--- SUPPLEMENTS ---
${supplementSummaries}

In the end, mention a short reason why it fits their concern or lifestyle
`;

  // OpenAI API call
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    }),
  });

  const data = await res.json();
  const reply =
    data.choices?.[0]?.message?.content || "Sorry, I didn't understand that.";
  console.log("💬 AI reply:", reply);

  return Response.json({ reply });
}
