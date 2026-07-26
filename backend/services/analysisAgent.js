import { runWithCascade } from "./modelManager.js";
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt } from "../config/prompts.js";

/**
 * Runs the report analysis using the Groq model cascade.
 * In-context learning: previousAnalyses (short excerpts of the user's earlier
 * analyses) are optionally included to give the model style/consistency context,
 * mirroring the original app's in-context learning from prior sessions.
 */
export const analyzeReport = async ({ reportText, patientInfo, previousAnalyses = [] }) => {
  const contextBlock =
    previousAnalyses.length > 0
      ? `\n\nFor style consistency, here are excerpts from this user's previous analyses:\n${previousAnalyses
          .map((a, i) => `Example ${i + 1}: ${a.slice(0, 300)}...`)
          .join("\n")}`
      : "";

  const userPrompt = buildAnalysisPrompt({ reportText, patientInfo }) + contextBlock;

  const { content, modelUsed } = await runWithCascade({
    systemPrompt: ANALYSIS_SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.4,
  });

  return { analysis: content, modelUsed };
};
