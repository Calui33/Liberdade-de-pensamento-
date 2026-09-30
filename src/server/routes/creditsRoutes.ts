import { Router } from "express";
import { consumeCredits } from "../services/creditsService";

export function createCreditsRouter() {
  const router = Router();

  router.post("/credits/consume", async (req, res) => {
    try {
      const amount = Number(req.body?.amount);
      const result = await consumeCredits(req, amount);
      if (!result.ok) {
        return res
          .status(result.error === "Créditos insuficientes." ? 402 : 400)
          .json(result);
      }
      res.json({ ok: true, credits: result.credits });
    } catch (error) {
      console.error("Credit consumption failed:", error);
      res.status(503).json({ error: "Não foi possível processar os créditos." });
    }
  });

  return router;
}
