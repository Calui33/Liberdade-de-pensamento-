import {
  auth,
  googleProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "../../firebase";
import type { User as FirebaseUser } from "../../firebase";

export type AuthProviderInfo = {
  providerId: string;
  displayName: string | null;
  email: string | null;
  photoUrl: string | null;
};

export type AuthUser = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  tenantId: string | null;
  providerData: AuthProviderInfo[];
};

export type AuthSubscription = (user: AuthUser | null) => void;

export interface AuthProvider {
  getCurrentUser(): AuthUser | null;
  getIdToken(forceRefresh?: boolean): Promise<string>;
  signInWithGoogle(): Promise<AuthUser>;
  signOut(): Promise<void>;
  subscribe(listener: AuthSubscription): () => void;
}

const toAuthUser = (user: FirebaseUser): AuthUser => ({
  uid: user.uid,
  email: user.email,
  emailVerified: user.emailVerified,
  isAnonymous: user.isAnonymous,
  tenantId: user.tenantId,
  providerData: user.providerData.map((provider) => ({
    providerId: provider.providerId,
    displayName: provider.displayName,
    email: provider.email,
    photoUrl: provider.photoURL,
  })),
});

/** Firebase implementation of the application authentication contract. */
export const authProvider: AuthProvider = {
  getCurrentUser: () => auth.currentUser ? toAuthUser(auth.currentUser) : null,
  getIdToken: (forceRefresh) => {
    if (!auth.currentUser) throw new Error("Autenticação necessária.");
    return auth.currentUser.getIdToken(forceRefresh);
  },
  async signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    return toAuthUser(result.user);
  },
  signOut: () => auth.signOut(),
  subscribe: (listener) => onAuthStateChanged(auth, (user) => listener(user ? toAuthUser(user) : null)),
};
