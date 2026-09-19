import { authenticatedContext } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return Response.json({
      backend: "EPHEMERAL",
      authenticated: false,
      signupEnabled: false
    });
  }

  const context = await authenticatedContext();

  return Response.json({
    backend: "DURABLE",
    authenticated: Boolean(context.user),
    user: context.user
      ? {
          id: context.user.id,
          email: context.user.email ?? null
        }
      : null,
    signupEnabled: process.env.STORYFORGE_SIGNUP_ENABLED === "true"
  });
}
