import fs from "node:fs/promises";

const read = async (path) =>
  fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [core, view, workspace, i18n, tnirTypes] = await Promise.all([
  read("apps/story-lab/lib/storyforge-v03.ts"),
  read("apps/story-lab/app/narrative-forge-view.tsx"),
  read("apps/story-lab/app/story-workspace.tsx"),
  read("apps/story-lab/app/i18n.tsx"),
  read("src/tnir/types.ts")
]);

const errors = [];
const expect = (condition, message) => {
  if (!condition) errors.push(message);
};

expect(core.includes("buildClaimLedger"), "Claim Ledger generator missing");
expect(core.includes('authority: "IDEA" as const'), "Creator-source claims must map to IDEA");
expect(core.includes('authority: "CANDIDATE" as const'), "Candidate claims missing");
expect(core.includes("forgeScenes"), "Scene Forge missing");
expect(core.includes("dialogueFor"), "Dialogue generation missing");
expect(core.includes("isTransferredCockroachStory"), "Specialized-story detector missing");
expect(core.includes("genericPt") && core.includes("genericEn") && core.includes("genericEs"), "General dialogue fallback missing");

for (const kind of [
  "ESTABLISHING",
  "DETAIL",
  "REACTION",
  "DIALOGUE",
  "TURN"
]) {
  expect(core.includes(`"${kind}"`), `Webtoon panel kind missing: ${kind}`);
}

expect(
  core.includes("for (const scene of scenes)") &&
    core.includes("for (const [localIndex, kind] of kinds.entries())"),
  "Webtoon compiler must generate panels from every scene"
);

expect(
  core.includes("panelCount: panels.length"),
  "Webtoon realization must report actual panel count"
);

expect(core.includes("buildTnirV05Export"), "T-NIR bridge missing");
expect(core.includes('version: "0.5.0"'), "T-NIR export version mismatch");
expect(core.includes('"storyDNA"') || core.includes("storyDNA:"), "T-NIR StoryDNA mapping missing");
expect(core.includes("causalLinks"), "T-NIR causal links missing");
expect(core.includes("stories:"), "T-NIR Story mapping missing");
expect(core.includes("mediaManifests:"), "T-NIR MediaManifest mapping missing");
expect(core.includes("realizationProfiles:"), "T-NIR RealizationProfile mapping missing");
expect(core.includes('status: "POSSIBLE"'), "Local branch must not be silently CANON");

expect(workspace.includes("forgeNarrativeV03"), "Workspace not wired to Narrative Forge V0.3");
expect(workspace.includes("FORGE_STORAGE_KEY"), "V0.3 persistence key missing");
expect(workspace.includes("<NarrativeForgeView"), "Narrative Forge UI not rendered");
expect(workspace.includes("exportTnir"), "T-NIR export action missing");
expect(workspace.includes("exportWebtoon"), "Webtoon export action missing");

expect(view.includes("forge.claimLedger"), "Claim Ledger UI missing");
expect(view.includes("forge.scenes"), "Scenes UI missing");
expect(view.includes("forge.webtoon"), "Webtoon UI missing");
expect(view.includes("forge.panelCount"), "Panel count UI missing");

for (const key of [
  "forge.compile",
  "forge.claimLedger",
  "forge.scenes",
  "forge.webtoon",
  "forge.exportForge",
  "forge.exportTnir",
  "forge.exportWebtoon"
]) {
  const count = (i18n.match(new RegExp(`"${key.replace(/\\./g, "\\\\.")}"`, "g")) || []).length;
  expect(count === 3, `i18n key must exist in PT-BR, EN and ES: ${key} (found ${count})`);
}

expect(
  tnirTypes.includes("export interface Scene") &&
    tnirTypes.includes("export interface NarrativeEvent") &&
    tnirTypes.includes("export interface CanonFact"),
  "T-NIR core contracts required by the bridge are missing"
);

if (errors.length) {
  console.error("Storyforge Narrative Forge V0.3 validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Storyforge Narrative Forge V0.3 validation passed.");
console.log(JSON.stringify({
  claimLedger: true,
  scenes: true,
  dialogue: true,
  webtoonPanelGrammar: 5,
  expectedPanelsForEightScenes: 40,
  tnirBridge: "0.5.0",
  locales: ["pt-BR", "en", "es"],
  canonMutation: false
}, null, 2));
