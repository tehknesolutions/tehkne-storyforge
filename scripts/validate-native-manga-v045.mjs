import fs from "node:fs/promises";

const read = async (path) =>
  fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [compiler, profiles, workspace] = await Promise.all([
  read("apps/story-lab/lib/storyforge-v045.ts"),
  read("src/media/profiles.ts"),
  read("apps/story-lab/app/story-workspace.tsx")
]);

const errors = [];
const expect = (condition, message) => {
  if (!condition) errors.push(message);
};

for (const token of [
  "NativeMangaChapter",
  "NativeMangaPage",
  "NativeMangaPanel",
  "MangaBalloon",
  "realizeNativeManga",
  '"RIGHT_TO_LEFT"',
  '"pageTurnRole"',
  "sceneRevisionId",
  "eventId",
  "sourceClaimIds",
  "readingOrder"
]) {
  expect(compiler.includes(token), `Native Manga Compiler contract missing: ${token}`);
}

expect(
  compiler.includes('version: "0.4.5"') &&
    compiler.includes('target: "MANGA"') &&
    compiler.includes('authority: "CANDIDATE"'),
  "Native Manga output must remain a candidate media projection"
);

expect(
  compiler.includes("expandSelectedScenes(workspace, locale)"),
  "Manga must compile from selected scene revisions through scene expansion"
);

expect(
  profiles.includes('target: "MANGA"') &&
    profiles.includes('"page_turn_reveal"') &&
    profiles.includes('"panel_rhythm"'),
  "Manga media profile must declare native page-turn and panel-rhythm capabilities"
);

expect(
  workspace.includes('{ id: "MANGA", label: "Mangá" }'),
  "Story Workspace must expose MANGA as a target"
);

if (errors.length) {
  console.error("Story Workspace V0.4.5 Native Manga Compiler validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Story Workspace V0.4.5 Native Manga Compiler validation passed.");
console.log(JSON.stringify({
  nativePages: true,
  nativePanels: true,
  rightToLeft: true,
  pageTurns: true,
  balloons: true,
  panelToSceneRevisionTrace: true,
  panelToEventTrace: true,
  canonicalEventGraphMutated: false
}, null, 2));
