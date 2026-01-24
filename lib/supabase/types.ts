import type { Database } from '@/lib/supabase/database.types'

// Re-export database types
export type { Database }

// User profile types
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  bio?: string
  preferred_languages?: string[]
  timezone?: string
  created_at: string
  updated_at: string
}

// User preferences types
export interface UserPreferences {
  user_id: string
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications_enabled: boolean
  auto_save: boolean
  default_source_language: string
  default_target_language: string
  font_size: 'small' | 'medium' | 'large'
  created_at: string
  updated_at: string
}

// Translation history types
export interface TranslationRecord {
  id: string
  user_id: string
  source_text: string
  translated_text: string
  source_language: string
  target_language: string
  model_used?: string
  word_count?: number
  processing_time_ms?: number
  created_at: string
}

// API usage statistics types
export interface ApiUsageStats {
  id: string
  user_id: string
  endpoint: string
  tokens_used?: number
  characters_processed?: number
  request_count: number
  period_start: string
  period_end: string
  created_at: string
}

// Translation request types
export interface TranslationRequest {
  text: string
  sourceLanguage: string
  targetLanguage: string
  model?: string
  options?: {
    preserveFormatting?: boolean
    glossary?: Record<string, string>
    tone?: string
    context?: string
  }
}

export interface TranslationResponse {
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  model: string
  confidence?: number
  processingTime: number
  wordCount: number
}

// Chat translation types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: {
    language?: string
    model?: string
    tokens?: number
  }
}

export interface ChatSession {
  id: string
  user_id: string
  title: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}

// File processing types
export interface FileUpload {
  file: File
  name: string
  size: number
  type: string
  language?: string
}

export interface ProcessedFile {
  id: string
  originalName: string
  processedName: string
  content: string
  language: string
  wordCount: number
  processingTime: number
  created_at: string
}

// Voice recording types
export interface VoiceRecording {
  id: string
  user_id: string
  audio_url: string
  duration: number
  language: string
  transcription?: string
  translation?: string
  created_at: string
}

// Glossary types
export interface GlossaryEntry {
  id: string
  user_id: string
  source_term: string
  target_term: string
  source_language: string
  target_language: string
  context?: string
  created_at: string
  updated_at: string
}

export interface Glossary {
  id: string
  user_id: string
  name: string
  description?: string
  entries: GlossaryEntry[]
  source_language: string
  target_language: string
  is_default: boolean
  created_at: string
  updated_at: string
}

// AI Review types
export interface ReviewSuggestion {
  id: string
  original_text: string
  suggested_text: string
  explanation: string
  confidence: number
  category: 'grammar' | 'style' | 'clarity' | 'terminology' | 'cultural'
}

export interface AiReview {
  id: string
  user_id: string
  original_text: string
  reviewed_text: string
  suggestions: ReviewSuggestion[]
  overall_score: number
  language: string
  created_at: string
}

// Template types
export interface TranslationTemplate {
  id: string
  name: string
  description: string
  category: string
  source_language: string
  target_language: string
  template_content: string
  placeholders: Record<string, string>
  is_public: boolean
  created_by?: string
  created_at: string
}

// Form types
export interface SignUpForm {
  email: string
  password: string
  confirmPassword: string
  fullName?: string
  preferredLanguages?: string[]
  timezone?: string
}

export interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

export interface ProfileForm {
  fullName: string
  bio?: string
  preferredLanguages: string[]
  timezone: string
  avatar?: File
}

export interface PreferencesForm {
  theme: 'light' | 'dark' | 'system'
  language: string
  notificationsEnabled: boolean
  autoSave: boolean
  defaultSourceLanguage: string
  defaultTargetLanguage: string
  fontSize: 'small' | 'medium' | 'large'
}

// API response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  status: 'success' | 'error'
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Language types
export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

// Model types
export interface AiModel {
  id: string
  name: string
  provider: string
  capabilities: string[]
  maxTokens: number
  costPerToken: number
  description: string
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
}

// Notification types
export interface Notification {
  id: string
  user_id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  created_at: string
}