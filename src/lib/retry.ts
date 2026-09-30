/**
 * Utility for retrying async operations
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    if (retries <= 0) throw error;

    const message = error instanceof Error ? error.message : String(error);

    // Only retry on 500 errors or network issues
    const isRetryable = message.includes('500') ||
                        message.includes('xhr error') ||
                        message.includes('ProxyUnaryCall') ||
                        message.includes('fetch') ||
                        message.includes('Network Error');

    if (!isRetryable) throw error;

    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}
