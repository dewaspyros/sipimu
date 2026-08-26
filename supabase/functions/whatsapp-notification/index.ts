import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  corsHeadersFor,
  isSafeWhatsappTarget,
  jsonResponse,
  resolveFonnteApiKey,
  serviceClient,
} from "../_shared/security.ts";

const FONTE_API_URL = "https://api.fonnte.com/send";

/** Notifikasi hanya boleh dikirim untuk pasien yang baru saja dibuat oleh trigger database. */
const MAX_RECORD_AGE_MS = 10 * 60 * 1000;
const DELAY_BETWEEN_MESSAGES_MS = 30_000;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeadersFor(req) });
  }

  try {
    // Fungsi ini dipanggil oleh trigger database. Isi pesan TIDAK pernah diambil dari
    // body permintaan — hanya id pasien yang dipakai, lalu datanya dibaca ulang dari database.
    let body: { record?: { id?: unknown } };
    try {
      body = await req.json();
    } catch {
      return jsonResponse(req, { error: "Body tidak valid" }, 400);
    }

    const pathwayId = body?.record?.id;
    if (typeof pathwayId !== "string" || !UUID_RE.test(pathwayId)) {
      return jsonResponse(req, { error: "ID pasien tidak valid" }, 400);
    }

    const supabase = serviceClient();

    const { data: pathway, error: pathwayError } = await supabase
      .from("clinical_pathways")
      .select(
        "id, nama_pasien, no_rm, jenis_clinical_pathway, tanggal_masuk, jam_masuk, dpjp, verifikator_pelaksana, bangsal, created_at, wa_notified_at",
      )
      .eq("id", pathwayId)
      .maybeSingle();

    if (pathwayError || !pathway) {
      return jsonResponse(req, { error: "Data pasien tidak ditemukan" }, 404);
    }

    // Idempoten + anti penyalahgunaan: satu pasien hanya menghasilkan satu notifikasi,
    // dan hanya dalam jendela waktu singkat setelah data dibuat.
    if (pathway.wa_notified_at) {
      return jsonResponse(req, { success: true, skipped: "already_notified" });
    }

    const age = Date.now() - new Date(pathway.created_at as string).getTime();
    if (age > MAX_RECORD_AGE_MS) {
      return jsonResponse(req, { success: true, skipped: "record_too_old" });
    }

    const { data: settings, error: settingsError } = await supabase
      .from("whatsapp_settings")
      .select("api_key, notification_phones, message_template, group_list")
      .maybeSingle();

    if (settingsError || !settings) {
      return jsonResponse(req, { error: "Pengaturan WhatsApp tidak ditemukan" }, 500);
    }

    const apiKey = resolveFonnteApiKey(settings.api_key);
    if (!apiKey) {
      return jsonResponse(req, { error: "API key Fonnte belum dikonfigurasi" }, 500);
    }

    const groupList = (settings.group_list ?? []) as Array<{ id: string }>;
    const validGroupIds = new Set(
      groupList.map((g) => g?.id).filter(isSafeWhatsappTarget),
    );

    const targets = ((settings.notification_phones ?? []) as unknown[])
      .filter(isSafeWhatsappTarget)
      .filter((target) => validGroupIds.has(target));

    if (targets.length === 0) {
      return jsonResponse(
        req,
        { error: "Tidak ada grup tujuan valid yang dikonfigurasi" },
        400,
      );
    }

    const message = (settings.message_template as string)
      .replace(/{nama_pasien}/g, pathway.nama_pasien ?? "")
      .replace(/{no_rm}/g, pathway.no_rm ?? "")
      .replace(/{jenis_clinical_pathway}/g, pathway.jenis_clinical_pathway ?? "")
      .replace(/{tanggal_masuk}/g, String(pathway.tanggal_masuk ?? ""))
      .replace(/{jam_masuk}/g, String(pathway.jam_masuk ?? ""))
      .replace(/{dpjp}/g, pathway.dpjp ?? "Tidak diisi")
      .replace(
        /{verifikator_pelaksana}/g,
        pathway.verifikator_pelaksana ?? "Tidak diisi",
      )
      .replace(/{bangsal}/g, pathway.bangsal ?? "Tidak diisi")
      .slice(0, 4000);

    // Tandai lebih dulu agar permintaan berulang tidak menghasilkan pesan ganda.
    await supabase
      .from("clinical_pathways")
      .update({ wa_notified_at: new Date().toISOString() })
      .eq("id", pathway.id);

    const sendResults: Array<{ group: string; status: string }> = [];

    for (let i = 0; i < targets.length; i++) {
      const groupId = targets[i];
      try {
        const formData = new FormData();
        formData.append("target", groupId);
        formData.append("message", message);

        const fonteResponse = await fetch(FONTE_API_URL, {
          method: "POST",
          headers: { Authorization: apiKey },
          body: formData,
        });

        const responseData = await fonteResponse.json();
        sendResults.push({
          group: groupId,
          status:
            fonteResponse.ok && responseData?.status !== false
              ? "success"
              : "error",
        });
      } catch (_error) {
        sendResults.push({ group: groupId, status: "error" });
      }

      if (i < targets.length - 1) {
        await delay(DELAY_BETWEEN_MESSAGES_MS);
      }
    }

    return jsonResponse(req, { success: true, results: sendResults });
  } catch (error) {
    console.error("Error whatsapp-notification:", (error as Error).message);
    return jsonResponse(req, { success: false, error: "Terjadi kesalahan" }, 500);
  }
});
