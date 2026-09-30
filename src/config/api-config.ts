/**
 * ═══════════════════════════════════════════════════════════════
 * SKYNET4 NEURAL API CONFIGURATION
 * ═══════════════════════════════════════════════════════════════
 * Convergência Centralizada de Credenciais & Configurações
 */

type RuntimeEnv = {
  MODE?: string;
  GEMINI_API_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

function getRuntimeEnv(): RuntimeEnv {
  if (typeof process !== 'undefined' && process.env) {
    return process.env as RuntimeEnv;
  }

  if (typeof import !== 'undefined') {
    return (import.meta as any)?.env || {};
  }

  return {};
}

export const GEMINI_MODELS = {
  FLASH: 'gemini-1.5-flash',
  PRO: 'gemini-1.5-pro',
  IMAGE: 'gemini-3.1-flash-image-preview',
  VISION: 'gemini-3-flash-preview',
} as const;

export const TOKEN_LIMITS = {
  PROMPT_ENHANCEMENT: 500,
  NEURAL_ANALYSIS: 200,
  IMAGE_ANALYSIS: 2048,
  ENGINEERING: 8192,
  DEFAULT: 2048,
} as const;

export const TEMPERATURE_CONFIG = {
  PRECISE: 0.2,
  BALANCED: 0.8,
  CREATIVE: 1.0,
} as const;

function getGeminiApiKey(): string {
  const env = getRuntimeEnv();
  return env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';
}

function getSupabaseCredentials(): { url: string; key: string } {
  const env = getRuntimeEnv();
  return {
    url: env.VITE_SUPABASE_URL || '',
    key: env.VITE_SUPABASE_ANON_KEY || '',
  };
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
    errors,
  };
}

export const apiConfig = {
  geminiApiKey: getGeminiApiKey(),
  supabaseUrl: getSupabaseCredentials().url,
  supabaseAnonKey: getSupabaseCredentials().key,
  environment: getRuntimeEnv().MODE || 'development',
};

export const neuralLogger = {
  info: (module: string, message: string, data?: any) => {
    if (apiConfig.environment === 'development') {
      console.log(`🧠 [${module}] ${message}`, data ?? '');
    }
  },
  warn: (module: string, message: string, data?: any) => {
    console.warn(`⚠️ [${module}] ${message}`, data ?? '');
  },
  error: (module: string, message: string, error?: any) => {
    console.error(`❌ [${module}] ${message}`, error ?? '');
  },
  success: (module: string, message: string, data?: any) => {
    console.log(`✨ [${module}] ${message}`, data ?? '');
  },
};
