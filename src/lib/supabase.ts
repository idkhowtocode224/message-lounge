import { createClient } from "@supabase/supabase-js";

// Resolve Supabase config in Lovable (no VITE_* envs). Try multiple sources and fall back safely.
type SupaWindow = Window & {
  __SUPABASE_URL?: string;
  __SUPABASE_ANON_KEY?: string;
  __lovable?: { supabase?: { url?: string; anonKey?: string } };
  __env?: { SUPABASE_URL?: string; SUPABASE_ANON_KEY?: string };
};

const w = globalThis as unknown as SupaWindow;

const fromEnvUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const fromEnvKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

const resolvedUrl = fromEnvUrl || w.__SUPABASE_URL || w.__lovable?.supabase?.url || w.__env?.SUPABASE_URL;
const resolvedKey = fromEnvKey || w.__SUPABASE_ANON_KEY || w.__lovable?.supabase?.anonKey || w.__env?.SUPABASE_ANON_KEY;

let supabaseUrl = resolvedUrl;
let supabaseKey = resolvedKey;

if (!supabaseUrl || !supabaseKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase config missing. Using placeholder client; auth/realtime disabled until connected."
  );
  // Provide safe placeholders to avoid constructor error. These will not work for real requests.
  supabaseUrl = "https://placeholder.supabase.co";
  supabaseKey = "public-anon-key";
}

export const supabase = createClient(supabaseUrl, supabaseKey);

