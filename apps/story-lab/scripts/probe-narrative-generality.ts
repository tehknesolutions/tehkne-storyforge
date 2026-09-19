import {
  createNarrativeDraft,
  createUniverseDraft,
  forgeStoryDNA
} from "../lib/storyforge-local";
import { forgeNarrativeV03 } from "../lib/storyforge-v03";

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

const forge = forgeNarrativeV03({
  storyDNA,
  universe,
  narrative,
  targetMedia: "WEBTOON",
  locale: "pt-BR"
});

const serialized = JSON.stringify(forge).toLocaleLowerCase("pt-BR");

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
    `GENERALITY_LEAK: unrelated probe contains specialized term: ${forbidden}`
  );
}

assert(
  forge.claims.some(
    (claim) =>
      claim.authority === "IDEA" &&
      claim.createdBy === "CREATOR" &&
      claim.text.includes("Uma menina encontra uma cidade")
  ),
  "Literal creator claim was not preserved."
);

assert(
  forge.claims.some((claim) => claim.authority === "CANDIDATE"),
  "Generic narrative produced no candidate claims."
);

assert(forge.scenes.length === 8, "Expected exactly 8 narrative scenes.");
assert(
  forge.scenes.every((scene) => scene.dialogue.length >= 1),
  "Every scene must contain candidate dialogue."
);

assert(forge.webtoon, "WEBTOON realization missing.");
assert(forge.webtoon.panelCount === 40, "Expected exactly 40 Webtoon panels.");

assert(
  new Set(forge.webtoon.panels.map((panel) => panel.eventId)).size === 8,
  "Webtoon realization must trace to all 8 events."
);

assert(
  forge.webtoon.panels.some((panel) => panel.kind === "DIALOGUE"),
  "Webtoon realization has no dialogue panels."
);

assert(
  forge.webtoon.panels.some((panel) => panel.kind === "TURN"),
  "Webtoon realization has no turn panels."
);

const tnir = forge.tnir as {
  version?: unknown;
  events?: unknown[];
  stories?: unknown[];
  canonProposals?: unknown[];
};

assert(tnir.version === "0.5.0", "T-NIR version mismatch.");
assert(
  Array.isArray(tnir.events) && tnir.events.length === 8,
  "T-NIR event mapping mismatch."
);
assert(
  Array.isArray(tnir.stories) && tnir.stories.length === 1,
  "T-NIR Story mapping missing."
);
assert(
  Array.isArray(tnir.canonProposals) && tnir.canonProposals.length > 0,
  "Candidate expansions were not mapped to CanonProposal."
);

console.log("Narrative Forge V0.3 generality prebuild probe passed.");
console.log(
  JSON.stringify(
    {
      idea,
      genre: storyDNA.genre,
      themes: storyDNA.themes,
      claims: forge.claims.length,
      characters: narrative.characters.length,
      events: narrative.events.length,
      scenes: forge.scenes.length,
      dialogues: forge.scenes.reduce(
        (sum, scene) => sum + scene.dialogue.length,
        0
      ),
      webtoonPanels: forge.webtoon.panelCount,
      tnirEvents: tnir.events.length,
      specializedLeakage: false
    },
    null,
    2
  )
);
