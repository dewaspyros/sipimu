-- Create enum for clinical pathway types
CREATE TYPE public.clinical_pathway_type AS ENUM (
  'Sectio Caesaria',
  'Pneumonia', 
  'Stroke Non Hemorragik',
  'Stroke Hemoragik',
  'Dengue Fever'
);

-- Create main clinical pathways table
CREATE TABLE public.clinical_pathways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  no_rm VARCHAR(50) NOT NULL,
  nama_pasien VARCHAR(255) NOT NULL,
  jenis_clinical_pathway clinical_pathway_type NOT NULL,
  verifikator_pelaksana VARCHAR(255),
  dpjp VARCHAR(255),
  tanggal_masuk DATE NOT NULL,
  jam_masuk TIME NOT NULL,
  tanggal_keluar DATE,
  jam_keluar TIME,
  los_hari INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clinical pathway checklist table
CREATE TABLE public.clinical_pathway_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinical_pathway_id UUID REFERENCES public.clinical_pathways(id) ON DELETE CASCADE,
  item_index INTEGER NOT NULL,
  item_text TEXT NOT NULL,
  checklist_hari_1 BOOLEAN DEFAULT FALSE,
  checklist_hari_2 BOOLEAN DEFAULT FALSE,
  checklist_hari_3 BOOLEAN DEFAULT FALSE,
  checklist_hari_4 BOOLEAN DEFAULT FALSE,
  checklist_hari_5 BOOLEAN DEFAULT FALSE,
  checklist_hari_6 BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monthly summary statistics table
CREATE TABLE public.monthly_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bulan INTEGER NOT NULL CHECK (bulan >= 1 AND bulan <= 12),
  tahun INTEGER NOT NULL,
  total_pasien_input INTEGER DEFAULT 0,
  jumlah_sesuai_target INTEGER DEFAULT 0,
  jumlah_kepatuhan_cp INTEGER DEFAULT 0,
  jumlah_kepatuhan_penunjang INTEGER DEFAULT 0,
  jumlah_kepatuhan_terapi INTEGER DEFAULT 0,
  keterangan_varian TEXT,
  sesuai_target BOOLEAN DEFAULT FALSE,
  kepatuhan_cp DECIMAL(5,2) DEFAULT 0,
  kepatuhan_penunjang DECIMAL(5,2) DEFAULT 0,
  kepatuhan_terapi DECIMAL(5,2) DEFAULT 0,
  rata_rata_los DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bulan, tahun)
);

-- Create profiles table for authentication
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nik VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.clinical_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_pathway_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now)
CREATE POLICY "Allow all operations on clinical_pathways" ON public.clinical_pathways FOR ALL USING (true);
CREATE POLICY "Allow all operations on clinical_pathway_checklist" ON public.clinical_pathway_checklist FOR ALL USING (true);
CREATE POLICY "Allow all operations on monthly_summary" ON public.monthly_summary FOR ALL USING (true);
CREATE POLICY "Allow all operations on profiles" ON public.profiles FOR ALL USING (true);

-- Create dashboard views
CREATE VIEW public.v_monthly_stats AS
SELECT 
  bulan,
  tahun,
  total_pasien_input,
  jumlah_sesuai_target,
  kepatuhan_cp,
  kepatuhan_penunjang,
  kepatuhan_terapi,
  rata_rata_los
FROM public.monthly_summary
ORDER BY tahun DESC, bulan DESC;

CREATE VIEW public.v_pathway_compliance AS
SELECT 
  jenis_clinical_pathway,
  COUNT(*) as total_pasien,
  AVG(CASE WHEN los_hari <= (SELECT "Terget Los" FROM public.daftar_cp WHERE jenis_cp = cp.jenis_clinical_pathway::text) THEN 1.0 ELSE 0.0 END) * 100 as compliance_percentage
FROM public.clinical_pathways cp
WHERE tanggal_keluar IS NOT NULL AND los_hari IS NOT NULL
GROUP BY jenis_clinical_pathway;

CREATE VIEW public.v_los_compliance AS
SELECT 
  jenis_clinical_pathway,
  AVG(los_hari) as avg_los,
  MIN(los_hari) as min_los,
  MAX(los_hari) as max_los,
  COUNT(*) as total_cases
FROM public.clinical_pathways
WHERE tanggal_keluar IS NOT NULL AND los_hari IS NOT NULL
GROUP BY jenis_clinical_pathway;

CREATE VIEW public.v_therapy_compliance AS
SELECT 
  cp.jenis_clinical_pathway,
  COUNT(*) as total_patients,
  SUM(CASE WHEN checklist_hari_1 AND checklist_hari_2 AND checklist_hari_3 THEN 1 ELSE 0 END) as compliant_patients,
  (SUM(CASE WHEN checklist_hari_1 AND checklist_hari_2 AND checklist_hari_3 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as compliance_percentage
FROM public.clinical_pathways cp
LEFT JOIN public.clinical_pathway_checklist cpc ON cp.id = cpc.clinical_pathway_id
GROUP BY cp.jenis_clinical_pathway;

CREATE VIEW public.v_support_compliance AS
SELECT 
  cp.jenis_clinical_pathway,
  COUNT(*) as total_patients,
  SUM(CASE WHEN checklist_hari_4 AND checklist_hari_5 AND checklist_hari_6 THEN 1 ELSE 0 END) as compliant_patients,
  (SUM(CASE WHEN checklist_hari_4 AND checklist_hari_5 AND checklist_hari_6 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as compliance_percentage
FROM public.clinical_pathways cp
LEFT JOIN public.clinical_pathway_checklist cpc ON cp.id = cpc.clinical_pathway_id
GROUP BY cp.jenis_clinical_pathway;

CREATE VIEW public.v_avg_los_compliance AS
SELECT 
  cp.jenis_clinical_pathway,
  AVG(cp.los_hari) as avg_los,
  dc."Terget Los" as target_los,
  (AVG(cp.los_hari) <= dc."Terget Los") as meets_target
FROM public.clinical_pathways cp
LEFT JOIN public.daftar_cp dc ON dc.jenis_cp = cp.jenis_clinical_pathway::text
WHERE cp.tanggal_keluar IS NOT NULL AND cp.los_hari IS NOT NULL
GROUP BY cp.jenis_clinical_pathway, dc."Terget Los";

CREATE VIEW public.v_total_patients AS
SELECT 
  COUNT(*) as total_patients,
  COUNT(CASE WHEN tanggal_keluar IS NOT NULL THEN 1 END) as discharged_patients,
  COUNT(CASE WHEN tanggal_keluar IS NULL THEN 1 END) as active_patients
FROM public.clinical_pathways;

-- Create function to update monthly statistics automatically
CREATE OR REPLACE FUNCTION public.update_monthly_stats_function()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create function to calculate compliance percentage per CP type
CREATE OR REPLACE FUNCTION public.calculate_compliance_function(cp_type clinical_pathway_type)
RETURNS DECIMAL(5,2) AS $$
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
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_summary_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clinical_pathways
  FOR EACH ROW
  EXECUTE FUNCTION public.update_monthly_stats_function();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_clinical_pathways_updated_at
  BEFORE UPDATE ON public.clinical_pathways
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinical_pathway_checklist_updated_at
  BEFORE UPDATE ON public.clinical_pathway_checklist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_summary_updated_at
  BEFORE UPDATE ON public.monthly_summary
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();