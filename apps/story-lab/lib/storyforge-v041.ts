import type {
  MediaTarget,
  NarrativeDraft,
  StoryDNA,
  StoryLocale,
  UniverseDraft
} from "./storyforge-local";
import type { NarrativeForgeV03 } from "./storyforge-v03";
import {
  buildV04TnirExport,
  selectedSceneRevisions,
  type SceneAuthorityWorkspace,
  type SceneRevision
} from "./storyforge-v04";

export type ExpandedBeatKind =
  | "ENTRY"
  | "GOAL"
  | "OBSTACLE"
  | "ACTION"
  | "EXCHANGE"
  | "REACTION"
  | "TURN"
  | "EXIT";

export type ExpandedSceneBeat = {
  id: string;
  kind: ExpandedBeatKind;
  purpose: string;
  authority: "CANDIDATE";
  sourceClaimIds: string[];
};

export type ExpandedDialogueLine = {
  id: string;
  speakerId: string | "NARRATOR";
  speakerName: string;
  text: string;
  authority: "CANDIDATE";
  sourceClaimIds: string[];
};

export type ExpandedScene = {
  id: string;
  version: "0.4.1";
  sceneId: string;
  sceneRevisionId: string;
  sceneRevision: number;
  eventId: string;
  title: string;
  goal: string;
  conflict: string;
  entryState: string;
  exitState: string;
  observableActions: string[];
  beats: ExpandedSceneBeat[];
  dialogueExchange: ExpandedDialogueLine[];
  sourceClaimIds: string[];
  authority: "CANDIDATE";
};

export type VisualNovelChoiceOption = {
  id: string;
  label: string;
  outcomeEventId: string;
  transitionId: string;
  branchId: string;
  authority: "CANDIDATE";
};

export type VisualNovelChoice = {
  id: string;
  atEventId: string;
  actor: "PLAYER";
  prompt: string;
  options: VisualNovelChoiceOption[];
  authority: "CANDIDATE";
};

export type VisualNovelStateTransition = {
  id: string;
  triggeredBy: {
    type: "CHOICE_OPTION";
    id: string;
  };
  targetId: "WORLD";
  patches: Array<{
    op: "SET";
    path: string;
    value: string;
  }>;
  authority: "CANDIDATE";
};

export type VisualNovelBranch = {
  id: string;
  parentBranchId: string;
  forkEventId: string;
  choiceOptionId: string;
  eventIds: string[];
  status: "POSSIBLE";
  authority: "CANDIDATE";
};

export type NativeVisualNovelRealization = {
  id: string;
  version: "0.4.1";
  target: "VISUAL_NOVEL";
  mode: "INTERACTIVE";
  sceneRevisionIds: string[];
  scenes: ExpandedScene[];
  choices: VisualNovelChoice[];
  stateTransitions: VisualNovelStateTransition[];
  branches: Array<
    | {
        id: string;
        eventIds: string[];
        status: "POSSIBLE";
        authority: "CANDIDATE";
      }
    | VisualNovelBranch
  >;
  convergenceEventId: string | null;
  authority: "CANDIDATE";
  createdAt: string;
};

function localized(
  locale: StoryLocale,
  values: Record<StoryLocale, string>
) {
  return values[locale];
}

function narratorName(locale: StoryLocale) {
  return localized(locale, {
    "pt-BR": "Narração",
    en: "Narration",
    es: "Narración"
  });
}

function sceneGoal(scene: SceneRevision, locale: StoryLocale) {
  return localized(locale, {
    "pt-BR": `Objetivo da cena: transformar “${scene.dramaticPurpose}” em uma mudança observável antes da saída.`,
    en: `Scene goal: turn “${scene.dramaticPurpose}” into an observable change before the exit.`,
    es: `Objetivo de la escena: convertir “${scene.dramaticPurpose}” en un cambio observable antes de la salida.`
  });
}

function sceneConflict(scene: SceneRevision, locale: StoryLocale) {
  const withheld = scene.informationWithheld[0];
  if (withheld) {
    return localized(locale, {
      "pt-BR": `Conflito local: avançar sem revelar cedo demais “${withheld}”.`,
      en: `Local conflict: advance without revealing “${withheld}” too early.`,
      es: `Conflicto local: avanzar sin revelar demasiado pronto “${withheld}”.`
    });
  }

  return localized(locale, {
    "pt-BR":
      "Conflito local: obter uma mudança dramática concreta sem criar nova verdade canônica.",
    en:
      "Local conflict: achieve a concrete dramatic change without creating new canonical truth.",
    es:
      "Conflicto local: lograr un cambio dramático concreto sin crear nueva verdad canónica."
  });
}

function entryState(scene: SceneRevision, locale: StoryLocale) {
  return localized(locale, {
    "pt-BR": `Entrada: o estado anterior ainda está ativo; a cena precisa tornar “${scene.title}” inevitável.`,
    en: `Entry: the previous state is still active; the scene must make “${scene.title}” inevitable.`,
    es: `Entrada: el estado anterior sigue activo; la escena debe volver “${scene.title}” inevitable.`
  });
}

function exitState(scene: SceneRevision, locale: StoryLocale) {
  const next = scene.informationWithheld[0];
  return next
    ? localized(locale, {
        "pt-BR": `Saída: a cena termina apontando causalmente para “${next}”.`,
        en: `Exit: the scene ends by causally pointing toward “${next}”.`,
        es: `Salida: la escena termina apuntando causalmente hacia “${next}”.`
      })
    : localized(locale, {
        "pt-BR":
          "Saída: o estado dramático mudou e a consequência fica pronta para o próximo ato.",
        en:
          "Exit: the dramatic state has changed and the consequence is ready for the next act.",
        es:
          "Salida: el estado dramático cambió y la consecuencia queda lista para el siguiente acto."
      });
}

function observableActions(
  scene: SceneRevision,
  locale: StoryLocale
): string[] {
  const reaction = localized(locale, {
    "pt-BR":
      "Uma reação observável confirma que a ação alterou o estado emocional ou informacional da cena.",
    en:
      "An observable reaction confirms that the action changed the emotional or informational state of the scene.",
    es:
      "Una reacción observable confirma que la acción cambió el estado emocional o informativo de la escena."
  });

  const turn = scene.informationWithheld[0]
    ? localized(locale, {
        "pt-BR": `A encenação termina abrindo a pergunta: “${scene.informationWithheld[0]}”.`,
        en: `The staging ends by opening the question: “${scene.informationWithheld[0]}”.`,
        es: `La puesta en escena termina abriendo la pregunta: “${scene.informationWithheld[0]}”.`
      })
    : localized(locale, {
        "pt-BR":
          "A encenação termina numa consequência que impede o retorno ao estado inicial.",
        en:
          "The staging ends on a consequence that prevents a return to the initial state.",
        es:
          "La puesta en escena termina en una consecuencia que impide volver al estado inicial."
      });

  return [scene.action, reaction, turn];
}

function expandedDialogue(
  scene: SceneRevision,
  locale: StoryLocale
): ExpandedDialogueLine[] {
  const active = scene.dialogue
    .filter((line) => line.status !== "REJECTED")
    .map((line) => ({
      id: `expanded:${line.id}`,
      speakerId: line.speakerId,
      speakerName: line.speakerName,
      text: line.text,
      authority: "CANDIDATE" as const,
      sourceClaimIds:
        line.sourceClaimIds.length > 0
          ? [...line.sourceClaimIds]
          : [...scene.sourceClaimIds]
    }));

  const response = localized(locale, {
    "pt-BR":
      "A reação seguinte não fecha a questão; ela desloca a cena para a próxima decisão.",
    en:
      "The next reaction does not close the question; it pushes the scene toward the next decision.",
    es:
      "La reacción siguiente no cierra la cuestión; empuja la escena hacia la próxima decisión."
  });

  return [
    ...active,
    {
      id: `expanded-dialogue:${scene.sceneId}:narration`,
      speakerId: "NARRATOR" as const,
      speakerName: narratorName(locale),
      text: response,
      authority: "CANDIDATE" as const,
      sourceClaimIds: [...scene.sourceClaimIds]
    }
  ];
}

export function expandSceneRevision(
  scene: SceneRevision,
  locale: StoryLocale
): ExpandedScene {
  const goal = sceneGoal(scene, locale);
  const conflict = sceneConflict(scene, locale);
  const entry = entryState(scene, locale);
  const exit = exitState(scene, locale);
  const actions = observableActions(scene, locale);
  const dialogue = expandedDialogue(scene, locale);

  const beats: ExpandedSceneBeat[] = [
    {
      id: `expanded-beat:${scene.sceneId}:entry`,
      kind: "ENTRY",
      purpose: entry,
      authority: "CANDIDATE",
      sourceClaimIds: [...scene.sourceClaimIds]
    },
    {
      id: `expanded-beat:${scene.sceneId}:goal`,
      kind: "GOAL",
      purpose: goal,
      authority: "CANDIDATE",
      sourceClaimIds: [...scene.sourceClaimIds]
    },
    {
      id: `expanded-beat:${scene.sceneId}:obstacle`,
      kind: "OBSTACLE",
      purpose: conflict,
      authority: "CANDIDATE",
      sourceClaimIds: [...scene.sourceClaimIds]
    },
    {
      id: `expanded-beat:${scene.sceneId}:action`,
      kind: "ACTION",
      purpose: actions[0],
      authority: "CANDIDATE",
      sourceClaimIds: [...scene.sourceClaimIds]
    },
    {
      id: `expanded-beat:${scene.sceneId}:exchange`,
      kind: "EXCHANGE",
      purpose: dialogue.map((line) => line.text).join(" / "),
      authority: "CANDIDATE",
      sourceClaimIds: [...scene.sourceClaimIds]
    },
    {
      id: `expanded-beat:${scene.sceneId}:reaction`,
      kind: "REACTION",
      purpose: actions[1],
      authority: "CANDIDATE",
      sourceClaimIds: [...scene.sourceClaimIds]
    },
    {
      id: `expanded-beat:${scene.sceneId}:turn`,
      kind: "TURN",
      purpose: actions[2],
      authority: "CANDIDATE",
      sourceClaimIds: [...scene.sourceClaimIds]
    },
    {
      id: `expanded-beat:${scene.sceneId}:exit`,
      kind: "EXIT",
      purpose: exit,
      authority: "CANDIDATE",
      sourceClaimIds: [...scene.sourceClaimIds]
    }
  ];

  return {
    id: `expanded-scene:${scene.sceneId}:r${scene.revision}`,
    version: "0.4.1",
    sceneId: scene.sceneId,
    sceneRevisionId: scene.id,
    sceneRevision: scene.revision,
    eventId: scene.eventId,
    title: scene.title,
    goal,
    conflict,
    entryState: entry,
    exitState: exit,
    observableActions: actions,
    beats,
    dialogueExchange: dialogue,
    sourceClaimIds: [...scene.sourceClaimIds],
    authority: "CANDIDATE"
  };
}

export function expandSelectedScenes(
  workspace: SceneAuthorityWorkspace,
  locale: StoryLocale
): ExpandedScene[] {
  return selectedSceneRevisions(workspace)
    .filter((scene) => scene.status !== "REJECTED")
    .map((scene) => expandSceneRevision(scene, locale));
}

function choicePrompt(
  fork: ExpandedScene,
  locale: StoryLocale
) {
  return localized(locale, {
    "pt-BR": `Como o jogador conduz a consequência de “${fork.title}”?`,
    en: `How should the player steer the consequence of “${fork.title}”?`,
    es: `¿Cómo debe conducir el jugador la consecuencia de “${fork.title}”?`
  });
}

function optionLabel(
  scene: ExpandedScene,
  locale: StoryLocale
) {
  return localized(locale, {
    "pt-BR": `Seguir: ${scene.title}`,
    en: `Follow: ${scene.title}`,
    es: `Seguir: ${scene.title}`
  });
}

export function realizeNativeVisualNovel(
  workspace: SceneAuthorityWorkspace,
  narrative: NarrativeDraft,
  locale: StoryLocale
): NativeVisualNovelRealization {
  const scenes = expandSelectedScenes(workspace, locale);

  if (scenes.length < 7) {
    throw new Error("VISUAL_NOVEL_REQUIRES_AT_LEAST_7_SELECTED_SCENES");
  }

  const forkIndex = 3;
  const fork = scenes[forkIndex];
  const optionAScene = scenes[forkIndex + 1];
  const optionBScene = scenes[forkIndex + 2];
  const convergence = scenes[forkIndex + 3];
  const tail = scenes.slice(forkIndex + 4);

  const rootBranchId = "branch:visual-novel:root";
  const branchAId = "branch:visual-novel:a";
  const branchBId = "branch:visual-novel:b";
  const choiceId = "choice:visual-novel:1";
  const optionAId = "choice-option:visual-novel:1:a";
  const optionBId = "choice-option:visual-novel:1:b";
  const transitionAId = "transition:visual-novel:1:a";
  const transitionBId = "transition:visual-novel:1:b";

  const optionA: VisualNovelChoiceOption = {
    id: optionAId,
    label: optionLabel(optionAScene, locale),
    outcomeEventId: optionAScene.eventId,
    transitionId: transitionAId,
    branchId: branchAId,
    authority: "CANDIDATE"
  };

  const optionB: VisualNovelChoiceOption = {
    id: optionBId,
    label: optionLabel(optionBScene, locale),
    outcomeEventId: optionBScene.eventId,
    transitionId: transitionBId,
    branchId: branchBId,
    authority: "CANDIDATE"
  };

  const choice: VisualNovelChoice = {
    id: choiceId,
    atEventId: fork.eventId,
    actor: "PLAYER",
    prompt: choicePrompt(fork, locale),
    options: [optionA, optionB],
    authority: "CANDIDATE"
  };

  const transitions: VisualNovelStateTransition[] = [
    {
      id: transitionAId,
      triggeredBy: {
        type: "CHOICE_OPTION",
        id: optionAId
      },
      targetId: "WORLD",
      patches: [
        {
          op: "SET",
          path: "visualNovel.activeBranch",
          value: branchAId
        },
        {
          op: "SET",
          path: "visualNovel.lastChoice",
          value: optionAId
        }
      ],
      authority: "CANDIDATE"
    },
    {
      id: transitionBId,
      triggeredBy: {
        type: "CHOICE_OPTION",
        id: optionBId
      },
      targetId: "WORLD",
      patches: [
        {
          op: "SET",
          path: "visualNovel.activeBranch",
          value: branchBId
        },
        {
          op: "SET",
          path: "visualNovel.lastChoice",
          value: optionBId
        }
      ],
      authority: "CANDIDATE"
    }
  ];

  const tailEventIds = tail.map((scene) => scene.eventId);

  const branches: NativeVisualNovelRealization["branches"] = [
    {
      id: rootBranchId,
      eventIds: scenes
        .slice(0, forkIndex + 1)
        .map((scene) => scene.eventId),
      status: "POSSIBLE",
      authority: "CANDIDATE"
    },
    {
      id: branchAId,
      parentBranchId: rootBranchId,
      forkEventId: fork.eventId,
      choiceOptionId: optionAId,
      eventIds: [
        optionAScene.eventId,
        convergence.eventId,
        ...tailEventIds
      ],
      status: "POSSIBLE",
      authority: "CANDIDATE"
    },
    {
      id: branchBId,
      parentBranchId: rootBranchId,
      forkEventId: fork.eventId,
      choiceOptionId: optionBId,
      eventIds: [
        optionBScene.eventId,
        convergence.eventId,
        ...tailEventIds
      ],
      status: "POSSIBLE",
      authority: "CANDIDATE"
    }
  ];

  return {
    id: `realization:visual-novel:v0.4.1:${crypto.randomUUID()}`,
    version: "0.4.1",
    target: "VISUAL_NOVEL",
    mode: "INTERACTIVE",
    sceneRevisionIds: scenes.map((scene) => scene.sceneRevisionId),
    scenes,
    choices: [choice],
    stateTransitions: transitions,
    branches,
    convergenceEventId: convergence.eventId,
    authority: "CANDIDATE",
    createdAt: new Date().toISOString()
  };
}

export function buildV041TnirExport(input: {
  storyDNA: StoryDNA;
  universe: UniverseDraft;
  narrative: NarrativeDraft;
  forgeV03: NarrativeForgeV03;
  sceneAuthority: SceneAuthorityWorkspace;
  targetMedia: MediaTarget;
  locale: StoryLocale;
}) {
  const base = buildV04TnirExport({
    storyDNA: input.storyDNA,
    universe: input.universe,
    narrative: input.narrative,
    forgeV03: input.forgeV03,
    sceneAuthority: input.sceneAuthority,
    targetMedia: input.targetMedia
  }) as Record<string, unknown>;

  const expandedScenes = expandSelectedScenes(
    input.sceneAuthority,
    input.locale
  );

  if (input.targetMedia !== "VISUAL_NOVEL") {
    return {
      ...base,
      sceneExpansions: expandedScenes,
      provenance: {
        ...((base.provenance as Record<string, unknown>) ?? {}),
        source: "story-lab-workspace-v0.4.1",
        sourceVersion: "0.4.1"
      }
    };
  }

  const realization = realizeNativeVisualNovel(
    input.sceneAuthority,
    input.narrative,
    input.locale
  );

  const tnirChoices = realization.choices.map((choice) => ({
    id: choice.id,
    atEventId: choice.atEventId,
    actor: choice.actor,
    prompt: choice.prompt,
    options: choice.options.map((option) => ({
      id: option.id,
      label: option.label,
      outcomeEventId: option.outcomeEventId,
      transitionId: option.transitionId,
      branchId: option.branchId
    })),
    authority: choice.authority
  }));

  const tnirTransitions = realization.stateTransitions.map(
    (transition) => ({
      id: transition.id,
      triggeredBy: transition.triggeredBy,
      targetId: transition.targetId,
      patches: transition.patches,
      authority: transition.authority
    })
  );

  const tnirBranches = realization.branches.map((branch) => ({
    id: branch.id,
    ...("parentBranchId" in branch
      ? { parentBranchId: branch.parentBranchId }
      : {}),
    ...("forkEventId" in branch
      ? { forkEventId: branch.forkEventId }
      : {}),
    ...("choiceOptionId" in branch
      ? { choiceOptionId: branch.choiceOptionId }
      : {}),
    eventIds: branch.eventIds,
    status: branch.status,
    authority: branch.authority
  }));

  const existingProfiles = Array.isArray(base.realizationProfiles)
    ? (base.realizationProfiles as Array<Record<string, unknown>>)
    : [];

  const realizationProfiles = existingProfiles.map((profile) =>
    profile.targetMedia === "VISUAL_NOVEL"
      ? {
          ...profile,
          mode: "INTERACTIVE",
          selectedBranchId: undefined,
          includeRootBranch: true
        }
      : profile
  );

  const existingManifests = Array.isArray(base.mediaManifests)
    ? (base.mediaManifests as Array<Record<string, unknown>>)
    : [];

  const mediaManifests = existingManifests.map((manifest) =>
    manifest.targetMedia === "VISUAL_NOVEL"
      ? {
          ...manifest,
          interactionModel: {
            compiler: "storyforge-native-visual-novel-v0.4.1",
            choiceCount: realization.choices.length,
            branchCount: realization.branches.length,
            convergenceEventId: realization.convergenceEventId,
            authority: "CANDIDATE"
          }
        }
      : manifest
  );

  return {
    ...base,
    choices: tnirChoices,
    stateTransitions: tnirTransitions,
    branches: tnirBranches,
    realizationProfiles,
    mediaManifests,
    sceneExpansions: expandedScenes,
    nativeVisualNovel: realization,
    provenance: {
      ...((base.provenance as Record<string, unknown>) ?? {}),
      source: "story-lab-workspace-v0.4.1",
      sourceVersion: "0.4.1",
      interactiveProjectionAuthority: "CANDIDATE",
      canonicalEventGraphMutated: false
    }
  };
}
