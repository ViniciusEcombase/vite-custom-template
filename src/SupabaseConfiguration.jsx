import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://niihlyofonxtmzgzanpv.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paWhseW9mb254dG16Z3phbnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MjM4NjAsImV4cCI6MjA2MjI5OTg2MH0.GWWHIBQBDpNOvQiWZD_pRDDfOLG2u0DTV7JDcXlKndc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  // Remove the CORS headers - they don't work from client side
  // Supabase handles CORS automatically for proper endpoints
});

export default supabase;
