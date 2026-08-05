import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "compliance_summary",
  title: "Rekap kepatuhan clinical pathway",
  description:
    "Summarise clinical pathway compliance for a given year (optionally one pathway type): patient counts and percentage of kepatuhan CP, penunjang, terapi, and LOS sesuai target, broken down per month.",
  inputSchema: {
    year: z.number().int().describe("Year of admission, e.g. 2026."),
    pathway_type: z.string().optional().describe("Limit to one jenis clinical pathway."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ year, pathway_type }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);

    let query = supabase
      .from("clinical_pathways")
      .select("id, jenis_clinical_pathway, tanggal_masuk")
      .gte("tanggal_masuk", `${year}-01-01`)
      .lt("tanggal_masuk", `${year + 1}-01-01`);
    if (pathway_type) query = query.eq("jenis_clinical_pathway", pathway_type as never);

    const { data: patients, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const ids = (patients ?? []).map((p) => p.id);
    let compliance: Array<Record<string, unknown>> = [];
    if (ids.length) {
      const { data, error: cErr } = await supabase
        .from("compliance_data")
        .select("patient_id, kepatuhan_cp, kepatuhan_penunjang, kepatuhan_terapi, sesuai_target")
        .in("patient_id", ids);
      if (cErr) return { content: [{ type: "text", text: cErr.message }], isError: true };
      compliance = data ?? [];
    }
    const byPatient = new Map(compliance.map((c) => [c.patient_id as string, c]));

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: 0,
      kepatuhan_cp: 0,
      kepatuhan_penunjang: 0,
      kepatuhan_terapi: 0,
      sesuai_target: 0,
    }));

    for (const p of patients ?? []) {
      const m = Number(String(p.tanggal_masuk).slice(5, 7));
      const row = months[m - 1];
      if (!row) continue;
      row.total += 1;
      const c = byPatient.get(p.id);
      if (c?.kepatuhan_cp) row.kepatuhan_cp += 1;
      if (c?.kepatuhan_penunjang) row.kepatuhan_penunjang += 1;
      if (c?.kepatuhan_terapi) row.kepatuhan_terapi += 1;
      if (c?.sesuai_target) row.sesuai_target += 1;
    }

    const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0);
    const monthly = months.map((m) => ({
      ...m,
      kepatuhan_cp_pct: pct(m.kepatuhan_cp, m.total),
      kepatuhan_penunjang_pct: pct(m.kepatuhan_penunjang, m.total),
      kepatuhan_terapi_pct: pct(m.kepatuhan_terapi, m.total),
      sesuai_target_pct: pct(m.sesuai_target, m.total),
    }));

    const totals = months.reduce(
      (acc, m) => ({
        total: acc.total + m.total,
        kepatuhan_cp: acc.kepatuhan_cp + m.kepatuhan_cp,
        kepatuhan_penunjang: acc.kepatuhan_penunjang + m.kepatuhan_penunjang,
        kepatuhan_terapi: acc.kepatuhan_terapi + m.kepatuhan_terapi,
        sesuai_target: acc.sesuai_target + m.sesuai_target,
      }),
      { total: 0, kepatuhan_cp: 0, kepatuhan_penunjang: 0, kepatuhan_terapi: 0, sesuai_target: 0 },
    );

    const result = {
      year,
      pathway_type: pathway_type ?? "semua",
      totals: {
        ...totals,
        kepatuhan_cp_pct: pct(totals.kepatuhan_cp, totals.total),
        kepatuhan_penunjang_pct: pct(totals.kepatuhan_penunjang, totals.total),
        kepatuhan_terapi_pct: pct(totals.kepatuhan_terapi, totals.total),
        sesuai_target_pct: pct(totals.sesuai_target, totals.total),
      },
      monthly,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
