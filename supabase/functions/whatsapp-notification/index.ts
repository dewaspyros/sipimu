import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FONTE_API_KEY = Deno.env.get('FONTE_WHATSAPP_API_KEY');
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
  dpjp: string;
  verifikator_pelaksana: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('WhatsApp notification function called');
    
    if (!FONTE_API_KEY) {
      console.error('FONTE_WHATSAPP_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const body = await req.json();
    console.log('Request body:', body);

    const { record, phone_number } = body as { 
      record: ClinicalPathwayData, 
      phone_number: string 
    };

    if (!record || !phone_number) {
      console.error('Missing required data:', { record: !!record, phone_number: !!phone_number });
      return new Response(
        JSON.stringify({ error: 'Missing record or phone_number' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Format the WhatsApp message
    const message = `🏥 *NOTIFIKASI CLINICAL PATHWAY BARU*

📋 *Detail Pasien:*
• Nama: ${record.nama_pasien}
• No. RM: ${record.no_rm}
• Jenis CP: ${record.jenis_clinical_pathway}
• Tanggal Masuk: ${record.tanggal_masuk}
• Jam Masuk: ${record.jam_masuk}
• DPJP: ${record.dpjp || 'Belum ditentukan'}
• Verifikator: ${record.verifikator_pelaksana || 'Belum ditentukan'}

⏰ Diterima pada: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}

Silakan segera tindak lanjuti sesuai prosedur clinical pathway yang berlaku.`;

    console.log('Sending WhatsApp message to:', phone_number);
    console.log('Message:', message);

    // Send WhatsApp message via Fonte API
    const fonteResponse = await fetch(FONTE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FONTE_API_KEY}`,
      },
      body: JSON.stringify({
        phone: phone_number,
        message: message,
      }),
    });

    const fonteResult = await fonteResponse.json();
    console.log('Fonte API response:', fonteResult);

    if (!fonteResponse.ok) {
      console.error('Fonte API error:', fonteResult);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send WhatsApp message', 
          details: fonteResult 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('WhatsApp notification sent successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'WhatsApp notification sent successfully',
        fonte_response: fonteResult
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in whatsapp-notification function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});