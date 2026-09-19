import fs from "node:fs/promises";

const readJson = async (path) =>
  JSON.parse(await fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const readText = async (path) =>
  fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [
  universe,
  providers,
  assetRequest,
  voiceProfile,
  game,
  providerOutput,
  reviewBatch,
  storyLabPackage,
  rootPackage,
  openaiAdapter,
  providerRegistry,
  storyLabPage,
  ideaIntake,
  reviewPage,
  healthRoute,
  tpirSource
] = await Promise.all([
  readJson("examples/micro-universe.json"),
  readJson("config/providers.example.json"),
  readJson("examples/assets/lia-character-sheet-request.json"),
  readJson("examples/audio/lia-voice-profile.json"),
  readJson("examples/game/first-light.game.json"),
  readJson("examples/providers/openai-structured-output.json"),
  readJson("examples/review/canon-review-batch.json"),
  readJson("apps/story-lab/package.json"),
  readJson("package.json"),
  readText("src/generation/adapters/openai-responses.ts"),
  readText("src/generation/provider-registry.ts"),
  readText("apps/story-lab/app/page.tsx"),
  readText("apps/story-lab/app/idea-intake.tsx"),
  readText("apps/story-lab/app/review/page.tsx"),
  readText("apps/story-lab/app/api/health/route.ts"),
  readText("src/production/tpir.ts")
]);

const errors = [];
const expect = (condition, message) => {
  if (!condition) errors.push(message);
};

expect(universe.version === "0.5.0", "T-NIR narrative core must remain v0.5.0");

expect(providers.version === "0.1.0", "Provider registry fixture version mismatch");
expect(providers.providers.length >= 1, "No provider registered");
for (const provider of providers.providers) {
  expect(provider.enabled === false, `Provider must be disabled by default: ${provider.id}`);
  expect(
    Array.isArray(provider.requiresEnvironment) && provider.requiresEnvironment.length > 0,
    `Provider must declare environment requirements: ${provider.id}`
  );
}
const openai = providers.providers.find((p) => p.id === "provider:openai:text");
expect(Boolean(openai), "OpenAI text provider missing");
expect(openai?.requiresEnvironment.includes("OPENAI_API_KEY"), "OpenAI provider must require OPENAI_API_KEY");
expect(openai?.metadata?.authority === "CANDIDATE_ONLY", "OpenAI provider authority must be CANDIDATE_ONLY");

expect(openaiAdapter.includes("/responses"), "OpenAI adapter must use Responses API");
expect(openaiAdapter.includes('type: "json_schema"'), "OpenAI adapter must request json_schema output");
expect(openaiAdapter.includes("strict: true"), "OpenAI adapter must use strict structured output");
expect(openaiAdapter.includes('authority: "CANDIDATE"'), "OpenAI adapter must create CANDIDATE CanonProposals");
expect(!openaiAdapter.includes('authority: "CANON"'), "OpenAI adapter must not create CANON facts");
expect(providerRegistry.includes("validateEnvironment"), "Provider registry missing environment validation");

expect(assetRequest.source.universeVersion === universe.version, "Asset request is stale");
expect(assetRequest.kind === "CHARACTER_SHEET", "Reference asset must be CHARACTER_SHEET");
expect(assetRequest.negativeConstraints.length >= 2, "Asset request lacks anti-invention constraints");
expect(assetRequest.continuityKeys.includes("entity:lia"), "Asset request missing character continuity key");

expect(voiceProfile.characterId === "entity:lia", "VoiceProfile character mismatch");
expect(voiceProfile.deliveryRules.length >= 2, "VoiceProfile lacks delivery continuity rules");
expect(
  voiceProfile.deliveryRules.some((rule) => rule.includes("omniscient")),
  "VoiceProfile must protect knowledge boundaries"
);

expect(game.source.universeVersion === universe.version, "Game export is stale");
expect(game.nodes.length === 10, "Game export must contain 10 story nodes");
expect(game.choices.length === 1, "Game export must contain reference choice");
expect(game.authority.eventProposalsIncluded === false, "Game export leaked EventProposals");
expect(game.authority.canonProposalsIncluded === false, "Game export leaked CanonProposals");

expect(providerOutput.output.kind === "MANGA_PANEL_SCRIPT", "Provider output fixture kind mismatch");
expect(providerOutput.assertions.length === 2, "Provider output fixture assertion count mismatch");
expect(providerOutput.canonProposals.length === 1, "Provider output fixture CanonProposal count mismatch");

const canonGroups = new Map();
for (const fact of universe.canon.filter((fact) => fact.authority === "CANON")) {
  const key = `${fact.subject}::${fact.predicate}`;
  const group = canonGroups.get(key) ?? [];
  group.push(fact);
  canonGroups.set(key, group);
}
const classify = (assertion) => {
  const existing = canonGroups.get(`${assertion.subject}::${assertion.predicate}`) ?? [];
  if (!existing.length) return "UNSUPPORTED_NEW_FACT";
  return existing.some(
    (fact) => JSON.stringify(fact.object) === JSON.stringify(assertion.object)
  )
    ? "CANON_RESTATEMENT"
    : "CANON_CONTRADICTION";
};
const outputClasses = providerOutput.assertions.map(classify);
expect(outputClasses.includes("CANON_RESTATEMENT"), "Provider fixture lacks CANON_RESTATEMENT");
expect(outputClasses.includes("UNSUPPORTED_NEW_FACT"), "Provider fixture lacks UNSUPPORTED_NEW_FACT");

expect(reviewBatch.universeVersion === universe.version, "Canon review batch is stale");
expect(reviewBatch.automaticPromotionAllowed === false, "Canon review batch permits automatic promotion");
expect(reviewBatch.items.length === 1, "Canon review batch item count mismatch");
expect(reviewBatch.items[0].status === "PENDING", "Canon review item must start PENDING");
expect(reviewBatch.items[0].proposal.authority === "CANDIDATE", "Canon review proposal must be CANDIDATE");

expect(storyLabPackage.dependencies.next === "16.3.3", "Story Lab must use patched Next.js 16.3.3");
expect(storyLabPackage.dependencies.react === "19.2.0", "Story Lab React version mismatch");
expect(rootPackage.workspaces?.includes("apps/*"), "Root package is not configured as Story Lab workspace");
expect(Boolean(rootPackage.scripts["build:story-lab"]), "Root package missing Story Lab build script");

expect(storyLabPage.includes("STORYFORGE V0.6"), "Story Lab product version label mismatch");
expect(storyLabPage.includes("T-NIR V0.5 · T-PIR V0.1"), "Story Lab architecture version label mismatch");
expect(ideaIntake.includes("What do you imagine?"), "Story Lab lacks ALEF idea intake");
expect(storyLabPage.includes("Review candidates"), "Story Lab lacks canon review navigation");
expect(storyLabPage.includes("Manga"), "Story Lab lacks Manga target");
expect(storyLabPage.includes("Webtoon"), "Story Lab lacks Webtoon target");
expect(storyLabPage.includes("Anime"), "Story Lab lacks Anime target");
expect(reviewPage.includes("Canon Review"), "Canon Review route missing");
expect(reviewPage.includes("Approve candidate"), "Canon Review route lacks approve action");
expect(reviewPage.includes("intentionally not wired"), "Canon Review UI must declare mutation disabled");
expect(healthRoute.includes('storyforge: "0.6.0"'), "Health route Storyforge version mismatch");
expect(healthRoute.includes('tnir: "0.5.0"'), "Health route T-NIR version mismatch");
expect(healthRoute.includes('tpir: "0.1.0"'), "Health route T-PIR version mismatch");
expect(healthRoute.includes("automaticCanonPromotion: false"), "Health route must expose canon promotion disabled");
expect(tpirSource.includes('narrativeCanonSource: "T-NIR"'), "T-PIR must use T-NIR as narrative canon source");
expect(tpirSource.includes("providersCanPromoteCanon: false"), "T-PIR must prohibit provider canon promotion");
expect(tpirSource.includes("generatedAssetsAreCanonByDefault: false"), "T-PIR assets must be non-canon by default");

if (errors.length) {
  console.error("Storyforge V0.6 production foundation validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Storyforge V0.6 production foundation validation passed.");
console.log(JSON.stringify({
  narrativeCore: universe.version,
  providers: providers.providers.length,
  providerAssertions: outputClasses,
  assetKind: assetRequest.kind,
  voiceProfile: voiceProfile.id,
  gameNodes: game.nodes.length,
  gameChoices: game.choices.length,
  storyLab: {
    next: storyLabPackage.dependencies.next,
    react: storyLabPackage.dependencies.react,
    routes: ["/", "/review", "/api/health"],
    versions: {
      storyforge: "0.6.0",
      tnir: "0.5.0",
      tpir: "0.1.0"
    }
  },
  canonReviewAutomaticPromotion: reviewBatch.automaticPromotionAllowed
}, null, 2));
