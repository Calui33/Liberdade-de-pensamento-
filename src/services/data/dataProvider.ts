import { db, serverTimestamp } from "../../firebase";
import { addDoc, collection, doc, getDoc, limit, onSnapshot, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";

export type Unsubscribe = () => void;
export type SnapshotListener<T> = (value: T) => void;

export interface DataProvider {
  watchUser(uid: string, listener: SnapshotListener<any>, onError?: (error: unknown) => void): Unsubscribe;
  createUser(uid: string, data: any): Promise<void>;
  updateUser(uid: string, data: any): Promise<void>;
  watchLatestChat(uid: string, listener: SnapshotListener<any>, onError?: (error: unknown) => void): Unsubscribe;
  saveChat(uid: string, data: any): Promise<void>;
  getImage(id: string): Promise<any | null>;
  watchUserImages(uid: string, listener: SnapshotListener<any[]>, onError?: (error: unknown) => void): Unsubscribe;
  saveImage(data: any): Promise<{ id: string }>;
}

/** Firebase/Firestore implementation of the application persistence contract. */
export const dataProvider: DataProvider = {
  watchUser(uid, listener, onError) {
    return onSnapshot(doc(db, "users", uid), (snapshot) => listener(snapshot.exists() ? snapshot.data() : null), onError);
  },
  createUser(uid, data) { return setDoc(doc(db, "users", uid), { ...data, createdAt: serverTimestamp() }); },
  updateUser(uid, data) { return updateDoc(doc(db, "users", uid), data); },
  watchLatestChat(uid, listener, onError) {
    const q = query(collection(db, "chats"), where("uid", "==", uid), orderBy("updatedAt", "desc"), limit(1));
    return onSnapshot(q, listener, onError);
  },
  saveChat(uid, data) { return setDoc(doc(db, "chats", uid), { ...data, updatedAt: serverTimestamp() }); },
  async getImage(id) {
    const snapshot = await getDoc(doc(db, "images", id));
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  },
  watchUserImages(uid, listener, onError) {
    const q = query(collection(db, "images"), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(20));
    return onSnapshot(q, (snapshot) => listener(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))), onError);
  },
  async saveImage(data) {
    const reference = await addDoc(collection(db, "images"), { ...data, createdAt: serverTimestamp() });
    return { id: reference.id };
  },
};
