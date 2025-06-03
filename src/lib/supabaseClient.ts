import { createClient } from '@supabase/supabase-js'

// Ensure environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing. Check your .env.local file.')
}

// Global variable to hold the single Supabase client instance
// Using a true singleton pattern with a closure to ensure only one instance exists
const createSupabaseClient = (() => {
  let instance: any = null;
  
  return () => {
    if (instance === null) {
      instance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      console.log('Supabase client initialized as singleton');
    } else {
      console.log('Returning existing Supabase client instance');
    }
    return instance;
  };
})();

// Export the singleton instance
export const supabase = createSupabaseClient();
