import type {
  NarrativeDraft,
  StoryDNA,
  StoryLocale,
  UniverseDraft
} from "./storyforge-local";
import type { NarrativeForgeV03 } from "./storyforge-v03";
import type { SceneAuthorityWorkspace } from "./storyforge-v04";
import { buildV041TnirExport } from "./storyforge-v041";

export type SemanticAssertionAuthority =
  | "IDEA"
  | "CANDIDATE"
  | "GOVERNANCE";

export type SemanticAssertionScope =
  | "STORY_DNA"
  | "UNIVERSE"
  | "NARRATIVE"
  | "SCENE"
  | "MEDIA";

export type SemanticAssertion = {
  id: string;
  scope: SemanticAssertionScope;
  fieldPath: string;
  text: string;
  authority: SemanticAssertionAuthority;
  createdBy: "CREATOR" | "SYSTEM";
  sourceClaimIds: string[];
  rationale: string;
};

export type SemanticAssertionLedger = {
  version: "0.4.2";
  assertions: SemanticAssertion[];
  summary: {
    total: number;
    idea: number;
    candidate: number;
    governance: number;
  };
  entityTypeReview: Array<{
    entityId: string;
    currentType: string;
    status: "UNRESOLVED";
    candidateTypes: string[];
    rationale: string;
  }>;
};

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
}

function idFor(scope: string, fieldPath: string, index = 1) {
  return `assertion:${scope.toLowerCase()}:${fieldPath
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()}:${index}`;
}

function assertion(input: Omit<SemanticAssertion, "id"> & { index?: number }) {
  return {
    id: idFor(input.scope, input.fieldPath, input.index ?? 1),
    scope: input.scope,
    fieldPath: input.fieldPath,
    text: input.text,
    authority: input.authority,
    createdBy: input.createdBy,
    sourceClaimIds: [...input.sourceClaimIds],
    rationale: input.rationale
  } satisfies SemanticAssertion;
}

function claimIdsByAuthority(
  forgeV03: NarrativeForgeV03,
  authority: "IDEA" | "CANDIDATE"
) {
  return forgeV03.claims
    .filter((claim) => claim.authority === authority)
    .map((claim) => claim.id);
}

function sourceClaimIds(forgeV03: NarrativeForgeV03) {
  return claimIdsByAuthority(forgeV03, "IDEA");
}

function candidateClaimIds(forgeV03: NarrativeForgeV03) {
  return claimIdsByAuthority(forgeV03, "CANDIDATE");
}

function storyDnaAssertions(
  storyDNA: StoryDNA,
  forgeV03: NarrativeForgeV03
): SemanticAssertion[] {
  const sourceIds = sourceClaimIds(forgeV03);
  const candidateIds = candidateClaimIds(forgeV03);
  const premiseIsLiteral =
    normalize(storyDNA.premise) === normalize(storyDNA.sourceIdea);

  return [
    assertion({
      scope: "STORY_DNA",
      fieldPath: "sourceIdea",
      text: storyDNA.sourceIdea,
      authority: "IDEA",
      createdBy: "CREATOR",
      sourceClaimIds: sourceIds,
      rationale: "Entrada literal preservada do criador."
    }),
    assertion({
      scope: "STORY_DNA",
      fieldPath: "premise",
      text: storyDNA.premise,
      authority: premiseIsLiteral ? "IDEA" : "CANDIDATE",
      createdBy: premiseIsLiteral ? "CREATOR" : "SYSTEM",
      sourceClaimIds: premiseIsLiteral ? sourceIds : candidateIds,
      rationale: premiseIsLiteral
        ? "A premissa permanece semanticamente igual à entrada do criador."
        : "A premissa contém formulação derivada pelo sistema."
    }),
    ...storyDNA.sourceFacts.map((text, index) =>
      assertion({
        scope: "STORY_DNA",
        fieldPath: `sourceFacts[${index}]`,
        text,
        authority: "IDEA",
        createdBy: "SYSTEM",
        sourceClaimIds: sourceIds,
        rationale: "Normalização estrutural de fato presente na ideia."
      })
    ),
    ...storyDNA.themes.map((text, index) =>
      assertion({
        scope: "STORY_DNA",
        fieldPath: `themes[${index}]`,
        text,
        authority: "CANDIDATE",
        createdBy: "SYSTEM",
        sourceClaimIds: sourceIds,
        rationale: "Tema interpretado pelo sistema a partir da premissa."
      })
    ),
    assertion({
      scope: "STORY_DNA",
      fieldPath: "genre",
      text: storyDNA.genre,
      authority: "CANDIDATE",
      createdBy: "SYSTEM",
      sourceClaimIds: sourceIds,
      rationale: "Classificação de gênero inferida pelo sistema."
    }),
    assertion({
      scope: "STORY_DNA",
      fieldPath: "tone",
      text: storyDNA.tone,
      authority: "CANDIDATE",
      createdBy: "SYSTEM",
      sourceClaimIds: sourceIds,
      rationale: "Tom inferido pelo sistema."
    }),
    assertion({
      scope: "STORY_DNA",
      fieldPath: "audience",
      text: storyDNA.audience,
      authority: "CANDIDATE",
      createdBy: "SYSTEM",
      sourceClaimIds: sourceIds,
      rationale: "Público ainda não foi fornecido literalmente pelo criador."
    }),
    assertion({
      scope: "STORY_DNA",
      fieldPath: "centralConflict",
      text: storyDNA.centralConflict,
      authority: "CANDIDATE",
      createdBy: "SYSTEM",
      sourceClaimIds: [...sourceIds, ...candidateIds],
      rationale:
        "Conflito central é formulação dramatúrgica do sistema; não herda autoridade IDEA do objeto Story DNA."
    }),
    assertion({
      scope: "STORY_DNA",
      fieldPath: "narrativePromise",
      text: storyDNA.narrativePromise,
      authority: "CANDIDATE",
      createdBy: "SYSTEM",
      sourceClaimIds: [...sourceIds, ...candidateIds],
      rationale:
        "Promessa narrativa é interpretação editorial do sistema."
    }),
    ...storyDNA.invariants.map((text, index) =>
      assertion({
        scope: "STORY_DNA",
        fieldPath: `invariants[${index}]`,
        text,
        authority: "GOVERNANCE",
        createdBy: "SYSTEM",
        sourceClaimIds: [],
        rationale:
          "Regra de governança do processo; não é fato narrativo do universo."
      })
    )
  ];
}

function universeAssertions(
  storyDNA: StoryDNA,
  universe: UniverseDraft,
  forgeV03: NarrativeForgeV03
): SemanticAssertion[] {
  const sourceIds = sourceClaimIds(forgeV03);
  const candidateIds = candidateClaimIds(forgeV03);
  const premiseIsLiteral =
    normalize(universe.premise) === normalize(storyDNA.sourceIdea);

  return [
    assertion({
      scope: "UNIVERSE",
      fieldPath: "title",
      text: universe.title,
      authority: "CANDIDATE",
      createdBy: "SYSTEM",
      sourceClaimIds: [],
      rationale:
        "Título de trabalho gerado pelo sistema; não foi fornecido pelo criador."
    }),
    assertion({
      scope: "UNIVERSE",
      fieldPath: "premise",
      text: universe.premise,
      authority: premiseIsLiteral ? "IDEA" : "CANDIDATE",
      createdBy: premiseIsLiteral ? "CREATOR" : "SYSTEM",
      sourceClaimIds: premiseIsLiteral ? sourceIds : candidateIds,
      rationale: premiseIsLiteral
        ? "Premissa do universo preserva a entrada do criador."
        : "Premissa do universo contém formulação derivada."
    }),
    ...universe.worldRules.map((text, index) =>
      assertion({
        scope: "UNIVERSE",
        fieldPath: `worldRules[${index}]`,
        text,
        authority: index < 2 ? "GOVERNANCE" : "CANDIDATE",
        createdBy: "SYSTEM",
        sourceClaimIds: index < 2 ? [] : [...sourceIds, ...candidateIds],
        rationale:
          index < 2
            ? "Regra de governança do workspace; não é verdade diegética."
            : "Regra de mundo inferida e ainda candidata."
      })
    ),
    ...universe.coreQuestions.map((text, index) =>
      assertion({
        scope: "UNIVERSE",
        fieldPath: `coreQuestions[${index}]`,
        text,
        authority: "CANDIDATE",
        createdBy: "SYSTEM",
        sourceClaimIds: [...sourceIds, ...candidateIds],
        rationale:
          "Questão narrativa proposta pelo sistema para orientar authoring."
      })
    )
  ];
}

function narrativeAssertions(
  narrative: NarrativeDraft,
  forgeV03: NarrativeForgeV03
): SemanticAssertion[] {
  const sourceIds = sourceClaimIds(forgeV03);
  const candidateIds = candidateClaimIds(forgeV03);

  return [
    assertion({
      scope: "NARRATIVE",
      fieldPath: "logline",
      text: narrative.logline,
      authority: "CANDIDATE",
      createdBy: "SYSTEM",
      sourceClaimIds: [...sourceIds, ...candidateIds],
      rationale:
        "Logline é síntese dramatúrgica gerada; não equivale a fato literal do criador."
    }),
    ...narrative.characters.map((character, index) =>
      assertion({
        scope: "NARRATIVE",
        fieldPath: `characters[${index}].description`,
        text: `${character.name}: ${character.description}`,
        authority:
          character.authority === "SOURCE" ? "IDEA" : "CANDIDATE",
        createdBy:
          character.authority === "SOURCE" ? "CREATOR" : "SYSTEM",
        sourceClaimIds:
          character.authority === "SOURCE" ? sourceIds : candidateIds,
        rationale:
          character.authority === "SOURCE"
            ? "Personagem/descrição ancorado em informação da ideia."
            : "Agente narrativo proposto pelo sistema."
      })
    ),
    ...narrative.candidateExpansions.map((text, index) =>
      assertion({
        scope: "NARRATIVE",
        fieldPath: `candidateExpansions[${index}]`,
        text,
        authority: "CANDIDATE",
        createdBy: "SYSTEM",
        sourceClaimIds: candidateIds,
        rationale: "Expansão dramatúrgica explícita."
      })
    ),
    ...narrative.events.map((event, index) =>
      assertion({
        scope: "NARRATIVE",
        fieldPath: `events[${index}]`,
        text: `${event.title}: ${event.summary}`,
        authority:
          event.authority === "SOURCE" ? "IDEA" : "CANDIDATE",
        createdBy: "SYSTEM",
        sourceClaimIds:
          event.authority === "SOURCE" ? sourceIds : candidateIds,
        rationale:
          event.authority === "SOURCE"
            ? "Evento de authoring ancorado em fatos da ideia."
            : "Evento candidato gerado para progressão dramática."
      })
    )
  ];
}

function entityTypeReview(narrative: NarrativeDraft) {
  const markers = [
    "pessoa, equipe ou instituição",
    "person, team or institution",
    "persona, equipo o institución"
  ];

  return narrative.characters
    .filter(
      (character) =>
        character.authority === "CANDIDATE" &&
        markers.some((marker) =>
          normalize(character.description).includes(normalize(marker))
        )
    )
    .map((character) => ({
      entityId: character.id,
      currentType: "CHARACTER",
      status: "UNRESOLVED" as const,
      candidateTypes: ["CHARACTER", "ORGANIZATION"],
      rationale:
        "A descrição permite pessoa ou organização; o tipo não deve ser tratado como resolvido sem aprovação do criador."
    }));
}

export function buildSemanticAssertionLedger(input: {
  storyDNA: StoryDNA;
  universe: UniverseDraft;
  narrative: NarrativeDraft;
  forgeV03: NarrativeForgeV03;
}): SemanticAssertionLedger {
  const assertions = [
    ...storyDnaAssertions(input.storyDNA, input.forgeV03),
    ...universeAssertions(
      input.storyDNA,
      input.universe,
      input.forgeV03
    ),
    ...narrativeAssertions(input.narrative, input.forgeV03)
  ];

  return {
    version: "0.4.2",
    assertions,
    summary: {
      total: assertions.length,
      idea: assertions.filter(
        (item) => item.authority === "IDEA"
      ).length,
      candidate: assertions.filter(
        (item) => item.authority === "CANDIDATE"
      ).length,
      governance: assertions.filter(
        (item) => item.authority === "GOVERNANCE"
      ).length
    },
    entityTypeReview: entityTypeReview(input.narrative)
  };
}

export function buildV042TnirExport(input: {
  storyDNA: StoryDNA;
  universe: UniverseDraft;
  narrative: NarrativeDraft;
  forgeV03: NarrativeForgeV03;
  sceneAuthority: SceneAuthorityWorkspace;
  targetMedia: Parameters<typeof buildV041TnirExport>[0]["targetMedia"];
  locale: StoryLocale;
}) {
  const base = buildV041TnirExport(input) as Record<string, unknown>;
  const ledger = buildSemanticAssertionLedger(input);

  return {
    ...base,
    semanticAssertions: ledger.assertions,
    semanticAuthoritySummary: ledger.summary,
    entityTypeReview: ledger.entityTypeReview,
    provenance: {
      ...((base.provenance as Record<string, unknown>) ?? {}),
      semanticAssertionLedgerVersion: "0.4.2",
      objectApprovalDoesNotPromoteNestedAssertions: true
    }
  };
}
