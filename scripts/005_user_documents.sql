-- Migration: Create user_documents table and storage bucket reference
-- This table will store metadata for files uploaded by users to Supabase Storage

CREATE TABLE IF NOT EXISTS public.user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path within the 'documents' bucket
  file_type TEXT,
  size INTEGER,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'error')),
  preview_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own documents" ON public.user_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON public.user_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.user_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON public.user_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_documents_updated_at
  BEFORE UPDATE ON public.user_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Note: Ensure a 'documents' bucket exists in Supabase Storage with appropriate RLS.
-- Standard storage policy for 'documents' bucket:
-- (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1])
