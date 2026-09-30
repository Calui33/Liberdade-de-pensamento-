import {
  db,
  serverTimestamp,
  Timestamp,
} from "../../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  addDoc,
} from "firebase/firestore";

/**
 * Application data boundary.
 * Firebase/Firestore is the current implementation and can be replaced behind this module.
 */
export const dataProvider = {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  Timestamp,
};
