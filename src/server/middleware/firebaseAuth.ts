import type { NextFunction, Request, Response } from "express";
import { firebaseApiKey, ownerEmail } from "../runtimeConfig";

const authCache = new Map<string, { user: any; expiresAt: number }>();

export const requireFirebaseAuth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.header("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return res.status(401).json({ error: "Autenticação necessária." });
  if (!firebaseApiKey) return res.status(500).json({ error: "FIREBASE_API_KEY não configurada no servidor." });

  const cached = authCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    (req as any).firebaseUser = cached.user;
    return next();
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );
    const data = await response.json();
    const firebaseUser = data?.users?.[0];
    if (!response.ok || !firebaseUser || firebaseUser.disabled) {
      return res.status(401).json({ error: "Sessão Firebase inválida ou expirada." });
    }

    authCache.set(token, { user: firebaseUser, expiresAt: Date.now() + 5 * 60 * 1000 });
    (req as any).firebaseUser = firebaseUser;
    next();
  } catch (error) {
    console.error("Firebase auth verification failed:", error);
    res.status(503).json({ error: "Não foi possível verificar a sessão." });
  }
};

export const requireOwner = (req: Request, res: Response, next: NextFunction) => {
  const firebaseUser = (req as any).firebaseUser;
  const email = typeof firebaseUser?.email === "string" ? firebaseUser.email.trim().toLowerCase() : "";
  if (!email || email !== ownerEmail) {
    return res.status(403).json({ error: "Esta instância da SKYNET4 é privada e pertence ao proprietário autorizado." });
  }
  next();
};
