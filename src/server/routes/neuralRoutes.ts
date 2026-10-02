import { Router } from "express";
import type { Content } from "@google/genai";
import { getNeuralProvider, type NeuralMessage } from "../providers/neuralProvider";
import { consumeCredits } from "../services/creditsService";
import { serverDataProvider, type ServerMemoryMessage } from "../providers/serverDataProvider";
import { publicServerError } from "../utils/publicServerError";

type TextMemory = {
  role: "user" | "model";
  text: string;
};

const contentToMemory = (contents: Content[]): TextMemory[] =>
  contents
    .flatMap((content) => {
      const role = content.role === "model" ? "model" : "user";
      const text = (content.parts || [])
        .map((part) => ("text" in part && typeof part.text === "string" ? part.text : ""))
        .filter(Boolean)
        .join("\n")
        .trim();
      return text ? [{ role, text }] : [];
    })
    .slice(-20);

const memoryToContents = (messages: TextMemory[]): Content[] =>
  messages.map((message) => ({
    role: message.role,
    parts: [{ text: message.text }],
  }));

const extractMemory = (document: { fields?: Record<string, any> } | undefined): TextMemory[] => {
  const values = document?.fields?.messages?.arrayValue?.values || [];
  return values
    .map((item: any) => item?.mapValue?.fields)
    .map((fields: any) => ({
      role: fields?.role?.stringValue === "model" ? "model" : "user",
      text: typeof fields?.text?.stringValue === "string" ? fields.text.stringValue : "",
    }))
    .filter((message: TextMemory) => message.text)
    .slice(-20);
};

const extractSummary = (document: { fields?: Record<string, any> } | undefined): string =>
  typeof document?.fields?.summary?.stringValue === "string"
    ? document.fields.summary.stringValue
    : "";

const buildMemoryContext = (messages: TextMemory[], summary: string): Content[] => {
  const context: Content[] = [];
  if (summary) {
    context.push({
      role: "user",
      parts: [{ text: `[MEMÓRIA PERSISTENTE — resumo]\n${summary}` }],
    });
  }
  if (messages.length) {
    context.push({
      role: "user",
      parts: [{
        text: `[MEMÓRIA PERSISTENTE — histórico recente]\n${messages
          .map((message) => `${message.role}: ${message.text}`)
          .join("\n")}`,
      }],
    });
  }
  return context;
};

export function createNeuralRouter() {
  const router = Router();

  router.post("/omni/chat", async (req, res) => {
    try {
      const credit = await consumeCredits(req, 1);
      if (!credit.ok) return res.status(credit.error === "Créditos insuficientes." ? 402 : 400).json(credit);

      const contents = (Array.isArray(req.body?.contents) ? req.body.contents : []) as Content[];
      const uid = req.firebaseUser?.localId;
      const token = req.firebaseToken;

      let memoryMessages: TextMemory[] = [];
      let summary = "";
      if (uid && token) {
        const memory = await serverDataProvider.getAiMemory(uid, token);
        if (memory.status >= 200 && memory.status < 300) {
          memoryMessages = extractMemory(memory.document);
          summary = extractSummary(memory.document);
        } else if (memory.status !== 404) {
          console.warn("AI memory read failed:", memory.status);
        }
      }

      const memoryContext = buildMemoryContext(memoryMessages, summary);
      const text = await getNeuralProvider().omniChat(
        contents,
        typeof req.body?.runtimeUrl === "string" ? req.body.runtimeUrl : "",
        memoryContext
      );

      if (uid && token) {
        const currentMessages = contentToMemory(contents);
        const nextMessages: ServerMemoryMessage[] = [...memoryMessages, ...currentMessages, { role: "model", text }].slice(-20);
        const saved = await serverDataProvider.saveAiMemory(uid, token, nextMessages, summary);
        if (saved.status < 200 || saved.status >= 300) {
          console.warn("AI memory write failed:", saved.status);
        }
      }

      res.json({ text, memory: { persisted: Boolean(uid && token), messages: 20 } });
    } catch (error: unknown) {
      console.error("OMNI neural provider error:", error);
      res.status(500).json(publicServerError("Falha no núcleo neural."));
    }
  });

  router.post("/neural/enhance", async (req, res) => {
    try {
      const prompt = typeof req.body?.prompt === "string" ? req.body.prompt : "";
      const style = typeof req.body?.style === "string" ? req.body.style : "surrealist";
      res.json({ text: await getNeuralProvider().enhancePrompt(prompt, style) });
    } catch (error: unknown) {
      console.error("Prompt enhancement failed:", error);
      res.status(500).json(publicServerError("Prompt enhancement failed."));
    }
  });

  router.post("/neural/context", async (req, res) => {
    try {
      const messages = (Array.isArray(req.body?.messages) ? req.body.messages : []) as NeuralMessage[];
      res.json({ text: await getNeuralProvider().analyzeContext(messages) });
    } catch (error: unknown) {
      console.error("Neural analysis failed:", error);
      res.status(500).json(publicServerError("Neural analysis failed."));
    }
  });

  router.post("/neural/image", async (req, res) => {
    try {
      const base64 = typeof req.body?.base64 === "string" ? req.body.base64 : "";
      const prompt = typeof req.body?.prompt === "string" ? req.body.prompt : "";
      res.json({ text: await getNeuralProvider().analyzeImage(base64, prompt) });
    } catch (error: unknown) {
      console.error("Neural analysis failed:", error);
      res.status(500).json(publicServerError("Neural analysis failed."));
    }
  });

  router.post("/neural/manus", async (req, res) => {
    try {
      const request = typeof req.body?.request === "string" ? req.body.request : "";
      res.json({ text: await getNeuralProvider().manus(request) });
    } catch (error: unknown) {
      console.error("Manus Engineering Error:", error);
      res.status(500).json(publicServerError("Manus Engineering Error."));
    }
  });

  router.post("/neural/image-generate", async (req, res) => {
    try {
      const credit = await consumeCredits(req, 5);
      if (!credit.ok) return res.status(credit.error === "Créditos insuficientes." ? 402 : 400).json(credit);
      const prompt = typeof req.body?.prompt === "string" ? req.body.prompt : "";
      const imageSize = ["1K", "2K", "4K"].includes(req.body?.imageSize) ? req.body.imageSize : "1K";
      res.json({ imageData: await getNeuralProvider().generateImage(prompt, imageSize) });
    } catch (error: unknown) {
      console.error("Image generation failed:", error);
      res.status(500).json(publicServerError("Image generation failed."));
    }
  });

  router.post("/neural/tts", async (req, res) => {
    try {
      const instruction = typeof req.body?.instruction === "string" ? req.body.instruction : "";
      const text = typeof req.body?.text === "string" ? req.body.text : "";
      const voiceName = typeof req.body?.voiceName === "string" ? req.body.voiceName : "Zephyr";
      res.json({ audioData: await getNeuralProvider().synthesizeSpeech(instruction, text, voiceName) });
    } catch (error: unknown) {
      console.error("TTS failed:", error);
      res.status(500).json(publicServerError("TTS generation failed."));
    }
  });

  router.post("/surreal/text", async (req, res) => {
    try {
      const input = typeof req.body?.input === "string" ? req.body.input : "";
      const isRawMode = Boolean(req.body?.isRawMode);
      res.json({ text: await getNeuralProvider().surrealText(input, isRawMode) });
    } catch (error: unknown) {
      console.error("Surreal text failed:", error);
      res.status(500).json(publicServerError("Surreal text failed."));
    }
  });

  router.post("/surreal/image", async (req, res) => {
    try {
      const textResponse = typeof req.body?.textResponse === "string" ? req.body.textResponse : "";
      const isRawMode = Boolean(req.body?.isRawMode);
      res.json({ imageData: await getNeuralProvider().surrealImage(textResponse, isRawMode) });
    } catch (error: unknown) {
      console.error("Surreal image failed:", error);
      res.status(500).json(publicServerError("Surreal image failed."));
    }
  });

  router.post("/neural/wisdom", async (_req, res) => {
    try {
      res.json({ text: await getNeuralProvider().dailyWisdom() });
    } catch (error: unknown) {
      console.error("Daily wisdom failed:", error);
      res.json({ text: "A sabedoria reside na busca constante pelo saber." });
    }
  });

  router.post("/neural/video", async (req, res) => {
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
    } catch (error: unknown) {
      console.error("Video generation failed:", error);
      res.status(500).json(publicServerError("Video generation failed."));
    }
  });

  router.post("/neural/map", async (req, res) => {
    try {
      const contents = (Array.isArray(req.body?.contents) ? req.body.contents : []) as Content[];
      const searchQuery = typeof req.body?.searchQuery === "string" ? req.body.searchQuery : "";
      const latLng = req.body?.latLng || { latitude: -23.5505, longitude: -46.6333 };
      res.json(await getNeuralProvider().neuralMap(contents, searchQuery, latLng));
    } catch (error: unknown) {
      console.error("Map neural search failed:", error);
      res.status(500).json(publicServerError("Map neural search failed."));
    }
  });

  return router;
}
