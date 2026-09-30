import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { getNeuralProvider } from "./server/providers/neuralProvider";
import { firebaseApiKey, firestoreBase, githubAllowedRepo, githubPat, ownerEmail } from "./server/runtimeConfig";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;


  app.use(express.json({ limit: "20mb" }));

  const authCache = new Map<string, { user: any; expiresAt: number }>();

  const requireFirebaseAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const header = req.header("Authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) return res.status(401).json({ error: "Autenticação necessária." });
    if (!firebaseApiKey) return res.status(500).json({ error: "FIREBASE_API_KEY não configurada no servidor." });

    const cached = authCache.get(token);
    if (cached && cached.expiresAt > Date.now()) {
      (req as any).firebaseUser = cached.user;
      return next();
    }

    try {
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      });
      const data = await response.json();
      const firebaseUser = data?.users?.[0];
      if (!response.ok || !firebaseUser || firebaseUser.disabled) {
        return res.status(401).json({ error: "Sessão Firebase inválida ou expirada." });
      }

      authCache.set(token, { user: firebaseUser, expiresAt: Date.now() + 5 * 60 * 1000 });
      (req as any).firebaseUser = firebaseUser;
      next();
    } catch (error) {
      console.error("Firebase auth verification failed:", error);
      res.status(503).json({ error: "Não foi possível verificar a sessão." });
    }
  };

  const requireOwner = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const firebaseUser = (req as any).firebaseUser;
    const email = typeof firebaseUser?.email === "string" ? firebaseUser.email.trim().toLowerCase() : "";
    if (!email || email !== ownerEmail) {
      return res.status(403).json({ error: "Esta instância da SKYNET4 é privada e pertence ao proprietário autorizado." });
    }
    next();
  };

  // SKYNET4 is a personal instance: authentication alone is not enough.
  // Only the configured owner may access the private API surface.
  app.use("/api", requireFirebaseAuth, requireOwner);

    const CREDIT_COSTS = new Set([1, 5, 20, 35, 50]);

  const consumeCredits = async (req: express.Request, amount: number): Promise<{ ok: boolean; credits?: number; error?: string }> => {
    if (!CREDIT_COSTS.has(amount)) return { ok: false, error: "Custo de crédito inválido." };

    const firebaseUser = (req as any).firebaseUser;
    const token = (req.header("Authorization") || "").slice(7);
    const uid = firebaseUser?.localId;
    if (!uid || !token) return { ok: false, error: "Autenticação necessária." };

    if (firebaseUser.email?.trim().toLowerCase() === ownerEmail) {
      return { ok: true, credits: 999999 };
    }

    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await fetch(`${firestoreBase}/users/${encodeURIComponent(uid)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 404) {
        const initialCredits = 100 - amount;
        const created = await fetch(`${firestoreBase}/users/${encodeURIComponent(uid)}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: {
              uid: { stringValue: uid },
              email: { stringValue: firebaseUser.email || "" },
              credits: { integerValue: String(initialCredits) },
              role: { stringValue: "user" },
              createdAt: { timestampValue: new Date().toISOString() },
            },
          }),
        });
        if (created.ok) return { ok: true, credits: initialCredits };
        if (created.status === 409) continue;
        return { ok: false, error: "Não foi possível inicializar o perfil de créditos." };
      }

      if (!response.ok) return { ok: false, error: "Não foi possível consultar os créditos." };

      const userDoc = await response.json();
      const role = userDoc.fields?.role?.stringValue;
      if (role === "admin") return { ok: true, credits: 999999 };

      const currentCredits = Number(userDoc.fields?.credits?.integerValue ?? userDoc.fields?.credits?.doubleValue ?? 0);
      if (!Number.isFinite(currentCredits) || currentCredits < amount) {
        return { ok: false, credits: currentCredits, error: "Créditos insuficientes." };
      }

      const nextCredits = currentCredits - amount;
      const update = await fetch(
        `${firestoreBase}/users/${encodeURIComponent(uid)}?updateMask.fieldPaths=credits`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: { credits: { integerValue: String(nextCredits) } },
            currentDocument: { updateTime: userDoc.updateTime },
          }),
        }
      );

      if (update.ok) return { ok: true, credits: nextCredits };
      if (update.status === 409) continue;
      return { ok: false, error: "Não foi possível atualizar os créditos." };
    }

    return { ok: false, error: "A reserva de créditos mudou durante a operação. Tente novamente." };
  };

  app.post("/api/credits/consume", async (req, res) => {
    try {
      const amount = Number(req.body?.amount);
      const result = await consumeCredits(req, amount);
      if (!result.ok) return res.status(result.error === "Créditos insuficientes." ? 402 : 400).json(result);
      res.json({ ok: true, credits: result.credits });
    } catch (error) {
      console.error("Credit consumption failed:", error);
      res.status(503).json({ error: "Não foi possível processar os créditos." });
    }
  });


  // SKYNET4 OMNI-AI NEXO — server-side Gemini bridge.
  // Personality/configuration is intentionally kept identical to the protected contract.
  app.post("/api/omni/chat", async (req, res) => {
    try {
      const credit = await consumeCredits(req, 1);
      if (!credit.ok) return res.status(credit.error === "Créditos insuficientes." ? 402 : 400).json(credit);
      const text = await getNeuralProvider().omniChat(
        Array.isArray(req.body?.contents) ? req.body.contents : [],
        typeof req.body?.runtimeUrl === "string" ? req.body.runtimeUrl : ""
      );
      res.json({ text });
    } catch (error: any) {
      console.error("OMNI neural provider error:", error);
      res.status(500).json({ error: error?.message || "Falha no núcleo neural." });
    }
  });

  // SKYNET4 neural specialist capabilities — server-side extraction.
  app.post("/api/neural/enhance", async (req, res) => {
    try {
      const prompt = typeof req.body?.prompt === "string" ? req.body.prompt : "";
      const style = typeof req.body?.style === "string" ? req.body.style : "surrealist";
      res.json({ text: await getNeuralProvider().enhancePrompt(prompt, style) });
    } catch (error: any) {
      console.error("Prompt enhancement failed:", error);
      res.status(500).json({ error: error?.message || "Prompt enhancement failed." });
    }
  });

  app.post("/api/neural/context", async (req, res) => {
    try {
      const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
      res.json({ text: await getNeuralProvider().analyzeContext(messages) });
    } catch (error: any) {
      console.error("Neural analysis failed:", error);
      res.status(500).json({ error: error?.message || "Neural analysis failed." });
    }
  });

  app.post("/api/neural/image", async (req, res) => {
    try {
      const base64 = typeof req.body?.base64 === "string" ? req.body.base64 : "";
      const prompt = typeof req.body?.prompt === "string" ? req.body.prompt : "";
      res.json({ text: await getNeuralProvider().analyzeImage(base64, prompt) });
    } catch (error: any) {
      console.error("Image analysis failed:", error);
      res.status(500).json({ error: error?.message || "Image analysis failed." });
    }
  });

  app.post("/api/neural/manus", async (req, res) => {
    try {
      const request = typeof req.body?.request === "string" ? req.body.request : "";
      res.json({ text: await getNeuralProvider().manus(request) });
    } catch (error: any) {
      console.error("Manus Engineering Error:", error);
      res.status(500).json({ error: error?.message || "Manus Engineering Error." });
    }
  });

  app.post("/api/neural/image-generate", async (req, res) => {
    try {
      const credit = await consumeCredits(req, 5);
      if (!credit.ok) return res.status(credit.error === "Créditos insuficientes." ? 402 : 400).json(credit);
      const prompt = typeof req.body?.prompt === "string" ? req.body.prompt : "";
      const imageSize = ["1K", "2K", "4K"].includes(req.body?.imageSize) ? req.body.imageSize : "1K";
      res.json({ imageData: await getNeuralProvider().generateImage(prompt, imageSize) });
    } catch (error: any) {
      console.error("Image generation failed:", error);
      res.status(500).json({ error: error?.message || "Image generation failed." });
    }
  });

  app.post("/api/neural/tts", async (req, res) => {
    try {
      const instruction = typeof req.body?.instruction === "string" ? req.body.instruction : "";
      const text = typeof req.body?.text === "string" ? req.body.text : "";
      const voiceName = typeof req.body?.voiceName === "string" ? req.body.voiceName : "Zephyr";
      res.json({ audioData: await getNeuralProvider().synthesizeSpeech(instruction, text, voiceName) });
    } catch (error: any) {
      console.error("TTS failed:", error);
      res.status(500).json({ error: error?.message || "TTS generation failed." });
    }
  });

  app.post("/api/surreal/text", async (req, res) => {
    try {
      const input = typeof req.body?.input === "string" ? req.body.input : "";
      const isRawMode = Boolean(req.body?.isRawMode);
      res.json({ text: await getNeuralProvider().surrealText(input, isRawMode) });
    } catch (error: any) {
      console.error("Surreal text failed:", error);
      res.status(500).json({ error: error?.message || "Surreal text failed." });
    }
  });

  app.post("/api/surreal/image", async (req, res) => {
    try {
      const textResponse = typeof req.body?.textResponse === "string" ? req.body.textResponse : "";
      const isRawMode = Boolean(req.body?.isRawMode);
      res.json({ imageData: await getNeuralProvider().surrealImage(textResponse, isRawMode) });
    } catch (error: any) {
      console.error("Surreal image failed:", error);
      res.status(500).json({ error: error?.message || "Surreal image failed." });
    }
  });

  app.post("/api/neural/wisdom", async (_req, res) => {
    try {
      res.json({ text: await getNeuralProvider().dailyWisdom() });
    } catch (error: any) {
      console.error("Daily wisdom failed:", error);
      res.json({ text: "A sabedoria reside na busca constante pelo saber." });
    }
  });

  app.post("/api/neural/video", async (req, res) => {
    try {
      const duration = ([5, 10, 15].includes(Number(req.body?.duration)) ? Number(req.body.duration) : 5) as 5 | 10 | 15;
      const cost = duration >= 15 ? 50 : (duration >= 10 ? 35 : 20);
      const credit = await consumeCredits(req, cost);
      if (!credit.ok) return res.status(credit.error === "Créditos insuficientes." ? 402 : 400).json(credit);

      const prompt = typeof req.body?.prompt === "string" ? req.body.prompt : "";
      const aspectRatio = req.body?.aspectRatio === "9:16" ? "9:16" : "16:9";
      const resolution = req.body?.resolution === "1080p" ? "1080p" : "720p";
      res.json({
        videoData: await getNeuralProvider().generateVideo(prompt, duration, aspectRatio, resolution)
      });
    } catch (error: any) {
      console.error("Video generation failed:", error);
      res.status(500).json({ error: error?.message || "Video generation failed." });
    }
  });

  app.post("/api/neural/map", async (req, res) => {
    try {
      const contents = Array.isArray(req.body?.contents) ? req.body.contents : [];
      const searchQuery = typeof req.body?.searchQuery === "string" ? req.body.searchQuery : "";
      const latLng = req.body?.latLng || { latitude: -23.5505, longitude: -46.6333 };
      res.json(await getNeuralProvider().neuralMap(contents, searchQuery, latLng));
    } catch (error: any) {
      console.error("Map neural search failed:", error);
      res.status(500).json({ error: error?.message || "Map neural search failed." });
    }
  });

  // GitHub API Proxy — authenticated, read-only, allowlisted.
  app.get("/api/github/*", async (req, res) => {
    const pat = githubPat;
    if (!pat) {
      return res.status(401).json({ 
        error: "GITHUB_PAT não configurado. Por favor, adicione seu Personal Access Token do GitHub nas configurações." 
      });
    }

    const githubPath = req.params[0];
    const allowedRepo = githubAllowedRepo;
    const allowedPrefix = `repos/${allowedRepo}/`;
    if (!githubPath.startsWith(allowedPrefix) && !githubPath.startsWith("users/")) {
      return res.status(403).json({ error: "Rota GitHub não autorizada." });
    }
    const query = new URLSearchParams(req.query as any).toString();
    const url = `https://api.github.com/${githubPath}${query ? `?${query}` : ""}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `token ${pat}`,
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "OMNI-AI-App"
        },
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      console.error("GitHub Proxy Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`OMNI-AI Server running on http://localhost:${PORT}`);
  });
}

startServer();