-- Create table for storing aggregated checklist data by month and clinical pathway type
CREATE TABLE public.checklist_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bulan INTEGER NOT NULL,
  tahun INTEGER NOT NULL,
  jenis_clinical_pathway TEXT NOT NULL,
  total_checklist_items INTEGER NOT NULL DEFAULT 0,
  completed_items INTEGER NOT NULL DEFAULT 0,
  completion_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  total_patients INTEGER NOT NULL DEFAULT 0,
  data_detail JSONB, -- Store detailed breakdown if needed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint to prevent duplicate entries for same month/year/pathway
  UNIQUE(bulan, tahun, jenis_clinical_pathway)
);

-- Enable Row Level Security
ALTER TABLE public.checklist_summary ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view checklist summary" 
ON public.checklist_summary 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert checklist summary" 
ON public.checklist_summary 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update checklist summary" 
ON public.checklist_summary 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete checklist summary" 
ON public.checklist_summary 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_checklist_summary_updated_at
BEFORE UPDATE ON public.checklist_summary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to aggregate checklist data
CREATE OR REPLACE FUNCTION public.aggregate_checklist_data(
  target_month INTEGER,
  target_year INTEGER,
  pathway_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  jenis_clinical_pathway TEXT,
  total_items BIGINT,
  completed_items BIGINT,
  completion_percentage DECIMAL(5,2),
  total_patients BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    cp.jenis_clinical_pathway::TEXT,
    COUNT(ccl.id) as total_items,
    COUNT(CASE 
      WHEN ccl.checklist_hari_1 = true OR 
           ccl.checklist_hari_2 = true OR 
           ccl.checklist_hari_3 = true OR 
           ccl.checklist_hari_4 = true OR 
           ccl.checklist_hari_5 = true OR 
           ccl.checklist_hari_6 = true 
      THEN 1 
    END) as completed_items,
    CASE 
      WHEN COUNT(ccl.id) > 0 THEN 
        ROUND(
          (COUNT(CASE 
            WHEN ccl.checklist_hari_1 = true OR 
                 ccl.checklist_hari_2 = true OR 
                 ccl.checklist_hari_3 = true OR 
                 ccl.checklist_hari_4 = true OR 
                 ccl.checklist_hari_5 = true OR 
                 ccl.checklist_hari_6 = true 
            THEN 1 
          END) * 100.0 / COUNT(ccl.id)), 2
        )
      ELSE 0 
    END as completion_percentage,
    COUNT(DISTINCT cp.id) as total_patients
  FROM public.clinical_pathways cp
  LEFT JOIN public.clinical_pathway_checklist ccl ON cp.id = ccl.clinical_pathway_id
  WHERE EXTRACT(MONTH FROM cp.tanggal_masuk) = target_month
    AND EXTRACT(YEAR FROM cp.tanggal_masuk) = target_year
    AND (pathway_type IS NULL OR cp.jenis_clinical_pathway::TEXT = pathway_type)
  GROUP BY cp.jenis_clinical_pathway::TEXT
  ORDER BY cp.jenis_clinical_pathway::TEXT;
END;
$function$;