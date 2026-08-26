CREATE INDEX IF NOT EXISTS idx_cpc_clinical_pathway_id ON public.clinical_pathway_checklist (clinical_pathway_id);
CREATE INDEX IF NOT EXISTS idx_cp_tanggal_masuk ON public.clinical_pathways (tanggal_masuk);
CREATE INDEX IF NOT EXISTS idx_cp_jenis_tanggal ON public.clinical_pathways (jenis_clinical_pathway, tanggal_masuk);