import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | undefined

if (typeof window !== "undefined") {
  // @ts-expect-error - globalThis augmentation for client caching
  if (!globalThis.__supabaseClient) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // @ts-expect-error - globalThis augmentation for client caching
      globalThis.__supabaseClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      )
    }
  }
  // @ts-expect-error - globalThis augmentation for client caching
  client = globalThis.__supabaseClient
}

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase environment variables")
  }

  if (client) {
    return client
  }

  // This should only run on first call if globalThis wasn't set
  client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  return client
}
