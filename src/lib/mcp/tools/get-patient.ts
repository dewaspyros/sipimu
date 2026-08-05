import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_patient",
  title: "Detail pasien & kepatuhan",
  description:
    "Get one clinical pathway patient record together with its compliance data (kepatuhan CP, penunjang, terapi, sesuai target) and checklist items.",
  inputSchema: {
    patient_id: z.string().optional().describe("Clinical pathway record UUID."),
    no_rm: z.string().optional().describe("Medical record number; used when patient_id is not given."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ patient_id, no_rm }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    if (!patient_id && !no_rm) {
      return { content: [{ type: "text", text: "Provide patient_id or no_rm" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);

    let patientQuery = supabase.from("clinical_pathways").select("*").limit(1);
    patientQuery = patient_id
      ? patientQuery.eq("id", patient_id)
      : patientQuery.eq("no_rm", no_rm as string).order("tanggal_masuk", { ascending: false });

    const { data: patients, error } = await patientQuery;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const patient = patients?.[0];
    if (!patient) return { content: [{ type: "text", text: "Pasien tidak ditemukan" }], isError: true };

    const [{ data: compliance }, { data: checklist }] = await Promise.all([
      supabase.from("compliance_data").select("*").eq("patient_id", patient.id).maybeSingle(),
      supabase.from("clinical_pathway_checklist").select("*").eq("patient_id", patient.id),
    ]);

    const result = { patient, compliance: compliance ?? null, checklist: checklist ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
