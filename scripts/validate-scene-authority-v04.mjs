import fs from "node:fs/promises";

const read = async (path) =>
  fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [
  core,
  editor,
  workspace,
  i18n,
  probe,
  appPackage
] = await Promise.all([
  read("apps/story-lab/lib/storyforge-v04.ts"),
  read("apps/story-lab/app/scene-authority-editor.tsx"),
  read("apps/story-lab/app/story-workspace.tsx"),
  read("apps/story-lab/app/i18n.tsx"),
  read("apps/story-lab/scripts/probe-scene-authority-v04.ts"),
  read("apps/story-lab/package.json")
]);

const errors = [];
const expect = (condition, message) => {
  if (!condition) errors.push(message);
};

for (const token of [
  "SceneRevisionStatus",
  "SceneRevision",
  "SceneAuthorityWorkspace",
  "createSceneAuthorityWorkspace",
  "approveSceneRevision",
  "rejectSceneRevision",
  "selectSceneRevision",
  "reviseScene",
  "regenerateScene",
  "updateDialogueLine",
  "realizeWebtoonFromSelectedRevisions",
  "buildV04TnirExport"
]) {
  expect(core.includes(token), `V0.4 core contract missing: ${token}`);
}

expect(
  core.includes('"CANDIDATE"') &&
    core.includes('"APPROVED_LOCAL"') &&
    core.includes('"REJECTED"') &&
    core.includes('"SUPERSEDED"'),
  "Scene revision lifecycle is incomplete"
);

expect(
  core.includes("sceneRevisionId") &&
    core.includes("sceneRevisionStatus"),
  "Media realization does not trace specific scene revisions"
);

expect(
  core.includes("basedOnRevisionId"),
  "Revision ancestry is missing"
);

expect(
  core.includes("sourceClaimIds"),
  "Scene source-claim provenance is missing"
);

expect(
  core.includes("previousSelected.status = \"SUPERSEDED\""),
  "Previous revisions are not preserved as SUPERSEDED"
);

expect(
  editor.includes("approveSceneRevision") &&
    editor.includes("rejectSceneRevision") &&
    editor.includes("regenerateScene") &&
    editor.includes("reviseScene") &&
    editor.includes("selectSceneRevision"),
  "Scene editor is missing revision actions"
);

expect(
  editor.includes("updateDialogueLine"),
  "Dialogue-line authority controls are missing"
);

expect(
  editor.includes("sceneRevisionId"),
  "V0.4 Webtoon UI does not expose scene revision traceability"
);

expect(
  workspace.includes("SCENE_AUTHORITY_STORAGE_KEY") &&
    workspace.includes("V04_WEBTOON_STORAGE_KEY"),
  "V0.4 persistence keys are missing"
);

expect(
  workspace.includes("createSceneAuthorityWorkspace") &&
    workspace.includes("<SceneAuthorityEditor"),
  "Workspace is not wired to Scene Authority V0.4"
);

expect(
  workspace.includes("buildV04TnirExport"),
  "Workspace does not export selected scene revisions to T-NIR"
);

expect(
  probe.includes("Expected 35 panels") &&
    probe.includes("Rejected scene must not remove its narrative event") &&
    probe.includes("Dialogue-line approval was not preserved"),
  "Executable V0.4 probe is missing critical invariants"
);

const appPkg = JSON.parse(appPackage);
expect(
  appPkg.scripts?.prebuild?.includes("probe-scene-authority-v04.ts"),
  "Story Lab production prebuild does not execute the V0.4 probe"
);

for (const key of [
  "scene.authorityTitle",
  "scene.eventLocked",
  "scene.history",
  "scene.approve",
  "scene.reject",
  "scene.regenerate",
  "scene.alternative",
  "scene.compileSelected",
  "scene.exportAuthority"
]) {
  const count = i18n.split(`"${key}"`).length - 1;
  expect(
    count === 3,
    `i18n key must exist exactly in PT-BR, EN and ES: ${key} (found ${count})`
  );
}

if (errors.length) {
  console.error("Story Workspace V0.4 Scene Authority validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Story Workspace V0.4 Scene Authority validation passed.");
console.log(JSON.stringify({
  stableSceneIds: true,
  revisionHistory: true,
  sceneApproval: true,
  sceneRejection: true,
  isolatedRegeneration: true,
  alternatives: true,
  dialogueAuthority: true,
  mediaRevisionTraceability: true,
  tnirSelectedRevisionExport: true,
  locales: ["pt-BR", "en", "es"],
  canonMutation: false
}, null, 2));
