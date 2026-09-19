import {
  createNarrativeDraft,
  createUniverseDraft,
  forgeStoryDNA
} from "../lib/storyforge-local";
import { forgeNarrativeV03 } from "../lib/storyforge-v03";
import { createSceneAuthorityWorkspace } from "../lib/storyforge-v04";
import { realizeNativeVisualNovel } from "../lib/storyforge-v041";
import {
  advanceVisualNovelRuntime,
  chooseVisualNovelOption,
  createVisualNovelRuntime,
  getVisualNovelRuntimeSnapshot
} from "../lib/storyforge-v043";

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
const realization = realizeNativeVisualNovel(
  authority,
  narrative,
  "pt-BR"
);

let runtime = createVisualNovelRuntime(realization);

assert(runtime.cursor === 0, "Runtime must start at cursor 0.");
assert(runtime.path.length === 4, "Runtime root path must contain 4 events.");
assert(runtime.selectedOptionIds.length === 0, "Runtime must start without choices.");
assert(Object.keys(runtime.worldState).length === 0, "Runtime worldState must start empty.");

let snapshot = getVisualNovelRuntimeSnapshot(realization, runtime);

while (!snapshot.waitingChoice && !snapshot.finished) {
  runtime = advanceVisualNovelRuntime(realization, runtime);
  snapshot = getVisualNovelRuntimeSnapshot(realization, runtime);
}

assert(snapshot.waitingChoice, "Runtime must stop at the Visual Novel choice.");
assert(snapshot.currentChoice, "Runtime choice payload missing.");
assert(runtime.cursor === 3, "Choice must occur at the end of root branch.");

const option = snapshot.currentChoice.options[0];
runtime = chooseVisualNovelOption(
  realization,
  runtime,
  option.id
);

assert(
  runtime.selectedOptionIds.includes(option.id),
  "Selected option was not recorded."
);
assert(
  runtime.worldState["visualNovel.activeBranch"] === option.branchId,
  "StateTransition did not set active branch."
);
assert(
  runtime.worldState["visualNovel.lastChoice"] === option.id,
  "StateTransition did not record last choice."
);
assert(
  runtime.path.length > 4,
  "Chosen branch was not appended to runtime path."
);

snapshot = getVisualNovelRuntimeSnapshot(realization, runtime);
assert(!snapshot.waitingChoice, "Choice must resolve after selecting an option.");

let safety = 0;
while (!snapshot.finished && safety < 20) {
  runtime = advanceVisualNovelRuntime(realization, runtime);
  snapshot = getVisualNovelRuntimeSnapshot(realization, runtime);
  safety += 1;
}

assert(snapshot.finished, "Runtime did not reach FINISHED state.");
assert(safety < 20, "Runtime exceeded safe step limit.");

const branch = realization.branches.find(
  (item) => item.id === option.branchId
);
assert(branch, "Selected runtime branch missing.");

assert(
  branch.eventIds.includes(realization.convergenceEventId!),
  "Selected runtime branch must pass through convergence."
);
assert(
  runtime.path.includes(realization.convergenceEventId!),
  "Runtime playthrough did not reach convergence."
);

const otherOption = realization.choices[0].options[1];
const fresh = createVisualNovelRuntime(realization);
let second = fresh;
let secondSnapshot = getVisualNovelRuntimeSnapshot(realization, second);
while (!secondSnapshot.waitingChoice) {
  second = advanceVisualNovelRuntime(realization, second);
  secondSnapshot = getVisualNovelRuntimeSnapshot(realization, second);
}

second = chooseVisualNovelOption(realization, second, otherOption.id);

assert(
  second.worldState["visualNovel.activeBranch"] === otherOption.branchId,
  "Second choice did not select its distinct branch."
);
assert(
  second.worldState["visualNovel.activeBranch"] !==
    runtime.worldState["visualNovel.activeBranch"],
  "Different options must select different runtime branches."
);

console.log("Story Workspace V0.4.3 playable Visual Novel runtime probe passed.");
console.log(JSON.stringify({
  rootEvents: 4,
  selectedOption: option.id,
  activeBranch: runtime.worldState["visualNovel.activeBranch"],
  convergenceEventId: realization.convergenceEventId,
  finalPathLength: runtime.path.length,
  finished: snapshot.finished,
  alternateBranch: second.worldState["visualNovel.activeBranch"]
}, null, 2));
