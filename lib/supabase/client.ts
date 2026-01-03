import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | undefined

// Enhanced error handling for Supabase client creation
function validateEnvironmentVariables() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not set. Please check your environment variables.\n" +
      "Get this value from: https://app.supabase.com/project/YOUR_PROJECT/settings/api"
    )
  }

  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Please check your environment variables.\n" +
      "Get this value from: https://app.supabase.com/project/YOUR_PROJECT/settings/api"
    )
  }

  // Check for placeholder values
  if (url.includes('your-project-ref') || url.includes('your-project')) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL contains placeholder values. Please update with your actual Supabase project URL.\n" +
      "Example: https://abcdefghijklmnop.supabase.co"
    )
  }

  if (key.includes('your-supabase') || key.includes('your-anon-key')) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY contains placeholder values. Please update with your actual Supabase anon key.\n" +
      "This should be a long string starting with 'eyJ...' from your Supabase project settings."
    )
  }

  return { url, key }
}

if (typeof window !== "undefined") {
  try {
    const { url, key } = validateEnvironmentVariables()

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
  const { url, key } = validateEnvironmentVariables()

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
