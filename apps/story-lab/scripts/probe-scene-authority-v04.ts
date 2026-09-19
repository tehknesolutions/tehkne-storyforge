import {
  createNarrativeDraft,
  createUniverseDraft,
  forgeStoryDNA
} from "../lib/storyforge-local";
import { forgeNarrativeV03 } from "../lib/storyforge-v03";
import {
  approveSceneRevision,
  buildV04TnirExport,
  createSceneAuthorityWorkspace,
  realizeWebtoonFromSelectedRevisions,
  regenerateScene,
  rejectSceneRevision,
  reviseScene,
  selectedSceneRevision,
  updateDialogueLine
} from "../lib/storyforge-v04";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const idea =
  "Uma menina encontra uma cidade onde ninguém consegue mentir, mas descobre que sua mãe vive escondida ali há vinte anos.";

const storyDNA = forgeStoryDNA(idea, "pt-BR");
storyDNA.status = "APPROVED_LOCAL";

const universe = createUniverseDraft(storyDNA, "pt-BR");
universe.status = "APPROVED_LOCAL";

const narrative = createNarrativeDraft(storyDNA, universe, "pt-BR");
narrative.status = "APPROVED_LOCAL";

const forgeV03 = forgeNarrativeV03({
  storyDNA,
  universe,
  narrative,
  targetMedia: "WEBTOON",
  locale: "pt-BR"
});

let authority = createSceneAuthorityWorkspace(forgeV03);

assert(
  Object.keys(authority.sceneIndex).length === 8,
  "Expected eight stable scene IDs."
);

const originalEventIds = Object.fromEntries(
  Object.values(authority.sceneIndex).map((entry) => [
    entry.sceneId,
    entry.eventId
  ])
);

authority = approveSceneRevision(authority, "scene:workspace:1");
assert(
  selectedSceneRevision(authority, "scene:workspace:1")?.status ===
    "APPROVED_LOCAL",
  "Scene 1 approval failed."
);

authority = reviseScene(
  authority,
  "scene:workspace:2",
  {
    action:
      "A criadora altera somente a ação desta cena para testar uma revisão isolada."
  },
  "V0.4 prebuild manual revision."
);

const scene2 = selectedSceneRevision(authority, "scene:workspace:2");
assert(scene2?.revision === 2, "Scene 2 did not create revision 2.");
assert(
  scene2?.eventId === originalEventIds["scene:workspace:2"],
  "Scene 2 revision changed its source event."
);
assert(
  authority.sceneIndex["scene:workspace:2"]?.revisionIds.length === 2,
  "Scene 2 revision history is incomplete."
);
assert(
  authority.revisions["scene:workspace:2:rev:1"]?.status === "SUPERSEDED",
  "Previous scene revision was not preserved as SUPERSEDED."
);

const scene1RevisionCountBefore =
  authority.sceneIndex["scene:workspace:1"]?.revisionIds.length;

authority = regenerateScene(
  authority,
  "scene:workspace:3",
  "pt-BR"
);

assert(
  selectedSceneRevision(authority, "scene:workspace:3")?.revision === 2,
  "Scene 3 isolated regeneration did not create revision 2."
);
assert(
  authority.sceneIndex["scene:workspace:1"]?.revisionIds.length ===
    scene1RevisionCountBefore,
  "Regenerating scene 3 changed scene 1 history."
);
assert(
  selectedSceneRevision(authority, "scene:workspace:3")?.eventId ===
    originalEventIds["scene:workspace:3"],
  "Regenerating scene 3 changed its source event."
);

authority = regenerateScene(
  authority,
  "scene:workspace:4",
  "pt-BR",
  { alternative: true }
);
assert(
  selectedSceneRevision(authority, "scene:workspace:4")?.alternative === true,
  "Scene alternative flag missing."
);

authority = rejectSceneRevision(authority, "scene:workspace:5");
assert(
  selectedSceneRevision(authority, "scene:workspace:5")?.status === "REJECTED",
  "Scene 5 rejection failed."
);
assert(
  authority.sceneIndex["scene:workspace:5"]?.eventId ===
    originalEventIds["scene:workspace:5"],
  "Rejecting scene 5 removed or changed its source event."
);

const scene6Before = selectedSceneRevision(
  authority,
  "scene:workspace:6"
);
const line6 = scene6Before?.dialogue[0];
assert(line6, "Scene 6 dialogue fixture missing.");

authority = updateDialogueLine(
  authority,
  "scene:workspace:6",
  line6.id,
  { status: "APPROVED_LOCAL" }
);

const scene6After = selectedSceneRevision(
  authority,
  "scene:workspace:6"
);
assert(
  scene6After?.revision === 2,
  "Dialogue update must create a new scene revision."
);
assert(
  scene6After?.dialogue[0]?.status === "APPROVED_LOCAL",
  "Dialogue-line approval was not preserved."
);
assert(
  scene6After?.eventId === originalEventIds["scene:workspace:6"],
  "Dialogue revision changed the source event."
);

const webtoon = realizeWebtoonFromSelectedRevisions(
  authority,
  "pt-BR"
);

assert(
  webtoon.selectedSceneRevisionIds.length === 7,
  "Rejected scene must be excluded from selected Webtoon realization."
);
assert(
  webtoon.panelCount === 35,
  `Expected 35 panels after one rejected scene, got ${webtoon.panelCount}.`
);
assert(
  webtoon.panels.every((panel) => Boolean(panel.sceneRevisionId)),
  "Every V0.4 panel must point to a sceneRevisionId."
);
assert(
  !webtoon.panels.some(
    (panel) => panel.sceneId === "scene:workspace:5"
  ),
  "Rejected scene leaked into Webtoon realization."
);

const tnir = buildV04TnirExport({
  storyDNA,
  universe,
  narrative,
  forgeV03,
  sceneAuthority: authority,
  targetMedia: "WEBTOON"
}) as {
  version?: unknown;
  events?: Array<{ id?: string }>;
  stories?: Array<{ scenes?: unknown[] }>;
  sceneRevisionAuthority?: Array<{
    sceneId?: string;
    revisionId?: string;
    status?: string;
  }>;
};

assert(tnir.version === "0.5.0", "V0.4 T-NIR version mismatch.");
assert(
  Array.isArray(tnir.events) && tnir.events.length === 8,
  "Rejected scene must not remove its narrative event from T-NIR."
);
assert(
  Array.isArray(tnir.stories) &&
    Array.isArray(tnir.stories[0]?.scenes) &&
    tnir.stories[0]?.scenes?.length === 7,
  "T-NIR Story must contain seven selected non-rejected scene revisions."
);
assert(
  Array.isArray(tnir.sceneRevisionAuthority) &&
    tnir.sceneRevisionAuthority.length === 7,
  "Scene revision authority manifest is incomplete."
);
assert(
  tnir.events?.some((event) => event.id === originalEventIds["scene:workspace:5"]),
  "Rejected scene source event disappeared from T-NIR."
);

console.log("Scene Authority V0.4 prebuild probe passed.");
console.log(
  JSON.stringify(
    {
      stableScenes: 8,
      scene2Revision: scene2.revision,
      scene3Revision:
        selectedSceneRevision(authority, "scene:workspace:3")?.revision,
      scene4Alternative:
        selectedSceneRevision(authority, "scene:workspace:4")?.alternative,
      scene5Status:
        selectedSceneRevision(authority, "scene:workspace:5")?.status,
      scene6DialogueStatus: scene6After.dialogue[0]?.status,
      webtoonSelectedScenes: webtoon.selectedSceneRevisionIds.length,
      webtoonPanels: webtoon.panelCount,
      tnirEvents: tnir.events?.length,
      tnirScenes: tnir.stories?.[0]?.scenes?.length
    },
    null,
    2
  )
);
