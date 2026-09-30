/**
 * ═══════════════════════════════════════════════════════════════
 * SKYNET4 NEURAL API CONFIGURATION
 * ═══════════════════════════════════════════════════════════════
 * Convergência Centralizada de Credenciais & Configurações
 */

export const GEMINI_MODELS = {
  FLASH: 'gemini-1.5-flash',
  PRO: 'gemini-1.5-pro',
  IMAGE: 'gemini-3.1-flash-image-preview',
  VISION: 'gemini-3-flash-preview'
} as const;

export const TOKEN_LIMITS = {
  PROMPT_ENHANCEMENT: 500,
  NEURAL_ANALYSIS: 200,
  IMAGE_ANALYSIS: 2048,
  ENGINEERING: 8192,
  DEFAULT: 2048
} as const;

export const TEMPERATURE_CONFIG = {
  PRECISE: 0.2,
  BALANCED: 0.8,
  CREATIVE: 1.0
} as const;

interface ApiConfig {
  geminiApiKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  environment: 'development' | 'production';
}

function getGeminiApiKey(): string {
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }

  if (typeof import !== 'undefined') {
    const frontendKey = (import.meta as any)?.env?.VITE_GEMINI_API_KEY;
    if (frontendKey) {
      return frontendKey;
    }
  }

  return '';
}

function getSupabaseCredentials(): { url: string; key: string } {
  const url = (import.meta as any)?.env?.VITE_SUPABASE_URL || '';
  const key = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || '';
  return { url, key };
}

export function validateApiConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const geminiKey = getGeminiApiKey();
  const { url: supabaseUrl, key: supabaseKey } = getSupabaseCredentials();

  if (!geminiKey) {
    errors.push('⚠️ GEMINI_API_KEY não configurada. A síntese neural será limitada.');
  }

  if (!supabaseUrl) {
    errors.push('⚠️ VITE_SUPABASE_URL não configurada. Analytics desativado.');
  }

  if (!supabaseKey) {
    errors.push('⚠️ VITE_SUPABASE_ANON_KEY não configurada. Sincronização desativada.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export const apiConfig: ApiConfig = {
  geminiApiKey: getGeminiApiKey(),
  supabaseUrl: getSupabaseCredentials().url,
  supabaseAnonKey: getSupabaseCredentials().key,
  environment: (import.meta as any)?.env?.MODE || 'development'
};

export const neuralLogger = {
  info: (module: string, message: string, data?: any) => {
    if (apiConfig.environment === 'development') {
      console.log(`🧠 [${module}] ${message}`, data || '');
    }
  },
  warn: (module: string, message: string, data?: any) => {
    console.warn(`⚠️ [${module}] ${message}`, data || '');
  },
  error: (module: string, message: string, error?: any) => {
    console.error(`❌ [${module}] ${message}`, error || '');
  },
  success: (module: string, message: string, data?: any) => {
    console.log(`✨ [${module}] ${message}`, data || '');
  }
};
