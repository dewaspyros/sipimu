import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listPatientsTool from "./tools/list-patients";
import getPatientTool from "./tools/get-patient";
import complianceSummaryTool from "./tools/compliance-summary";
import listPathwayTypesTool from "./tools/list-pathway-types";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "sipimu",
  title: "sipimu",
  version: "0.1.0",
  instructions:
    "Tools for SiPi-Mu, the clinical pathway reporting app of RS PKU Muhammadiyah Wonosobo. Use `list_pathway_types` to discover valid pathway names, `list_patients` to browse patient records, `get_patient` for one patient with its compliance and checklist, and `compliance_summary` for yearly/monthly kepatuhan statistics. All data is scoped to the signed-in user's permissions.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listPathwayTypesTool, listPatientsTool, getPatientTool, complianceSummaryTool],
});
