-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table to store document chunks and their embeddings
CREATE TABLE IF NOT EXISTS public.document_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID, -- Decoupled for rapid session-based ingestion
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- Dimension for text-embedding-3-small
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.document_sections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "sections_select_own_or_shared" ON public.document_sections FOR SELECT 
  USING (document_id IN (SELECT id FROM public.shared_documents WHERE owner_id = auth.uid() OR id IN (SELECT document_id FROM public.document_collaborators WHERE user_id = auth.uid())));

CREATE POLICY "sections_insert_own" ON public.document_sections FOR INSERT 
  WITH CHECK (document_id IN (SELECT id FROM public.shared_documents WHERE owner_id = auth.uid()));

-- Create HNSW index for performance
CREATE INDEX ON public.document_sections USING hnsw (embedding vector_cosine_ops);

-- RCP Function for vector search
CREATE OR REPLACE FUNCTION match_document_sections (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  filter JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ds.id,
    ds.document_id,
    ds.content,
    ds.metadata,
    1 - (ds.embedding <=> query_embedding) AS similarity
  FROM public.document_sections ds
  WHERE 1 - (ds.embedding <=> query_embedding) > match_threshold
    AND (
      filter = '{}'::jsonb OR
      ds.metadata @> filter
    )
  ORDER BY ds.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
