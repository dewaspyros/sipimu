-- Create clinical_pathways table
CREATE TABLE public.clinical_pathways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  no_rm VARCHAR(20) NOT NULL,
  nama_pasien VARCHAR(255) NOT NULL,
  umur INTEGER,
  tanggal_masuk DATE NOT NULL,
  tanggal_keluar DATE,
  diagnosis VARCHAR(500) NOT NULL,
  dpjp VARCHAR(255) NOT NULL,
  verifikator VARCHAR(255),
  los INTEGER, -- Length of Stay in days
  kepatuhan_percentage INTEGER CHECK (kepatuhan_percentage >= 0 AND kepatuhan_percentage <= 100),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clinical_pathway_steps table for detailed checklist items
CREATE TABLE public.clinical_pathway_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pathway_id UUID REFERENCES public.clinical_pathways(id) ON DELETE CASCADE,
  step_name VARCHAR(255) NOT NULL,
  step_category VARCHAR(100), -- 'assessment', 'intervention', 'outcome', etc.
  day_number INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completion_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clinical_pathway_templates table for reusable templates
CREATE TABLE public.clinical_pathway_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name VARCHAR(255) NOT NULL,
  diagnosis VARCHAR(500) NOT NULL,
  expected_los INTEGER, -- Expected length of stay
  template_data JSONB, -- Store template structure
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.clinical_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_pathway_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_pathway_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clinical_pathways
CREATE POLICY "Users can view clinical pathways they created" 
ON public.clinical_pathways 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

CREATE POLICY "Users can create clinical pathways" 
ON public.clinical_pathways 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clinical pathways" 
ON public.clinical_pathways 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

-- Create RLS policies for clinical_pathway_steps
CREATE POLICY "Users can view pathway steps for their pathways" 
ON public.clinical_pathway_steps 
FOR SELECT 
USING (
  pathway_id IN (
    SELECT id FROM public.clinical_pathways 
    WHERE user_id = auth.uid() OR auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    )
  )
);

CREATE POLICY "Users can create pathway steps for their pathways" 
ON public.clinical_pathway_steps 
FOR INSERT 
WITH CHECK (
  pathway_id IN (
    SELECT id FROM public.clinical_pathways 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update pathway steps for their pathways" 
ON public.clinical_pathway_steps 
FOR UPDATE 
USING (
  pathway_id IN (
    SELECT id FROM public.clinical_pathways 
    WHERE user_id = auth.uid() OR auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    )
  )
);

-- Create RLS policies for clinical_pathway_templates
CREATE POLICY "All authenticated users can view active templates" 
ON public.clinical_pathway_templates 
FOR SELECT 
USING (is_active = TRUE);

CREATE POLICY "Only admins can create templates" 
ON public.clinical_pathway_templates 
FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

CREATE POLICY "Only admins can update templates" 
ON public.clinical_pathway_templates 
FOR UPDATE 
USING (auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

-- Create indexes for better performance
CREATE INDEX idx_clinical_pathways_user_id ON public.clinical_pathways(user_id);
CREATE INDEX idx_clinical_pathways_no_rm ON public.clinical_pathways(no_rm);
CREATE INDEX idx_clinical_pathways_tanggal_masuk ON public.clinical_pathways(tanggal_masuk);
CREATE INDEX idx_clinical_pathway_steps_pathway_id ON public.clinical_pathway_steps(pathway_id);
CREATE INDEX idx_clinical_pathway_steps_day_number ON public.clinical_pathway_steps(day_number);
CREATE INDEX idx_clinical_pathway_templates_diagnosis ON public.clinical_pathway_templates(diagnosis);

-- Create function to automatically calculate LOS
CREATE OR REPLACE FUNCTION public.calculate_los()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tanggal_keluar IS NOT NULL AND NEW.tanggal_masuk IS NOT NULL THEN
    NEW.los = NEW.tanggal_keluar - NEW.tanggal_masuk;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate LOS
CREATE TRIGGER calculate_los_trigger
  BEFORE INSERT OR UPDATE ON public.clinical_pathways
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_los();

-- Create function to update updated_at timestamp
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

CREATE TRIGGER update_clinical_pathway_steps_updated_at
    BEFORE UPDATE ON public.clinical_pathway_steps
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinical_pathway_templates_updated_at
    BEFORE UPDATE ON public.clinical_pathway_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample template data for common diagnoses
INSERT INTO public.clinical_pathway_templates (template_name, diagnosis, expected_los, template_data, is_active) VALUES
('Template Sectio Caesaria', 'Sectio Caesaria', 2, '{"steps": [{"day": 0, "category": "assessment", "items": ["Vital signs", "Blood type", "Consent"]}, {"day": 1, "category": "intervention", "items": ["Surgery", "Post-op monitoring"]}, {"day": 2, "category": "outcome", "items": ["Wound check", "Discharge planning"]}]}', TRUE),
('Template Pneumonia', 'Pneumonia', 5, '{"steps": [{"day": 0, "category": "assessment", "items": ["Chest X-ray", "Blood gas analysis", "CBC"]}, {"day": 1, "category": "intervention", "items": ["Antibiotic therapy", "Oxygen therapy"]}, {"day": 3, "category": "outcome", "items": ["Repeat chest X-ray", "Clinical improvement"]}]}', TRUE),
('Template Stroke Non Hemoragik', 'Stroke Non Hemoragik', 5, '{"steps": [{"day": 0, "category": "assessment", "items": ["CT scan", "Neurological exam", "Blood pressure"]}, {"day": 1, "category": "intervention", "items": ["Thrombolytic therapy", "Physiotherapy"]}, {"day": 5, "category": "outcome", "items": ["Functional assessment", "Discharge planning"]}]}', TRUE);