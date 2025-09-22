import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const FONTE_API_URL = 'https://api.fonte.com.br/v1/message'; // Default Fonte API URL

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClinicalPathwayData {
  id: string;
  nama_pasien: string;
  no_rm: string;
  jenis_clinical_pathway: string;
  tanggal_masuk: string;
  jam_masuk: string;
  dpjp?: string;
  verifikator_pelaksana?: string;
}

interface WhatsappSettings {
  id: string;
  api_key: string;
  notification_phones: string[];
  message_template: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('WhatsApp notification function triggered');
    
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get WhatsApp settings from database
    const { data: settings, error: settingsError } = await supabase
      .from('whatsapp_settings')
      .select('*')
      .maybeSingle();

    if (settingsError) {
      console.error('Error fetching WhatsApp settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch WhatsApp settings' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!settings) {
      console.error('No WhatsApp settings found');
      return new Response(
        JSON.stringify({ error: 'WhatsApp settings not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const whatsappSettings = settings as WhatsappSettings;
    
    if (!whatsappSettings.api_key) {
      console.error('WhatsApp API key not configured');
      return new Response(
        JSON.stringify({ error: 'WhatsApp API key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!whatsappSettings.notification_phones || whatsappSettings.notification_phones.length === 0) {
      console.error('No notification phone numbers configured');
      return new Response(
        JSON.stringify({ error: 'No notification phone numbers configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const { record, phone_number } = await req.json();
    
    if (!record) {
      console.error('Missing required clinical pathway record');
      return new Response(
        JSON.stringify({ error: 'Missing clinical pathway record' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Use phone number from request or from settings
    const targetPhones = phone_number ? [phone_number] : whatsappSettings.notification_phones;
    
    console.log('Target phones:', targetPhones);
    console.log('Clinical pathway data:', record);

    const clinicalPathwayData = record as ClinicalPathwayData;

    // Format the message using the template from settings
    let message = whatsappSettings.message_template
      .replace(/{nama_pasien}/g, clinicalPathwayData.nama_pasien)
      .replace(/{no_rm}/g, clinicalPathwayData.no_rm)
      .replace(/{jenis_clinical_pathway}/g, clinicalPathwayData.jenis_clinical_pathway)
      .replace(/{tanggal_masuk}/g, clinicalPathwayData.tanggal_masuk)
      .replace(/{jam_masuk}/g, clinicalPathwayData.jam_masuk)
      .replace(/{dpjp}/g, clinicalPathwayData.dpjp || 'Tidak diisi')
      .replace(/{verifikator_pelaksana}/g, clinicalPathwayData.verifikator_pelaksana || 'Tidak diisi');

    console.log('Formatted message:', message);

    // Send WhatsApp message to each configured phone number
    const sendResults = [];
    
    for (const phoneNumber of targetPhones) {
      try {
        console.log(`Sending WhatsApp message to: ${phoneNumber}`);
        
        const fonteResponse = await fetch(FONTE_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappSettings.api_key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: phoneNumber,
            message: message,
          }),
        });

        const responseData = await fonteResponse.json();
        console.log(`Fonte API response for ${phoneNumber}:`, responseData);

        if (fonteResponse.ok) {
          sendResults.push({
            phone: phoneNumber,
            status: 'success',
            data: responseData
          });
          console.log(`WhatsApp message sent successfully to: ${phoneNumber}`);
        } else {
          sendResults.push({
            phone: phoneNumber,
            status: 'error',
            error: responseData
          });
          console.error(`Fonte API error for ${phoneNumber}:`, responseData);
        }
      } catch (error) {
        sendResults.push({
          phone: phoneNumber,
          status: 'error',
          error: error.message
        });
        console.error(`Error sending to ${phoneNumber}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'WhatsApp notifications processed',
        results: sendResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in WhatsApp notification function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});