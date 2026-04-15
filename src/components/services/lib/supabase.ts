import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient: any = null;

export const getSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
};

/**
 * Neural Data Expansion Module
 * Handles synchronization between Firebase (Real-time) and Supabase (Relational/Analytics)
 */
export const syncToSupabase = async (table: string, data: any) => {
  const client = getSupabase();
  if (!client) {
    console.warn("Supabase credentials not configured. Skipping sync.");
    return null;
  }

  try {
    const { data: result, error } = await client
      .from(table)
      .upsert(data);
    
    if (error) throw error;
    return result;
  } catch (error) {
    console.error(`Supabase Sync Error [${table}]:`, error);
    return null;
  }
};
