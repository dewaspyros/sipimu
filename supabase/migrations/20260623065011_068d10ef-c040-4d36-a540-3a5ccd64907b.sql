ALTER TYPE public.clinical_pathway_type RENAME VALUE 'Pneumonia' TO 'Intracranial Hemorrhagia';
ALTER TYPE public.clinical_pathway_type RENAME VALUE 'Dengue Fever' TO 'Post Partum Hemorrhagia';
ALTER TYPE public.daftar_cps RENAME VALUE 'Pneumonia' TO 'Intracranial Hemorrhagia';
ALTER TYPE public.daftar_cps RENAME VALUE 'Dengue Fever' TO 'Post Partum Hemorrhagia';
UPDATE public.daftar_cp SET jenis_cp = 'Intracranial Hemorrhagia' WHERE jenis_cp = 'Pneumonia';
UPDATE public.daftar_cp SET jenis_cp = 'Post Partum Hemorrhagia' WHERE jenis_cp = 'Dengue Fever';