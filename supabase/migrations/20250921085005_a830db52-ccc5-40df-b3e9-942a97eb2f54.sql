-- Add unique constraint to patient_id in compliance_data table
ALTER TABLE public.compliance_data 
ADD CONSTRAINT compliance_data_patient_id_unique UNIQUE (patient_id);