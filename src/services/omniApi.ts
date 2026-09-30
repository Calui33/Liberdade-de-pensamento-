import { apiFetch } from "./apiFetch";
export type OmniMessage = {
  role: "user" | "model";
  parts: Array<Record<string, any>>;
};

export async function generateOmniResponse(
  contents: OmniMessage[],
  runtimeUrl: string
): Promise<string> {
  const response = await apiFetch("/api/omni/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents, runtimeUrl }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "OMNI neural core unavailable");
  }

  return data.text || "Erro ao processar resposta.";
}
