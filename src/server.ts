import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createNeuralRouter } from "./server/routes/neuralRoutes";
import { createCreditsRouter } from "./server/routes/creditsRoutes";
import { createGitHubRouter } from "./server/routes/githubRoutes";
import { requireFirebaseAuth, requireOwner } from "./server/middleware/firebaseAuth";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;


  app.use(express.json({ limit: "20mb" }));

  app.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok", service: "skynet4-omni-ai" });
  });

  app.use("/api", requireFirebaseAuth, requireOwner);

  app.use("/api", createCreditsRouter());

  app.use("/api", createNeuralRouter());
  app.use("/api", createGitHubRouter());

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