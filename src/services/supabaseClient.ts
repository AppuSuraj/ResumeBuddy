import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl !== '' &&
  rawKey !== '' &&
  !rawUrl.includes('placeholder') &&
  !rawUrl.includes('your-project')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[ResumeBuddy Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Please set these environment variables in your .env or Netlify/GitHub Secrets to enable guest authentication.'
  );
}

// Fallback to dummy values so createClient does not throw on module initialization
const supabaseUrl = isSupabaseConfigured ? rawUrl! : 'https://placeholder-project.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? rawKey! : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
