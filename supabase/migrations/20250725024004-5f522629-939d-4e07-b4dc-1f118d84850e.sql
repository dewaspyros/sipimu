-- First, let's check what column exists and update the clinical pathway enum to include the specific types
DROP TYPE IF EXISTS clinical_pathway_type CASCADE;
CREATE TYPE clinical_pathway_type AS ENUM (
  'Sectio Caesaria',
  'Stroke Hemoragik', 
  'Stroke Non Hemoragik',
  'Pneumonia',
  'Dengue Fever'
);

-- Update clinical_pathways table to use the new enum (using correct column name)
ALTER TABLE clinical_pathways 
ALTER COLUMN clinical_pathway_type TYPE clinical_pathway_type 
USING clinical_pathway_type::text::clinical_pathway_type;

-- Update clinical_pathway_templates table to use the new enum  
ALTER TABLE clinical_pathway_templates
ALTER COLUMN pathway_type TYPE clinical_pathway_type
USING pathway_type::text::clinical_pathway_type;

-- Update monthly_summaries table to use the new enum
ALTER TABLE monthly_summaries
ALTER COLUMN pathway_type TYPE clinical_pathway_type
USING pathway_type::text::clinical_pathway_type;

-- Clear existing verifikators and add the new ones
DELETE FROM verifikators;
INSERT INTO verifikators (name, is_active) VALUES
('dr. Ivan Jazid Adam', true),
('Aulia Paramedika, S.Kep, Ns', true),
('Fita Dhiah Andari, S.Kep, Ns', true),
('Heni Indriastuti, S.Kep, Ns', true),
('Zayid Al Amin, S.Kep, Ns', true),
('Suratman, S.Kep, Ns', true),
('Ami Tri Agustin, S.Kep', true);

-- Clear existing DPJP doctors and add the new ones
DELETE FROM dpjp_doctors;
INSERT INTO dpjp_doctors (code, name, specialization, is_active) VALUES
('DPJP001', 'dr. Dia Irawati, Sp.PD', 'Penyakit Dalam', true),
('DPJP002', 'dr. Kurniawan Agung Yuwono, Sp.PD', 'Penyakit Dalam', true),
('DPJP003', 'dr. Irla Yudha Saputra, Sp.PD', 'Penyakit Dalam', true),
('DPJP004', 'dr. Fitria Nurul Hidayah, Sp.PD', 'Penyakit Dalam', true),
('DPJP005', 'dr. Lusiana Susio Utami, Sp.P', 'Paru', true),
('DPJP006', 'dr. Waskitho Nugroho, MMR, Sp.N', 'Neurologi', true),
('DPJP007', 'dr. Ardiansyah, Sp.S', 'Saraf', true),
('DPJP008', 'dr. Raden Bayu, Sp.OG', 'Obstetri Ginekologi', true),
('DPJP009', 'dr. Mira Maulina, Sp.OG', 'Obstetri Ginekologi', true),
('DPJP010', 'dr. Arinil Haque, Sp.OG, M.Ked, Klin', 'Obstetri Ginekologi', true);

-- Add clinical pathway templates for the new types
DELETE FROM clinical_pathway_templates;
INSERT INTO clinical_pathway_templates (pathway_type, target_los, explanation, items_config, days_config) VALUES
('Sectio Caesaria', 3, 'Clinical pathway untuk operasi sectio caesaria', '[]', '{"day_1": true, "day_2": true, "day_3": true}'),
('Stroke Hemoragik', 7, 'Clinical pathway untuk stroke hemoragik', '[]', '{"day_1": true, "day_2": true, "day_3": true, "day_4": true, "day_5": true, "day_6": true}'),
('Stroke Non Hemoragik', 5, 'Clinical pathway untuk stroke non hemoragik', '[]', '{"day_1": true, "day_2": true, "day_3": true, "day_4": true, "day_5": true}'),
('Pneumonia', 5, 'Clinical pathway untuk pneumonia', '[]', '{"day_1": true, "day_2": true, "day_3": true, "day_4": true, "day_5": true}'),
('Dengue Fever', 4, 'Clinical pathway untuk dengue fever', '[]', '{"day_1": true, "day_2": true, "day_3": true, "day_4": true}');

-- Create view for dashboard compliance data over past 12 months
CREATE OR REPLACE VIEW v_dashboard_compliance AS
WITH monthly_data AS (
  SELECT 
    EXTRACT(YEAR FROM admission_date) as year,
    EXTRACT(MONTH FROM admission_date) as month,
    clinical_pathway_type,
    COUNT(*) as total_patients,
    ROUND(AVG(CASE WHEN length_of_stay <= (
      SELECT target_los FROM clinical_pathway_templates 
      WHERE pathway_type = clinical_pathways.clinical_pathway_type
    ) THEN 100.0 ELSE 0.0 END), 1) as los_compliance_percentage,
    ROUND(AVG(CASE WHEN kepatuhan_cp THEN 100.0 ELSE 0.0 END), 1) as cp_compliance_percentage,
    ROUND(AVG(length_of_stay::numeric), 1) as avg_los,
    ROUND(AVG(CASE WHEN kepatuhan_terapi THEN 100.0 ELSE 0.0 END), 1) as terapi_compliance_percentage,
    ROUND(AVG(CASE WHEN kepatuhan_penunjang THEN 100.0 ELSE 0.0 END), 1) as penunjang_compliance_percentage
  FROM clinical_pathways
  WHERE admission_date >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY EXTRACT(YEAR FROM admission_date), EXTRACT(MONTH FROM admission_date), clinical_pathway_type
)
SELECT 
  year,
  month,
  clinical_pathway_type,
  total_patients,
  los_compliance_percentage,
  cp_compliance_percentage,
  avg_los,
  terapi_compliance_percentage,
  penunjang_compliance_percentage,
  TO_CHAR(make_date(year::int, month::int, 1), 'Mon YYYY') as month_year_label
FROM monthly_data
ORDER BY year, month;