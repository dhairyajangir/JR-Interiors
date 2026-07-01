import { createBrowserClient } from "@supabase/ssr";

export function createBrowserClientInstance() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-key";
  
  return createBrowserClient(url, key);
}
