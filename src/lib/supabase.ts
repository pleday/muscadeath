import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** True once VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set (see .env.example). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/**
 * Public (anon) Supabase client. Safe to expose in the frontend bundle: write
 * access is enforced server-side by the Row Level Security policies defined
 * in supabase/schema.sql, not by keeping this key secret.
 */
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null
