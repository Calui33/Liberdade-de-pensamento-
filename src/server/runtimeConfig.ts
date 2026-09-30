import dotenv from "dotenv";
import firebaseConfig from "../../firebase-applet-config.json";

dotenv.config();

export const ownerEmail = (process.env.OWNER_EMAIL || "setecentistaquero@gmail.com").trim().toLowerCase();

export const geminiApiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";

export const firebaseApiKey =
  process.env.FIREBASE_API_KEY ||
  process.env.VITE_FIREBASE_API_KEY ||
  firebaseConfig.apiKey;

export const firestoreBase =
  `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents`;

export const githubPat = process.env.GITHUB_PAT || "";
export const githubAllowedRepo =
  process.env.GITHUB_ALLOWED_REPO || "Calui33/Liberdade-de-pensamento-";
