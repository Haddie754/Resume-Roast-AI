/**
 * AI provider abstraction.
 * Every feature calls generateAIResponse() — nothing else imports an AI SDK directly.
 * To swap providers: change AI_PROVIDER in .env.local.
 */

import OpenAI from "openai";

export type AIProvider = "openai" | "gemini" | "anthropic";

export interface GenerateOptions {
  temperature?: number;
  system?: string;
  json?: boolean;
}

export interface AIResponse {
  text: string;
  provider: AIProvider;
  model: string;
}

function getProvider(): AIProvider {
  return (process.env.AI_PROVIDER as AIProvider) || "openai";
}

export async function generateAIResponse(
  prompt: string,
  options: GenerateOptions = {},
): Promise<AIResponse> {
  const provider = getProvider();

  switch (provider) {
    case "openai":
      return callOpenAI(prompt, options);
    case "gemini":
      throw new Error("Gemini provider removed — set AI_PROVIDER=openai in .env.local");
    case "anthropic":
      throw new Error("Anthropic provider not wired up yet.");
    default:
      throw new Error(`Unknown AI_PROVIDER: ${provider}`);
  }
}

async function callOpenAI(prompt: string, options: GenerateOptions): Promise<AIResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Add it to .env.local.");
  }

  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const client = new OpenAI({ apiKey });

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (options.system) {
    messages.push({ role: "system", content: options.system });
  }
  messages.push({ role: "user", content: prompt });

  const response = await client.chat.completions.create({
    model: modelName,
    messages,
    temperature: options.temperature ?? 0.7,
    response_format: options.json ? { type: "json_object" } : { type: "text" },
  });

  const text = response.choices[0]?.message?.content ?? "";
  return { text, provider: "openai", model: modelName };
}
