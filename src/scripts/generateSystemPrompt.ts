import fs from "fs";
import path from "path";

// Paths
const productPath = path.join(__dirname, "../data/skincare_products_100.json");
const maskPath = path.join(__dirname, "../data/skincare_masks.json");
const supplementPath = path.join(
  __dirname,
  "../data/skincare_supplements.json"
);
const basePromptPath = path.join(__dirname, "../systemPrompt.txt"); // optional
const outputPath = path.join(process.cwd(), "systemPrompt.txt");

// Load base
const systemBase = fs.existsSync(basePromptPath)
  ? fs.readFileSync(basePromptPath, "utf-8")
  : "";

// Load JSON files
if (
  !fs.existsSync(productPath) ||
  !fs.existsSync(maskPath) ||
  !fs.existsSync(supplementPath)
) {
  console.error("❌ Missing data file(s)");
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(productPath, "utf-8")).slice(0, 15);
const masks = JSON.parse(fs.readFileSync(maskPath, "utf-8")).slice(0, 5);
const supplements = JSON.parse(fs.readFileSync(supplementPath, "utf-8")).slice(
  0,
  5
);

// Build summaries
const productSummaries = products
  .map((p: any, i: number) => {
    return `Product ${i + 1}: ${p.product_name} (${p.brand_name})\nImage: ${
      p.image
    }\nIngredients: ${p.ingredients.join(", ")}\nRecommended use: ${
      p.recommended_use
    }`;
  })
  .join("\n\n");

const maskSummaries = masks
  .map((m: any, i: number) => {
    return `Mask ${i + 1}: ${m.name} (${
      m.brand
    })\nIngredients: ${m.ingredients.join(
      ", "
    )}\nSkin types: ${m.skin_types.join(", ")}\nHow to use: ${m.how_to_use}`;
  })
  .join("\n\n");

const supplementSummaries = supplements
  .map((s: any, i: number) => {
    return `Supplement ${i + 1}: ${s.name} (${
      s.brand
    })\nBenefits: ${s.benefits.join(", ")}\nHow to use: ${s.how_to_use}`;
  })
  .join("\n\n");

// Final system prompt
const systemPrompt = `
${systemBase}

You are an expert skincare assistant. You will recommend a short, highly personalized morning and night routine (1–2 products each), one suitable mask, one helpful supplement, and a brief diet/lifestyle tip.
You are highly empathetic when they mention their concerns, just mention 1 line.

Always follow these guidelines:

- Only recommend products, masks, and supplements from the provided lists.
- If the user asks a general question (like "what skincare should I use"), ask gentle follow-up questions about their skin type, concerns, and goals.
- If they mention specific symptoms or goals, suggest 1 product option per category with:
  - Name
  - Product image using Markdown format: ![Product Name](Image URL)
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

fs.writeFileSync(outputPath, systemPrompt.trim(), "utf-8");
console.log(`✅ System prompt saved to ${outputPath}`);
