import { apiFetch } from "./apiFetch";

export type NeuralMapPlace = {
  uri: string;
  title: string;
};

export type NeuralMapChunk = {
  maps?: NeuralMapPlace;
  web?: NeuralMapPlace;
};

export async function searchNeuralMap(
  contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>,
  searchQuery: string,
  latLng: { latitude: number; longitude: number }
): Promise<NeuralMapChunk[]> {
  const response = await apiFetch("/api/neural/map", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents, searchQuery, latLng }),
  });
  const data = await response.json() as { chunks?: NeuralMapChunk[]; error?: string };
  if (!response.ok) throw new Error(data.error || "Map neural search failed.");
  return data.chunks || [];
}
