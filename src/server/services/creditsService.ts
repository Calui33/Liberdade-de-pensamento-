import type { Request } from "express";
import { firestoreBase, ownerEmail } from "../runtimeConfig";

const CREDIT_COSTS = new Set([1, 5, 20, 35, 50]);

export type CreditResult = {
  ok: boolean;
  credits?: number;
  error?: string;
};

export const consumeCredits = async (req: Request, amount: number): Promise<CreditResult> => {
  if (!CREDIT_COSTS.has(amount)) return { ok: false, error: "Custo de crédito inválido." };

  const firebaseUser = (req as any).firebaseUser;
  const token = (req.header("Authorization") || "").slice(7);
  const uid = firebaseUser?.localId;
  if (!uid || !token) return { ok: false, error: "Autenticação necessária." };

  if (firebaseUser.email?.trim().toLowerCase() === ownerEmail) {
    return { ok: true, credits: 999999 };
  }

  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(`${firestoreBase}/users/${encodeURIComponent(uid)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 404) {
      const initialCredits = 100 - amount;
      const created = await fetch(`${firestoreBase}/users/${encodeURIComponent(uid)}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            uid: { stringValue: uid },
            email: { stringValue: firebaseUser.email || "" },
            credits: { integerValue: String(initialCredits) },
            role: { stringValue: "user" },
            createdAt: { timestampValue: new Date().toISOString() },
          },
        }),
      });
      if (created.ok) return { ok: true, credits: initialCredits };
      if (created.status === 409) continue;
      return { ok: false, error: "Não foi possível inicializar o perfil de créditos." };
    }

    if (!response.ok) return { ok: false, error: "Não foi possível consultar os créditos." };

    const userDoc = await response.json();
    const role = userDoc.fields?.role?.stringValue;
    if (role === "admin") return { ok: true, credits: 999999 };

    const currentCredits = Number(
      userDoc.fields?.credits?.integerValue ??
      userDoc.fields?.credits?.doubleValue ??
      0
    );
    if (!Number.isFinite(currentCredits) || currentCredits < amount) {
      return { ok: false, credits: currentCredits, error: "Créditos insuficientes." };
    }

    const nextCredits = currentCredits - amount;
    const update = await fetch(
      `${firestoreBase}/users/${encodeURIComponent(uid)}?updateMask.fieldPaths=credits`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: { credits: { integerValue: String(nextCredits) } },
          currentDocument: { updateTime: userDoc.updateTime },
        }),
      }
    );

    if (update.ok) return { ok: true, credits: nextCredits };
    if (update.status === 409) continue;
    return { ok: false, error: "Não foi possível atualizar os créditos." };
  }

  return { ok: false, error: "A reserva de créditos mudou durante a operação. Tente novamente." };
};
