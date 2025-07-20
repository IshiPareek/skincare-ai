import chromadb
import os

CHROMA_URL = "https://skincare-ai-tceg.onrender.com"
COLLECTION_NAME = "skincare-products"

# Connect to remote ChromaDB
client = chromadb.HttpClient(host=CHROMA_URL, ssl=True)

try:
    client.create_collection(COLLECTION_NAME)
    print(f"✅ Created collection '{COLLECTION_NAME}' on {CHROMA_URL}")
except Exception as e:
    print(f"⚠️  Could not create collection (it may already exist): {e}") 