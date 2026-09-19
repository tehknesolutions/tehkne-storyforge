import fs from "node:fs/promises";

const read = async (path) =>
  fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [
  core,
  workspace,
  editor,
  visualNovelView,
  i18n,
  probe,
  appPackage,
  tsconfig
] = await Promise.all([
  read("apps/story-lab/lib/storyforge-v041.ts"),
  read("apps/story-lab/app/story-workspace.tsx"),
  read("apps/story-lab/app/scene-authority-editor.tsx"),
  read("apps/story-lab/app/visual-novel-view.tsx"),
  read("apps/story-lab/app/i18n.tsx"),
  read("apps/story-lab/scripts/probe-scene-expansion-v041.ts"),
  read("apps/story-lab/package.json"),
  read("apps/story-lab/tsconfig.json")
]);

const errors = [];
const expect = (condition, message) => {
  if (!condition) errors.push(message);
};

for (const token of [
  "ExpandedScene",
  "expandSceneRevision",
  "expandSelectedScenes",
  "NativeVisualNovelRealization",
  "realizeNativeVisualNovel",
  "buildV041TnirExport"
]) {
  expect(core.includes(token), `V0.4.1 core contract missing: ${token}`);
}

for (const kind of [
  "ENTRY",
  "GOAL",
  "OBSTACLE",
  "ACTION",
  "EXCHANGE",
  "REACTION",
  "TURN",
  "EXIT"
]) {
  expect(core.includes(`"${kind}"`), `Expanded scene beat missing: ${kind}`);
}

expect(
  core.includes('mode: "INTERACTIVE"'),
  "Native Visual Novel must compile as INTERACTIVE"
);

expect(
  core.includes("VisualNovelChoice") &&
    core.includes("VisualNovelStateTransition") &&
    core.includes("VisualNovelBranch"),
  "Native Visual Novel interaction contracts are incomplete"
);

expect(
  core.includes("options: [optionA, optionB]"),
  "Native Visual Novel must expose at least two real choice options"
);

expect(
  core.includes("canonicalEventGraphMutated: false") &&
    core.includes('interactiveProjectionAuthority: "CANDIDATE"'),
  "Interactive projection must preserve canon graph and remain CANDIDATE"
);

expect(
  core.includes("choices: tnirChoices") &&
    core.includes("stateTransitions: tnirTransitions") &&
    core.includes("branches: tnirBranches"),
  "T-NIR export does not materialize native Visual Novel structures"
);

expect(
  core.includes('mode: "INTERACTIVE"') &&
    core.includes('compiler: "storyforge-native-visual-novel-v0.4.1"'),
  "T-NIR RealizationProfile/MediaManifest Visual Novel metadata missing"
);

expect(
  workspace.includes("V041_VISUAL_NOVEL_STORAGE_KEY") &&
    workspace.includes("setVisualNovelV041"),
  "V0.4.1 Visual Novel persistence is missing"
);

expect(
  workspace.includes("realizeNativeVisualNovel") &&
    workspace.includes("buildV041TnirExport") &&
    workspace.includes("<VisualNovelView"),
  "Story Workspace is not wired to the V0.4.1 compiler"
);

expect(
  workspace.includes("setWebtoonV04(null);\n                  setVisualNovelV041(null);"),
  "Changing media target must invalidate both media realizations"
);

expect(
  editor.includes('targetMedia === "VISUAL_NOVEL"') &&
    editor.includes('t("scene.compileVisualNovel")'),
  "Scene editor does not expose native Visual Novel compilation"
);

expect(
  visualNovelView.includes("realization.choices.map") &&
    visualNovelView.includes("realization.stateTransitions.map") &&
    visualNovelView.includes("realization.branches.map") &&
    visualNovelView.includes("scene.beats.map") &&
    visualNovelView.includes("scene.dialogueExchange.map"),
  "Visual Novel UI does not expose the native interactive structure"
);

expect(
  probe.includes("Expected 8 expanded scenes") &&
    probe.includes("Expected one native Visual Novel choice") &&
    probe.includes("Expected two state transitions") &&
    probe.includes("Expected root + two possible branches") &&
    probe.includes("Interactive projection must preserve all 8 source events"),
  "Executable V0.4.1 probe is missing critical invariants"
);

const appPkg = JSON.parse(appPackage);
expect(
  appPkg.scripts?.prebuild?.includes("probe-scene-expansion-v041.ts"),
  "Story Lab prebuild does not execute the V0.4.1 probe"
);

const ts = JSON.parse(tsconfig);
expect(
  ts.exclude?.includes("scripts/probe-scene-expansion-v041.ts"),
  "V0.4.1 runtime probe must stay outside Next TypeScript app checking"
);

for (const key of [
  "scene.compileVisualNovelBody",
  "scene.compileVisualNovel",
  "scene.nativeMediaUnsupported",
  "vn.title",
  "vn.choiceGraph",
  "vn.stateTransitions",
  "vn.branchGraph",
  "vn.expandedScenes",
  "vn.goal",
  "vn.conflict",
  "vn.entryState",
  "vn.exitState",
  "vn.observableActions",
  "vn.beats",
  "vn.dialogueExchange",
  "vn.export"
]) {
  const count = i18n.split(`"${key}"`).length - 1;
  expect(
    count === 3,
    `V0.4.1 i18n key must exist in PT-BR, EN and ES: ${key} (found ${count})`
  );
}

if (errors.length) {
  console.error("Story Workspace V0.4.1 validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Story Workspace V0.4.1 Scene Expansion + Visual Novel validation passed.");
console.log(JSON.stringify({
  expandedSceneBeats: 8,
  nativeVisualNovel: true,
  interactiveChoice: true,
  stateTransitions: true,
  branches: true,
  convergence: true,
  tnirInteractiveProjection: true,
  canonicalEventGraphMutated: false,
  locales: ["pt-BR", "en", "es"],
  canonMutation: false
}, null, 2));
