import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

// Custom hook for user authentication state
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, session, loading }
}

// Custom hook for user profile
export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(data)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [user])

  const updateProfile = async (updates: any) => {
    if (!user) return { error: 'No user logged in' }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (!error && data) {
      setProfile(data)
    }

    return { data, error }
  }

  return { profile, loading, updateProfile }
}

// Custom hook for user preferences
export function usePreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setPreferences(null)
      setLoading(false)
      return
    }

    const fetchPreferences = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching preferences:', error)
      } else {
        setPreferences(data)
      }
      setLoading(false)
    }

    fetchPreferences()
  }, [user])

  const updatePreferences = async (updates: any) => {
    if (!user) return { error: 'No user logged in' }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: user.id, ...updates })
      .select()
      .single()

    if (!error && data) {
      setPreferences(data)
    }

    return { data, error }
  }

  return { preferences, loading, updatePreferences }
}

// Custom hook for translation history
export function useTranslationHistory(limit = 10) {
  const { user } = useAuth()
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setHistory([])
      setLoading(false)
      return
    }

    const fetchHistory = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('translation_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching translation history:', error)
      } else {
        setHistory(data || [])
      }
      setLoading(false)
    }

    fetchHistory()
  }, [user, limit])

  const addTranslation = async (translation: {
    source_text: string
    translated_text: string
    source_language: string
    target_language: string
    model_used?: string
    word_count?: number
  }) => {
    if (!user) return { error: 'No user logged in' }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('translation_history')
      .insert({
        user_id: user.id,
        ...translation
      })
      .select()
      .single()

    if (!error && data) {
      setHistory(prev => [data, ...prev.slice(0, limit - 1)])
    }

    return { data, error }
  }

  return { history, loading, addTranslation }
}

// Utility functions for authentication
export const auth = {
  signUp: async (email: string, password: string, metadata?: any) => {
    const supabase = createClient()
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  },

  signIn: async (email: string, password: string) => {
    const supabase = createClient()
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  },

  signInWithOAuth: async (provider: 'google' | 'github') => {
    const supabase = createClient()
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  },

  signOut: async () => {
    const supabase = createClient()
    return await supabase.auth.signOut()
  },

  resetPassword: async (email: string) => {
    const supabase = createClient()
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
  },
}

// Database utility functions
export const db = {
  // Generic table operations
  from: (table: string) => {
    const supabase = createClient()
    return supabase.from(table)
  },

  // Specific table helpers
  profiles: () => {
    const supabase = createClient()
    return supabase.from('profiles')
  },

  userPreferences: () => {
    const supabase = createClient()
    return supabase.from('user_preferences')
  },

  translationHistory: () => {
    const supabase = createClient()
    return supabase.from('translation_history')
  },

  apiUsageStats: () => {
    const supabase = createClient()
    return supabase.from('api_usage_stats')
  },
}