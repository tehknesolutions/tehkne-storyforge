import {
  createNarrativeDraft,
  createUniverseDraft,
  forgeStoryDNA
} from "@/lib/storyforge-local";
import { forgeNarrativeV03 } from "@/lib/storyforge-v03";

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

  const forge = forgeNarrativeV03({
    storyDNA,
    universe,
    narrative,
    targetMedia: "WEBTOON",
    locale: "pt-BR"
  });

  const serialized = JSON.stringify(forge).toLocaleLowerCase("pt-BR");
  const forbidden = [
    "barata",
    "cockroach",
    "cucaracha",
    "transferência de mente",
    "mind transfer",
    "experimento científico"
  ];
  const leakage = forbidden.filter((term) => serialized.includes(term));

  const tnir = forge.tnir as {
    version?: unknown;
    events?: unknown[];
    stories?: unknown[];
    canonProposals?: unknown[];
  };

  const checks = {
    literalCreatorClaim:
      forge.claims.some(
        (claim) =>
          claim.authority === "IDEA" &&
          claim.createdBy === "CREATOR" &&
          claim.text.includes("Uma menina encontra uma cidade")
      ),
    candidateClaims:
      forge.claims.some((claim) => claim.authority === "CANDIDATE"),
    eightScenes: forge.scenes.length === 8,
    dialoguePerScene: forge.scenes.every(
      (scene) => scene.dialogue.length >= 1
    ),
    webtoonExists: Boolean(forge.webtoon),
    fortyPanels: forge.webtoon?.panelCount === 40,
    eightTracedEvents:
      new Set(forge.webtoon?.panels.map((panel) => panel.eventId)).size === 8,
    dialoguePanels:
      Boolean(
        forge.webtoon?.panels.some((panel) => panel.kind === "DIALOGUE")
      ),
    turnPanels:
      Boolean(forge.webtoon?.panels.some((panel) => panel.kind === "TURN")),
    tnirV05: tnir.version === "0.5.0",
    tnirEightEvents:
      Array.isArray(tnir.events) && tnir.events.length === 8,
    tnirStory:
      Array.isArray(tnir.stories) && tnir.stories.length === 1,
    candidateProposals:
      Array.isArray(tnir.canonProposals) &&
      tnir.canonProposals.length > 0,
    noSpecializedLeakage: leakage.length === 0
  };

  const passed = Object.values(checks).every(Boolean);

  return Response.json(
    {
      product: "TEHKNÉ STORYFORGE",
      probe: "Narrative Forge V0.3 — Generality",
      passed,
      idea,
      result: {
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
        webtoonPanels: forge.webtoon?.panelCount ?? 0,
        tnirEvents: tnir.events?.length ?? 0
      },
      checks,
      leakage
    },
    { status: passed ? 200 : 500 }
  );
}
