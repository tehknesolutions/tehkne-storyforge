import {
  createNarrativeDraft,
  createUniverseDraft,
  forgeStoryDNA
} from "@/lib/storyforge-local";
import { forgeNarrativeV03 } from "@/lib/storyforge-v03";
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
} from "@/lib/storyforge-v04";

export const runtime = "nodejs";

export async function GET() {
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

  const originalEvents = Object.fromEntries(
    Object.values(authority.sceneIndex).map((entry) => [
      entry.sceneId,
      entry.eventId
    ])
  );

  authority = approveSceneRevision(
    authority,
    "scene:workspace:1"
  );

  const scene1 = selectedSceneRevision(
    authority,
    "scene:workspace:1"
  );

  authority = reviseScene(
    authority,
    "scene:workspace:2",
    {
      action:
        "A criadora altera somente a ação desta cena para testar uma revisão isolada."
    },
    "Runtime self-test manual revision."
  );

  const scene2 = selectedSceneRevision(
    authority,
    "scene:workspace:2"
  );

  const scene1HistoryBeforeRegeneration =
    authority.sceneIndex["scene:workspace:1"]?.revisionIds.length ?? 0;

  authority = regenerateScene(
    authority,
    "scene:workspace:3",
    "pt-BR"
  );

  const scene3 = selectedSceneRevision(
    authority,
    "scene:workspace:3"
  );

  authority = regenerateScene(
    authority,
    "scene:workspace:4",
    "pt-BR",
    { alternative: true }
  );

  const scene4 = selectedSceneRevision(
    authority,
    "scene:workspace:4"
  );

  authority = rejectSceneRevision(
    authority,
    "scene:workspace:5"
  );

  const scene5 = selectedSceneRevision(
    authority,
    "scene:workspace:5"
  );

  const scene6Before = selectedSceneRevision(
    authority,
    "scene:workspace:6"
  );
  const line6 = scene6Before?.dialogue[0];

  if (line6) {
    authority = updateDialogueLine(
      authority,
      "scene:workspace:6",
      line6.id,
      { status: "APPROVED_LOCAL" }
    );
  }

  const scene6 = selectedSceneRevision(
    authority,
    "scene:workspace:6"
  );

  const webtoon = realizeWebtoonFromSelectedRevisions(
    authority,
    "pt-BR"
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
    sceneRevisionAuthority?: unknown[];
  };

  const checks = {
    eightStableSceneIds:
      Object.keys(authority.sceneIndex).length === 8,

    sceneApprovalIndependentFromDialogue:
      scene1?.status === "APPROVED_LOCAL" &&
      scene1.dialogue[0]?.status === "CANDIDATE",

    scene2RevisionCreated:
      scene2?.revision === 2 &&
      scene2.eventId === originalEvents["scene:workspace:2"] &&
      authority.sceneIndex["scene:workspace:2"]?.revisionIds.length === 2,

    previousRevisionPreserved:
      authority.revisions["scene:workspace:2:rev:1"]?.status ===
      "SUPERSEDED",

    isolatedRegeneration:
      scene3?.revision === 2 &&
      scene3.eventId === originalEvents["scene:workspace:3"] &&
      authority.sceneIndex["scene:workspace:1"]?.revisionIds.length ===
        scene1HistoryBeforeRegeneration,

    alternativeRevision:
      scene4?.alternative === true,

    rejectedScenePreservesEvent:
      scene5?.status === "REJECTED" &&
      authority.sceneIndex["scene:workspace:5"]?.eventId ===
        originalEvents["scene:workspace:5"],

    dialogueAuthorityIndependent:
      scene6?.revision === 2 &&
      scene6.dialogue[0]?.status === "APPROVED_LOCAL" &&
      scene6.eventId === originalEvents["scene:workspace:6"],

    sevenSelectedScenes:
      webtoon.selectedSceneRevisionIds.length === 7,

    thirtyFivePanels:
      webtoon.panelCount === 35,

    panelRevisionTraceability:
      webtoon.panels.every((panel) =>
        Boolean(panel.sceneRevisionId)
      ),

    rejectedSceneExcludedFromWebtoon:
      !webtoon.panels.some(
        (panel) => panel.sceneId === "scene:workspace:5"
      ),

    tnirV05:
      tnir.version === "0.5.0",

    tnirPreservesEightEvents:
      Array.isArray(tnir.events) &&
      tnir.events.length === 8 &&
      tnir.events.some(
        (event) =>
          event.id === originalEvents["scene:workspace:5"]
      ),

    tnirUsesSevenSelectedScenes:
      Array.isArray(tnir.stories) &&
      Array.isArray(tnir.stories[0]?.scenes) &&
      tnir.stories[0]?.scenes?.length === 7,

    revisionAuthorityManifest:
      Array.isArray(tnir.sceneRevisionAuthority) &&
      tnir.sceneRevisionAuthority.length === 7
  };

  const passed = Object.values(checks).every(Boolean);

  return Response.json(
    {
      product: "TEHKNÉ STORYFORGE",
      selfTest: "Story Workspace V0.4 — Scene Authority & Revision",
      passed,
      checks,
      result: {
        stableScenes: Object.keys(authority.sceneIndex).length,
        scene2Revision: scene2?.revision ?? null,
        scene3Revision: scene3?.revision ?? null,
        scene4Alternative: scene4?.alternative ?? null,
        scene5Status: scene5?.status ?? null,
        scene6DialogueStatus:
          scene6?.dialogue[0]?.status ?? null,
        selectedWebtoonScenes:
          webtoon.selectedSceneRevisionIds.length,
        webtoonPanels: webtoon.panelCount,
        tnirEvents: tnir.events?.length ?? 0,
        tnirScenes: tnir.stories?.[0]?.scenes?.length ?? 0
      }
    },
    { status: passed ? 200 : 500 }
  );
}
