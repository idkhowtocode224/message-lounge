import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  // Non-fatal: app can still render, but auth/features will be limited.
  // eslint-disable-next-line no-console
  console.warn("Supabase env vars are missing. Auth/chat disabled until configured.");
}

export const supabase = createClient(supabaseUrl ?? "", supabaseKey ?? "");
