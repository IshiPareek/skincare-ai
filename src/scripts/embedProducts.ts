import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { ChromaClient } from "chromadb";
import { v4 as uuidv4 } from "uuid";

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const DATA_DIR = path.join(process.cwd(), "src", "data");
const CHROMA_URL = "https://your-chroma.onrender.com";
const COLLECTION_NAME = "skincare-products";
const BATCH_SIZE = 32;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY in .env.local");
  process.exit(1);
}

async function getAllProductFiles() {
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith("products.json"))
    .map((f) => path.join(DATA_DIR, f));
}

function buildDescription(p: any) {
  return `${p.name || "Unnamed"}\nIngredients: ${(p.ingredients || []).join(", ") || "N/A"}\nConcerns: ${(p.concerns || []).join(", ") || "N/A"}\nHow to use: ${p.how_to_use || "N/A"}`;
}

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-ada-002",
      input: text,
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI error: ${await res.text()}`);
  }
  const data = await res.json();
  return data.data?.[0]?.embedding;
}

async function main() {
  const files = await getAllProductFiles();
  let allProducts: any[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, "utf-8");
      const products = JSON.parse(raw);
      allProducts.push(...products.map((p: any, i: number) => ({ ...p, _file: path.basename(file), _idx: i })));
    } catch (err) {
      console.error(`❌ Failed to load ${file}:`, err);
    }
  }
  console.log(`Loaded ${allProducts.length} products from ${files.length} files.`);

  // Connect to ChromaDB
  const chroma = new ChromaClient({ path: CHROMA_URL });
  let collection;
  try {
    collection = await chroma.getCollection({ name: COLLECTION_NAME });
    console.log(`Found existing collection: ${COLLECTION_NAME}`);
  } catch (err) {
    console.warn(`Collection '${COLLECTION_NAME}' not found, creating it...`);
    try {
      collection = await chroma.createCollection({ name: COLLECTION_NAME });
      console.log(`Created collection: ${COLLECTION_NAME}`);
    } catch (createErr) {
      console.error("❌ Failed to create Chroma collection:", createErr);
      process.exit(1);
    }
  }

  // Prepare batches
  for (let i = 0; i < allProducts.length; i += BATCH_SIZE) {
    const batch = allProducts.slice(i, i + BATCH_SIZE);
    const ids = batch.map((p) => `${p._file.replace(/\.json$/, "")}_${p._idx}`);
    const descriptions = batch.map(buildDescription);
    let embeddings: number[][] = [];
    try {
      // Batch embedding (OpenAI API supports batching)
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-ada-002",
          input: descriptions,
        }),
      });
      if (!res.ok) throw new Error(`OpenAI error: ${await res.text()}`);
      const data = await res.json();
      embeddings = data.data.map((d: any) => d.embedding);
    } catch (err) {
      console.error(`❌ Embedding batch ${i / BATCH_SIZE + 1} failed:`, err);
      continue;
    }
    const metadatas = batch.map((p) => ({
      name: p.name || null,
      ingredients: p.ingredients || [],
      concerns: p.concerns || [],
      how_to_use: p.how_to_use || null,
    }));
    try {
      await collection.add({
        ids,
        embeddings,
        documents: descriptions,
        metadatas,
      });
      console.log(`✅ Uploaded batch ${i / BATCH_SIZE + 1} (${ids.length} products)`);
    } catch (err) {
      console.error(`❌ Chroma upload batch ${i / BATCH_SIZE + 1} failed:`, err);
    }
  }
  console.log("🎉 All products uploaded to ChromaDB!");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
