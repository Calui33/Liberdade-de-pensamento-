import { createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { firebaseApiKey, ownerEmail } from "../runtimeConfig";

export type FirebaseIdentity = {
  localId: string;
  email?: string;
  emailVerified?: boolean;
  disabled?: boolean;
};

declare global {
  namespace Express {
    interface Request {
      firebaseUser?: FirebaseIdentity;
      firebaseToken?: string;
    }
  }
}

const authCache = new Map<string, { user: FirebaseIdentity; expiresAt: number }>();

const cacheKeyForToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const requireFirebaseAuth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.header("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return res.status(401).json({ error: "Autenticação necessária." });
  if (!firebaseApiKey) return res.status(500).json({ error: "FIREBASE_API_KEY não configurada no servidor." });

  const cacheKey = cacheKeyForToken(token);
  const cached = authCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    req.firebaseUser = cached.user;
    req.firebaseToken = token;
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
    const firebaseUser = data?.users?.[0] as FirebaseIdentity | undefined;
    if (!response.ok || !firebaseUser || firebaseUser.disabled) {
      return res.status(401).json({ error: "Sessão Firebase inválida ou expirada." });
    }

    authCache.set(cacheKey, { user: firebaseUser, expiresAt: Date.now() + 5 * 60 * 1000 });
    req.firebaseUser = firebaseUser;
    req.firebaseToken = token;
    next();
  } catch (error) {
    console.error("Firebase auth verification failed:", error);
    res.status(503).json({ error: "Não foi possível verificar a sessão." });
  }
};

export const requireOwner = (req: Request, res: Response, next: NextFunction) => {
  const email = req.firebaseUser?.email?.trim().toLowerCase() || "";
  if (!email || email !== ownerEmail || req.firebaseUser?.emailVerified !== true) {
    return res.status(403).json({ error: "Esta instância da SKYNET4 é privada e pertence ao proprietário autorizado." });
  }
  next();
};
