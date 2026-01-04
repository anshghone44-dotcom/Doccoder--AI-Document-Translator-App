import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | undefined

// Mock client for when Supabase is not configured
const createMockClient = (): SupabaseClient => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
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

// Enhanced error handling for Supabase client creation
function validateEnvironmentVariables() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn(
      "Supabase environment variables not set. Some features will be disabled.\n" +
      "To enable full functionality, set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.\n" +
      "Get these values from: https://app.supabase.com/project/YOUR_PROJECT/settings/api"
    )
    return null
  }

  // Check for placeholder values
  if (url.includes('your-project-ref') || url.includes('your-project')) {
    console.warn(
      "NEXT_PUBLIC_SUPABASE_URL contains placeholder values. Please update with your actual Supabase project URL.\n" +
      "Example: https://abcdefghijklmnop.supabase.co"
    )
    return null
  }

  if (key.includes('your-supabase') || key.includes('your-anon-key')) {
    console.warn(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY contains placeholder values. Please update with your actual Supabase anon key.\n" +
      "This should be a long string starting with 'eyJ...' from your Supabase project settings."
    )
    return null
  }

  return { url, key }
}

if (typeof window !== "undefined") {
  try {
    const envVars = validateEnvironmentVariables()
    
    if (envVars) {
      const { url, key } = envVars
      // @ts-expect-error - globalThis augmentation for client caching
      if (!globalThis.__supabaseClient) {
        // @ts-expect-error - globalThis augmentation for client caching
        globalThis.__supabaseClient = createBrowserClient(
          url,
          key,
          {
            auth: {
              autoRefreshToken: true,
              persistSession: true,
              detectSessionInUrl: true,
              flowType: 'pkce'
            },
            global: {
              headers: {
                'X-Client-Info': 'doccoder-web-app'
              }
            }
          }
        )
      }
      // @ts-expect-error - globalThis augmentation for client caching
      client = globalThis.__supabaseClient
    } else {
      console.warn('Supabase client not initialized due to missing/invalid environment variables')
    }
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    // In development, we'll still create the client but log the error
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using fallback Supabase client. Please fix environment variables for full functionality.')
    }
  }
}

export function createClient() {
  if (client) {
    return client
  }

  // Validate environment variables
  const envVars = validateEnvironmentVariables()
  
  if (!envVars) {
    console.warn('Supabase not configured, using mock client. Some features will be disabled.')
    client = createMockClient()
    return client
  }

  const { url, key } = envVars

  // This should only run on first call if globalThis wasn't set
  client = createBrowserClient(
    url,
    key,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'X-Client-Info': 'doccoder-web-app'
        }
      }
    }
  )

  return client
}
