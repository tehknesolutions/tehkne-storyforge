import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { error: "DURABLE_BACKEND_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  const payload = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (
    typeof payload.email !== "string" ||
    typeof payload.password !== "string" ||
    !payload.email.includes("@") ||
    payload.password.length < 8
  ) {
    return Response.json(
      { error: "INVALID_CREDENTIAL_INPUT" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password
  });

  if (error || !data.user) {
    return Response.json(
      {
        error: "SIGN_IN_FAILED",
        message: error?.message ?? "Authentication failed"
      },
      { status: 401 }
    );
  }

  return Response.json({
    signedIn: true,
    user: {
      id: data.user.id,
      email: data.user.email ?? null
    }
  });
}
