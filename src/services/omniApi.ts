import { apiFetch } from "./apiFetch";

export type OmniPart = {
  text?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
};

export type OmniMessage = {
  role: "user" | "model";
  parts: OmniPart[];
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

  const data = await response.json() as { text?: string; error?: string };
  if (!response.ok) {
    throw new Error(data.error || "OMNI neural core unavailable");
  }

  return data.text || "Erro ao processar resposta.";
}
