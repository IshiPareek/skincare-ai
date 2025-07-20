import { NextRequest } from "next/server";
import { ChromaClient } from "chromadb";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response("Missing or invalid 'query' field", { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return new Response("Missing OpenAI API key", { status: 500 });
    }

    // Generate embedding using OpenAI API
    const embeddingRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input: query,
      }),
    });

    if (!embeddingRes.ok) {
      const errText = await embeddingRes.text();
      return new Response(`OpenAI error: ${errText}`, { status: 500 });
    }

    const embeddingData = await embeddingRes.json();
    const embedding = embeddingData.data?.[0]?.embedding;
    if (!embedding) {
      return new Response("Failed to generate embedding", { status: 500 });
    }

    // Connect to remote ChromaDB
    const chroma = new ChromaClient({
      path: "https://your-chroma.onrender.com", // Replace with your actual ChromaDB URL
    });

    // Get the collection (assume 'skincare-products')
    const collection = await chroma.getCollection({
      name: "skincare-products",
    });

    // Query for similar products
    const results = await collection.query({
      queryEmbeddings: [embedding],
      nResults: 3,
    });

    // Format the results
    const matches = (results.documents?.[0] || []).map((doc: any, i: number) => ({
      document: doc,
      metadata: results.metadatas?.[0]?.[i] || null,
      distance: results.distances?.[0]?.[i] || null,
    }));

    return Response.json({ matches });
  } catch (err: any) {
    console.error("❌ Chroma search error:", err);
    return new Response("Unexpected error", { status: 500 });
  }
} 