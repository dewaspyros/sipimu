ALTER TABLE public.clinical_pathways
  ADD COLUMN IF NOT EXISTS wa_notified_at timestamptz;