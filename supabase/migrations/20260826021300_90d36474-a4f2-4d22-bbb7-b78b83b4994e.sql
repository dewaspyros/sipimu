-- =========================================================
-- TAHAP 1: Menutup kebocoran data (RLS + GRANT + views)
-- =========================================================

-- 1. Cabut semua izin anon dari skema public
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;

-- 2. Views: security_invoker agar menghormati RLS tabel dasarnya
ALTER VIEW public.v_avg_los_compliance SET (security_invoker = true);
ALTER VIEW public.v_los_compliance     SET (security_invoker = true);
ALTER VIEW public.v_monthly_stats      SET (security_invoker = true);
ALTER VIEW public.v_pathway_compliance SET (security_invoker = true);
ALTER VIEW public.v_support_compliance SET (security_invoker = true);
ALTER VIEW public.v_therapy_compliance SET (security_invoker = true);
ALTER VIEW public.v_total_patients     SET (security_invoker = true);

-- =========================================================
-- clinical_pathways
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can view clinical pathways"   ON public.clinical_pathways;
DROP POLICY IF EXISTS "Authenticated users can insert clinical pathways" ON public.clinical_pathways;
DROP POLICY IF EXISTS "Authenticated users can update clinical pathways" ON public.clinical_pathways;
DROP POLICY IF EXISTS "Authenticated users can delete clinical pathways" ON public.clinical_pathways;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinical_pathways TO authenticated;
GRANT ALL ON public.clinical_pathways TO service_role;

CREATE POLICY "Approved staff can view clinical pathways"
  ON public.clinical_pathways FOR SELECT TO authenticated
  USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved staff can insert clinical pathways"
  ON public.clinical_pathways FOR INSERT TO authenticated
  WITH CHECK (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved staff can update clinical pathways"
  ON public.clinical_pathways FOR UPDATE TO authenticated
  USING (public.is_user_approved(auth.uid()))
  WITH CHECK (public.is_user_approved(auth.uid()));

CREATE POLICY "Admins can delete clinical pathways"
  ON public.clinical_pathways FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- clinical_pathway_checklist
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can view checklists"   ON public.clinical_pathway_checklist;
DROP POLICY IF EXISTS "Authenticated users can insert checklists" ON public.clinical_pathway_checklist;
DROP POLICY IF EXISTS "Authenticated users can update checklists" ON public.clinical_pathway_checklist;
DROP POLICY IF EXISTS "Authenticated users can delete checklists" ON public.clinical_pathway_checklist;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinical_pathway_checklist TO authenticated;
GRANT ALL ON public.clinical_pathway_checklist TO service_role;

CREATE POLICY "Approved staff can view checklists"
  ON public.clinical_pathway_checklist FOR SELECT TO authenticated
  USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved staff can insert checklists"
  ON public.clinical_pathway_checklist FOR INSERT TO authenticated
  WITH CHECK (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved staff can update checklists"
  ON public.clinical_pathway_checklist FOR UPDATE TO authenticated
  USING (public.is_user_approved(auth.uid()))
  WITH CHECK (public.is_user_approved(auth.uid()));

CREATE POLICY "Admins can delete checklists"
  ON public.clinical_pathway_checklist FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- compliance_data
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can view compliance data"   ON public.compliance_data;
DROP POLICY IF EXISTS "Authenticated users can insert compliance data" ON public.compliance_data;
DROP POLICY IF EXISTS "Authenticated users can update compliance data" ON public.compliance_data;
DROP POLICY IF EXISTS "Authenticated users can delete compliance data" ON public.compliance_data;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliance_data TO authenticated;
GRANT ALL ON public.compliance_data TO service_role;

CREATE POLICY "Approved staff can view compliance data"
  ON public.compliance_data FOR SELECT TO authenticated
  USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved staff can insert compliance data"
  ON public.compliance_data FOR INSERT TO authenticated
  WITH CHECK (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved staff can update compliance data"
  ON public.compliance_data FOR UPDATE TO authenticated
  USING (public.is_user_approved(auth.uid()))
  WITH CHECK (public.is_user_approved(auth.uid()));

CREATE POLICY "Admins can delete compliance data"
  ON public.compliance_data FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- checklist_summary
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can view checklist summary"   ON public.checklist_summary;
DROP POLICY IF EXISTS "Authenticated users can insert checklist summary" ON public.checklist_summary;
DROP POLICY IF EXISTS "Authenticated users can update checklist summary" ON public.checklist_summary;
DROP POLICY IF EXISTS "Authenticated users can delete checklist summary" ON public.checklist_summary;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.checklist_summary TO authenticated;
GRANT ALL ON public.checklist_summary TO service_role;

CREATE POLICY "Approved staff can view checklist summary"
  ON public.checklist_summary FOR SELECT TO authenticated
  USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved staff can insert checklist summary"
  ON public.checklist_summary FOR INSERT TO authenticated
  WITH CHECK (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved staff can update checklist summary"
  ON public.checklist_summary FOR UPDATE TO authenticated
  USING (public.is_user_approved(auth.uid()))
  WITH CHECK (public.is_user_approved(auth.uid()));

CREATE POLICY "Admins can delete checklist summary"
  ON public.checklist_summary FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- compliance_overrides (tulis: admin saja)
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can access compliance overrides" ON public.compliance_overrides;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliance_overrides TO authenticated;
GRANT ALL ON public.compliance_overrides TO service_role;

CREATE POLICY "Approved staff can view compliance overrides"
  ON public.compliance_overrides FOR SELECT TO authenticated
  USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Admins can manage compliance overrides"
  ON public.compliance_overrides FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- monthly_summary (tulis: admin saja)
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can access monthly summary" ON public.monthly_summary;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.monthly_summary TO authenticated;
GRANT ALL ON public.monthly_summary TO service_role;

CREATE POLICY "Approved staff can view monthly summary"
  ON public.monthly_summary FOR SELECT TO authenticated
  USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Admins can manage monthly summary"
  ON public.monthly_summary FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- whatsapp_settings (admin saja)
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can view WhatsApp settings"   ON public.whatsapp_settings;
DROP POLICY IF EXISTS "Authenticated users can insert WhatsApp settings" ON public.whatsapp_settings;
DROP POLICY IF EXISTS "Authenticated users can update WhatsApp settings" ON public.whatsapp_settings;
DROP POLICY IF EXISTS "Authenticated users can delete WhatsApp settings" ON public.whatsapp_settings;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_settings TO authenticated;
GRANT ALL ON public.whatsapp_settings TO service_role;

CREATE POLICY "Admins can manage WhatsApp settings"
  ON public.whatsapp_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- daftar_cp (referensi master)
-- =========================================================
GRANT SELECT ON public.daftar_cp TO authenticated;
GRANT ALL ON public.daftar_cp TO service_role;

DROP POLICY IF EXISTS "Approved staff can view daftar_cp" ON public.daftar_cp;
DROP POLICY IF EXISTS "Admins can manage daftar_cp" ON public.daftar_cp;

CREATE POLICY "Approved staff can view daftar_cp"
  ON public.daftar_cp FOR SELECT TO authenticated
  USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Admins can manage daftar_cp"
  ON public.daftar_cp FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- profiles / user_roles: pastikan hanya authenticated
-- =========================================================
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- =========================================================
-- Views: hanya authenticated
-- =========================================================
GRANT SELECT ON public.v_avg_los_compliance, public.v_los_compliance,
                public.v_monthly_stats, public.v_pathway_compliance,
                public.v_support_compliance, public.v_therapy_compliance,
                public.v_total_patients TO authenticated;

-- =========================================================
-- Fungsi tanpa search_path tetap
-- =========================================================
CREATE OR REPLACE FUNCTION public.notify_whatsapp_new_pathway()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    PERFORM net.http_post(
        url := 'https://uxrgnwsdkkjrueoqozuq.functions.supabase.co/functions/v1/whatsapp-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-webhook-source', 'db-trigger'
        ),
        body := json_build_object(
            'record', json_build_object(
                'id', NEW.id,
                'nama_pasien', NEW.nama_pasien,
                'no_rm', NEW.no_rm,
                'jenis_clinical_pathway', NEW.jenis_clinical_pathway::text,
                'tanggal_masuk', NEW.tanggal_masuk::text,
                'jam_masuk', NEW.jam_masuk::text,
                'dpjp', NEW.dpjp,
                'verifikator_pelaksana', NEW.verifikator_pelaksana,
                'bangsal', NEW.bangsal
            )
        )::jsonb
    );
    RETURN NEW;
END;
$function$;