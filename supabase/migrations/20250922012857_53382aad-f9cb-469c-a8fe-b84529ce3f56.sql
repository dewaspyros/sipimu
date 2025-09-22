-- Create WhatsApp settings table
CREATE TABLE public.whatsapp_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key TEXT,
  notification_phones TEXT[] DEFAULT '{}',
  message_template TEXT DEFAULT 'Halo, Data Clinical Pathway baru telah ditambahkan:

Nama Pasien: {nama_pasien}
No. RM: {no_rm}
Jenis CP: {jenis_clinical_pathway}
Tanggal Masuk: {tanggal_masuk}
Jam Masuk: {jam_masuk}
DPJP: {dpjp}

Silakan cek sistem untuk detail lebih lanjut.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view WhatsApp settings"
ON public.whatsapp_settings
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert WhatsApp settings"
ON public.whatsapp_settings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update WhatsApp settings"
ON public.whatsapp_settings
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete WhatsApp settings"
ON public.whatsapp_settings
FOR DELETE
USING (true);

-- Insert default settings
INSERT INTO public.whatsapp_settings (api_key, notification_phones, message_template)
VALUES (
  '',
  ARRAY['6281234567890'],
  'Halo, Data Clinical Pathway baru telah ditambahkan:

Nama Pasien: {nama_pasien}
No. RM: {no_rm}
Jenis CP: {jenis_clinical_pathway}
Tanggal Masuk: {tanggal_masuk}
Jam Masuk: {jam_masuk}
DPJP: {dpjp}

Silakan cek sistem untuk detail lebih lanjut.'
);

-- Add trigger for timestamps
CREATE TRIGGER update_whatsapp_settings_updated_at
BEFORE UPDATE ON public.whatsapp_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();