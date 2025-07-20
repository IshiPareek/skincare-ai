import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document } from "@langchain/core/documents";

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const productDataPath = path.join(
  process.cwd(),
  "src",
  "data",
  "products.json"
);

async function run() {
  const raw = fs.readFileSync(productDataPath, "utf-8");
  const products = JSON.parse(raw);

  const docs: Document[] = products.map((p: any) => {
    const content = `${p.name}\nIngredients: ${
      p.ingredients?.join(", ") || "N/A"
    }\nConcerns: ${p.concerns?.join(", ") || "N/A"}\nHow to use: ${
      p.how_to_use || "N/A"
    }`;
    return new Document({ pageContent: content, metadata: p });
  });

  const vectorStore = await Chroma.fromDocuments(docs, new OpenAIEmbeddings(), {
    collectionName: "skincare-products",
  });

  const query = "I have oily skin and breakouts. What should I use?";
  const results = await vectorStore.similaritySearch(query, 3);

  console.log("🧠 Query:", query);
  console.log("\n🔍 Top Results:\n");
  results.forEach((doc, i) => {
    console.log(`Result ${i + 1}:\n${doc.pageContent}\n`);
  });
}

run();
