import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';
import type { SupabaseClient } from './supabase.client';

// Environment variables for Supabase configuration
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

/**
 * Create a Supabase client for server-side usage with auth context from cookies
 */
export function createClient(cookies: AstroCookies): SupabaseClient {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Cookie: cookies.toString(),
      },
    },
  });
}
