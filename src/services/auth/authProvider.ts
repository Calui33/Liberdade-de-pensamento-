import {
  auth,
  googleProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "../../firebase";
import type { User } from "../../firebase";

export type AuthUser = User;
export type AuthSubscription = (user: AuthUser | null) => void;

export interface AuthProvider {
  getCurrentUser(): AuthUser | null;
  signInWithGoogle(): Promise<unknown>;
  signOut(): Promise<void>;
  subscribe(listener: AuthSubscription): () => void;
}

/** Firebase implementation of the application authentication contract. */
export const authProvider: AuthProvider = {
  getCurrentUser: () => auth.currentUser,
  signInWithGoogle: () => signInWithPopup(auth, googleProvider),
  signOut: () => auth.signOut(),
  subscribe: (listener) => onAuthStateChanged(auth, listener),
};
