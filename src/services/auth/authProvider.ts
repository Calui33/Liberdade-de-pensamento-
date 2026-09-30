import { auth, googleProvider, signInWithPopup, onAuthStateChanged } from "../../firebase";
import type { User } from "../../firebase";

/**
 * Application authentication boundary.
 * Firebase is the current implementation; UI/services should depend on this boundary.
 */
export const authProvider = {
  auth,
  googleProvider,
  signInWithPopup,
  onAuthStateChanged,
};

export type AuthUser = User;
