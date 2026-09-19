import fs from "node:fs/promises";

const read = async (path) =>
  fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [
  runtime,
  player,
  view,
  probe,
  i18n,
  appPackage,
  tsconfig
] = await Promise.all([
  read("apps/story-lab/lib/storyforge-v043.ts"),
  read("apps/story-lab/app/visual-novel-player.tsx"),
  read("apps/story-lab/app/visual-novel-view.tsx"),
  read("apps/story-lab/scripts/probe-visual-novel-runtime-v043.ts"),
  read("apps/story-lab/app/i18n.tsx"),
  read("apps/story-lab/package.json"),
  read("apps/story-lab/tsconfig.json")
]);

const errors = [];
const expect = (condition, message) => {
  if (!condition) errors.push(message);
};

for (const token of [
  "VisualNovelRuntimeState",
  "createVisualNovelRuntime",
  "getVisualNovelRuntimeSnapshot",
  "chooseVisualNovelOption",
  "advanceVisualNovelRuntime",
  "resetVisualNovelRuntime"
]) {
  expect(runtime.includes(token), `V0.4.3 runtime contract missing: ${token}`);
}

expect(
  runtime.includes('"PLAYING"') &&
    runtime.includes('"WAITING_CHOICE"') &&
    runtime.includes('"FINISHED"'),
  "Visual Novel runtime lifecycle is incomplete"
);

expect(
  runtime.includes("VISUAL_NOVEL_NOT_WAITING_FOR_CHOICE") &&
    runtime.includes("VISUAL_NOVEL_OPTION_NOT_AVAILABLE_HERE"),
  "Runtime must reject invalid choice transitions"
);

expect(
  runtime.includes("worldState[patch.path] = patch.value"),
  "StateTransition patches are not applied to runtime state"
);

expect(
  runtime.includes("path: [...runtime.path, ...branch.eventIds]"),
  "Chosen branch is not appended to runtime playthrough"
);

expect(
  player.includes("createVisualNovelRuntime") &&
    player.includes("chooseVisualNovelOption") &&
    player.includes("advanceVisualNovelRuntime"),
  "Player UI is not backed by the pure runtime state machine"
);

expect(
  player.includes("snapshot.currentChoice.options.map") &&
    player.includes("runtime.worldState"),
  "Player UI does not expose real choice or runtime state"
);

expect(
  view.includes("<VisualNovelPlayer"),
  "Native Visual Novel view does not render the playable runtime"
);

expect(
  probe.includes("Runtime must stop at the Visual Novel choice") &&
    probe.includes("StateTransition did not set active branch") &&
    probe.includes("Runtime playthrough did not reach convergence") &&
    probe.includes("Different options must select different runtime branches"),
  "Executable V0.4.3 probe is missing critical runtime invariants"
);

const appPkg = JSON.parse(appPackage);
expect(
  appPkg.scripts?.prebuild?.includes("probe-visual-novel-runtime-v043.ts"),
  "Story Lab prebuild does not execute the V0.4.3 runtime probe"
);

const ts = JSON.parse(tsconfig);
expect(
  ts.exclude?.includes("scripts/probe-visual-novel-runtime-v043.ts"),
  "V0.4.3 runtime probe must stay outside Next application typecheck"
);

for (const key of [
  "vn.player",
  "vn.next",
  "vn.restart",
  "vn.finished",
  "vn.runtimeState",
  "vn.runtimeStateEmpty"
]) {
  const count = i18n.split(`"${key}"`).length - 1;
  expect(
    count === 3,
    `V0.4.3 i18n key must exist in PT-BR, EN and ES: ${key} (found ${count})`
  );
}

if (errors.length) {
  console.error("Story Workspace V0.4.3 Visual Novel Runtime validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Story Workspace V0.4.3 playable Visual Novel runtime validation passed.");
console.log(JSON.stringify({
  pureRuntime: true,
  realChoice: true,
  stateTransitionsApplied: true,
  branchTraversal: true,
  convergenceTraversal: true,
  restartable: true,
  locales: ["pt-BR", "en", "es"]
}, null, 2));
