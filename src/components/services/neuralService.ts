import { GoogleGenAI } from "@google/genai";
import { withRetry } from "../../lib/retry";

const getGeminiKey = () => {
  return process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY || '';
};

const ai = new GoogleGenAI({ apiKey: getGeminiKey() });

/**
 * Enhances a user's prompt for better image generation results.
 */
export async function enhancePrompt(prompt: string, style: string = "surrealist"): Promise<string> {
  try {
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 500,
      }
    });
    const result = await withRetry(() => model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Enhance this image prompt for a ${style} style. Be descriptive and artistic. Prompt: ${prompt}` }] }],
    }));
    return result.response.text() || prompt;
  } catch (error) {
    console.error("Prompt enhancement failed", error);
    return prompt;
  }
}

/**
 * Analyzes a conversation to provide neural insights.
 */
export async function analyzeNeuralContext(messages: any[]): Promise<string> {
  try {
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 200,
      }
    });
    const history = messages.slice(-10).map(m => `${m.role}: ${m.text}`).join('\n');
    const result = await withRetry(() => model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Analyze this conversation context and provide a brief neural insight (max 2 sentences): \n${history}` }] }],
    }));
    return result.response.text() || "Neural synchronization stable.";
  } catch (error) {
    console.error("Neural analysis failed", error);
    return "Neural synchronization stable.";
  }
}

/**
 * Analyzes an image and returns a description or answers a question about it.
 */
export async function analyzeImage(base64: string, prompt: string): Promise<string> {
  try {
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 2048,
      }
    });
    const result = await withRetry(() => model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { data: base64, mimeType: "image/jpeg" } }
        ]
      }],
    }));
    return result.response.text();
  } catch (error) {
    console.error("Image analysis failed", error);
    throw error;
  }
}

/**
 * Specialized engineering agent for complex technical tasks.
 */
export async function manusEngineeringAgent(request: string): Promise<string> {
  try {
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });
    const result = await withRetry(() => model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `Você é o Manus AI Engineering Module. Sua tarefa é resolver problemas de engenharia complexos.
          Analise o seguinte pedido, decomponha em tarefas, projete a arquitetura e forneça o código ou solução técnica necessária.
          Seja extremamente técnico, preciso e eficiente.
          
          Pedido: ${request}`
        }]
      }],
    }));
    return result.response.text();
  } catch (error) {
    console.error("Manus Engineering Error:", error);
    throw error;
  }
}
