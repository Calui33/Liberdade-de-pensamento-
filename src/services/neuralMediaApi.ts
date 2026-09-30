import { apiFetch } from "./apiFetch";
export async function generateNeuralImage(
  prompt: string,
  imageSize: "1K" | "2K" | "4K"
): Promise<string> {
  const response = await apiFetch("/api/neural/image-generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, imageSize }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "Image generation failed.");
  return data.imageData || "";
}

export async function synthesizeNeuralSpeech(
  instruction: string,
  text: string,
  voiceName: string
): Promise<string> {
  const response = await apiFetch("/api/neural/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ instruction, text, voiceName }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "TTS generation failed.");
  return data.audioData || "";
}
