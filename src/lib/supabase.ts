import { createClient } from "@supabase/supabase-js";

// Expose same default keys that server.ts uses for seamless out-of-the-box local sandbox operation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://fkwujxzeahauouhquhdw.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_KEY || "sb_publishable_QaOyxgqQVKNN39QIxcv7hw_QHP7PKK5";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Helper to determine if we are using the live default sandbox keys or custom ones
export const isSandboxCredentials = () => {
  return supabaseUrl.includes("fkwujxzeahauouhquhdw") && supabaseKey.startsWith("sb_publishable");
};
