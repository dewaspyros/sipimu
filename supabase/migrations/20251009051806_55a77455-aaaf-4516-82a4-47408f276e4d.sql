-- Add columns for WhatsApp group management
ALTER TABLE public.whatsapp_settings 
ADD COLUMN IF NOT EXISTS group_list jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_group_update timestamp with time zone;

COMMENT ON COLUMN public.whatsapp_settings.group_list IS 'Stores list of available WhatsApp groups from Fonnte API';
COMMENT ON COLUMN public.whatsapp_settings.last_group_update IS 'Timestamp of last group list update from Fonnte API';