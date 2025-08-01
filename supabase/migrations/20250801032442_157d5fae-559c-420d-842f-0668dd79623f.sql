-- Create missing views to fix dashboard blinking issues

-- View for monthly statistics
CREATE OR REPLACE VIEW v_monthly_stats AS
SELECT 
  EXTRACT(MONTH FROM cp.tanggal_masuk)::INTEGER as bulan,
  EXTRACT(YEAR FROM cp.tanggal_masuk)::INTEGER as tahun,
  COUNT(*)::INTEGER as total_pasien_input,
  COUNT(CASE WHEN cp.los_hari <= COALESCE(dc."Terget Los", 2) THEN 1 END)::INTEGER as jumlah_sesuai_target,
  AVG(CASE WHEN co.kepatuhan_cp IS NOT NULL THEN 
    CASE WHEN co.kepatuhan_cp THEN 100 ELSE 0 END
    ELSE 75 END)::NUMERIC as kepatuhan_cp,
  AVG(CASE WHEN co.kepatuhan_penunjang IS NOT NULL THEN 
    CASE WHEN co.kepatuhan_penunjang THEN 100 ELSE 0 END
    ELSE 75 END)::NUMERIC as kepatuhan_penunjang,
  AVG(CASE WHEN co.kepatuhan_terapi IS NOT NULL THEN 
    CASE WHEN co.kepatuhan_terapi THEN 100 ELSE 0 END
    ELSE 75 END)::NUMERIC as kepatuhan_terapi,
  AVG(COALESCE(co.los_hari, cp.los_hari))::NUMERIC as rata_rata_los
FROM clinical_pathways cp
LEFT JOIN daftar_cp dc ON dc.jenis_cp = cp.jenis_clinical_pathway::text
LEFT JOIN compliance_overrides co ON co.patient_id = cp.id
WHERE cp.tanggal_masuk IS NOT NULL
GROUP BY 
  EXTRACT(MONTH FROM cp.tanggal_masuk),
  EXTRACT(YEAR FROM cp.tanggal_masuk)
ORDER BY tahun DESC, bulan DESC;

-- View for pathway compliance
CREATE OR REPLACE VIEW v_pathway_compliance AS
SELECT 
  cp.jenis_clinical_pathway,
  COUNT(*)::BIGINT as total_pasien,
  AVG(CASE WHEN COALESCE(co.kepatuhan_cp, false) THEN 100 ELSE 0 END)::NUMERIC as compliance_percentage
FROM clinical_pathways cp
LEFT JOIN compliance_overrides co ON co.patient_id = cp.id
WHERE cp.tanggal_keluar IS NOT NULL
GROUP BY cp.jenis_clinical_pathway;

-- View for LOS compliance  
CREATE OR REPLACE VIEW v_los_compliance AS
SELECT 
  cp.jenis_clinical_pathway,
  AVG(COALESCE(co.los_hari, cp.los_hari))::NUMERIC as avg_los,
  MIN(COALESCE(co.los_hari, cp.los_hari))::INTEGER as min_los,
  MAX(COALESCE(co.los_hari, cp.los_hari))::INTEGER as max_los,
  COUNT(*)::BIGINT as total_cases
FROM clinical_pathways cp
LEFT JOIN compliance_overrides co ON co.patient_id = cp.id
WHERE COALESCE(co.los_hari, cp.los_hari) IS NOT NULL
GROUP BY cp.jenis_clinical_pathway;

-- View for therapy compliance
CREATE OR REPLACE VIEW v_therapy_compliance AS
SELECT 
  cp.jenis_clinical_pathway,
  COUNT(*)::BIGINT as total_patients,
  COUNT(CASE WHEN COALESCE(co.kepatuhan_terapi, false) THEN 1 END)::BIGINT as compliant_patients,
  AVG(CASE WHEN COALESCE(co.kepatuhan_terapi, false) THEN 100 ELSE 0 END)::NUMERIC as compliance_percentage
FROM clinical_pathways cp
LEFT JOIN compliance_overrides co ON co.patient_id = cp.id
WHERE cp.tanggal_keluar IS NOT NULL
GROUP BY cp.jenis_clinical_pathway;

-- View for support compliance
CREATE OR REPLACE VIEW v_support_compliance AS
SELECT 
  cp.jenis_clinical_pathway,
  COUNT(*)::BIGINT as total_patients,
  COUNT(CASE WHEN COALESCE(co.kepatuhan_penunjang, false) THEN 1 END)::BIGINT as compliant_patients,
  AVG(CASE WHEN COALESCE(co.kepatuhan_penunjang, false) THEN 100 ELSE 0 END)::NUMERIC as compliance_percentage
FROM clinical_pathways cp
LEFT JOIN compliance_overrides co ON co.patient_id = cp.id
WHERE cp.tanggal_keluar IS NOT NULL
GROUP BY cp.jenis_clinical_pathway;

-- View for total patients
CREATE OR REPLACE VIEW v_total_patients AS
SELECT 
  COUNT(*)::BIGINT as total_patients,
  COUNT(CASE WHEN tanggal_keluar IS NOT NULL THEN 1 END)::BIGINT as discharged_patients,
  COUNT(CASE WHEN tanggal_keluar IS NULL THEN 1 END)::BIGINT as active_patients
FROM clinical_pathways;