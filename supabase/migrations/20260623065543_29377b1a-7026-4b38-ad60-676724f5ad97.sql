-- Re-add old enum values
ALTER TYPE public.clinical_pathway_type ADD VALUE IF NOT EXISTS 'Pneumonia';
ALTER TYPE public.clinical_pathway_type ADD VALUE IF NOT EXISTS 'Dengue Fever';
ALTER TYPE public.daftar_cps ADD VALUE IF NOT EXISTS 'Pneumonia';
ALTER TYPE public.daftar_cps ADD VALUE IF NOT EXISTS 'Dengue Fever';