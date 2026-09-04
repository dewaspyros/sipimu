DROP POLICY IF EXISTS "Admins can delete clinical pathways" ON public.clinical_pathways;
CREATE POLICY "Approved staff can delete clinical pathways" ON public.clinical_pathways FOR DELETE TO authenticated USING (is_user_approved(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete checklists" ON public.clinical_pathway_checklist;
CREATE POLICY "Approved staff can delete checklists" ON public.clinical_pathway_checklist FOR DELETE TO authenticated USING (is_user_approved(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete compliance data" ON public.compliance_data;
CREATE POLICY "Approved staff can delete compliance data" ON public.compliance_data FOR DELETE TO authenticated USING (is_user_approved(auth.uid()));

ALTER TABLE public.clinical_pathway_checklist DROP CONSTRAINT IF EXISTS clinical_pathway_checklist_clinical_pathway_id_fkey;
ALTER TABLE public.clinical_pathway_checklist ADD CONSTRAINT clinical_pathway_checklist_clinical_pathway_id_fkey FOREIGN KEY (clinical_pathway_id) REFERENCES public.clinical_pathways(id) ON DELETE CASCADE;

ALTER TABLE public.compliance_data DROP CONSTRAINT IF EXISTS compliance_data_patient_id_fkey;
ALTER TABLE public.compliance_data ADD CONSTRAINT compliance_data_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.clinical_pathways(id) ON DELETE CASCADE;

ALTER TABLE public.compliance_overrides DROP CONSTRAINT IF EXISTS compliance_overrides_patient_id_fkey;
ALTER TABLE public.compliance_overrides ADD CONSTRAINT compliance_overrides_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.clinical_pathways(id) ON DELETE CASCADE;