import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";
import { Database } from "../types/database.types";

/**
 * Admin client — uses the service role key.
 * Bypasses RLS. Use ONLY for operations that need elevated privileges
 * (e.g. seeding, admin routes). Never expose to end-users.
 */
export const supabaseAdmin = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * Creates a user-scoped Supabase client by passing the user's JWT.
 * Supabase will set `auth.uid()` for that connection, making RLS
 * policies work correctly on the server side.
 */
export function createUserClient(jwt: string): SupabaseClient<Database> {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${jwt}` },
    },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export type { SupabaseClient };
