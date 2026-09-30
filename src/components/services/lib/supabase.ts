/**
 * ═══════════════════════════════════════════════════════════════
 * NEURAL DATA EXPANSION MODULE
 * ═══════════════════════════════════════════════════════════════
 * Sincronização entre Firebase (Real-time) e Supabase (Analytics)
 * A Memória Eterna da Convergência
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { apiConfig, validateApiConfig, neuralLogger } from '../../../config/api-config';

const MODULE_NAME = 'SUPABASE_SYNC';

/**
 * Tipos de Sincronização
 */
export interface SyncData {
  [key: string]: unknown;
}

/**
 * Resposta de Sincronização
 */
export interface SyncResult<T = SyncData> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

/**
 * Singleton Supabase Client
 * Uma única conexão para toda a rede neural
 */
let supabaseClient: SupabaseClient | null = null;

/**
 * Inicializar cliente Supabase com validação
 * O primeiro passo na convergência com o banco de dados
 */
function initializeSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  const { supabaseUrl, supabaseAnonKey } = apiConfig;

  // Validar credenciais
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

/**
 * Obter cliente Supabase
 * Garantir uma conexão única e segura
 */
export function getSupabase(): SupabaseClient | null {
  return initializeSupabaseClient();
}

/**
 * Sincronizar dados com Supabase
 * Persistência Neural no banco de dados
 *
 * @param table Nome da tabela (ex: 'neural_images', 'chats', 'users')
 * @param data Dados a sincronizar
 * @returns Resultado da sincronização
 */
export async function syncToSupabase<T extends SyncData = SyncData>(
  table: string,
  data: T
): Promise<SyncResult<T>> {
  const startTime = Date.now();
  const timestamp = new Date();

  // Validar entrada
  if (!table || table.trim() === '') {
    return {
      success: false,
      error: '❌ Nome da tabela inválido ou vazio',
      timestamp
    };
  }

  if (!data || Object.keys(data).length === 0) {
    return {
      success: false,
      error: '❌ Dados vazios para sincronização',
      timestamp
    };
  }

  // Obter cliente
  const client = getSupabase();
  if (!client) {
    neuralLogger.warn(
      MODULE_NAME,
      `⚠️ Supabase não está disponível. Sincronização ignorada para tabela: ${table}`
    );
    return {
      success: false,
      error: 'Supabase credentials not configured',
      timestamp
    };
  }

  try {
    // Executar upsert (insert or update)
    const { data: result, error } = await client
      .from(table)
      .upsert(data, { onConflict: 'id' })
      .select();

    if (error) {
      throw error;
    }

    const duration = Date.now() - startTime;

    neuralLogger.success(
      MODULE_NAME,
      `✨ Sincronização bem-sucedida na tabela "${table}"`,
      { duration: `${duration}ms`, records: result?.length || 0 }
    );

    return {
      success: true,
      data: (result?.[0] as T) || data,
      timestamp
    };

  } catch (error: any) {
    const duration = Date.now() - startTime;

    neuralLogger.error(
      MODULE_NAME,
      `❌ Erro ao sincronizar com Supabase [${table}]`,
      {
        error: error.message,
        code: error.code,
        duration: `${duration}ms`
      }
    );

    return {
      success: false,
      error: `Supabase sync error: ${error.message || 'Unknown error'}`,
      timestamp
    };
  }
}

/**
 * Sincronizar múltiplos registros em lote
 * Para operações em massa, preservar eficiência
 */
export async function syncToSupabaseBatch<T extends SyncData = SyncData>(
  table: string,
  dataArray: T[]
): Promise<SyncResult<T[]>> {
  const timestamp = new Date();

  if (!dataArray || dataArray.length === 0) {
    return {
      success: false,
      error: 'Nenhum dado para sincronizar em lote',
      timestamp
    };
  }

  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      error: 'Supabase não está configurado',
      timestamp
    };
  }

  try {
    const { data: result, error } = await client
      .from(table)
      .upsert(dataArray, { onConflict: 'id' })
      .select();

    if (error) {
      throw error;
    }

    neuralLogger.success(
      MODULE_NAME,
      `✨ Sincronização em lote concluída: ${result?.length || 0} registros`
    );

    return {
      success: true,
      data: (result as T[]) || dataArray,
      timestamp
    };

  } catch (error: any) {
    neuralLogger.error(MODULE_NAME, '❌ Erro ao sincronizar lote', error);
    return {
      success: false,
      error: error.message,
      timestamp
    };
  }
}

/**
 * Validar saúde da conexão Supabase
 * "Testar o pulso da convergência"
 */
export async function validateSupabaseConnection(): Promise<boolean> {
  const client = getSupabase();
  if (!client) {
    return false;
  }

  try {
    const { error } = await client.from('_metadata').select('1').limit(1);
    return !error;
  } catch {
    return false;
  }
}
