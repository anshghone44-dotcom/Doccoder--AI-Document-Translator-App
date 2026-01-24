export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      api_usage_stats: {
        Row: {
          characters_processed: number | null
          created_at: string
          endpoint: string
          id: string
          period_end: string
          period_start: string
          request_count: number
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          characters_processed?: number | null
          created_at?: string
          endpoint: string
          id?: string
          period_end: string
          period_start: string
          request_count?: number
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          characters_processed?: number | null
          created_at?: string
          endpoint?: string
          id?: string
          period_end?: string
          period_start?: string
          request_count?: number
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      glossary: {
        Row: {
          context: string | null
          created_at: string
          id: string
          language_pair: string | null
          term: string
          translation: string
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          language_pair?: string | null
          term: string
          translation: string
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          language_pair?: string | null
          term?: string
          translation?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "glossary_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          preferred_languages: string[] | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          preferred_languages?: string[] | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          preferred_languages?: string[] | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      translation_history: {
        Row: {
          created_at: string
          id: string
          model_used: string | null
          processing_time_ms: number | null
          source_language: string
          source_text: string
          target_language: string
          translated_text: string
          user_id: string
          word_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          model_used?: string | null
          processing_time_ms?: number | null
          source_language: string
          source_text: string
          target_language: string
          translated_text: string
          user_id: string
          word_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          model_used?: string | null
          processing_time_ms?: number | null
          source_language?: string
          source_text?: string
          target_language?: string
          translated_text?: string
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "translation_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_preferences: {
        Row: {
          auto_save: boolean | null
          created_at: string
          default_source_language: string | null
          default_target_language: string | null
          font_size: string | null
          language: string | null
          notifications_enabled: boolean | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_save?: boolean | null
          created_at?: string
          default_source_language?: string | null
          default_target_language?: string | null
          font_size?: string | null
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_save?: boolean | null
          created_at?: string
          default_source_language?: string | null
          default_target_language?: string | null
          font_size?: string | null
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}