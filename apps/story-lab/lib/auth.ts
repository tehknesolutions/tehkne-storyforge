import { createSupabaseServerClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/env";

export async function authenticatedContext() {
  if (!isSupabaseConfigured()) {
    return {
      mode: "PREVIEW" as const,
      user: null,
      supabase: null
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      mode: "DURABLE" as const,
      user: null,
      supabase
    };
  }

  return {
    mode: "DURABLE" as const,
    user: data.user,
    supabase
  };
}

export async function requireAuthenticatedContext() {
  const context = await authenticatedContext();

  if (context.mode !== "DURABLE" || !context.user || !context.supabase) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }

  return context;
}
