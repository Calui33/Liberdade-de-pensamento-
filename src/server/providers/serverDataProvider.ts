import { firestoreBase } from "../runtimeConfig";

export type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
  nullValue?: "NULL_VALUE";
  bytesValue?: string;
  referenceValue?: string;
  geoPointValue?: { latitude: number; longitude: number };
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
};

export type FirestoreFields = Record<string, FirestoreValue>;

export type ServerUserDocument = {
  fields?: FirestoreFields;
  updateTime?: string;
};

export type ServerMemoryMessage = {
  role: "user" | "model";
  text: string;
};

export type ServerMemoryDocument = {
  fields?: FirestoreFields;
  updateTime?: string;
};

export interface ServerDataProvider {
  getUser(uid: string, token: string): Promise<{ status: number; document?: ServerUserDocument }>;
  createUser(uid: string, token: string, fields: FirestoreFields): Promise<{ status: number }>;
  updateUserCredits(uid: string, token: string, credits: number, updateTime: string): Promise<{ status: number }>;
  getAiMemory(uid: string, token: string): Promise<{ status: number; document?: ServerMemoryDocument }>;
  saveAiMemory(uid: string, token: string, messages: ServerMemoryMessage[], summary?: string): Promise<{ status: number }>;
}

const memoryFields = (
  uid: string,
  messages: ServerMemoryMessage[],
  summary: string
): FirestoreFields => ({
  uid: { stringValue: uid },
  messages: {
    arrayValue: {
      values: messages.map((message) => ({
        mapValue: {
          fields: {
            role: { stringValue: message.role },
            text: { stringValue: message.text },
          },
        },
      })),
    },
  },
  summary: { stringValue: summary },
  updatedAt: { timestampValue: new Date().toISOString() },
});

export const serverDataProvider: ServerDataProvider = {
  async getUser(uid, token) {
    const response = await fetch(`${firestoreBase}/skynet4_users/${encodeURIComponent(uid)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { status: response.status, document: response.ok ? await response.json() as ServerUserDocument : undefined };
  },

  async createUser(uid, token, fields) {
    const response = await fetch(`${firestoreBase}/skynet4_users/${encodeURIComponent(uid)}`, {
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
      `${firestoreBase}/skynet4_users/${encodeURIComponent(uid)}?updateMask.fieldPaths=credits`,
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

  async getAiMemory(uid, token) {
    const response = await fetch(`${firestoreBase}/skynet4_ai_memory/${encodeURIComponent(uid)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      status: response.status,
      document: response.ok ? await response.json() as ServerMemoryDocument : undefined,
    };
  },

  async saveAiMemory(uid, token, messages, summary = "") {
    const response = await fetch(`${firestoreBase}/skynet4_ai_memory/${encodeURIComponent(uid)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: memoryFields(uid, messages, summary) }),
    });
    return { status: response.status };
  },
};
