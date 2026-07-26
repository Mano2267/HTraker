export const APP_NAME = "HIA (Health Insights Agent)";

export const LIMITS = {
  DAILY_ANALYSIS_LIMIT: Number(process.env.DAILY_ANALYSIS_LIMIT || 15),
  MAX_UPLOAD_MB: Number(process.env.MAX_UPLOAD_MB || 20),
  MAX_PDF_PAGES: Number(process.env.MAX_PDF_PAGES || 50),
  SESSION_TIMEOUT_MIN: Number(process.env.SESSION_TIMEOUT_MIN || 60),
};

// Groq multi-model cascade: primary -> secondary -> tertiary -> fallback
export const MODEL_CASCADE = [
  "meta-llama/llama-4-maverick-17b-128e-instruct",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "llama3-70b-8192",
];

export const CHAT_MODEL = "llama-3.3-70b-versatile";
