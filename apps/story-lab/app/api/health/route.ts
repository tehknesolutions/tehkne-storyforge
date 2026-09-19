import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

export async function GET() {
  const durableBackendConfigured = isSupabaseConfigured();

  return Response.json({
    product: "TEHKNÉ STORYFORGE / Story Lab",
    status: durableBackendConfigured
      ? "durable-backend-configured"
      : "preview-runtime",
    storyforge: "0.7.0",
    storyLab: "0.2.0",
    tnir: "0.5.0",
    tpir: "0.1.0",
    creatorAuthority: true,
    automaticCanonPromotion: false,
    productionStore: durableBackendConfigured
      ? "DURABLE_REQUIRES_AUTH"
      : "EPHEMERAL",
    canonCommitMode: durableBackendConfigured
      ? "EXPLICIT_TRANSACTIONAL"
      : "DISABLED"
  });
}
