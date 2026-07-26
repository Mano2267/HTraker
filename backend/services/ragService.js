import { pipeline } from "@xenova/transformers";
import { chunkText } from "../utils/pdfExtractor.js";

let embedderPromise = null;

// Lazily load the embedding model once and reuse it (all-MiniLM-L6-v2, same model
// used by the original app's HuggingFace embeddings).
const getEmbedder = () => {
  if (!embedderPromise) {
    embedderPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedderPromise;
};

const embed = async (text) => {
  const embedder = await getEmbedder();
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
};

/**
 * Splits report text into chunks and embeds each one.
 * Returns an array of { text, embedding } ready to store on the ChatSession document,
 * functioning as this session's vector store (replacing the per-session FAISS index).
 */
export const buildVectorStore = async (reportText) => {
  const chunks = chunkText(reportText);
  const results = [];
  for (const chunk of chunks) {
    const embedding = await embed(chunk);
    results.push({ text: chunk, embedding });
  }
  return results;
};

const cosineSimilarity = (a, b) => {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
};

/**
 * Retrieves the top-k most relevant chunks for a query against a session's stored chunks.
 */
export const retrieveRelevantChunks = async (chunks, query, k = 4) => {
  if (!chunks || chunks.length === 0) return [];
  const queryEmbedding = await embed(query);
  const scored = chunks.map((c) => ({
    text: c.text,
    score: cosineSimilarity(c.embedding, queryEmbedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map((s) => s.text);
};
