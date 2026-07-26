import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { LIMITS } from "../config/appConfig.js";
import { isLikelyMedicalReport } from "./validators.js";

/**
 * Extracts text from a PDF buffer, enforcing page-count and content-type checks,
 * mirroring the validation done in the original Streamlit app's pdf_extractor.py.
 */
export const extractPdfText = async (buffer) => {
  const data = await pdfParse(buffer);

  if (data.numpages > LIMITS.MAX_PDF_PAGES) {
    const err = new Error(
      `PDF exceeds max page limit (${LIMITS.MAX_PDF_PAGES} pages).`
    );
    err.status = 400;
    throw err;
  }

  const text = (data.text || "").trim();

  if (!isLikelyMedicalReport(text)) {
    const err = new Error(
      "This doesn't look like a medical/blood report. Please upload a valid report."
    );
    err.status = 400;
    throw err;
  }

  return text;
};

export const chunkText = (text, chunkSize = 800, overlap = 100) => {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
};
