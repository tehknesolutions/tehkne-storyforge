import fs from "node:fs/promises";

const readJson = async (path) =>
  JSON.parse(await fs.readFile(new URL(`../${path}`, import.meta.url), "utf8"));
const readText = async (path) =>
  fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [
  universe,
  providers,
  rootPackage,
  appPackage,
  vercelConfig,
  adapter,
  providerSelection,
  health,
  providerStatus,
  generationRoute,
  generationPage,
  productionStore,
  jobsRoute,
  jobPatchRoute,
  reviewRoute,
  reviewCard,
  gamePage,
  homePage,
  envExample,
  deployDoc
] = await Promise.all([
  readJson("examples/micro-universe.json"),
  readJson("config/providers.example.json"),
  readJson("package.json"),
  readJson("apps/story-lab/package.json"),
  readJson("apps/story-lab/vercel.json"),
  readText("src/generation/adapters/openai-responses.ts"),
  readText("src/generation/provider-selection.ts"),
  readText("apps/story-lab/app/api/health/route.ts"),
  readText("apps/story-lab/app/api/provider-status/route.ts"),
  readText("apps/story-lab/app/api/generate/reference/route.ts"),
  readText("apps/story-lab/app/generate/page.tsx"),
  readText("apps/story-lab/lib/production-store.ts"),
  readText("apps/story-lab/app/api/production/jobs/route.ts"),
  readText("apps/story-lab/app/api/production/jobs/[id]/route.ts"),
  readText("apps/story-lab/app/api/review/[id]/route.ts"),
  readText("apps/story-lab/app/review/review-card.tsx"),
  readText("apps/story-lab/app/game/page.tsx"),
  readText("apps/story-lab/app/page.tsx"),
  readText("apps/story-lab/.env.example"),
  readText("docs/STORY-LAB-VERCEL-IMPORT.md")
]);

const errors = [];
const expect = (condition, message) => {
  if (!condition) errors.push(message);
};

expect(universe.version === "0.5.0", "T-NIR narrative core must remain v0.5.0");
expect(rootPackage.version === "0.7.0", "Storyforge package must be v0.7.0");
expect(appPackage.version === "0.2.0", "Story Lab package must be v0.2.0");

expect(health.includes('storyforge: "0.7.0"'), "Health Storyforge version mismatch");
expect(health.includes('storyLab: "0.2.0"'), "Health Story Lab version mismatch");
expect(health.includes('tnir: "0.5.0"'), "Health T-NIR version mismatch");
expect(health.includes('tpir: "0.1.0"'), "Health T-PIR version mismatch");
expect(health.includes('productionStore: "EPHEMERAL"'), "Health must expose preview store durability");
expect(health.includes("automaticCanonPromotion: false"), "Health canon authority mismatch");

const openai = providers.providers.find((item) => item.id === "provider:openai:text");
expect(Boolean(openai), "OpenAI provider descriptor missing");
expect(openai?.enabled === false, "OpenAI provider must remain disabled by default");
expect(openai?.adapterId === "openai:responses:v0.2", "Provider adapter descriptor mismatch");
expect(openai?.metadata?.authority === "CANDIDATE_ONLY", "Provider authority mismatch");

expect(adapter.includes('readonly id = "openai:responses:v0.2"'), "Core adapter version mismatch");
expect(adapter.includes("/responses"), "Core adapter must use Responses API");
expect(adapter.includes("store: false"), "Core adapter must disable response storage");
expect(adapter.includes('type: "json_schema"'), "Core adapter must use JSON Schema output");
expect(adapter.includes("strict: true"), "Core adapter must use strict structured output");
expect(adapter.includes("objectJson"), "Core adapter must use schema-safe objectJson fields");
expect(adapter.includes('authority: "CANDIDATE"'), "Core adapter must emit CANDIDATE proposals");
expect(!adapter.includes('authority: "CANON"'), "Core adapter must not emit CANON authority");

expect(providerSelection.includes("PROVIDER_DISABLED"), "Provider selector missing disabled-provider reason");
expect(providerSelection.includes("MEDIA_NOT_SUPPORTED"), "Provider selector missing capability reason");
expect(providerSelection.includes("MISSING_ENV:"), "Provider selector missing environment reason");

expect(providerStatus.includes("STORYFORGE_GENERATION_ENABLED"), "Provider status missing explicit enable gate");
expect(providerStatus.includes("STORYFORGE_GENERATION_ACCESS_TOKEN"), "Provider status missing access-token gate");
expect(providerStatus.includes("accessTokenRequired: true"), "Provider status must require execution token");
expect(providerStatus.includes("storeResponses: false"), "Provider status must expose no-store policy");

expect(generationRoute.includes("PROVIDER_NOT_ENABLED"), "Generation route missing provider enable gate");
expect(generationRoute.includes("GENERATION_ACCESS_DENIED"), "Generation route missing access-token denial");
expect(generationRoute.includes("x-storyforge-generation-token"), "Generation route missing creator token header");
expect(generationRoute.includes("store: false"), "Generation route must disable provider response storage");
expect(generationRoute.includes('type: "json_schema"'), "Generation route missing structured output");
expect(generationRoute.includes("strict: true"), "Generation route missing strict schema");
expect(generationRoute.includes("serverProposals"), "Generation route missing server-side CanonProposal fallback");
expect(generationRoute.includes("canonMutationEnabled: false"), "Generation route must prohibit canon mutation");

expect(generationPage.includes('type="password"'), "Generation UI token field must be password type");
expect(generationPage.includes('autoComplete="off"'), "Generation UI must not autocomplete creator token");
expect(generationPage.includes("!status.enabled"), "Generation UI must respect enabled provider gate");
expect(generationPage.includes("!accessToken"), "Generation UI must require a creator execution token");

expect(productionStore.includes('readonly durability = "EPHEMERAL"'), "Preview ProductionStore must be EPHEMERAL");
expect(jobsRoute.includes('productionSafe: store.durability === "DURABLE"'), "Jobs API must expose productionSafe");
expect(jobPatchRoute.includes("INVALID_PRODUCTION_STAGE"), "Job PATCH must validate stage");
expect(jobPatchRoute.includes("INVALID_PRODUCTION_STATUS"), "Job PATCH must validate status");
expect(jobPatchRoute.includes("productionSafe: store.durability === \"DURABLE\""), "Job PATCH must expose durability");

expect(reviewRoute.includes('mutationScope: "REVIEW_STATE_ONLY"'), "Review API mutation scope mismatch");
expect(reviewRoute.includes("canonMutationEnabled: false"), "Review API must disable canon mutation");
expect(reviewRoute.includes("EXPLICIT_CANON_COMMIT_NOT_IMPLEMENTED"), "Review API must require explicit future canon commit");
expect(reviewCard.includes("/api/review/"), "Review UI is not connected to safe review API");
expect(reviewCard.includes("Canon commit remains disabled"), "Review UI must disclose canon commit remains disabled");

expect(gamePage.includes('setBranch("descend")'), "Game probe missing descend branch");
expect(gamePage.includes('setBranch("return")'), "Game probe missing return branch");
expect(!gamePage.includes("event:candidate:"), "Game probe must not include candidate Events");

expect(homePage.includes("STORYFORGE V0.7"), "Story Lab home version mismatch");
for (const link of ["/generate", "/production", "/game", "/review"]) {
  expect(homePage.includes(`href="${link}"`), `Story Lab navigation missing ${link}`);
}

expect(vercelConfig.framework === "nextjs", "Vercel config framework mismatch");
expect(vercelConfig.buildCommand === "npm run build", "Vercel build command mismatch");
expect(deployDoc.includes("Root Directory = apps/story-lab"), "Vercel import root documentation missing");
expect(envExample.includes("STORYFORGE_GENERATION_ENABLED=false"), "Env example must disable generation by default");
expect(envExample.includes("STORYFORGE_GENERATION_ACCESS_TOKEN="), "Env example missing execution token");

expect(!productionStore.includes("../../../src/"), "Story Lab store imports outside Vercel root");
expect(!jobsRoute.includes("../../../src/"), "Story Lab jobs API imports outside Vercel root");

if (errors.length) {
  console.error("Storyforge V0.7 preview runtime validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Storyforge V0.7 preview runtime validation passed.");
console.log(JSON.stringify({
  storyforge: rootPackage.version,
  storyLab: appPackage.version,
  narrativeCore: universe.version,
  productionCore: "0.1.0",
  provider: {
    id: openai?.id,
    adapter: openai?.adapterId,
    enabledByDefault: openai?.enabled,
    authority: openai?.metadata?.authority
  },
  routes: [
    "/",
    "/generate",
    "/production",
    "/game",
    "/review",
    "/api/health",
    "/api/provider-status",
    "/api/generate/reference",
    "/api/production/jobs",
    "/api/production/jobs/[id]",
    "/api/review/[id]"
  ],
  productionStore: "EPHEMERAL",
  canonMutationEnabled: false
}, null, 2));
