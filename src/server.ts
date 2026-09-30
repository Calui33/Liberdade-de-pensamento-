import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { githubAllowedRepo, githubPat } from "./server/runtimeConfig";
import { createNeuralRouter } from "./server/routes/neuralRoutes";
import { consumeCredits } from "./server/services/creditsService";
import { requireFirebaseAuth, requireOwner } from "./server/middleware/firebaseAuth";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;


  app.use(express.json({ limit: "20mb" }));

  app.use("/api", requireFirebaseAuth, requireOwner);

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


  app.use("/api", createNeuralRouter());
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