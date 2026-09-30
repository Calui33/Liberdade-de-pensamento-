import { apiFetch } from "./apiFetch";
export async function generateSurrealText(input: string, isRawMode: boolean): Promise<string> {
  const response = await apiFetch("/api/surreal/text", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, isRawMode }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "Surreal neural pulse failed.");
  return data.text || "O silêncio é a resposta da convergência.";
}

export async function generateSurrealVision(textResponse: string, isRawMode: boolean): Promise<string> {
  const response = await apiFetch("/api/surreal/image", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ textResponse, isRawMode }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "Surreal vision failed.");
  return data.imageData || "";
}
