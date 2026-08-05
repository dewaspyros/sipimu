import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_pathway_types",
  title: "Daftar jenis clinical pathway",
  description:
    "List the clinical pathway types (jenis CP) configured in the app along with their LOS target in days.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("daftar_cp")
      .select("id, jenis_cp, \"Terget Los\"")
      .order("jenis_cp");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const types = (data ?? []).map((row) => ({
      id: row.id,
      jenis_cp: row.jenis_cp,
      target_los_hari: row["Terget Los"],
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(types, null, 2) }],
      structuredContent: { types },
    };
  },
});
