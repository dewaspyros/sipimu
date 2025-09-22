-- Update the WhatsApp notification trigger to use dynamic settings
-- First, drop the existing trigger
DROP TRIGGER IF EXISTS trigger_whatsapp_new_pathway ON public.clinical_pathways;

-- Drop the existing function
DROP FUNCTION IF EXISTS public.notify_whatsapp_new_pathway();

-- Create updated function that doesn't pass phone numbers (they'll be read from settings)
CREATE OR REPLACE FUNCTION public.notify_whatsapp_new_pathway()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Log the trigger execution
    RAISE LOG 'WhatsApp notification trigger fired for new clinical pathway: %', NEW.id;
    
    -- Call the edge function to send WhatsApp notification
    -- The edge function will read phone numbers and settings from whatsapp_settings table
    PERFORM net.http_post(
        url := 'https://uxrgnwsdkkjrueoqozuq.functions.supabase.co/functions/v1/whatsapp-notification',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cmdud3Nka2tqcnVlb3FvenVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MTYwMDcsImV4cCI6MjA2ODk5MjAwN30.mRXkQ1ANvj5tPtVLLsgQSzdsfkCJJ29jGzVLUmPXJ2o"}'::jsonb,
        body := json_build_object(
            'record', json_build_object(
                'id', NEW.id,
                'nama_pasien', NEW.nama_pasien,
                'no_rm', NEW.no_rm,
                'jenis_clinical_pathway', NEW.jenis_clinical_pathway::text,
                'tanggal_masuk', NEW.tanggal_masuk::text,
                'jam_masuk', NEW.jam_masuk::text,
                'dpjp', NEW.dpjp,
                'verifikator_pelaksana', NEW.verifikator_pelaksana
            )
        )::jsonb
    );
    
    RETURN NEW;
END;
$function$

-- Recreate the trigger
CREATE TRIGGER trigger_whatsapp_new_pathway
    AFTER INSERT ON public.clinical_pathways
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_whatsapp_new_pathway();