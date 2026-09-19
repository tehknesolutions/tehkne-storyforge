import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

export async function POST() {
  if (!isSupabaseConfigured()) {
    return Response.json({ signedOut: true, mode: "PREVIEW" });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    return Response.json(
      {
        error: "SIGN_OUT_FAILED",
        message: error.message
      },
      { status: 400 }
    );
  }

  return Response.json({ signedOut: true, mode: "DURABLE" });
}
