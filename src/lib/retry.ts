/**
 * ═══════════════════════════════════════════════════════════════
 * NEURAL RESILIENCE ENGINE
 * ═══════════════════════════════════════════════════════════════
 * Sistema avançado de retry com backoff exponencial e jitter.
 * Mantém compatibilidade com a API antiga do projeto.
 */

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  timeoutMs: number;
  backoffMultiplier: number;
  jitterFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  timeoutMs: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.1,
};

const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];
const RETRYABLE_ERROR_PATTERNS = [
  'timeout',
  'xhr error',
  'network error',
  'econnrefused',
  'econnreset',
  'unavailable',
  'temporarily',
  'throttled',
  'resource_exhausted',
  'rate limit',
];

function isRetryableError(error: any): boolean {
  if (error?.status && RETRYABLE_STATUS_CODES.includes(error.status)) {
    return true;
  }

  const message = (error?.message || '').toLowerCase();
  return RETRYABLE_ERROR_PATTERNS.some(pattern => message.includes(pattern));
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs
  );

  const jitter = exponentialDelay * config.jitterFactor * Math.random();
  return Math.floor(exponentialDelay + jitter);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retriesOrConfig: number | Partial<RetryConfig> = 3,
  maybeDelay?: number
): Promise<T> {
  const finalConfig: RetryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    ...(typeof retriesOrConfig === 'number'
      ? { maxRetries: retriesOrConfig, initialDelayMs: maybeDelay ?? DEFAULT_RETRY_CONFIG.initialDelayMs }
      : retriesOrConfig),
  };

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      const result = await Promise.race([
        fn(),
        new Promise<T>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error(`Operation timeout after ${finalConfig.timeoutMs}ms`));
          }, finalConfig.timeoutMs);
        }),
      ]);

      if (timeoutId) clearTimeout(timeoutId);
      return result;
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      lastError = error;

      const retryable = isRetryableError(error);

      console.warn(`🔄 [NEURAL RETRY] ${error?.message || 'Retrying...'}`, {
        attempt: attempt + 1,
        maxAttempts: finalConfig.maxRetries + 1,
        retryable,
        status: error?.status,
      });

      if (!retryable || attempt === finalConfig.maxRetries) {
        throw error;
      }

      const delay = calculateDelay(attempt, finalConfig);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Max retries exceeded with unknown error');
}

export async function withSimpleRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  return withRetry(fn, { maxRetries });
}

export async function withAggressiveRetry<T>(fn: () => Promise<T>): Promise<T> {
  return withRetry(fn, {
    maxRetries: 5,
    initialDelayMs: 500,
    maxDelayMs: 15000,
    timeoutMs: 60000,
    backoffMultiplier: 2.5,
  });
}

export async function withConservativeRetry<T>(fn: () => Promise<T>): Promise<T> {
  return withRetry(fn, {
    maxRetries: 2,
    initialDelayMs: 500,
    maxDelayMs: 5000,
    timeoutMs: 15000,
    backoffMultiplier: 2,
  });
}
