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

  if (process.env.STORYFORGE_SIGNUP_ENABLED !== "true") {
    return Response.json(
      { error: "SIGNUP_DISABLED" },
      { status: 403 }
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
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password
  });

  if (error) {
    return Response.json(
      {
        error: "SIGN_UP_FAILED",
        message: error.message
      },
      { status: 400 }
    );
  }

  return Response.json({
    signedUp: true,
    sessionCreated: Boolean(data.session),
    userId: data.user?.id ?? null
  });
}
