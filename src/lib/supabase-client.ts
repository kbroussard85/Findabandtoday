import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a function to get the client to avoid build-time errors if env vars are missing
export const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time, we return a mock or null to prevent crashing
    return null as any;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

// For backward compatibility with the ProfileEditor
export const supabase = (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null as any;
