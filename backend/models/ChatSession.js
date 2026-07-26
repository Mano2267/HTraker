import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "New Session" },
    reportText: { type: String, default: "" },
    reportSource: { type: String, enum: ["upload", "sample"], default: "upload" },
    patientInfo: { type: mongoose.Schema.Types.Mixed, default: null },
    analysis: { type: String, default: "" },
    // RAG vector store for this session's report, replaces the per-session FAISS index
    chunks: { type: [chunkSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("ChatSession", chatSessionSchema);
