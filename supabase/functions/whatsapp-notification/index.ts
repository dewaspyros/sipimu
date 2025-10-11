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

interface WhatsappGroup {
  id: string;
  name?: string;
  subject?: string;
}

interface WhatsappSettings {
  id: string;
  api_key: string;
  notification_phones: string[];
  message_template: string;
  group_list?: WhatsappGroup[];
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
      console.error('No notification groups configured');
      return new Response(
        JSON.stringify({ error: 'No notification groups configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!whatsappSettings.group_list || whatsappSettings.group_list.length === 0) {
      console.error('Group list is empty. Please fetch groups first.');
      return new Response(
        JSON.stringify({ error: 'Group list is empty. Please fetch groups using the settings page.' }), 
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
    
    // Use targets from request or from settings (group IDs only)
    const targetGroups = phone_number ? [phone_number] : whatsappSettings.notification_phones;
    
    console.log('Target groups:', targetGroups);
    console.log('Available groups:', whatsappSettings.group_list);
    console.log('Clinical pathway data:', record);
    
    // Create a Set of valid group IDs for quick lookup
    const validGroupIds = new Set(whatsappSettings.group_list.map(g => g.id));
    
    // Validate that target is in the group list
    const validateGroupId = (groupId: string): boolean => {
      const isValid = validGroupIds.has(groupId);
      if (!isValid) {
        console.error(`Group ID ${groupId} not found in group list. Available groups:`, Array.from(validGroupIds));
      }
      return isValid;
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
    
    // Send WhatsApp message to each configured group with delay
    const sendResults = [];
    const delayBetweenMessages = 30000; // 30 seconds delay between messages
    
    for (let i = 0; i < targetGroups.length; i++) {
      const groupId = targetGroups[i];
      
      // Validate group ID
      if (!validateGroupId(groupId)) {
        console.error(`Invalid group ID: ${groupId} - not found in fetched group list`);
        sendResults.push({
          group: groupId,
          status: 'error',
          error: 'Group ID not found in available groups. Please refresh group list.'
        });
        continue;
      }
      
      try {
        console.log(`Sending WhatsApp message to group: ${groupId} (${i + 1}/${targetGroups.length})`);
        
        // Prepare form data for Fonnte API
        const formData = new FormData();
        formData.append('target', groupId);
        formData.append('message', message);

        const fonteResponse = await fetch(FONTE_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': whatsappSettings.api_key,
          },
          body: formData,
        });

        const responseData = await fonteResponse.json();
        console.log(`Fonte API response for group ${groupId}:`, responseData);

        // Check response status from Fonnte
        if (responseData.status === false) {
          const errorMsg = responseData.reason || 'Unknown error';
          sendResults.push({
            group: groupId,
            status: 'error',
            error: errorMsg
          });
          console.error(`Fonte API error for group ${groupId}:`, errorMsg);
          
          // Provide helpful error messages
          if (errorMsg.includes('invalid group id')) {
            console.error('Hint: Group ID may be invalid or outdated. Try refreshing group list in settings page.');
          } else if (errorMsg.includes('disconnected device')) {
            console.error('Hint: WhatsApp device is disconnected. Please reconnect your device in Fonnte dashboard');
          }
        } else if (fonteResponse.ok) {
          sendResults.push({
            group: groupId,
            status: 'success',
            data: responseData
          });
          console.log(`WhatsApp message sent successfully to group: ${groupId}`);
        } else {
          sendResults.push({
            group: groupId,
            status: 'error',
            error: responseData
          });
          console.error(`Fonte API error for group ${groupId}:`, responseData);
        }
        
        // Add delay between messages, except for the last one
        if (i < targetGroups.length - 1) {
          console.log(`Waiting ${delayBetweenMessages}ms before sending to next group...`);
          await delay(delayBetweenMessages);
        }
        
      } catch (error) {
        sendResults.push({
          group: groupId,
          status: 'error',
          error: (error as Error).message
        });
        console.error(`Error sending to group ${groupId}:`, error);
        
        // Still add delay even on error, except for the last one
        if (i < targetGroups.length - 1) {
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