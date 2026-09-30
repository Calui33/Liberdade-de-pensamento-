import { apiFetch } from "../../services/apiFetch";

export type NeuralContextMessage = {
  role: "user" | "model";
  text: string;
};

const postNeural = async (path: string, body: Record<string, unknown>): Promise<string> => {
  const response = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json() as { text?: string; error?: string };
  if (!response.ok) throw new Error(data.error || "Neural specialist unavailable");
  return data.text || "";
};

/** Enhances a user's prompt for better image generation results. */
export async function enhancePrompt(prompt: string, style: string = "surrealist"): Promise<string> {
  try {
    return await postNeural("/api/neural/enhance", { prompt, style });
  } catch (error) {
    console.error("Prompt enhancement failed", error);
    return prompt;
  }
}

/** Analyzes a conversation to provide neural insights. */
export async function analyzeNeuralContext(messages: NeuralContextMessage[]): Promise<string> {
  try {
    return await postNeural("/api/neural/context", { messages });
  } catch (error) {
    console.error("Neural analysis failed", error);
    return "Neural synchronization stable.";
  }
}

/** Analyzes an image and returns a description or answers a question about it. */
export async function analyzeImage(base64: string, prompt: string): Promise<string> {
  try {
    return await postNeural("/api/neural/image", { base64, prompt });
  } catch (error) {
    console.error("Image analysis failed", error);
    throw error;
  }
}

/** Specialized engineering agent for complex technical tasks. */
export async function manusEngineeringAgent(request: string): Promise<string> {
  try {
    return await postNeural("/api/neural/manus", { request });
  } catch (error) {
    console.error("Manus Engineering Error:", error);
    throw error;
  }
}
