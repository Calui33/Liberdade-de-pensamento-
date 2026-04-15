import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, onSnapshot, serverTimestamp, Timestamp, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection test
async function testConnection() {
  try {
    // Force a network request to verify the backend is reachable
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    const isUnavailable = error.message?.includes('unavailable') || error.code === 'unavailable';
    const isOffline = error.message?.includes('the client is offline');
    
    if (isUnavailable || isOffline) {
      console.error("❌ Erro Crítico de Conexão com o Firestore. O backend não pôde ser alcançado.");
      console.error("Isso geralmente indica que a configuração do Firebase está incorreta ou o banco de dados não foi provisionado.");
    }
  }
}
testConnection();

export { signInWithPopup, onAuthStateChanged, serverTimestamp, Timestamp };
export type { User };
