import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && key);

/**
 * PKCE flow puts the auth code in the query string (?code=...), which does not clash
 * with HashRouter's #/route. The implicit flow would put tokens in the hash instead.
 */
export const supabase: SupabaseClient = createClient(url || "http://localhost", key || "missing", {
  auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
