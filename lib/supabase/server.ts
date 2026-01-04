import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { SupabaseClient } from "@supabase/supabase-js"

// Mock client for when Supabase is not configured
const createMockClient = (): SupabaseClient => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      // Add other auth methods as needed
    } as any,
    from: () => ({
      select: async () => ({ data: [], error: { message: 'Supabase not configured' } }),
      insert: async () => ({ error: { message: 'Supabase not configured' } }),
      update: async () => ({ error: { message: 'Supabase not configured' } }),
      delete: async () => ({ error: { message: 'Supabase not configured' } }),
    }),
    // Add other methods as needed
  } as unknown as SupabaseClient
}

export async function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Supabase environment variables not set. Using mock client. Some server-side features will be disabled.")
    return createMockClient()
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies().getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookies().set(name, value, options))
          } catch (error) {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
            console.warn('Failed to set cookies in server component:', error)
          }
        },
      },
      auth: {
        flowType: 'pkce'
      }
    }
  )
}
