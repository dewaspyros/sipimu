import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  corsHeadersFor,
  jsonResponse,
  requireAdmin,
  resolveFonnteApiKey,
  serviceClient,
} from "../_shared/security.ts";

const FONNTE_UPDATE_GROUP_URL = "https://api.fonnte.com/fetch-group";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeadersFor(req) });
  }

  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) {
      return jsonResponse(req, { error: auth.error }, auth.status);
    }

    const supabase = serviceClient();

    const { data: settings, error: settingsError } = await supabase
      .from("whatsapp_settings")
      .select("id, api_key")
      .maybeSingle();

    if (settingsError || !settings) {
      return jsonResponse(req, { error: "Pengaturan WhatsApp tidak ditemukan" }, 500);
    }

    const apiKey = resolveFonnteApiKey(settings.api_key);
    if (!apiKey) {
      return jsonResponse(req, { error: "API key Fonnte belum dikonfigurasi" }, 400);
    }

    const fonteResponse = await fetch(FONNTE_UPDATE_GROUP_URL, {
      method: "POST",
      headers: { Authorization: apiKey },
    });

    const responseData = await fonteResponse.json();

    if (!fonteResponse.ok || responseData?.status === false) {
      console.error("Fonnte fetch-group gagal");
      return jsonResponse(req, { error: "Gagal memperbarui grup dari Fonnte" }, 400);
    }

    return jsonResponse(req, {
      success: true,
      message: "Daftar grup berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error fonnte-update-group:", (error as Error).message);
    return jsonResponse(req, { success: false, error: "Terjadi kesalahan" }, 500);
  }
});
