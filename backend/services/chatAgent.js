import { retrieveRelevantChunks } from "./ragService.js";
import { runChatCompletion } from "./modelManager.js";
import { CHAT_SYSTEM_PROMPT } from "../config/prompts.js";
import { CHAT_MODEL } from "../config/appConfig.js";

/**
 * Contextualizes the follow-up question against recent chat history, retrieves
 * relevant report chunks via the session's vector store, and answers using Groq.
 */
export const answerFollowUp = async ({ session, question, recentMessages = [] }) => {
  const historyBlock = recentMessages
    .slice(-6)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const relevantChunks = await retrieveRelevantChunks(session.chunks, question, 4);

  const userPrompt = `Prior conversation:\n${historyBlock || "(none)"}\n\nRelevant report excerpts:\n${relevantChunks
    .map((c, i) => `[Excerpt ${i + 1}] ${c}`)
    .join("\n\n")}\n\nAnalysis summary:\n${session.analysis.slice(0, 1500)}\n\nUser question: ${question}`;

  const answer = await runChatCompletion({
    systemPrompt: CHAT_SYSTEM_PROMPT,
    userPrompt,
    model: CHAT_MODEL,
  });

  return answer;
};
