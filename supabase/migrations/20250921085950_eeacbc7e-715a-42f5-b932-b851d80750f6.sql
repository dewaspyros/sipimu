-- Create a trigger function to send WhatsApp notifications for new clinical pathways
CREATE OR REPLACE FUNCTION public.notify_whatsapp_new_pathway()
RETURNS TRIGGER AS $$
DECLARE
    notification_phones TEXT[] := ARRAY['6281234567890', '6289876543210']; -- Replace with actual phone numbers
    phone_number TEXT;
BEGIN
    -- Log the trigger execution
    RAISE LOG 'WhatsApp notification trigger fired for new clinical pathway: %', NEW.id;
    
    -- Loop through each phone number and send notification
    FOREACH phone_number IN ARRAY notification_phones
    LOOP
        -- Call the edge function to send WhatsApp notification
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
                ),
                'phone_number', phone_number
            )::jsonb
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger that fires when a new clinical pathway is inserted
CREATE OR REPLACE TRIGGER trigger_whatsapp_new_pathway
    AFTER INSERT ON public.clinical_pathways
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_whatsapp_new_pathway();

-- Enable the pg_net extension if not already enabled (required for http_post)
CREATE EXTENSION IF NOT EXISTS pg_net;