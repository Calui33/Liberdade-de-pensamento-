import { Router } from "express";
import { githubAllowedRepo, githubPat } from "../runtimeConfig";

export function createGitHubRouter() {
  const router = Router();

  // GitHub API Proxy — authenticated, read-only, allowlisted.
  router.get("/github/*", async (req, res) => {
    const pat = githubPat;
    if (!pat) {
      return res.status(401).json({
        error: "GITHUB_PAT não configurado. Por favor, adicione seu Personal Access Token do GitHub nas configurações."
      });
    }

    const githubPath = req.params[0];
    const allowedPrefix = `repos/${githubAllowedRepo}/`;
    if (!githubPath.startsWith(allowedPrefix) && !githubPath.startsWith("users/")) {
      return res.status(403).json({ error: "Rota GitHub não autorizada." });
    }

    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (Array.isArray(value)) {
        for (const item of value) queryParams.append(key, String(item));
      } else if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    }
    const query = queryParams.toString();
    const url = `https://api.github.com/${githubPath}${query ? `?${query}` : ""}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `token ${pat}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "OMNI-AI-App"
        },
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("GitHub Proxy Error:", message);
      res.status(500).json({ error: message });
    }
  });

  return router;
}
