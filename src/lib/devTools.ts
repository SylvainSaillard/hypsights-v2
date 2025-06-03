/**
 * Development tools and utilities for Hypsights V2
 * 
 * This file provides development-only functionality that doesn't interfere with
 * the simplified "real data only" architecture.
 */

/**
 * Logger function that only logs in development mode
 * @param message The message to log
 * @param data Additional data to log
 * @param isError Whether this is an error log (uses console.error instead of console.log)
 */
export function devLog(message: string, data?: any, isError?: boolean): void {
  if (import.meta.env.DEV) {
    if (isError) {
      console.error(`[DEV ERROR] ${message}`, data || '');
    } else {
      console.log(`[DEV] ${message}`, data || '');
    }
  }
}

/**
 * Performance measurement utility - start timer
 * @param label The label for the timer
 */
export function startPerformanceTimer(label: string): void {
  if (import.meta.env.DEV) {
    console.time(`[PERF] ${label}`);
  }
}

/**
 * Performance measurement utility - end timer
 * @param label The label for the timer
 */
export function endPerformanceTimer(label: string): void {
  if (import.meta.env.DEV) {
    console.timeEnd(`[PERF] ${label}`);
  }
}

/**
 * Get the current Hypsights environment
 * @returns The current environment - 'development', 'staging', or 'production'
 */
export function getEnvironment(): 'development' | 'staging' | 'production' {
  if (import.meta.env.DEV) {
    return 'development';
  }
  
  // Check URL for staging environment
  if (window.location.hostname.includes('staging') || 
      window.location.hostname.includes('test')) {
    return 'staging';
  }
  
  return 'production';
}

/**
 * Checks if code is running on localhost
 * @returns True if running on localhost
 */
export function isLocalhost(): boolean {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
}

/**
 * Generate a request ID for API calls
 * Used for deduplicating requests (especially with React 18 double renders in development)
 * @param prefix Optional prefix for the ID
 * @returns A unique request ID
 */
export function generateRequestId(prefix: string = 'req'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get Supabase URL from environment
 * @returns The Supabase URL
 */
export function getSupabaseUrl(): string {
  return import.meta.env.VITE_SUPABASE_URL as string;
}

/**
 * Get Supabase anonymous key from environment
 * @returns The Supabase anonymous key
 */
export function getSupabaseAnonKey(): string {
  return import.meta.env.VITE_SUPABASE_ANON_KEY as string;
}
