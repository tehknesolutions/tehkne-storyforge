import fs from "node:fs/promises";

const readJson = async (path) =>
  JSON.parse(await fs.readFile(new URL(`../${path}`, import.meta.url), "utf8"));
const readText = async (path) =>
  fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const exists = async (path) => {
  try {
    await fs.access(new URL(`../${path}`, import.meta.url));
    return true;
  } catch {
    return false;
  }
};

const [
  rootPackage,
  appPackage,
  schema,
  supabaseEnv,
  supabaseServer,
  supabaseProxy,
  auth,
  productionStore,
  reviewStore,
  generation,
  reviewApi,
  canonCommit,
  auditApi,
  reviewUi,
  loginUi,
  health,
  envExample
] = await Promise.all([
  readJson("package.json"),
  readJson("apps/story-lab/package.json"),
  readText("docs/database/STORYFORGE-SUPABASE-SCHEMA-V0.8.sql"),
  readText("apps/story-lab/lib/supabase/env.ts"),
  readText("apps/story-lab/lib/supabase/server.ts"),
  readText("apps/story-lab/lib/supabase/proxy.ts"),
  readText("apps/story-lab/lib/auth.ts"),
  readText("apps/story-lab/lib/production-store.ts"),
  readText("apps/story-lab/lib/review-store.ts"),
  readText("apps/story-lab/app/api/generate/reference/route.ts"),
  readText("apps/story-lab/app/api/review/[id]/route.ts"),
  readText("apps/story-lab/app/api/canon/commit/route.ts"),
  readText("apps/story-lab/app/api/authority-audit/route.ts"),
  readText("apps/story-lab/app/review/review-card.tsx"),
  readText("apps/story-lab/app/login/page.tsx"),
  readText("apps/story-lab/app/api/health/route.ts"),
  readText("apps/story-lab/.env.example")
]);

const errors = [];
const blockers = [];
const expect = (condition, message) => {
  if (!condition) errors.push(message);
};

expect(rootPackage.version === "0.8.0-rc.1", "Storyforge RC version mismatch");
expect(appPackage.version === "0.3.0-rc.1", "Story Lab RC version mismatch");
expect(appPackage.dependencies["@supabase/ssr"] === "0.12.7", "@supabase/ssr must be pinned");
expect(appPackage.dependencies["@supabase/supabase-js"] === "2.116.0", "supabase-js must be pinned");

for (const table of [
  "storyforge_production_jobs",
  "storyforge_review_items",
  "storyforge_canon_facts",
  "storyforge_authority_audit"
]) {
  expect(
    schema.includes(`alter table public.${table} enable row level security;`),
    `RLS missing for ${table}`
  );
}

expect(schema.includes("grant select\n  on public.storyforge_canon_facts to authenticated;"), "Canon facts must be select-only for authenticated");
expect(schema.includes("grant select\n  on public.storyforge_authority_audit to authenticated;"), "Audit must be select-only for authenticated");
expect(!schema.includes("grant insert\n  on public.storyforge_canon_facts"), "Direct Canon INSERT grant detected");
expect(!schema.includes("grant insert\n  on public.storyforge_authority_audit"), "Direct audit INSERT grant detected");
expect(schema.includes("and status = 'PENDING'\n  and decision is null"), "Review inserts must start PENDING");
expect(schema.includes("status <> 'COMMITTED'"), "Committed review must be immutable");
expect(schema.includes("storyforge_private.commit_canon_proposal"), "Private commit implementation missing");
expect(schema.includes("public.storyforge_commit_canon_proposal"), "Public commit RPC missing");
expect(schema.includes("REVIEW_VERSION_CONFLICT"), "Optimistic lock missing");
expect(schema.includes("PROPOSAL_AUTHORITY_MUST_BE_CANDIDATE"), "Candidate authority check missing");
expect(schema.includes("auth.jwt() ->> 'session_id'"), "Session-aware audit missing");

expect(supabaseEnv.includes("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), "Publishable-key env contract missing");
expect(supabaseServer.includes("await cookies()"), "Server client must use request cookies");
expect(!supabaseServer.includes("globalThis"), "Server Supabase client must not be global");
expect(supabaseProxy.includes("supabase.auth.getClaims()"), "Proxy must validate JWT claims");
expect(supabaseProxy.includes('"/authority-audit"'), "Authority audit route must be protected");
expect(auth.includes("supabase.auth.getUser()"), "Sensitive authenticated context must revalidate user");

expect(productionStore.includes('readonly durability = "DURABLE"'), "Durable ProductionStore missing");
expect(productionStore.includes('from("storyforge_production_jobs")'), "ProductionStore is not Supabase-backed");
expect(reviewStore.includes('from("storyforge_review_items")'), "ReviewStore is not Supabase-backed");

expect(generation.includes("await requireAuthenticatedContext();"), "Durable generation must auth before provider call");
expect(generation.includes("CANON_PROPOSAL_PERSISTENCE_FAILED"), "Generated proposal persistence hard-fail missing");
expect(generation.includes('from("storyforge_review_items")'), "Generated proposals are not persisted");

expect(reviewApi.includes("EXPLICIT_CANON_COMMIT_REQUIRED"), "Review API missing explicit commit boundary");
expect(canonCommit.includes('confirmation !== "COMMIT TO CANON"'), "Canon textual confirmation missing");
expect(canonCommit.includes("p_expected_updated_at"), "Canon optimistic-lock argument missing");
expect(canonCommit.includes("storyforge_commit_canon_proposal"), "Canon RPC call missing");
expect(auditApi.includes('from("storyforge_authority_audit")'), "Audit API missing");
expect(auditApi.includes("immutableFromClient: true"), "Audit immutability disclosure missing");

expect(reviewUi.includes("/api/canon/commit"), "Review UI is not wired to Canon commit");
expect(reviewUi.includes("COMMIT TO CANON"), "Review UI confirmation phrase missing");
expect(loginUi.includes("/api/auth/"), "Login UI not wired to auth API");
expect(loginUi.includes('submit("sign-in")'), "Login UI sign-in path missing");

expect(envExample.includes("STORYFORGE_SIGNUP_ENABLED=false"), "Signup must default off");
expect(envExample.includes("NEXT_PUBLIC_SUPABASE_URL="), "Supabase URL env missing");
expect(envExample.includes("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="), "Supabase publishable key env missing");
expect(!envExample.includes("SUPABASE_SERVICE_ROLE"), "Service-role key must not appear in Story Lab env");
expect(health.includes('"0.8.0-rc.1"'), "Health RC version missing");

const lockfiles = await Promise.all([
  exists("package-lock.json"),
  exists("apps/story-lab/package-lock.json"),
  exists("pnpm-lock.yaml")
]);

if (!lockfiles.some(Boolean)) {
  blockers.push("PACKAGE_LOCK_NOT_GENERATED");
}

blockers.push("DEDICATED_SUPABASE_PROJECT_NOT_PROVISIONED");
blockers.push("SUPABASE_SCHEMA_NOT_APPLIED_OR_ADVISED");
blockers.push("DURABLE_RLS_MULTI_USER_TEST_NOT_EXECUTED");
blockers.push("REAL_BUILD_NOT_EXECUTED");

if (errors.length) {
  console.error("Storyforge V0.8 RC1 code/schema validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Storyforge V0.8 RC1 code/schema validation passed.");
console.log(JSON.stringify({
  storyforge: rootPackage.version,
  storyLab: appPackage.version,
  tnir: "0.5.0",
  tpir: "0.1.0",
  codeSchemaAudit: "PASS",
  releaseStatus: "READY_FOR_PROVISIONING",
  blockers
}, null, 2));
