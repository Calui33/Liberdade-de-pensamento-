import { firestoreBase } from "../runtimeConfig";

export type ServerUserDocument = {
  fields?: Record<string, any>;
  updateTime?: string;
};

export interface ServerDataProvider {
  getUser(uid: string, token: string): Promise<{ status: number; document?: ServerUserDocument }>;
  createUser(uid: string, token: string, fields: Record<string, any>): Promise<{ status: number }>;
  updateUserCredits(uid: string, token: string, credits: number, updateTime: string): Promise<{ status: number }>;
}

export const serverDataProvider: ServerDataProvider = {
  async getUser(uid, token) {
    const response = await fetch(`${firestoreBase}/users/${encodeURIComponent(uid)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { status: response.status, document: response.ok ? await response.json() : undefined };
  },

  async createUser(uid, token, fields) {
    const response = await fetch(`${firestoreBase}/users/${encodeURIComponent(uid)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });
    return { status: response.status };
  },

  async updateUserCredits(uid, token, credits, updateTime) {
    const response = await fetch(
      `${firestoreBase}/users/${encodeURIComponent(uid)}?updateMask.fieldPaths=credits`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: { credits: { integerValue: String(credits) } },
          currentDocument: { updateTime },
        }),
      }
    );
    return { status: response.status };
  },
};
