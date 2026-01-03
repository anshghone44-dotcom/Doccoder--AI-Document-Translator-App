# Supabase Integration

This directory contains comprehensive Supabase integration utilities for the AI Document Translator app.

## Files Overview

### `client.ts`
Client-side Supabase configuration with PKCE authentication, session persistence, and global caching.

### `server.ts`
Server-side Supabase configuration for API routes and server components.

### `middleware.ts`
Route protection middleware that secures authenticated pages and redirects unauthenticated users.

### `hooks.ts`
Custom React hooks for common Supabase operations:
- `useAuth()` - User authentication state
- `useProfile()` - User profile management
- `usePreferences()` - User preferences
- `useTranslationHistory()` - Translation history with pagination

### `errors.ts`
Comprehensive error handling utilities:
- `handleAuthError()` - Authentication error handling
- `handleDatabaseError()` - Database error handling
- `handleSupabaseError()` - Generic error handling
- `withErrorHandling()` - Error boundary wrapper
- `validators` - Input validation helpers

### `types.ts`
TypeScript type definitions for the application:
- Database types
- Form types
- API response types
- Component prop types

### `database.types.ts`
Auto-generated Supabase database types for type safety.

## Usage Examples

### Authentication

```typescript
import { useAuth, auth } from '@/lib/supabase/hooks'

// In a component
function LoginForm() {
  const { user, loading } = useAuth()

  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await auth.signIn(email, password)
    if (error) {
      console.error('Login failed:', error.message)
    }
  }

  const handleOAuth = async () => {
    const { data, error } = await auth.signInWithOAuth('google')
  }

  if (loading) return <div>Loading...</div>
  if (user) return <div>Welcome, {user.email}!</div>

  return (
    <form onSubmit={handleLogin}>
      {/* Form fields */}
    </form>
  )
}
```

### User Profile Management

```typescript
import { useProfile } from '@/lib/supabase/hooks'

function ProfilePage() {
  const { profile, loading, updateProfile } = useProfile()

  const handleUpdate = async (updates: any) => {
    const { data, error } = await updateProfile(updates)
    if (error) {
      console.error('Update failed:', error.message)
    }
  }

  if (loading) return <div>Loading profile...</div>

  return (
    <div>
      <h1>{profile?.full_name || 'Anonymous'}</h1>
      <p>{profile?.bio}</p>
      {/* Profile form */}
    </div>
  )
}
```

### Translation History

```typescript
import { useTranslationHistory } from '@/lib/supabase/hooks'

function HistoryPage() {
  const { history, loading, addTranslation } = useTranslationHistory(20)

  const handleNewTranslation = async (translation: any) => {
    const { data, error } = await addTranslation(translation)
  }

  if (loading) return <div>Loading history...</div>

  return (
    <div>
      {history.map(item => (
        <div key={item.id}>
          <p>{item.source_text} → {item.translated_text}</p>
          <small>{item.created_at}</small>
        </div>
      ))}
    </div>
  )
}
```

### Error Handling

```typescript
import { handleSupabaseError, withErrorHandling } from '@/lib/supabase/errors'

function TranslationComponent() {
  const translateText = withErrorHandling(
    async (text: string) => {
      // Translation logic
      return await api.translate(text)
    },
    (error) => {
      // Show error to user
      toast.error(error.message)
    }
  )

  return (
    <button onClick={() => translateText('Hello world')}>
      Translate
    </button>
  )
}
```

### Database Operations

```typescript
import { db } from '@/lib/supabase/hooks'

// Direct table operations
const { data, error } = await db.profiles().select('*').eq('id', userId)

// Generic table operations
const { data, error } = await db.from('translation_history')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10)
```

## Environment Variables

Make sure to set these environment variables in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_database_connection_string
```

## Database Schema

The database includes the following tables:

- `profiles` - User profile information
- `user_preferences` - User settings and preferences
- `translation_history` - Translation records
- `api_usage_stats` - API usage tracking

All tables include Row Level Security (RLS) policies for data protection.

## Security

- All database operations use RLS policies
- Authentication is handled via Supabase Auth
- Route protection via middleware
- Input validation and sanitization
- Error handling prevents information leakage

## Best Practices

1. Always use the provided hooks for data fetching
2. Handle errors appropriately in your components
3. Use TypeScript types for better development experience
4. Validate user input before database operations
5. Use the error handling utilities for consistent error messages
6. Keep sensitive operations server-side when possible