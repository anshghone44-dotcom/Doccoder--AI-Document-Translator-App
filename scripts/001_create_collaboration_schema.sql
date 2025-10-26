-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shared documents table
CREATE TABLE IF NOT EXISTS public.shared_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  original_language TEXT DEFAULT 'en',
  target_language TEXT DEFAULT 'es',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document collaborators table
CREATE TABLE IF NOT EXISTS public.document_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.shared_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer', -- 'viewer', 'editor', 'owner'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, user_id)
);

-- Create real-time updates table
CREATE TABLE IF NOT EXISTS public.document_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.shared_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  language TEXT,
  update_type TEXT, -- 'translation', 'edit', 'comment'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.shared_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  ai_suggestion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create glossary table for brand style memory
CREATE TABLE IF NOT EXISTS public.glossary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  translation TEXT NOT NULL,
  language_pair TEXT, -- e.g., 'en-es'
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, term, language_pair)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Shared documents policies
CREATE POLICY "documents_select_own_or_shared" ON public.shared_documents FOR SELECT 
  USING (auth.uid() = owner_id OR id IN (SELECT document_id FROM public.document_collaborators WHERE user_id = auth.uid()));
CREATE POLICY "documents_insert_own" ON public.shared_documents FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "documents_update_own_or_editor" ON public.shared_documents FOR UPDATE 
  USING (auth.uid() = owner_id OR id IN (SELECT document_id FROM public.document_collaborators WHERE user_id = auth.uid() AND role IN ('editor', 'owner')));

-- Document collaborators policies
CREATE POLICY "collaborators_select" ON public.document_collaborators FOR SELECT 
  USING (user_id = auth.uid() OR document_id IN (SELECT id FROM public.shared_documents WHERE owner_id = auth.uid()));
CREATE POLICY "collaborators_insert" ON public.document_collaborators FOR INSERT 
  WITH CHECK (document_id IN (SELECT id FROM public.shared_documents WHERE owner_id = auth.uid()));

-- Document updates policies
CREATE POLICY "updates_select" ON public.document_updates FOR SELECT 
  USING (document_id IN (SELECT id FROM public.shared_documents WHERE owner_id = auth.uid() OR id IN (SELECT document_id FROM public.document_collaborators WHERE user_id = auth.uid())));
CREATE POLICY "updates_insert" ON public.document_updates FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND document_id IN (SELECT id FROM public.shared_documents WHERE owner_id = auth.uid() OR id IN (SELECT document_id FROM public.document_collaborators WHERE user_id = auth.uid())));

-- Comments policies
CREATE POLICY "comments_select" ON public.comments FOR SELECT 
  USING (document_id IN (SELECT id FROM public.shared_documents WHERE owner_id = auth.uid() OR id IN (SELECT document_id FROM public.document_collaborators WHERE user_id = auth.uid())));
CREATE POLICY "comments_insert" ON public.comments FOR INSERT 
  WITH CHECK (user_id = auth.uid() AND document_id IN (SELECT id FROM public.shared_documents WHERE owner_id = auth.uid() OR id IN (SELECT document_id FROM public.document_collaborators WHERE user_id = auth.uid())));

-- Glossary policies
CREATE POLICY "glossary_select_own" ON public.glossary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "glossary_insert_own" ON public.glossary FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "glossary_update_own" ON public.glossary FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "glossary_delete_own" ON public.glossary FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data ->> 'display_name', new.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
