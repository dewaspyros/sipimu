-- Add keterangan column to clinical_pathways table
ALTER TABLE public.clinical_pathways 
ADD COLUMN IF NOT EXISTS keterangan TEXT;