import type {
  LocalAuthority,
  MediaTarget,
  NarrativeDraft,
  StoryDNA,
  StoryLocale,
  UniverseDraft
} from "./storyforge-local";

export type ClaimAuthority = "IDEA" | "CANDIDATE";

export type WorkspaceClaim = {
  id: string;
  text: string;
  authority: ClaimAuthority;
  createdBy: "CREATOR" | "SYSTEM";
  rationale: string;
  sourceText?: string;
};

export type SceneBeatDraft = {
  id: string;
  type:
    | "SETUP"
    | "DISCOVERY"
    | "REACTION"
    | "REVELATION"
    | "DECISION"
    | "REVERSAL"
    | "PAYOFF"
    | "SILENCE"
    | "CUSTOM";
  purpose: string;
};

export type DialogueLine = {
  id: string;
  speakerId: string | "NARRATOR";
  speakerName: string;
  text: string;
  authority: "CANDIDATE";
  sourceClaimIds: string[];
};

export type SceneDraft = {
  id: string;
  index: number;
  title: string;
  eventId: string;
  eventAuthority: LocalAuthority;
  dramaticPurpose: string;
  action: string;
  informationRevealed: string[];
  informationWithheld: string[];
  beats: SceneBeatDraft[];
  dialogue: DialogueLine[];
};

export type WebtoonPanel = {
  id: string;
  index: number;
  sequence: number;
  sceneId: string;
  eventId: string;
  kind: "ESTABLISHING" | "DETAIL" | "REACTION" | "DIALOGUE" | "TURN";
  visualIntent: string;
  text?: string;
  speakerName?: string;
  authority: "CANDIDATE";
  scrollGapAfter: number;
};

export type WebtoonRealization = {
  id: string;
  target: "WEBTOON";
  episodeNumber: 1;
  title: string;
  sceneIds: string[];
  eventIds: string[];
  panelCount: number;
  panels: WebtoonPanel[];
  authority: "CANDIDATE";
  createdAt: string;
};

export type NarrativeForgeV03 = {
  version: "0.3.0";
  claims: WorkspaceClaim[];
  scenes: SceneDraft[];
  webtoon: WebtoonRealization | null;
  tnir: Record<string, unknown>;
};

function claimId(kind: "source" | "candidate", index: number) {
  return `claim:${kind}:${index + 1}`;
}

export function buildClaimLedger(
  storyDNA: StoryDNA,
  narrative: NarrativeDraft
): WorkspaceClaim[] {
  const sourceClaims = storyDNA.sourceFacts.map((fact, index) => ({
    id: claimId("source", index),
    text: fact,
    authority: "IDEA" as const,
    createdBy: "CREATOR" as const,
    rationale: "Extraído diretamente da ideia fornecida pelo criador.",
    sourceText: storyDNA.sourceIdea
  }));

  const candidateClaims = narrative.candidateExpansions.map((fact, index) => ({
    id: claimId("candidate", index),
    text: fact,
    authority: "CANDIDATE" as const,
    createdBy: "SYSTEM" as const,
    rationale:
      "Expansão dramatúrgica proposta pelo Storyforge; requer aprovação explícita antes de qualquer promoção."
  }));

  return [...sourceClaims, ...candidateClaims];
}

function sourceClaimIds(
  claims: WorkspaceClaim[],
  eventAuthority: LocalAuthority
) {
  return claims
    .filter((claim) =>
      eventAuthority === "SOURCE"
        ? claim.authority === "IDEA"
        : claim.authority === "CANDIDATE"
    )
    .slice(0, 2)
    .map((claim) => claim.id);
}

function dialogueFor(
  narrative: NarrativeDraft,
  eventIndex: number,
  locale: StoryLocale,
  claims: WorkspaceClaim[]
): DialogueLine[] {
  const protagonist = narrative.characters[0];
  const partner = narrative.characters[1];
  const sourceIds = sourceClaimIds(
    claims,
    narrative.events[eventIndex]?.authority ?? "CANDIDATE"
  );
  const protagonistName = protagonist?.name ?? "Protagonista";
  const partnerName =
    partner?.name ??
    (locale === "en"
      ? "Other"
      : locale === "es"
        ? "Otro"
        : "Outro");

  const pt: Array<[string, string, string]> = [
    [
      protagonist?.id ?? "NARRATOR",
      protagonistName,
      "Alguma coisa está errada. Eu penso como antes, mas o mundo agora parece gigantesco."
    ],
    [
      partner?.id ?? "NARRATOR",
      partnerName,
      "Espera... você está tentando falar comigo?"
    ],
    [
      protagonist?.id ?? "NARRATOR",
      protagonistName,
      "Eu sei coisas que este corpo não deveria saber."
    ],
    [
      partner?.id ?? "NARRATOR",
      partnerName,
      "Então vamos descobrir quem você era — e o que fizeram com você."
    ],
    [
      protagonist?.id ?? "NARRATOR",
      protagonistName,
      "Para você é só um corredor. Para mim, cada passo pode me matar."
    ],
    [
      partner?.id ?? "NARRATOR",
      partnerName,
      "Isto não foi acidente. Alguém fez esse experimento."
    ],
    [
      protagonist?.id ?? "NARRATOR",
      protagonistName,
      "Se fizeram isso comigo... talvez eu não tenha sido o primeiro."
    ],
    [
      protagonist?.id ?? "NARRATOR",
      protagonistName,
      "Eu me lembro de um nome."
    ]
  ];

  const en: Array<[string, string, string]> = [
    [protagonist?.id ?? "NARRATOR", protagonistName, "Something is wrong. I think like before, but the world is enormous now."],
    [partner?.id ?? "NARRATOR", partnerName, "Wait... are you trying to talk to me?"],
    [protagonist?.id ?? "NARRATOR", protagonistName, "I know things this body should never know."],
    [partner?.id ?? "NARRATOR", partnerName, "Then we find out who you were — and what they did to you."],
    [protagonist?.id ?? "NARRATOR", protagonistName, "To you this is a hallway. To me, every step can kill me."],
    [partner?.id ?? "NARRATOR", partnerName, "This was not an accident. Someone ran this experiment."],
    [protagonist?.id ?? "NARRATOR", protagonistName, "If they did this to me... maybe I wasn't the first."],
    [protagonist?.id ?? "NARRATOR", protagonistName, "I remember a name."]
  ];

  const es: Array<[string, string, string]> = [
    [protagonist?.id ?? "NARRATOR", protagonistName, "Algo está mal. Pienso como antes, pero ahora el mundo es gigantesco."],
    [partner?.id ?? "NARRATOR", partnerName, "Espera... ¿estás intentando hablar conmigo?"],
    [protagonist?.id ?? "NARRATOR", protagonistName, "Sé cosas que este cuerpo nunca debería saber."],
    [partner?.id ?? "NARRATOR", partnerName, "Entonces descubriremos quién eras — y qué te hicieron."],
    [protagonist?.id ?? "NARRATOR", protagonistName, "Para ti es solo un pasillo. Para mí, cada paso puede matarme."],
    [partner?.id ?? "NARRATOR", partnerName, "Esto no fue un accidente. Alguien hizo este experimento."],
    [protagonist?.id ?? "NARRATOR", protagonistName, "Si me hicieron esto... quizá no fui el primero."],
    [protagonist?.id ?? "NARRATOR", protagonistName, "Recuerdo un nombre."]
  ];

  const script = locale === "en" ? en : locale === "es" ? es : pt;
  const [speakerId, speakerName, text] =
    script[eventIndex] ?? script[script.length - 1];

  return [
    {
      id: `dialogue:scene:${eventIndex + 1}:1`,
      speakerId,
      speakerName,
      text,
      authority: "CANDIDATE",
      sourceClaimIds: sourceIds
    }
  ];
}

function beatType(index: number): SceneBeatDraft["type"] {
  return (
    [
      "SETUP",
      "REACTION",
      "DISCOVERY",
      "DECISION",
      "REVERSAL",
      "REVELATION",
      "DECISION",
      "PAYOFF"
    ] as const
  )[index] ?? "CUSTOM";
}

export function forgeScenes(
  narrative: NarrativeDraft,
  claims: WorkspaceClaim[],
  locale: StoryLocale
): SceneDraft[] {
  return narrative.events.map((event, index) => {
    const nextEvent = narrative.events[index + 1];

    return {
      id: `scene:workspace:${index + 1}`,
      index: index + 1,
      title: event.title,
      eventId: event.id,
      eventAuthority: event.authority,
      dramaticPurpose: event.summary,
      action: event.summary,
      informationRevealed:
        event.authority === "SOURCE"
          ? claims
              .filter((claim) => claim.authority === "IDEA")
              .slice(0, Math.min(2, index + 1))
              .map((claim) => claim.text)
          : [event.summary],
      informationWithheld: nextEvent ? [nextEvent.title] : [],
      beats: [
        {
          id: `beat:scene:${index + 1}:setup`,
          type: beatType(index),
          purpose: event.summary
        },
        {
          id: `beat:scene:${index + 1}:reaction`,
          type: index === 7 ? "SILENCE" : "REACTION",
          purpose:
            locale === "en"
              ? "Show a character response that changes the emotional state before the next event."
              : locale === "es"
                ? "Mostrar una reacción que cambie el estado emocional antes del siguiente evento."
                : "Mostrar uma reação que altere o estado emocional antes do próximo evento."
        }
      ],
      dialogue: dialogueFor(narrative, index, locale, claims)
    };
  });
}

function visualText(
  scene: SceneDraft,
  kind: WebtoonPanel["kind"],
  locale: StoryLocale,
  protagonistName: string
) {
  const prefix =
    locale === "en"
      ? "Vertical mobile panel"
      : locale === "es"
        ? "Panel vertical móvil"
        : "Painel vertical mobile";

  if (kind === "ESTABLISHING") {
    return `${prefix}: establish the physical situation through visible action — ${scene.action}`;
  }
  if (kind === "DETAIL") {
    return `${prefix}: isolate one concrete detail that proves or complicates the event without adding new canon.`;
  }
  if (kind === "REACTION") {
    return `${prefix}: close reaction on ${protagonistName}; prioritize body language over exposition.`;
  }
  if (kind === "DIALOGUE") {
    return `${prefix}: hold composition simple so dialogue lands clearly; keep background information subordinate.`;
  }
  return `${prefix}: end the sequence on a changed state or question that pulls the reader downward.`;
}

export function realizeWebtoon(
  scenes: SceneDraft[],
  narrative: NarrativeDraft,
  locale: StoryLocale
): WebtoonRealization {
  const protagonistName =
    narrative.characters[0]?.name ??
    (locale === "en"
      ? "Protagonist"
      : locale === "es"
        ? "Protagonista"
        : "Protagonista");

  const panels: WebtoonPanel[] = [];
  let panelIndex = 1;

  for (const scene of scenes) {
    const dialogue = scene.dialogue[0];
    const kinds: WebtoonPanel["kind"][] = [
      "ESTABLISHING",
      "DETAIL",
      "REACTION",
      "DIALOGUE",
      "TURN"
    ];

    for (const [localIndex, kind] of kinds.entries()) {
      const isLast = scene.index === scenes.length && kind === "TURN";
      const text =
        kind === "DIALOGUE"
          ? dialogue?.text
          : kind === "TURN"
            ? scene.informationWithheld[0]
            : undefined;

      panels.push({
        id: `panel:webtoon:${panelIndex}`,
        index: panelIndex,
        sequence: scene.index,
        sceneId: scene.id,
        eventId: scene.eventId,
        kind,
        visualIntent: visualText(scene, kind, locale, protagonistName),
        ...(text ? { text } : {}),
        ...(kind === "DIALOGUE" && dialogue
          ? { speakerName: dialogue.speakerName }
          : {}),
        authority: "CANDIDATE",
        scrollGapAfter: isLast
          ? 140
          : [16, 24, 12, 28, 58][localIndex] ?? 20
      });

      panelIndex += 1;
    }
  }

  return {
    id: `realization:webtoon:${crypto.randomUUID()}`,
    target: "WEBTOON",
    episodeNumber: 1,
    title:
      locale === "en"
        ? "Episode 1 — First Contact"
        : locale === "es"
          ? "Episodio 1 — Primer contacto"
          : "Episódio 1 — Primeiro contato",
    sceneIds: scenes.map((scene) => scene.id),
    eventIds: scenes.map((scene) => scene.eventId),
    panelCount: panels.length,
    panels,
    authority: "CANDIDATE",
    createdAt: new Date().toISOString()
  };
}

function entityId(id: string) {
  return id.startsWith("entity:")
    ? id
    : `entity:${id.replace(/^character:/, "")}`;
}

function canonStatus(authority: LocalAuthority) {
  return authority === "SOURCE" ? "IDEA" : "CANDIDATE";
}

function tnirBeatType(type: SceneBeatDraft["type"]) {
  return type === "SETUP" ||
    type === "DISCOVERY" ||
    type === "REACTION" ||
    type === "REVELATION" ||
    type === "DECISION" ||
    type === "REVERSAL" ||
    type === "PAYOFF" ||
    type === "SILENCE"
    ? type
    : "CUSTOM";
}

export function buildTnirV05Export(input: {
  storyDNA: StoryDNA;
  universe: UniverseDraft;
  narrative: NarrativeDraft;
  scenes: SceneDraft[];
  targetMedia: MediaTarget;
}) {
  const { storyDNA, universe, narrative, scenes, targetMedia } = input;
  const now = new Date().toISOString();
  const storyId = "story:workspace-main";
  const branchId = "branch:workspace-root";

  const entities = narrative.characters.map((character) => ({
    id: entityId(character.id),
    type: "CHARACTER",
    name: character.name,
    description: character.description,
    canonStatus: canonStatus(character.authority),
    provenance: {
      createdBy:
        character.authority === "SOURCE" ? "CREATOR" : "SYSTEM",
      source: "story-lab-workspace-v0.3",
      createdAt: now
    },
    beliefs: [],
    knowledge: [],
    intentions: [],
    secrets: [],
    goals: [],
    plans: [],
    currentState: {}
  }));

  const participantIds = entities.slice(0, 2).map((entity) => entity.id);

  const events = narrative.events.map((event, index) => ({
    id: event.id,
    type: event.function.toUpperCase().replace(/\s+/g, "_"),
    participants: participantIds,
    actions: [{ summary: event.summary }],
    effects: [
      {
        narrativeSummary: event.summary,
        sourceAuthority: event.authority
      }
    ],
    ...(index > 0 ? { causedBy: [narrative.events[index - 1].id] } : {}),
    ...(index < narrative.events.length - 1
      ? { causes: [narrative.events[index + 1].id] }
      : {}),
    canonStatus: canonStatus(event.authority),
    provenance: {
      createdBy: "SYSTEM",
      source: "story-lab-workspace-v0.3",
      createdAt: now,
      rationale:
        event.authority === "SOURCE"
          ? "Evento de authoring ancorado em fatos fornecidos pelo criador."
          : "Expansão narrativa candidata."
    }
  }));

  const causalLinks = narrative.events.slice(1).map((event, index) => ({
    id: `causal:workspace:${index + 1}`,
    fromEventId: narrative.events[index].id,
    toEventId: event.id,
    type: "CAUSES",
    rationale: "Sequência causal do Narrative Draft aprovado localmente."
  }));

  const tnirScenes = scenes.map((scene) => ({
    id: scene.id,
    title: scene.title,
    ...(participantIds[0] ? { povEntityId: participantIds[0] } : {}),
    eventIds: [scene.eventId],
    dramaticPurpose: scene.dramaticPurpose,
    informationRevealed: scene.informationRevealed,
    informationWithheld: scene.informationWithheld,
    beats: scene.beats.map((beat) => ({
      id: beat.id,
      type: tnirBeatType(beat.type),
      purpose: beat.purpose,
      eventIds: [scene.eventId]
    }))
  }));

  const canon = storyDNA.sourceFacts.map((fact, index) => ({
    id: `fact:workspace-source:${index + 1}`,
    subject: universe.id,
    predicate: "creatorSourceStatement",
    object: fact,
    authority: "IDEA",
    provenance: {
      createdBy: "CREATOR",
      source: storyDNA.sourceIdea,
      createdAt: now
    }
  }));

  return {
    id: universe.id.startsWith("universe:")
      ? universe.id
      : `universe:${universe.id}`,
    title: universe.title,
    version: "0.5.0",
    storyDNA: {
      premise: storyDNA.premise,
      themes: storyDNA.themes,
      genres: [storyDNA.genre],
      tone: [storyDNA.tone],
      audience: [storyDNA.audience],
      emotionalPromise: [storyDNA.narrativePromise],
      creatorIntent: storyDNA.sourceIdea,
      constraints: storyDNA.invariants,
      narrativeQuestions: universe.coreQuestions
    },
    canon,
    entities,
    relationships: [],
    events,
    causalLinks,
    choices: [],
    stateTransitions: [],
    evidence: [],
    beliefRevisions: [],
    replanRules: [],
    actionProposals: [],
    decisionScores: [],
    eventProposals: [],
    canonProposals: narrative.candidateExpansions.map((text, index) => ({
      id: `canon-proposal:workspace:${index + 1}`,
      subject: universe.id,
      predicate: "narrativeExpansion",
      object: text,
      authority: "CANDIDATE",
      conflictsWithFactIds: [],
      rationale: "Expansão gerada no Narrative Draft e ainda não promovida."
    })),
    realizationProfiles: [
      {
        id: "realization:workspace",
        targetMedia,
        storyId,
        mode: "LINEAR",
        selectedBranchId: branchId,
        includeRootBranch: true
      }
    ],
    worldRules: [],
    branches: [
      {
        id: branchId,
        eventIds: narrative.events.map((event) => event.id),
        status: "POSSIBLE"
      }
    ],
    stories: [
      {
        id: storyId,
        title: universe.title,
        premise: storyDNA.premise,
        eventIds: narrative.events.map((event) => event.id),
        scenes: tnirScenes
      }
    ],
    mediaManifests: [
      {
        id: "media:workspace",
        targetMedia,
        storyId,
        compilerConfig: {
          locale: storyDNA.locale,
          source: "story-lab-workspace-v0.3"
        }
      }
    ],
    provenance: {
      createdBy: "SYSTEM",
      source: "story-lab-workspace-v0.3",
      sourceVersion: "0.3.0",
      createdAt: now
    }
  };
}

export function forgeNarrativeV03(input: {
  storyDNA: StoryDNA;
  universe: UniverseDraft;
  narrative: NarrativeDraft;
  targetMedia: MediaTarget;
  locale: StoryLocale;
}): NarrativeForgeV03 {
  const claims = buildClaimLedger(input.storyDNA, input.narrative);
  const scenes = forgeScenes(input.narrative, claims, input.locale);
  const webtoon =
    input.targetMedia === "WEBTOON"
      ? realizeWebtoon(scenes, input.narrative, input.locale)
      : null;

  const tnir = buildTnirV05Export({
    storyDNA: input.storyDNA,
    universe: input.universe,
    narrative: input.narrative,
    scenes,
    targetMedia: input.targetMedia
  });

  return {
    version: "0.3.0",
    claims,
    scenes,
    webtoon,
    tnir
  };
}
