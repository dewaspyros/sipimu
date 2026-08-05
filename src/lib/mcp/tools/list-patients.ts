import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_patients",
  title: "Daftar pasien clinical pathway",
  description:
    "List clinical pathway patient records, optionally filtered by year, month, pathway type, ward, or patient name / medical record number.",
  inputSchema: {
    year: z.number().int().optional().describe("Filter by admission year, e.g. 2026."),
    month: z.number().int().optional().describe("Filter by admission month 1-12 (requires year)."),
    pathway_type: z.string().optional().describe("Exact jenis clinical pathway, e.g. 'Intracranial Hemorrhagia'."),
    ward: z.string().optional().describe("Exact bangsal / ward name."),
    search: z.string().optional().describe("Partial match on patient name or medical record number (no_rm)."),
    limit: z.number().int().optional().describe("Max rows to return, default 50, capped at 200."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ year, month, pathway_type, ward, search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const take = Math.min(Math.max(limit ?? 50, 1), 200);

    let query = supabase
      .from("clinical_pathways")
      .select("id, no_rm, nama_pasien, jenis_clinical_pathway, bangsal, dpjp, tanggal_masuk, tanggal_keluar, los_hari, keterangan")
      .order("tanggal_masuk", { ascending: false })
      .limit(take);

    if (year) {
      const from = month
        ? `${year}-${String(month).padStart(2, "0")}-01`
        : `${year}-01-01`;
      const toDate = month
        ? new Date(Date.UTC(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1))
        : new Date(Date.UTC(year + 1, 0, 1));
      query = query.gte("tanggal_masuk", from).lt("tanggal_masuk", toDate.toISOString().slice(0, 10));
    }
    if (pathway_type) query = query.eq("jenis_clinical_pathway", pathway_type as never);
    if (ward) query = query.eq("bangsal", ward as never);
    if (search) query = query.or(`nama_pasien.ilike.%${search}%,no_rm.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { count: data?.length ?? 0, patients: data ?? [] },
    };
  },
});
