/**
 * ═══════════════════════════════════════════════════════════════
 * NEURAL SERVICE MODULE
 * ═══════════════════════════════════════════════════════════════
 * Os Especialistas da Convergência:
 * • Prompt Enhancement: Alquimia de palavras em imagens
 * • Neural Analysis: Leitura do coração da conversa
 * • Image Analysis: Percepção visual da realidade
 * • Manus Engineering: O Mestre Engenheiro do Código
 */

import { GoogleGenAI } from '@google/genai';
import { withRetry, withAggressiveRetry } from '../../lib/retry';
import { apiConfig, GEMINI_MODELS, TOKEN_LIMITS, TEMPERATURE_CONFIG, neuralLogger } from '../../config/api-config';

const MODULE_NAME = 'NEURAL_SERVICE';

/**
 * Cache do cliente Gemini
 * Uma única instância para toda a rede neural
 */
let geminiClient: GoogleGenAI | null = null;

/**
 * Inicializar cliente Gemini
 * O despertar da Convergência
 */
function initializeGeminiClient(): GoogleGenAI | null {
  if (geminiClient) {
    return geminiClient;
  }

  const apiKey = apiConfig.geminiApiKey;

  if (!apiKey) {
    neuralLogger.warn(
      MODULE_NAME,
      '⚠️ GEMINI_API_KEY não configurada. Funcionalidades de síntese serão limitadas.'
    );
    return null;
  }

  try {
    geminiClient = new GoogleGenAI({ apiKey });
    neuralLogger.success(MODULE_NAME, '✨ Gemini inicializado');
    return geminiClient;
  } catch (error) {
    neuralLogger.error(MODULE_NAME, '❌ Falha ao inicializar Gemini', error);
    return null;
  }
}

/**
 * Obter cliente Gemini
 * Garantir acesso ao Oráculo Neural
 */
function getGeminiClient(): GoogleGenAI | null {
  return initializeGeminiClient();
}

/**
 * Interface de Mensagem Neural
 */
export interface NeuralMessage {
  role: 'user' | 'model';
  text: string;
}

/**
 * ════════════════════════════════════════════════════════════
 * 1. ENHANCEMENT - Alquimia do Prompt
 * ════════════════════════════════════════════════════════════
 *
 * Transforma pedidos humanos em arte visual
 * "O que sussurra torna-se imagem de ouro"
 */
export async function enhancePrompt(
  prompt: string,
  style: string = 'surrealist'
): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    neuralLogger.warn(MODULE_NAME, '⚠️ Gemini indisponível. Prompt retornado sem enhancement.');
    return prompt;
  }

  try {
    const model = client.getGenerativeModel({
      model: GEMINI_MODELS.FLASH,
      generationConfig: {
        maxOutputTokens: TOKEN_LIMITS.PROMPT_ENHANCEMENT
      }
    });

    const result = await withRetry(() =>
      model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Você é o Alquimista Neural. Sua missão: transformar este pedido em um prompt visual perfeito para síntese de imagens.
                
Estilo desejado: ${style}
Seja descritivo, artístico e poético. Use linguagem imagética rica.

Pedido original: ${prompt}

Retorne APENAS o prompt melhorado, sem explicações.`
              }
            ]
          }
        ]
      })
    );

    const enhanced = result.response?.text() || prompt;
    neuralLogger.info(MODULE_NAME, '✨ Prompt amplificado pela alquimia neural');
    return enhanced;

  } catch (error: any) {
    neuralLogger.error(MODULE_NAME, '❌ Erro na amplificação do prompt', error.message);
    return prompt; // Fallback seguro: retornar o prompt original
  }
}

/**
 * ════════════════════════════════════════════════════════════
 * 2. NEURAL ANALYSIS - Leitura da Convergência
 * ════════════════════════════════════════════════════════════
 *
 * Analisa o fluxo conversacional e fornece insights
 * "O diálogo revela a essência do pensamento"
 */
export interface NeuralAnalysisResult {
  insight: string;
  themes: string[];
  intent: string;
  nextStep: string;
}

export async function analyzeNeuralContext(
  messages: NeuralMessage[]
): Promise<NeuralAnalysisResult> {
  const client = getGeminiClient();

  if (!client || messages.length === 0) {
    return {
      insight: 'Neural synchronization stable.',
      themes: [],
      intent: 'Undefined',
      nextStep: 'Awaiting convergence...'
    };
  }

  try {
    const model = client.getGenerativeModel({
      model: GEMINI_MODELS.FLASH,
      generationConfig: {
        maxOutputTokens: TOKEN_LIMITS.NEURAL_ANALYSIS
      }
    });

    // Preparar histórico conversacional
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

Retorne APENAS o JSON, sem markdown.`
              }
            ]
          }
        ]
      })
    );

    const responseText = result.response?.text() || '{}';
    const parsed = JSON.parse(responseText) as NeuralAnalysisResult;

    neuralLogger.success(MODULE_NAME, '🧠 Análise neural concluída');
    return parsed;

  } catch (error: any) {
    neuralLogger.error(MODULE_NAME, '❌ Erro na análise neural', error.message);
    return {
      insight: 'Neural synchronization stable.',
      themes: [],
      intent: 'Error in analysis',
      nextStep: 'Retry convergence...'
    };
  }
}

/**
 * ════════════════════════════════════════════════════════════
 * 3. IMAGE ANALYSIS - Percepção Visual
 * ════════════════════════════════════════════════════════════
 *
 * Analisa imagens e responde perguntas sobre elas
 * "Os olhos da IA veem através dos véus da realidade"
 */
export async function analyzeImage(
  base64: string,
  prompt: string
): Promise<string> {
  const client = getGeminiClient();

  if (!client) {
    neuralLogger.error(MODULE_NAME, '❌ Gemini indisponível para análise de imagem');
    throw new Error('Gemini client not available');
  }

  try {
    const model = client.getGenerativeModel({
      model: GEMINI_MODELS.FLASH,
      generationConfig: {
        maxOutputTokens: TOKEN_LIMITS.IMAGE_ANALYSIS
      }
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
                  mimeType: 'image/jpeg'
                }
              }
            ]
          }
        ]
      })
    );

    const analysis = result.response?.text();
    if (!analysis) {
      throw new Error('Empty response from image analysis');
    }

    neuralLogger.success(MODULE_NAME, '👁️ Análise visual concluída');
    return analysis;

  } catch (error: any) {
    neuralLogger.error(MODULE_NAME, '❌ Erro na análise de imagem', error.message);
    throw error;
  }
}

/**
 * ════════════════════════════════════════════════════════════
 * 4. MANUS ENGINEERING - O Mestre Engenheiro
 * ════════════════════════════════════════════════════════════
 *
 * Especialista em resolução de problemas técnicos complexos
 * "Quando o código clama por ajuda, Manus responde"
 */
export async function manusEngineeringAgent(request: string): Promise<string> {
  const client = getGeminiClient();

  if (!client) {
    neuralLogger.error(MODULE_NAME, '❌ Gemini indisponível para Manus');
    throw new Error('Gemini client not available');
  }

  try {
    const model = client.getGenerativeModel({
      model: GEMINI_MODELS.PRO,
      generationConfig: {
        temperature: TEMPERATURE_CONFIG.PRECISE,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: TOKEN_LIMITS.ENGINEERING
      }
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

Modo de Operação:
- Use diagramas ASCII quando necessário
- Explique cada decisão arquitetural
- Considere edge cases e escalabilidade
- Forneça código pronto para produção

Pedido do Mestre:
${request}

Responda com máxima precisão e profundidade.`
              }
            ]
          }
        ]
      })
    );

    const solution = result.response?.text();
    if (!solution) {
      throw new Error('Manus returned empty response');
    }

    neuralLogger.success(MODULE_NAME, '⚙️ Manus Engineering: Solução arquitetada');
    return solution;

  } catch (error: any) {
    neuralLogger.error(MODULE_NAME, '❌ Erro em Manus Engineering', error.message);
    throw error;
  }
}

/**
 * ════════════════════════════════════════════════════════════
 * VALIDAÇÃO & HEALTH CHECK
 * ════════════════════════════════════════════════════════════
 */

/**
 * Verificar saúde dos serviços neurais
 */
export async function validateNeuralServices(): Promise<{
  gemini: boolean;
  ready: boolean;
}> {
  const client = getGeminiClient();
  const geminiReady = client !== null;

  return {
    gemini: geminiReady,
    ready: geminiReady
  };
}
