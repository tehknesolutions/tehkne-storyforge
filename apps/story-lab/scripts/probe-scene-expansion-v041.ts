import {
  createNarrativeDraft,
  createUniverseDraft,
  forgeStoryDNA
} from "../lib/storyforge-local";
import { forgeNarrativeV03 } from "../lib/storyforge-v03";
import { createSceneAuthorityWorkspace } from "../lib/storyforge-v04";
import {
  buildV041TnirExport,
  expandSelectedScenes,
  realizeNativeVisualNovel
} from "../lib/storyforge-v041";

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
  targetMedia: "VISUAL_NOVEL",
  locale: "pt-BR"
});

const authority = createSceneAuthorityWorkspace(forgeV03);
const expanded = expandSelectedScenes(authority, "pt-BR");

assert(expanded.length === 8, "Expected 8 expanded scenes.");

for (const scene of expanded) {
  assert(
    scene.beats.length >= 8,
    `Expanded scene ${scene.sceneId} must have at least 8 beats.`
  );
  assert(
    scene.dialogueExchange.length >= 2,
    `Expanded scene ${scene.sceneId} must have at least 2 dialogue/narration lines.`
  );
  assert(
    scene.observableActions.length >= 3,
    `Expanded scene ${scene.sceneId} must have at least 3 observable actions.`
  );
  assert(
    scene.goal !== scene.observableActions[0],
    `Expanded scene ${scene.sceneId} goal must not collapse into its first action.`
  );
  assert(
    scene.entryState !== scene.exitState,
    `Expanded scene ${scene.sceneId} must change dramatic state.`
  );
  assert(
    scene.authority === "CANDIDATE",
    "Expanded scene must remain CANDIDATE."
  );
}

const visualNovel = realizeNativeVisualNovel(
  authority,
  narrative,
  "pt-BR"
);

assert(
  visualNovel.mode === "INTERACTIVE",
  "Visual Novel realization must be INTERACTIVE."
);
assert(
  visualNovel.choices.length === 1,
  "Expected one native Visual Novel choice."
);
assert(
  visualNovel.choices[0]?.options.length === 2,
  "Expected two choice options."
);
assert(
  visualNovel.stateTransitions.length === 2,
  "Expected two state transitions."
);
assert(
  visualNovel.branches.length === 3,
  "Expected root + two possible branches."
);
assert(
  Boolean(visualNovel.convergenceEventId),
  "Visual Novel convergence event missing."
);

const choice = visualNovel.choices[0];
const optionA = choice.options[0];
const optionB = choice.options[1];

assert(
  optionA.outcomeEventId !== optionB.outcomeEventId,
  "Visual Novel options must have distinct outcome events."
);
assert(
  optionA.branchId !== optionB.branchId,
  "Visual Novel options must target distinct branches."
);

const branchA = visualNovel.branches.find(
  (branch) => branch.id === optionA.branchId
);
const branchB = visualNovel.branches.find(
  (branch) => branch.id === optionB.branchId
);

assert(branchA, "Branch A missing.");
assert(branchB, "Branch B missing.");
assert(
  branchA.eventIds.includes(visualNovel.convergenceEventId!),
  "Branch A does not converge."
);
assert(
  branchB.eventIds.includes(visualNovel.convergenceEventId!),
  "Branch B does not converge."
);

const tnir = buildV041TnirExport({
  storyDNA,
  universe,
  narrative,
  forgeV03,
  sceneAuthority: authority,
  targetMedia: "VISUAL_NOVEL",
  locale: "pt-BR"
}) as {
  version?: string;
  events?: unknown[];
  causalLinks?: unknown[];
  choices?: unknown[];
  stateTransitions?: unknown[];
  branches?: unknown[];
  realizationProfiles?: Array<{ mode?: string; targetMedia?: string }>;
  mediaManifests?: Array<{
    interactionModel?: {
      compiler?: string;
      choiceCount?: number;
      branchCount?: number;
    };
  }>;
  nativeVisualNovel?: { mode?: string };
  provenance?: {
    canonicalEventGraphMutated?: boolean;
    interactiveProjectionAuthority?: string;
  };
};

assert(tnir.version === "0.5.0", "T-NIR version must remain 0.5.0.");
assert(
  Array.isArray(tnir.events) && tnir.events.length === 8,
  "Interactive projection must preserve all 8 source events."
);
assert(
  Array.isArray(tnir.causalLinks) && tnir.causalLinks.length === 7,
  "Interactive projection must preserve the canonical causal graph."
);
assert(
  Array.isArray(tnir.choices) && tnir.choices.length === 1,
  "T-NIR Visual Novel choice missing."
);
assert(
  Array.isArray(tnir.stateTransitions) &&
    tnir.stateTransitions.length === 2,
  "T-NIR Visual Novel transitions missing."
);
assert(
  Array.isArray(tnir.branches) && tnir.branches.length === 3,
  "T-NIR Visual Novel branches missing."
);
assert(
  tnir.realizationProfiles?.some(
    (profile) =>
      profile.targetMedia === "VISUAL_NOVEL" &&
      profile.mode === "INTERACTIVE"
  ),
  "Visual Novel RealizationProfile must be INTERACTIVE."
);
assert(
  tnir.mediaManifests?.some(
    (manifest) =>
      manifest.interactionModel?.compiler ===
        "storyforge-native-visual-novel-v0.4.1" &&
      manifest.interactionModel.choiceCount === 1 &&
      manifest.interactionModel.branchCount === 3
  ),
  "Visual Novel interaction model manifest missing."
);
assert(
  tnir.nativeVisualNovel?.mode === "INTERACTIVE",
  "Native Visual Novel realization missing from export."
);
assert(
  tnir.provenance?.canonicalEventGraphMutated === false,
  "Interactive projection must not mutate canonical event graph."
);
assert(
  tnir.provenance?.interactiveProjectionAuthority === "CANDIDATE",
  "Interactive projection must remain CANDIDATE."
);

const serialized = JSON.stringify({
  expanded,
  visualNovel,
  tnir
}).toLocaleLowerCase("pt-BR");

for (const forbidden of [
  "barata",
  "cockroach",
  "cucaracha",
  "transferência de mente",
  "mind transfer",
  "experimento científico"
]) {
  assert(
    !serialized.includes(forbidden),
    `V0.4.1 generic probe leaked specialized term: ${forbidden}`
  );
}

console.log("Story Workspace V0.4.1 Scene Expansion + Visual Novel probe passed.");
console.log(JSON.stringify({
  expandedScenes: expanded.length,
  beatsPerScene: expanded.map((scene) => scene.beats.length),
  dialogueLinesPerScene: expanded.map(
    (scene) => scene.dialogueExchange.length
  ),
  choices: visualNovel.choices.length,
  options: visualNovel.choices[0]?.options.length ?? 0,
  transitions: visualNovel.stateTransitions.length,
  branches: visualNovel.branches.length,
  convergenceEventId: visualNovel.convergenceEventId,
  tnirEvents: tnir.events?.length ?? 0,
  tnirCausalLinks: tnir.causalLinks?.length ?? 0,
  specializedLeakage: false
}, null, 2));
