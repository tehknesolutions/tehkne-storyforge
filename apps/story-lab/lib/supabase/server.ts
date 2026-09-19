import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseEnv } from "./env";

export async function createSupabaseServerClient() {
  const { url, publishableKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot always write cookies.
          // proxy.ts owns refresh-cookie propagation.
        }
      }
    }
  });
}
