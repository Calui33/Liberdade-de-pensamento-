import { db, serverTimestamp } from "../../firebase";
import { addDoc, collection, doc, getDoc, limit, onSnapshot, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";

export type Unsubscribe = () => void;
export type SnapshotListener<T> = (value: T) => void;

export type UserRecord = {
  uid?: string;
  email?: string | null;
  credits?: number;
  role?: string;
  [key: string]: unknown;
};

export type ChatMessageRecord = {
  role: "user" | "model";
  text: string;
  id?: string;
  imageId?: string;
};

export type ChatRecord = {
  uid: string;
  messages: ChatMessageRecord[];
};

export type ImageRecord = {
  id: string;
  uid?: string;
  data?: string;
  prompt?: string;
  originalPrompt?: string;
  style?: string;
  [key: string]: unknown;
};

export interface DataProvider {
  watchUser(uid: string, listener: SnapshotListener<UserRecord | null>, onError?: (error: unknown) => void): Unsubscribe;
  createUser(uid: string, data: UserRecord): Promise<void>;
  updateUser(uid: string, data: Partial<UserRecord>): Promise<void>;
  watchLatestChat(uid: string, listener: SnapshotListener<ChatRecord | null>, onError?: (error: unknown) => void): Unsubscribe;
  saveChat(uid: string, data: ChatRecord): Promise<void>;
  getImage(id: string): Promise<ImageRecord | null>;
  watchUserImages(uid: string, listener: SnapshotListener<ImageRecord[]>, onError?: (error: unknown) => void): Unsubscribe;
  saveImage(data: Omit<ImageRecord, "id">): Promise<{ id: string }>;
}

/** Firebase/Firestore implementation of the application persistence contract. */
export const dataProvider: DataProvider = {
  watchUser(uid, listener, onError) {
    return onSnapshot(
      doc(db, "users", uid),
      (snapshot) => listener(snapshot.exists() ? snapshot.data() as UserRecord : null),
      onError
    );
  },
  createUser(uid, data) {
    return setDoc(doc(db, "users", uid), { ...data, createdAt: serverTimestamp() });
  },
  updateUser(uid, data) {
    return updateDoc(doc(db, "users", uid), data);
  },
  watchLatestChat(uid, listener, onError) {
    const q = query(
      collection(db, "chats"),
      where("uid", "==", uid),
      orderBy("updatedAt", "desc"),
      limit(1)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const document = snapshot.docs[0];
        if (!document) {
          listener(null);
          return;
        }
        const data = document.data();
        listener({
          uid: String(data.uid || uid),
          messages: Array.isArray(data.messages) ? data.messages as ChatMessageRecord[] : []
        });
      },
      onError
    );
  },
  saveChat(uid, data) {
    return setDoc(doc(db, "chats", uid), {
      ...data,
      uid,
      updatedAt: serverTimestamp()
    });
  },
  async getImage(id) {
    const snapshot = await getDoc(doc(db, "images", id));
    return snapshot.exists()
      ? { id: snapshot.id, ...snapshot.data() } as ImageRecord
      : null;
  },
  watchUserImages(uid, listener, onError) {
    const q = query(
      collection(db, "images"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    return onSnapshot(
      q,
      (snapshot) => listener(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as ImageRecord)),
      onError
    );
  },
  async saveImage(data) {
    const reference = await addDoc(collection(db, "images"), {
      ...data,
      createdAt: serverTimestamp()
    });
    return { id: reference.id };
  },
};
