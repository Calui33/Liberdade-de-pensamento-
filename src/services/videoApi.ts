import { apiFetch } from "./apiFetch";
export async function generateNeuralVideo(
  prompt: string,
  duration: number,
  aspectRatio: "16:9" | "9:16",
  resolution: "720p" | "1080p"
): Promise<string> {
  const response = await apiFetch("/api/neural/video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, duration, aspectRatio, resolution }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "Video generation failed.");
  return data.videoData || "";
}
