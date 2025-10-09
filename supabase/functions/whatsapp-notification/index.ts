import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const FONTE_API_URL = 'https://api.fonnte.com/send'; // Fonnte API URL

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
  bangsal?: string;
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
    
    // Validate target format (phone number or group ID)
    const validateTarget = (target: string): boolean => {
      // Valid formats:
      // - Phone: 628xxx or 08xxx (will be normalized to 628xxx)
      // - Group ID: format from Fonnte API (typically contains @g.us or specific format)
      const phonePattern = /^(0|62)\d{8,}$/;
      const groupPattern = /^[\d-]+@g\.us$|^[\d]+$/; // Fonnte group ID patterns
      
      return phonePattern.test(target) || groupPattern.test(target);
    };
    
    // Normalize phone number (convert 08xxx to 628xxx)
    const normalizeTarget = (target: string): string => {
      if (target.startsWith('0')) {
        return '62' + target.substring(1);
      }
      return target;
    };

    const clinicalPathwayData = record as ClinicalPathwayData;

    // Format the message using the template from settings
    let message = whatsappSettings.message_template
      .replace(/{nama_pasien}/g, clinicalPathwayData.nama_pasien)
      .replace(/{no_rm}/g, clinicalPathwayData.no_rm)
      .replace(/{jenis_clinical_pathway}/g, clinicalPathwayData.jenis_clinical_pathway)
      .replace(/{tanggal_masuk}/g, clinicalPathwayData.tanggal_masuk)
      .replace(/{jam_masuk}/g, clinicalPathwayData.jam_masuk)
      .replace(/{dpjp}/g, clinicalPathwayData.dpjp || 'Tidak diisi')
      .replace(/{verifikator_pelaksana}/g, clinicalPathwayData.verifikator_pelaksana || 'Tidak diisi')
      .replace(/{bangsal}/g, clinicalPathwayData.bangsal || 'Tidak diisi');

    console.log('Formatted message:', message);

    // Helper function to add delay between messages
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Send WhatsApp message to each configured phone number with delay
    const sendResults = [];
    const delayBetweenMessages = 30000; // 30 seconds delay between messages
    
    for (let i = 0; i < targetPhones.length; i++) {
      const target = targetPhones[i];
      
      // Validate and normalize target
      if (!validateTarget(target)) {
        console.error(`Invalid target format: ${target}`);
        sendResults.push({
          phone: target,
          status: 'error',
          error: 'Invalid phone number or group ID format'
        });
        continue;
      }
      
      const normalizedTarget = normalizeTarget(target);
      
      try {
        console.log(`Sending WhatsApp message to: ${normalizedTarget} (${i + 1}/${targetPhones.length})`);
        
        // Prepare form data for Fonnte API
        const formData = new FormData();
        formData.append('target', normalizedTarget);
        formData.append('message', message);

        const fonteResponse = await fetch(FONTE_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': whatsappSettings.api_key,
          },
          body: formData,
        });

        const responseData = await fonteResponse.json();
        console.log(`Fonte API response for ${normalizedTarget}:`, responseData);

        // Check response status from Fonnte
        if (responseData.status === false) {
          const errorMsg = responseData.reason || 'Unknown error';
          sendResults.push({
            phone: normalizedTarget,
            status: 'error',
            error: errorMsg
          });
          console.error(`Fonte API error for ${normalizedTarget}:`, errorMsg);
          
          // Provide helpful error messages
          if (errorMsg.includes('invalid group id')) {
            console.error('Hint: Group ID may be invalid. Try updating group list first using fonnte-update-group, then fetching with fonnte-get-groups');
          } else if (errorMsg.includes('disconnected device')) {
            console.error('Hint: WhatsApp device is disconnected. Please reconnect your device in Fonnte dashboard');
          }
        } else if (fonteResponse.ok) {
          sendResults.push({
            phone: normalizedTarget,
            status: 'success',
            data: responseData
          });
          console.log(`WhatsApp message sent successfully to: ${normalizedTarget}`);
        } else {
          sendResults.push({
            phone: normalizedTarget,
            status: 'error',
            error: responseData
          });
          console.error(`Fonte API error for ${normalizedTarget}:`, responseData);
        }
        
        // Add delay between messages, except for the last one
        if (i < targetPhones.length - 1) {
          console.log(`Waiting ${delayBetweenMessages}ms before sending to next number...`);
          await delay(delayBetweenMessages);
        }
        
      } catch (error) {
        sendResults.push({
          phone: normalizedTarget,
          status: 'error',
          error: (error as Error).message
        });
        console.error(`Error sending to ${normalizedTarget}:`, error);
        
        // Still add delay even on error, except for the last one
        if (i < targetPhones.length - 1) {
          console.log(`Error occurred, still waiting ${delayBetweenMessages}ms before next attempt...`);
          await delay(delayBetweenMessages);
        }
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
        error: (error as Error).message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});