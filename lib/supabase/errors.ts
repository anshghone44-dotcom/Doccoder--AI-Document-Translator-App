import { AuthError, PostgrestError } from '@supabase/supabase-js'

// Error types for better error handling
export interface SupabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

// Error handler for authentication errors
export function handleAuthError(error: AuthError | null): SupabaseError | null {
  if (!error) return null

  const errorMap: Record<string, string> = {
    'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
    'email_not_confirmed': 'Please check your email and click the confirmation link before signing in.',
    'signup_disabled': 'New user registration is currently disabled.',
    'email_address_invalid': 'Please enter a valid email address.',
    'password_too_short': 'Password must be at least 6 characters long.',
    'user_already_registered': 'An account with this email already exists. Please sign in instead.',
    'weak_password': 'Password is too weak. Please choose a stronger password.',
    'invalid_grant': 'Invalid login credentials.',
    'refresh_token_not_found': 'Session expired. Please sign in again.',
    'invalid_refresh_token': 'Session expired. Please sign in again.',
  }

  return {
    message: errorMap[error.message] || error.message || 'An authentication error occurred.',
    code: error.status?.toString(),
    details: error.message,
  }
}

// Error handler for database errors
export function handleDatabaseError(error: PostgrestError | null): SupabaseError | null {
  if (!error) return null

  const errorMap: Record<string, string> = {
    'PGRST116': 'No data found.',
    'PGRST301': 'Row level security violation.',
    '23505': 'This record already exists.',
    '23503': 'Referenced record does not exist.',
    '42501': 'Permission denied.',
    '42P01': 'Table does not exist.',
  }

  return {
    message: errorMap[error.code] || error.message || 'A database error occurred.',
    code: error.code,
    details: error.details,
    hint: error.hint,
  }
}

// Generic error handler
export function handleSupabaseError(error: any): SupabaseError {
  if (error?.status) {
    // Auth error
    return handleAuthError(error) || {
      message: error.message || 'An authentication error occurred.',
      code: error.status?.toString(),
    }
  }

  if (error?.code) {
    // Database error
    return handleDatabaseError(error) || {
      message: error.message || 'A database error occurred.',
      code: error.code,
    }
  }

  // Generic error
  return {
    message: error?.message || 'An unexpected error occurred.',
    details: error?.toString(),
  }
}

// Error boundary helper for React components
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorHandler?: (error: SupabaseError) => void
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args)
    } catch (error) {
      const supabaseError = handleSupabaseError(error)
      console.error('Supabase operation failed:', supabaseError)

      if (errorHandler) {
        errorHandler(supabaseError)
      }

      return null
    }
  }
}

// Validation helpers
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  password: (password: string): { valid: boolean; message?: string } => {
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters long.' }
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter.' }
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter.' }
    }
    if (!/(?=.*\d)/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number.' }
    }
    return { valid: true }
  },

  required: (value: string, fieldName: string): { valid: boolean; message?: string } => {
    if (!value || value.trim().length === 0) {
      return { valid: false, message: `${fieldName} is required.` }
    }
    return { valid: true }
  },
}

// Toast notification helpers for errors
export const errorMessages = {
  network: 'Network error. Please check your connection and try again.',
  server: 'Server error. Please try again later.',
  validation: 'Please check your input and try again.',
  unauthorized: 'You are not authorized to perform this action.',
  forbidden: 'Access denied.',
  notFound: 'The requested resource was not found.',
  conflict: 'This action conflicts with existing data.',
  rateLimit: 'Too many requests. Please wait and try again.',
}