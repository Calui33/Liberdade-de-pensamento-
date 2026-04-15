/**
 * Utility for retrying async operations
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0) throw error;
    
    // Only retry on 500 errors or network issues
    const isRetryable = error.message?.includes('500') || 
                        error.message?.includes('xhr error') || 
                        error.message?.includes('ProxyUnaryCall') ||
                        error.message?.includes('fetch') ||
                        error.message?.includes('Network Error');
    
    if (!isRetryable) throw error;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}
