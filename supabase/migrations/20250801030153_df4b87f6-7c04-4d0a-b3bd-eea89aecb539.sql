-- Create table to store manual compliance overrides for rekap data
CREATE TABLE IF NOT EXISTS public.compliance_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.clinical_pathways(id) ON DELETE CASCADE,
  los_hari INTEGER,
  sesuai_target BOOLEAN DEFAULT false,
  kepatuhan_cp BOOLEAN DEFAULT false,
  kepatuhan_penunjang BOOLEAN DEFAULT false,
  kepatuhan_terapi BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_patient_override UNIQUE (patient_id)
);

-- Enable RLS
ALTER TABLE public.compliance_overrides ENABLE ROW LEVEL SECURITY;

-- Create policies for compliance_overrides
CREATE POLICY "Allow all operations on compliance_overrides" 
ON public.compliance_overrides 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_compliance_overrides_updated_at
BEFORE UPDATE ON public.compliance_overrides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();