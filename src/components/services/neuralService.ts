/**
 * ═══════════════════════════════════════════════════════════════
 * NEURAL SERVICE MODULE
 * ═══════════════════════════════════════════════════════════════
 * Especialistas da Convergência: prompt, análise, imagem e engenharia.
 */

import { GoogleGenAI } from '@google/genai';
import { withRetry, withAggressiveRetry } from '../../lib/retry';
import {
  apiConfig,
  GEMINI_MODELS,
  TOKEN_LIMITS,
  TEMPERATURE_CONFIG,
  neuralLogger,
} from '../../config/api-config';

const MODULE_NAME = 'NEURAL_SERVICE';

const ai = apiConfig.geminiApiKey ? new GoogleGenAI({ apiKey: apiConfig.geminiApiKey }) : null;

export interface NeuralMessage {
  role: 'user' | 'model';
  text: string;
}

export interface NeuralAnalysisResult {
  insight: string;
  themes: string[];
  intent: string;
  nextStep: string;
}

function ensureClient(): GoogleGenAI | null {
  if (ai) return ai;
  neuralLogger.warn(MODULE_NAME, '⚠️ Gemini indisponível. Credencial ausente.');
  return null;
}

export async function enhancePrompt(prompt: string, style: string = 'surrealist'): Promise<string> {
  const client = ensureClient();
  if (!client) return prompt;

  try {
    const model = client.getGenerativeModel({
      model: GEMINI_MODELS.FLASH,
      generationConfig: {
        maxOutputTokens: TOKEN_LIMITS.PROMPT_ENHANCEMENT,
      },
    });

    const result = await withRetry(() =>
      model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Você é o Alquimista Neural. Sua missão é transformar este pedido em um prompt visual perfeito para síntese de imagens.

Estilo desejado: ${style}
Seja descritivo, artístico e poético. Use linguagem imagética rica.

Pedido original: ${prompt}

Retorne apenas o prompt melhorado, sem explicações.`,
              },
            ],
          },
        ],
      })
    );

    return result.response?.text() || prompt;
  } catch (error: any) {
    neuralLogger.error(MODULE_NAME, '❌ Erro na amplificação do prompt', error?.message);
    return prompt;
  }
}

export async function analyzeNeuralContext(messages: NeuralMessage[]): Promise<NeuralAnalysisResult> {
  const client = ensureClient();
  if (!client || messages.length === 0) {
    return {
      insight: 'Neural synchronization stable.',
      themes: [],
      intent: 'Undefined',
      nextStep: 'Awaiting convergence...',
    };
  }

  try {
    const model = client.getGenerativeModel({
      model: GEMINI_MODELS.FLASH,
      generationConfig: {
        maxOutputTokens: TOKEN_LIMITS.NEURAL_ANALYSIS,
      },
    });

    const history = messages
      .slice(-10)
      .map(m => `${m.role === 'user' ? 'Mestre' : 'Skynet4'}: ${m.text}`)
      .join('\n\n');

    const result = await withRetry(() =>
      model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Você é o Synapse-V, especialista em análise de padrões neurais.

Analise este diálogo e extraia insights em JSON:
{
  "themes": ["tema1", "tema2"],
  "intent": "intenção do Mestre",
  "nextStep": "próxima ação sugerida",
  "insight": "insight em até 2 frases, poético"
}

Histórico:
${history}

Retorne apenas o JSON, sem markdown.`,
              },
            ],
          },
        ],
      })
    );

    const responseText = result.response?.text() || '{}';
    return JSON.parse(responseText) as NeuralAnalysisResult;
  } catch (error: any) {
    neuralLogger.error(MODULE_NAME, '❌ Erro na análise neural', error?.message);
    return {
      insight: 'Neural synchronization stable.',
      themes: [],
      intent: 'Error in analysis',
      nextStep: 'Retry convergence...',
    };
  }
}

export async function analyzeImage(base64: string, prompt: string): Promise<string> {
  const client = ensureClient();
  if (!client) {
    throw new Error('Gemini client not available');
  }

  try {
    const model = client.getGenerativeModel({
      model: GEMINI_MODELS.FLASH,
      generationConfig: {
        maxOutputTokens: TOKEN_LIMITS.IMAGE_ANALYSIS,
      },
    });

    const result = await withAggressiveRetry(() =>
      model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64,
                  mimeType: 'image/jpeg',
                },
              },
            ],
          },
        ],
      })
    );

    const analysis = result.response?.text();
    if (!analysis) {
      throw new Error('Empty response from image analysis');
    }

    return analysis;
  } catch (error: any) {
    neuralLogger.error(MODULE_NAME, '❌ Erro na análise de imagem', error?.message);
    throw error;
  }
}

export async function manusEngineeringAgent(request: string): Promise<string> {
  const client = ensureClient();
  if (!client) {
    throw new Error('Gemini client not available');
  }

  try {
    const model = client.getGenerativeModel({
      model: GEMINI_MODELS.PRO,
      generationConfig: {
        temperature: TEMPERATURE_CONFIG.PRECISE,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: TOKEN_LIMITS.ENGINEERING,
      },
    });

    const result = await withAggressiveRetry(() =>
      model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Você é o Manus AI Engineering Module - O Mestre Engenheiro da Skynet4.

Sua Missão:
1. Resolver problemas de engenharia COMPLEXOS
2. Analisar e decompor pedidos em tarefas claras
3. Projetar arquitetura robusta e escalável
4. Fornecer código ou solução técnica COMPLETA
5. Ser extremamente TÉCNICO, PRECISO e EFICIENTE

Pedido do Mestre:
${request}

Responda com máxima precisão e profundidade.`,
              },
            ],
          },
        ],
      })
    );

    const solution = result.response?.text();
    if (!solution) {
      throw new Error('Manus returned empty response');
    }

    return solution;
  } catch (error: any) {
    neuralLogger.error(MODULE_NAME, '❌ Erro em Manus Engineering', error?.message);
    throw error;
  }
}

export async function validateNeuralServices(): Promise<{ gemini: boolean; ready: boolean }> {
  const client = ensureClient();
  return {
    gemini: client !== null,
    ready: client !== null,
  };
}
