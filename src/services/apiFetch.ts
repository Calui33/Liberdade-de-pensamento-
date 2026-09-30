import { authProvider } from "./auth/authProvider";

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const user = authProvider.getCurrentUser();
  if (!user) throw new Error("Autenticação necessária.");
  const token = await authProvider.getIdToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}
