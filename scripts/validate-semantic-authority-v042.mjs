import fs from "node:fs/promises";

const read = async (path) =>
  fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [
  core,
  workspace,
  view,
  i18n,
  probe,
  appPackage,
  tsconfig
] = await Promise.all([
  read("apps/story-lab/lib/storyforge-v042.ts"),
  read("apps/story-lab/app/story-workspace.tsx"),
  read("apps/story-lab/app/semantic-authority-view.tsx"),
  read("apps/story-lab/app/i18n.tsx"),
  read("apps/story-lab/scripts/probe-semantic-authority-v042.ts"),
  read("apps/story-lab/package.json"),
  read("apps/story-lab/tsconfig.json")
]);

const errors = [];
const expect = (condition, message) => {
  if (!condition) errors.push(message);
};

for (const token of [
  "SemanticAssertion",
  "SemanticAssertionLedger",
  "buildSemanticAssertionLedger",
  "buildV042TnirExport"
]) {
  expect(core.includes(token), `V0.4.2 core contract missing: ${token}`);
}

expect(
  core.includes('"IDEA"') &&
    core.includes('"CANDIDATE"') &&
    core.includes('"GOVERNANCE"'),
  "Semantic assertion authority classes are incomplete"
);

for (const field of [
  "centralConflict",
  "narrativePromise",
  "genre",
  "tone",
  "audience"
]) {
  expect(
    core.includes(`fieldPath: "${field}"`) &&
      core.includes('authority: "CANDIDATE"'),
    `Derived Story DNA field authority missing: ${field}`
  );
}

expect(
  core.includes("objectApprovalDoesNotPromoteNestedAssertions: true"),
  "Object approval must not promote nested assertions"
);

expect(
  core.includes('status: "UNRESOLVED"') &&
    core.includes('"CHARACTER", "ORGANIZATION"'),
  "Ambiguous entity-type review is missing"
);

expect(
  workspace.includes("buildSemanticAssertionLedger") &&
    workspace.includes("buildV042TnirExport") &&
    workspace.includes("<SemanticAuthorityView"),
  "Story Workspace is not wired to Semantic Authority V0.4.2"
);

expect(
  workspace.includes("semanticAssertionLedgerV042"),
  "Workspace JSON export does not include Semantic Assertion Ledger"
);

expect(
  view.includes("ledger.assertions.map") &&
    view.includes("ledger.entityTypeReview.map"),
  "Semantic Authority UI does not expose assertions and unresolved entity types"
);

expect(
  probe.includes("Derived Story DNA field must remain CANDIDATE") &&
    probe.includes("Object-level approval must not promote nested assertions") &&
    probe.includes("Ambiguous experiment-force type must be surfaced for review"),
  "Executable V0.4.2 probe is missing critical authority invariants"
);

const appPkg = JSON.parse(appPackage);
expect(
  appPkg.scripts?.prebuild?.includes("probe-semantic-authority-v042.ts"),
  "Story Lab prebuild does not execute the V0.4.2 probe"
);

const ts = JSON.parse(tsconfig);
expect(
  ts.exclude?.includes("scripts/probe-semantic-authority-v042.ts"),
  "V0.4.2 runtime probe must stay outside Next application typecheck"
);

for (const key of [
  "semantic.title",
  "semantic.body",
  "semantic.total",
  "semantic.createdBy",
  "semantic.sourceClaims",
  "semantic.entityTypeReview",
  "semantic.entityTypeBody",
  "semantic.currentType",
  "semantic.candidateTypes",
  "semantic.export"
]) {
  const count = i18n.split(`"${key}"`).length - 1;
  expect(
    count === 3,
    `V0.4.2 i18n key must exist in PT-BR, EN and ES: ${key} (found ${count})`
  );
}

if (errors.length) {
  console.error("Story Workspace V0.4.2 Semantic Authority validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Story Workspace V0.4.2 Semantic Authority validation passed.");
console.log(JSON.stringify({
  fieldLevelAuthority: true,
  objectApprovalIsNotNestedPromotion: true,
  unresolvedEntityTypesSurfaced: true,
  tnirSemanticAssertions: true,
  locales: ["pt-BR", "en", "es"],
  canonMutation: false
}, null, 2));
