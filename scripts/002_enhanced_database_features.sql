-- Migration: Add enhanced database features for Doccoder
-- This script adds new tables and improves existing ones for better functionality

-- Check if profiles table exists before proceeding
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        RAISE EXCEPTION 'profiles table does not exist. Please run the base schema migration first.';
    END IF;
END $$;

-- Add new columns to profiles table (using DO block for safe column addition)
DO $$
BEGIN
    -- Add columns one by one to handle potential conflicts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'country') THEN
        ALTER TABLE public.profiles ADD COLUMN country TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'date_of_birth') THEN
        ALTER TABLE public.profiles ADD COLUMN date_of_birth DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'preferred_languages') THEN
        ALTER TABLE public.profiles ADD COLUMN preferred_languages TEXT[] DEFAULT ARRAY['en', 'es'];
    END IF;
END $$;

-- Create translation history table
CREATE TABLE IF NOT EXISTS public.translation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  model_used TEXT DEFAULT 'gpt-4',
  word_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system',
  default_source_lang TEXT DEFAULT 'en',
  default_target_lang TEXT DEFAULT 'es',
  auto_save BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create API usage statistics table
CREATE TABLE IF NOT EXISTS public.api_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  characters_processed INTEGER DEFAULT 0,
  request_count INTEGER DEFAULT 1,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint, date)
);

-- Enable Row Level Security for new tables
ALTER TABLE public.translation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_stats ENABLE ROW LEVEL SECURITY;

-- Translation history policies
CREATE POLICY "translation_history_select_own" ON public.translation_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "translation_history_insert_own" ON public.translation_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "user_preferences_select_own" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_preferences_insert_own" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_preferences_update_own" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- API usage stats policies
CREATE POLICY "api_stats_select_own" ON public.api_usage_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "api_stats_insert_own" ON public.api_usage_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update the trigger function to handle new profile fields and create default preferences
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile with enhanced fields (only insert fields that exist)
  INSERT INTO public.profiles (id, email, display_name, first_name, last_name, phone, country, date_of_birth)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.email),
    COALESCE(new.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'phone', ''),
    COALESCE(new.raw_user_meta_data ->> 'country', ''),
    CASE
      WHEN new.raw_user_meta_data ->> 'date_of_birth' != '' AND new.raw_user_meta_data ->> 'date_of_birth' IS NOT NULL
      THEN (new.raw_user_meta_data ->> 'date_of_birth')::DATE
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    country = EXCLUDED.country,
    date_of_birth = EXCLUDED.date_of_birth;

  -- Create default user preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance (with error handling)
DO $$
BEGIN
    CREATE INDEX IF NOT EXISTS idx_translation_history_user_id ON public.translation_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_translation_history_created_at ON public.translation_history(created_at);
    CREATE INDEX IF NOT EXISTS idx_api_usage_stats_user_date ON public.api_usage_stats(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_glossary_user_term ON public.glossary(user_id, term);
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some indexes could not be created: %', SQLERRM;
END $$;

-- Add comments for documentation
COMMENT ON TABLE public.translation_history IS 'Stores history of all translations performed by users';
COMMENT ON TABLE public.user_preferences IS 'User-specific settings and preferences';
COMMENT ON TABLE public.api_usage_stats IS 'Tracks API usage for billing and analytics';

-- Final verification
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('translation_history', 'user_preferences', 'api_usage_stats');

    IF table_count = 3 THEN
        RAISE NOTICE 'Migration completed successfully! All tables created.';
    ELSE
        RAISE NOTICE 'Migration completed with warnings. Some tables may not have been created.';
    END IF;
END $$;