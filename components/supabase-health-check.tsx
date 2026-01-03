'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface HealthCheckResult {
  status: 'checking' | 'success' | 'error'
  message: string
  details?: string
}

export default function SupabaseHealthCheck() {
  const [results, setResults] = useState<Record<string, HealthCheckResult>>({})
  const [isVisible, setIsVisible] = useState(false)

  const runHealthCheck = async () => {
    const newResults: Record<string, HealthCheckResult> = {}

    // Check environment variables
    const updateResult = (key: string, result: HealthCheckResult) => {
      setResults(prev => ({ ...prev, [key]: result }))
    }

    // 1. Environment variables
    updateResult('env', { status: 'checking', message: 'Checking environment variables...' })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      updateResult('env', {
        status: 'error',
        message: 'Environment variables missing',
        details: 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set'
      })
      return
    }

    if (supabaseUrl.includes('your-project') || supabaseKey.includes('your-')) {
      updateResult('env', {
        status: 'error',
        message: 'Environment variables contain placeholders',
        details: 'Please update .env.local with your actual Supabase credentials'
      })
      return
    }

    updateResult('env', { status: 'success', message: 'Environment variables configured' })

    // 2. Connection test
    updateResult('connection', { status: 'checking', message: 'Testing connection...' })

    try {
      const supabase = createClient()
      const { error } = await supabase.from('profiles').select('count').limit(1)

      if (error) {
        updateResult('connection', {
          status: 'error',
          message: 'Connection failed',
          details: error.message
        })
      } else {
        updateResult('connection', { status: 'success', message: 'Connection successful' })
      }
    } catch (error) {
      updateResult('connection', {
        status: 'error',
        message: 'Connection error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // 3. Database tables
    updateResult('tables', { status: 'checking', message: 'Checking database tables...' })

    try {
      const supabase = createClient()
      const tables = ['profiles', 'user_preferences', 'translation_history']
      let successCount = 0

      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('*').limit(1)
          if (!error) successCount++
        } catch {}
      }

      if (successCount === tables.length) {
        updateResult('tables', { status: 'success', message: 'All tables exist' })
      } else {
        updateResult('tables', {
          status: 'error',
          message: 'Some tables missing',
          details: `Found ${successCount}/${tables.length} tables. Run database migration.`
        })
      }
    } catch (error) {
      updateResult('tables', {
        status: 'error',
        message: 'Table check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // 4. Authentication
    updateResult('auth', { status: 'checking', message: 'Testing authentication...' })

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.getSession()

      if (error && !error.message.includes('session')) {
        updateResult('auth', {
          status: 'error',
          message: 'Auth system error',
          details: error.message
        })
      } else {
        updateResult('auth', { status: 'success', message: 'Authentication system ready' })
      }
    } catch (error) {
      updateResult('auth', {
        status: 'error',
        message: 'Auth check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  useEffect(() => {
    if (isVisible) {
      runHealthCheck()
    }
  }, [isVisible])

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          🔍 Check Supabase Setup
        </button>
      </div>
    )
  }

  const getStatusIcon = (status: HealthCheckResult['status']) => {
    switch (status) {
      case 'checking': return '⏳'
      case 'success': return '✅'
      case 'error': return '❌'
    }
  }

  const getStatusColor = (status: HealthCheckResult['status']) => {
    switch (status) {
      case 'checking': return 'text-yellow-600'
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Supabase Health Check</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {Object.entries(results).map(([key, result]) => (
            <div key={key} className="flex items-start space-x-3">
              <span className="text-lg">{getStatusIcon(result.status)}</span>
              <div className="flex-1">
                <div className={`font-medium ${getStatusColor(result.status)}`}>
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </div>
                <div className="text-sm text-gray-600">{result.message}</div>
                {result.details && (
                  <div className="text-xs text-gray-500 mt-1">{result.details}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex space-x-2">
          <button
            onClick={runHealthCheck}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            🔄 Re-check
          </button>
          <a
            href="/SUPABASE_SETUP.md"
            target="_blank"
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
          >
            📖 Setup Guide
          </a>
        </div>
      </div>
    </div>
  )
}