CREATE TABLE public.activity_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  actor_name text NOT NULL,
  action_type text NOT NULL,
  pathway_id uuid,
  nama_pasien text,
  no_rm text,
  jenis_clinical_pathway text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.activity_notifications TO authenticated;
GRANT DELETE ON public.activity_notifications TO authenticated;
GRANT ALL ON public.activity_notifications TO service_role;

ALTER TABLE public.activity_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved staff can view notifications"
ON public.activity_notifications FOR SELECT TO authenticated
USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved staff can insert own notifications"
ON public.activity_notifications FOR INSERT TO authenticated
WITH CHECK (public.is_user_approved(auth.uid()) AND actor_id = auth.uid());

CREATE POLICY "Admins can delete notifications"
ON public.activity_notifications FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_activity_notifications_created_at ON public.activity_notifications (created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_notifications;