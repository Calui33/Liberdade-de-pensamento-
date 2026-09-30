export async function searchNeuralMap(
  contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>,
  searchQuery: string,
  latLng: { latitude: number; longitude: number }
): Promise<any[]> {
  const response = await fetch("/api/neural/map", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents, searchQuery, latLng }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "Map neural search failed.");
  return data.chunks || [];
}
