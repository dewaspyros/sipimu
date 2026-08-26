import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/** Origin yang boleh memanggil edge function ini. */
const ALLOWED_ORIGINS = [
  "https://sipimu.web.id",
  "https://www.sipimu.web.id",
  "https://sipimu.lovable.app",
  "http://localhost:8080",
];

const ALLOWED_ORIGIN_PATTERNS = [/^https:\/\/[a-z0-9-]+\.lovable\.app$/i];

export function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowed =
    ALLOWED_ORIGINS.includes(origin) ||
    ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin));

  return {
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export function jsonResponse(
  req: Request,
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeadersFor(req), "Content-Type": "application/json" },
  });
}

/** Klien service role — hanya untuk dipakai di dalam edge function, tidak pernah ke browser. */
export function serviceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface AdminCheck {
  ok: boolean;
  status: number;
  error?: string;
  userId?: string;
}

/**
 * Memvalidasi bahwa pemanggil adalah user yang login, sudah disetujui, dan berperan admin.
 * Token diverifikasi di sisi server; role dibaca dari tabel user_roles (bukan dari klaim JWT).
 */
export async function requireAdmin(req: Request): Promise<AdminCheck> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token || token === SUPABASE_ANON_KEY) {
    return { ok: false, status: 401, error: "Autentikasi diperlukan" };
  }

  const admin = serviceClient();
  const { data: userData, error: userError } = await admin.auth.getUser(token);

  if (userError || !userData?.user) {
    return { ok: false, status: 401, error: "Sesi tidak valid" };
  }

  const userId = userData.user.id;

  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleRow) {
    return { ok: false, status: 403, error: "Akses khusus admin", userId };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("is_approved")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile?.is_approved) {
    return { ok: false, status: 403, error: "Akun belum disetujui", userId };
  }

  return { ok: true, status: 200, userId };
}

/**
 * API key Fonnte. Diambil dari secret bila tersedia agar tidak pernah melewati browser;
 * nilai di tabel hanya dipakai sebagai cadangan selama masa transisi.
 */
export function resolveFonnteApiKey(fallback?: string | null): string | null {
  return Deno.env.get("FONTE_WHATSAPP_API_KEY") || fallback || null;
}

/** Nomor/ID target WhatsApp yang aman untuk diteruskan ke API eksternal. */
export function isSafeWhatsappTarget(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 64 &&
    /^[0-9A-Za-z@.\-]+$/.test(value)
  );
}
