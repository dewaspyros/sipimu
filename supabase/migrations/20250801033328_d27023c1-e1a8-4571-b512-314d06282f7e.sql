-- Fix security issues: Remove SECURITY DEFINER from views and set proper function settings

-- Drop and recreate views as SECURITY INVOKER (default)
DROP VIEW IF EXISTS v_monthly_stats CASCADE;
DROP VIEW IF EXISTS v_pathway_compliance CASCADE;  
DROP VIEW IF EXISTS v_los_compliance CASCADE;
DROP VIEW IF EXISTS v_therapy_compliance CASCADE;
DROP VIEW IF EXISTS v_support_compliance CASCADE;
DROP VIEW IF EXISTS v_total_patients CASCADE;

-- Recreate views without SECURITY DEFINER (uses SECURITY INVOKER by default)
CREATE VIEW v_monthly_stats AS
SELECT 
  EXTRACT(MONTH FROM cp.tanggal_masuk)::INTEGER as bulan,
  EXTRACT(YEAR FROM cp.tanggal_masuk)::INTEGER as tahun,
  COUNT(*)::INTEGER as total_pasien_input,
  COUNT(CASE WHEN cp.los_hari <= COALESCE(dc."Terget Los", 2) THEN 1 END)::INTEGER as jumlah_sesuai_target,
  AVG(CASE WHEN co.kepatuhan_cp IS NOT NULL THEN 
    CASE WHEN co.kepatuhan_cp THEN 100 ELSE 0 END
    ELSE 75 END) as kepatuhan_cp,
  AVG(CASE WHEN co.kepatuhan_penunjang IS NOT NULL THEN 
    CASE WHEN co.kepatuhan_penunjang THEN 100 ELSE 0 END
    ELSE 75 END) as kepatuhan_penunjang,
  AVG(CASE WHEN co.kepatuhan_terapi IS NOT NULL THEN 
    CASE WHEN co.kepatuhan_terapi THEN 100 ELSE 0 END
    ELSE 75 END) as kepatuhan_terapi,
  AVG(COALESCE(co.los_hari, cp.los_hari)) as rata_rata_los
FROM clinical_pathways cp
LEFT JOIN daftar_cp dc ON dc.jenis_cp = cp.jenis_clinical_pathway::text
LEFT JOIN compliance_overrides co ON co.patient_id = cp.id
WHERE cp.tanggal_masuk IS NOT NULL
GROUP BY 
  EXTRACT(MONTH FROM cp.tanggal_masuk),
  EXTRACT(YEAR FROM cp.tanggal_masuk);

CREATE VIEW v_pathway_compliance AS
SELECT 
  cp.jenis_clinical_pathway,
  COUNT(*) as total_pasien,
  AVG(CASE WHEN COALESCE(co.kepatuhan_cp, false) THEN 100 ELSE 0 END) as compliance_percentage
FROM clinical_pathways cp
LEFT JOIN compliance_overrides co ON co.patient_id = cp.id
WHERE cp.tanggal_keluar IS NOT NULL
GROUP BY cp.jenis_clinical_pathway;

CREATE VIEW v_los_compliance AS
SELECT 
  cp.jenis_clinical_pathway,
  AVG(COALESCE(co.los_hari, cp.los_hari)) as avg_los,
  MIN(COALESCE(co.los_hari, cp.los_hari)) as min_los,
  MAX(COALESCE(co.los_hari, cp.los_hari)) as max_los,
  COUNT(*) as total_cases
FROM clinical_pathways cp
LEFT JOIN compliance_overrides co ON co.patient_id = cp.id
WHERE COALESCE(co.los_hari, cp.los_hari) IS NOT NULL
GROUP BY cp.jenis_clinical_pathway;

CREATE VIEW v_therapy_compliance AS
SELECT 
  cp.jenis_clinical_pathway,
  COUNT(*) as total_patients,
  COUNT(CASE WHEN COALESCE(co.kepatuhan_terapi, false) THEN 1 END) as compliant_patients,
  AVG(CASE WHEN COALESCE(co.kepatuhan_terapi, false) THEN 100 ELSE 0 END) as compliance_percentage
FROM clinical_pathways cp
LEFT JOIN compliance_overrides co ON co.patient_id = cp.id
WHERE cp.tanggal_keluar IS NOT NULL
GROUP BY cp.jenis_clinical_pathway;

CREATE VIEW v_support_compliance AS
SELECT 
  cp.jenis_clinical_pathway,
  COUNT(*) as total_patients,
  COUNT(CASE WHEN COALESCE(co.kepatuhan_penunjang, false) THEN 1 END) as compliant_patients,
  AVG(CASE WHEN COALESCE(co.kepatuhan_penunjang, false) THEN 100 ELSE 0 END) as compliance_percentage
FROM clinical_pathways cp
LEFT JOIN compliance_overrides co ON co.patient_id = cp.id
WHERE cp.tanggal_keluar IS NOT NULL
GROUP BY cp.jenis_clinical_pathway;

CREATE VIEW v_total_patients AS
SELECT 
  COUNT(*) as total_patients,
  COUNT(CASE WHEN tanggal_keluar IS NOT NULL THEN 1 END) as discharged_patients,
  COUNT(CASE WHEN tanggal_keluar IS NULL THEN 1 END) as active_patients
FROM clinical_pathways;

-- Fix function security settings
CREATE OR REPLACE FUNCTION public.update_monthly_stats_function()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  target_month INTEGER;
  target_year INTEGER;
  total_patients INTEGER;
  compliant_patients INTEGER;
  avg_los_val DECIMAL(5,2);
BEGIN
  -- Get month and year from the record
  IF TG_OP = 'DELETE' THEN
    target_month := EXTRACT(MONTH FROM OLD.tanggal_masuk);
    target_year := EXTRACT(YEAR FROM OLD.tanggal_masuk);
  ELSE
    target_month := EXTRACT(MONTH FROM NEW.tanggal_masuk);
    target_year := EXTRACT(YEAR FROM NEW.tanggal_masuk);
  END IF;

  -- Calculate statistics for the month
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN cp.los_hari <= dc."Terget Los" THEN 1 END),
    AVG(cp.los_hari)
  INTO total_patients, compliant_patients, avg_los_val
  FROM public.clinical_pathways cp
  LEFT JOIN public.daftar_cp dc ON dc.jenis_cp = cp.jenis_clinical_pathway::text
  WHERE EXTRACT(MONTH FROM cp.tanggal_masuk) = target_month
    AND EXTRACT(YEAR FROM cp.tanggal_masuk) = target_year;

  -- Insert or update monthly summary
  INSERT INTO public.monthly_summary (
    bulan, tahun, total_pasien_input, jumlah_sesuai_target, rata_rata_los
  ) VALUES (
    target_month, target_year, total_patients, compliant_patients, avg_los_val
  )
  ON CONFLICT (bulan, tahun) 
  DO UPDATE SET
    total_pasien_input = EXCLUDED.total_pasien_input,
    jumlah_sesuai_target = EXCLUDED.jumlah_sesuai_target,
    rata_rata_los = EXCLUDED.rata_rata_los,
    updated_at = now();

  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_compliance_function(cp_type clinical_pathway_type)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER  
 SET search_path = public
AS $function$
DECLARE
  total_patients INTEGER;
  compliant_patients INTEGER;
  compliance_percentage DECIMAL(5,2);
BEGIN
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN cp.los_hari <= dc."Terget Los" THEN 1 END)
  INTO total_patients, compliant_patients
  FROM public.clinical_pathways cp
  LEFT JOIN public.daftar_cp dc ON dc.jenis_cp = cp.jenis_clinical_pathway::text
  WHERE cp.jenis_clinical_pathway = cp_type
    AND cp.tanggal_keluar IS NOT NULL;

  IF total_patients > 0 THEN
    compliance_percentage := (compliant_patients * 100.0) / total_patients;
  ELSE
    compliance_percentage := 0;
  END IF;

  RETURN compliance_percentage;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;