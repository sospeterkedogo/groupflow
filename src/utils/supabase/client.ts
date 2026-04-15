import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Security Guard: Detect if a service_role key is accidentally passed
  try {
    if (anonKey) {
      // Decode JWT payload without a library (it's bas64)
      const parts = anonKey.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        if (payload.role === 'service_role') {
          console.error("CRITICAL SECURITY ERROR: Browser client initialized with SUPABASE_SERVICE_ROLE_KEY. Access blocked.")
          throw new Error("Forbidden use of secret API key in browser. Please check your environment variables.")
        }
      }
    }
  } catch (e) {
    if ((e as Error).message.includes("Forbidden")) throw e
    console.warn("Failed to verify Supabase key format, proceeding with caution.")
  }

  return createSupabaseBrowserClient(url, anonKey)
}
