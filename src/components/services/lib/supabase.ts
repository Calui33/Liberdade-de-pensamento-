/**
 * ═══════════════════════════════════════════════════════════════
 * NEURAL DATA EXPANSION MODULE
 * ═══════════════════════════════════════════════════════════════
 * Sincronização entre Firebase (Real-time) e Supabase (Analytics)
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { apiConfig, neuralLogger } from '../../../config/api-config';

const MODULE_NAME = 'SUPABASE_SYNC';

type SyncRecord = Record<string, unknown>;

export interface SyncResult<T = SyncRecord> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

let supabaseClient: SupabaseClient | null = null;

function initializeSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const { supabaseUrl, supabaseAnonKey } = apiConfig;

  if (!supabaseUrl || !supabaseAnonKey) {
    neuralLogger.warn(
      MODULE_NAME,
      '⚠️ Credenciais Supabase não configuradas. Modo offline ativado.',
      { url: !!supabaseUrl, key: !!supabaseAnonKey }
    );
    return null;
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    neuralLogger.success(MODULE_NAME, '✨ Supabase inicializado com sucesso');
    return supabaseClient;
  } catch (error) {
    neuralLogger.error(MODULE_NAME, '❌ Falha ao inicializar Supabase', error);
    return null;
  }
}

export function getSupabase(): SupabaseClient | null {
  return initializeSupabaseClient();
}

export async function syncToSupabase<T extends SyncRecord = SyncRecord>(
  table: string,
  data: T
): Promise<SyncResult<T>> {
  const timestamp = new Date();

  if (!table || table.trim() === '') {
    return {
      success: false,
      error: '❌ Nome da tabela inválido ou vazio',
      timestamp,
    };
  }

  if (!data || Object.keys(data).length === 0) {
    return {
      success: false,
      error: '❌ Dados vazios para sincronização',
      timestamp,
    };
  }

  const client = getSupabase();
  if (!client) {
    neuralLogger.warn(
      MODULE_NAME,
      `⚠️ Supabase indisponível. Sincronização ignorada para tabela: ${table}`
    );

    return {
      success: false,
      error: 'Supabase credentials not configured',
      timestamp,
    };
  }

  try {
    const { data: result, error } = await client
      .from(table)
      .upsert(data, { onConflict: 'id' })
      .select();

    if (error) throw error;

    neuralLogger.success(
      MODULE_NAME,
      `✨ Sincronização bem-sucedida na tabela "${table}"`,
      { records: result?.length || 0 }
    );

    return {
      success: true,
      data: (result?.[0] as T) || data,
      timestamp,
    };
  } catch (error: any) {
    neuralLogger.error(
      MODULE_NAME,
      `❌ Erro ao sincronizar com Supabase [${table}]`,
      { message: error?.message, code: error?.code }
    );

    return {
      success: false,
      error: `Supabase sync error: ${error.message || 'Unknown error'}`,
      timestamp,
    };
  }
}

export async function syncToSupabaseBatch<T extends SyncRecord = SyncRecord>(
  table: string,
  dataArray: T[]
): Promise<SyncResult<T[]>> {
  const timestamp = new Date();

  if (!dataArray || dataArray.length === 0) {
    return {
      success: false,
      error: 'Nenhum dado para sincronizar em lote',
      timestamp,
    };
  }

  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      error: 'Supabase não está configurado',
      timestamp,
    };
  }

  try {
    const { data: result, error } = await client
      .from(table)
      .upsert(dataArray, { onConflict: 'id' })
      .select();

    if (error) throw error;

    return {
      success: true,
      data: (result as T[]) || dataArray,
      timestamp,
    };
  } catch (error: any) {
    neuralLogger.error(MODULE_NAME, '❌ Erro ao sincronizar lote', error);
    return {
      success: false,
      error: error.message,
      timestamp,
    };
  }
}

export async function validateSupabaseConnection(): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client.from('_metadata').select('1').limit(1);
    return !error;
  } catch {
    return false;
  }
}
