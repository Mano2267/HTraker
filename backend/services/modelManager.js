import Groq from "groq-sdk";
import { MODEL_CASCADE } from "../config/appConfig.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Tries each model in MODEL_CASCADE in order (primary -> secondary -> tertiary -> fallback),
 * moving to the next one on failure (rate limit, timeout, model error, etc).
 */
export const runWithCascade = async ({ systemPrompt, userPrompt, temperature = 0.4 }) => {
  let lastError;

  for (const model of MODEL_CASCADE) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        temperature,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
      return {
        content: completion.choices[0]?.message?.content ?? "",
        modelUsed: model,
      };
    } catch (err) {
      console.warn(`Model ${model} failed: ${err.message}. Trying next in cascade...`);
      lastError = err;
    }
  }

  throw new Error(
    `All models in cascade failed. Last error: ${lastError?.message || "unknown"}`
  );
};

export const runChatCompletion = async ({ systemPrompt, userPrompt, model, temperature = 0.3 }) => {
  const completion = await groq.chat.completions.create({
    model,
    temperature,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  return completion.choices[0]?.message?.content ?? "";
};
