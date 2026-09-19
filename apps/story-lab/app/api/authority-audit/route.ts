import { requireAuthenticatedContext } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return Response.json(
      {
        error: "DURABLE_BACKEND_NOT_CONFIGURED",
        durability: "EPHEMERAL",
        items: []
      },
      { status: 503 }
    );
  }

  try {
    const { supabase } = await requireAuthenticatedContext();
    const { data, error } = await supabase
      .from("storyforge_authority_audit")
      .select(
        "id, actor_user_id, actor_session_id, action, target_type, target_id, from_state, to_state, payload, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({
      durability: "DURABLE",
      immutableFromClient: true,
      items: data ?? []
    });
  } catch (error) {
    return Response.json(
      {
        error: "AUTHORITY_AUDIT_READ_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
        items: []
      },
      { status: 401 }
    );
  }
}
