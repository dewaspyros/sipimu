-- Create ward enum for clinical pathways
CREATE TYPE public.ward_type AS ENUM (
  'Perinatal',
  'Khadijah 2', 
  'Khadijah 3',
  'Aisyah 3',
  'Hafshoh 3',
  'Hafshoh 4',
  'ICU',
  'Multazam'
);

-- Add ward column to clinical_pathways table
ALTER TABLE public.clinical_pathways 
ADD COLUMN bangsal public.ward_type;

-- Create separate compliance table for Rekap Data (disconnected from clinical-pathway-checklist)
CREATE TABLE public.compliance_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  kepatuhan_penunjang BOOLEAN DEFAULT false,
  kepatuhan_terapi BOOLEAN DEFAULT false,
  kepatuhan_cp BOOLEAN DEFAULT false,
  sesuai_target BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZERO NOT NULL DEFAULT now(),
  FOREIGN KEY (patient_id) REFERENCES public.clinical_pathways(id) ON DELETE CASCADE
);

-- Enable RLS on compliance_data table
ALTER TABLE public.compliance_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for compliance_data
CREATE POLICY "Authenticated users can view compliance data" 
ON public.compliance_data 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert compliance data" 
ON public.compliance_data 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update compliance data" 
ON public.compliance_data 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete compliance data" 
ON public.compliance_data 
FOR DELETE 
USING (true);

-- Create trigger for compliance_data updated_at
CREATE TRIGGER update_compliance_data_updated_at
BEFORE UPDATE ON public.compliance_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();