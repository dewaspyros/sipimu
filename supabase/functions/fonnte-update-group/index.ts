import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const FONNTE_UPDATE_GROUP_URL = 'https://api.fonnte.com/update-group';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Updating WhatsApp groups from Fonnte API');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get WhatsApp API key from settings
    const { data: settings, error: settingsError } = await supabase
      .from('whatsapp_settings')
      .select('api_key')
      .maybeSingle();

    if (settingsError || !settings) {
      console.error('Error fetching settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'WhatsApp settings not found' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!settings.api_key) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp API key not configured' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Call Fonnte API to update groups
    const fonteResponse = await fetch(FONNTE_UPDATE_GROUP_URL, {
      method: 'POST',
      headers: {
        'Authorization': settings.api_key,
      },
    });

    const responseData = await fonteResponse.json();
    console.log('Fonnte update-group response:', responseData);

    if (!fonteResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update groups from Fonnte', 
          details: responseData 
        }), 
        { 
          status: fonteResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Group list updated successfully',
        details: responseData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in fonnte-update-group function:', error);
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
