import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedAdminClient: SupabaseClient<any> | null | undefined;

/**
 * Returns a Supabase admin client when the service role configuration is available.
 * The module does not throw if configuration is missing so that applications can
 * still load in environments where service-role operations are disabled.
 */
export function getSupabaseAdminClient<Database = any>(): SupabaseClient<Database> | null {
  if (cachedAdminClient !== undefined) {
    return cachedAdminClient as SupabaseClient<Database> | null;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    cachedAdminClient = null;
    return cachedAdminClient;
  }

  cachedAdminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedAdminClient as SupabaseClient<Database>;
}
