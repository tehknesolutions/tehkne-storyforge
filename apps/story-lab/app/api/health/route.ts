import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

export async function GET() {
  const durableBackendConfigured = isSupabaseConfigured();

  return Response.json({
    product: "TEHKNÉ STORYFORGE / Story Lab",
    status: durableBackendConfigured
      ? "durable-backend-configured"
      : "v0.8-rc-ready-for-provisioning",
    storyforge: "0.8.0-rc.1",
    storyLab: "0.3.0-rc.1",
    tnir: "0.5.0",
    tpir: "0.1.0",
    creatorAuthority: true,
    automaticCanonPromotion: false,
    productionStore: durableBackendConfigured
      ? "DURABLE_REQUIRES_AUTH"
      : "EPHEMERAL",
    canonCommitMode: durableBackendConfigured
      ? "EXPLICIT_TRANSACTIONAL"
      : "DISABLED",
    durableBackendProvisioned: durableBackendConfigured
  });
}
