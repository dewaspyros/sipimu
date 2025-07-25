
-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for clinical pathway types
CREATE TYPE public.clinical_pathway_type AS ENUM (
  'Sectio Caesaria',
  'Stroke Hemoragik', 
  'Stroke Non Hemoragik',
  'Pneumonia',
  'Dengue Fever'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role app_role DEFAULT 'user',
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create verifikators table
CREATE TABLE public.verifikators (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create dpjp_doctors table
CREATE TABLE public.dpjp_doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  specialization TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create clinical_pathway_templates table
CREATE TABLE public.clinical_pathway_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  pathway_type clinical_pathway_type NOT NULL UNIQUE,
  days_config JSON NOT NULL,
  items_config JSON NOT NULL,
  explanation TEXT,
  target_los INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create clinical_pathways table
CREATE TABLE public.clinical_pathways (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  no_rm TEXT NOT NULL,
  patient_name_age TEXT NOT NULL,
  clinical_pathway_type clinical_pathway_type NOT NULL,
  verifikator TEXT NOT NULL,
  dpjp TEXT NOT NULL,
  admission_date DATE NOT NULL,
  admission_time TIME NOT NULL,
  discharge_date DATE,
  discharge_time TIME,
  length_of_stay INTEGER,
  sesuai_target BOOLEAN DEFAULT FALSE,
  kepatuhan_cp BOOLEAN DEFAULT FALSE,
  kepatuhan_penunjang BOOLEAN DEFAULT FALSE,
  kepatuhan_terapi BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create checklist_items table
CREATE TABLE public.checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  clinical_pathway_id UUID NOT NULL REFERENCES public.clinical_pathways(id) ON DELETE CASCADE,
  item_index INTEGER NOT NULL,
  item_text TEXT NOT NULL,
  day_1 BOOLEAN DEFAULT FALSE,
  day_2 BOOLEAN DEFAULT FALSE,
  day_3 BOOLEAN DEFAULT FALSE,
  day_4 BOOLEAN DEFAULT FALSE,
  day_5 BOOLEAN DEFAULT FALSE,
  day_6 BOOLEAN DEFAULT FALSE,
  variant_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create monthly_summaries table
CREATE TABLE public.monthly_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  pathway_type clinical_pathway_type NOT NULL,
  total_patients INTEGER DEFAULT 0,
  sesuai_target_count INTEGER DEFAULT 0,
  kepatuhan_cp_count INTEGER DEFAULT 0,
  kepatuhan_penunjang_count INTEGER DEFAULT 0,
  kepatuhan_terapi_count INTEGER DEFAULT 0,
  avg_los DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id),
  UNIQUE(month, year, pathway_type)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifikators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dpjp_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_pathway_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for verifikators (readable by all authenticated users)
CREATE POLICY "Authenticated users can view verifikators" ON public.verifikators
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage verifikators" ON public.verifikators
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for dpjp_doctors (readable by all authenticated users)
CREATE POLICY "Authenticated users can view dpjp_doctors" ON public.dpjp_doctors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage dpjp_doctors" ON public.dpjp_doctors
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for clinical_pathway_templates (readable by all authenticated users)
CREATE POLICY "Authenticated users can view templates" ON public.clinical_pathway_templates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage templates" ON public.clinical_pathway_templates
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for clinical_pathways (all authenticated users can manage)
CREATE POLICY "Authenticated users can manage clinical pathways" ON public.clinical_pathways
  FOR ALL TO authenticated USING (true);

-- Create RLS policies for checklist_items (all authenticated users can manage)
CREATE POLICY "Authenticated users can manage checklist items" ON public.checklist_items
  FOR ALL TO authenticated USING (true);

-- Create RLS policies for monthly_summaries (all authenticated users can view)
CREATE POLICY "Authenticated users can view monthly summaries" ON public.monthly_summaries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage monthly summaries" ON public.monthly_summaries
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    'user'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update monthly summaries
CREATE OR REPLACE FUNCTION public.update_monthly_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  summary_month INTEGER;
  summary_year INTEGER;
BEGIN
  -- Get month and year from admission date
  summary_month := EXTRACT(MONTH FROM NEW.admission_date);
  summary_year := EXTRACT(YEAR FROM NEW.admission_date);
  
  -- Insert or update monthly summary
  INSERT INTO public.monthly_summaries (
    month, year, pathway_type, total_patients, 
    sesuai_target_count, kepatuhan_cp_count, 
    kepatuhan_penunjang_count, kepatuhan_terapi_count, avg_los
  )
  SELECT 
    summary_month,
    summary_year,
    NEW.clinical_pathway_type,
    COUNT(*),
    SUM(CASE WHEN sesuai_target THEN 1 ELSE 0 END),
    SUM(CASE WHEN kepatuhan_cp THEN 1 ELSE 0 END),
    SUM(CASE WHEN kepatuhan_penunjang THEN 1 ELSE 0 END),
    SUM(CASE WHEN kepatuhan_terapi THEN 1 ELSE 0 END),
    AVG(length_of_stay)
  FROM public.clinical_pathways
  WHERE EXTRACT(MONTH FROM admission_date) = summary_month
    AND EXTRACT(YEAR FROM admission_date) = summary_year
    AND clinical_pathway_type = NEW.clinical_pathway_type
  ON CONFLICT (month, year, pathway_type)
  DO UPDATE SET
    total_patients = EXCLUDED.total_patients,
    sesuai_target_count = EXCLUDED.sesuai_target_count,
    kepatuhan_cp_count = EXCLUDED.kepatuhan_cp_count,
    kepatuhan_penunjang_count = EXCLUDED.kepatuhan_penunjang_count,
    kepatuhan_terapi_count = EXCLUDED.kepatuhan_terapi_count,
    avg_los = EXCLUDED.avg_los,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$;

-- Create trigger to update monthly summaries
CREATE TRIGGER update_summary_on_clinical_pathway_change
  AFTER INSERT OR UPDATE ON public.clinical_pathways
  FOR EACH ROW EXECUTE FUNCTION public.update_monthly_summary();

-- Insert initial data for verifikators
INSERT INTO public.verifikators (name) VALUES
  ('dr. Ivan Jazid Adam'),
  ('Aulia Paramedika, S.Kep, Ns'),
  ('Fita Dhiah Andari, S.Kep, Ns'),
  ('Heni Indriastuti, S.Kep, Ns'),
  ('Zayid Al Amin, S.Kep, Ns'),
  ('Suratman, S.Kep, Ns'),
  ('Ami Tri Agustin, S.Kep');

-- Insert initial data for dpjp_doctors
INSERT INTO public.dpjp_doctors (name, code, specialization) VALUES
  ('dr. Dia Irawati, Sp.PD', 'DPJP DI', 'Penyakit Dalam'),
  ('dr. Kurniawan Agung Yuwono, Sp.PD', 'DPJP KA', 'Penyakit Dalam'),
  ('dr. Irla Yudha Saputra, Sp.PD', 'DPJP IY', 'Penyakit Dalam'),
  ('dr. Fitria Nurul Hidayah, Sp.PD', 'DPJP FN', 'Penyakit Dalam'),
  ('dr. Lusiana Susio Utami, Sp.P', 'DPJP LS', 'Paru'),
  ('dr. Waskitho Nugroho, MMR, Sp.N', 'DPJP WN', 'Neurologi'),
  ('dr. Ardiansyah, Sp.S', 'DPJP MA', 'Saraf'),
  ('dr. Raden Bayu, Sp.OG', 'DPJP RB', 'Obstetri Ginekologi'),
  ('dr. Mira Maulina, Sp.OG', 'DPJP MM', 'Obstetri Ginekologi'),
  ('dr. Arinil Haque, Sp.OG, M.Ked, Klin', 'DPJP AH', 'Obstetri Ginekologi');

-- Insert initial clinical pathway templates
INSERT INTO public.clinical_pathway_templates (pathway_type, days_config, items_config, explanation, target_los) VALUES
  ('Sectio Caesaria', '["Hari ke-1", "Hari ke-2"]', '["Pemeriksaan fisik", "Monitoring vital signs", "Mobilisasi dini", "Perawatan luka operasi"]', 'Terapi post operasi sectio caesaria', 2),
  ('Stroke Hemoragik', '["Hari ke-1", "Hari ke-2", "Hari ke-3", "Hari ke-4", "Hari ke-5"]', '["Pemeriksaan neurologis", "CT Scan kepala", "Monitoring tekanan darah", "Terapi rehabilitasi"]', 'Terapi stroke hemoragik', 5),
  ('Stroke Non Hemoragik', '["Hari ke-1", "Hari ke-2", "Hari ke-3", "Hari ke-4", "Hari ke-5"]', '["Pemeriksaan neurologis", "CT Scan kepala", "Terapi antiplatelet", "Terapi rehabilitasi"]', 'Terapi stroke non hemoragik', 5),
  ('Pneumonia', '["Hari ke-1", "Hari ke-2", "Hari ke-3", "Hari ke-4", "Hari ke-5", "Hari ke-6"]', '["Pemeriksaan fisik", "Foto thorax", "Terapi antibiotik", "Terapi oksigen"]', 'Terapi pneumonia', 6),
  ('Dengue Fever', '["Hari ke-1", "Hari ke-2", "Hari ke-3"]', '["Pemeriksaan fisik", "Monitoring trombosit", "Terapi cairan", "Monitoring tanda perdarahan"]', 'Terapi dengue fever', 3);

-- Create views for dashboard
CREATE VIEW public.v_monthly_stats AS
SELECT 
  ms.month,
  ms.year,
  ms.pathway_type,
  ms.total_patients,
  CASE WHEN ms.total_patients > 0 THEN 
    ROUND((ms.sesuai_target_count::DECIMAL / ms.total_patients) * 100, 1) 
  ELSE 0 END as sesuai_target_percentage,
  CASE WHEN ms.total_patients > 0 THEN 
    ROUND((ms.kepatuhan_cp_count::DECIMAL / ms.total_patients) * 100, 1) 
  ELSE 0 END as kepatuhan_cp_percentage,
  CASE WHEN ms.total_patients > 0 THEN 
    ROUND((ms.kepatuhan_penunjang_count::DECIMAL / ms.total_patients) * 100, 1) 
  ELSE 0 END as kepatuhan_penunjang_percentage,
  CASE WHEN ms.total_patients > 0 THEN 
    ROUND((ms.kepatuhan_terapi_count::DECIMAL / ms.total_patients) * 100, 1) 
  ELSE 0 END as kepatuhan_terapi_percentage,
  ms.avg_los
FROM public.monthly_summaries ms;

CREATE VIEW public.v_pathway_compliance AS
SELECT 
  clinical_pathway_type,
  COUNT(*) as total_patients,
  SUM(CASE WHEN sesuai_target THEN 1 ELSE 0 END) as sesuai_target_count,
  SUM(CASE WHEN kepatuhan_cp THEN 1 ELSE 0 END) as kepatuhan_cp_count,
  SUM(CASE WHEN kepatuhan_penunjang THEN 1 ELSE 0 END) as kepatuhan_penunjang_count,
  SUM(CASE WHEN kepatuhan_terapi THEN 1 ELSE 0 END) as kepatuhan_terapi_count,
  AVG(length_of_stay) as avg_los
FROM public.clinical_pathways
GROUP BY clinical_pathway_type;

CREATE VIEW public.v_recent_patients AS
SELECT 
  cp.id,
  cp.no_rm,
  cp.patient_name_age,
  cp.clinical_pathway_type,
  cp.admission_date,
  cp.discharge_date,
  cp.length_of_stay,
  cp.sesuai_target,
  cp.kepatuhan_cp,
  cp.kepatuhan_penunjang,
  cp.kepatuhan_terapi
FROM public.clinical_pathways cp
ORDER BY cp.created_at DESC
LIMIT 10;
