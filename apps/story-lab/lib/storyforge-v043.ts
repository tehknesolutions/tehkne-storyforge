import type {
  NativeVisualNovelRealization,
  VisualNovelChoice,
  VisualNovelChoiceOption
} from "./storyforge-v041";

export type VisualNovelRuntimeState = {
  version: "0.4.3";
  path: string[];
  cursor: number;
  selectedOptionIds: string[];
  worldState: Record<string, string>;
  status: "PLAYING" | "WAITING_CHOICE" | "FINISHED";
};

export type VisualNovelRuntimeSnapshot = {
  currentEventId: string | null;
  currentSceneRevisionId: string | null;
  currentChoice: VisualNovelChoice | null;
  finished: boolean;
  waitingChoice: boolean;
};

function rootBranch(realization: NativeVisualNovelRealization) {
  const root = realization.branches.find(
    (branch) => !("parentBranchId" in branch)
  );

  if (!root) {
    throw new Error("VISUAL_NOVEL_ROOT_BRANCH_MISSING");
  }

  return root;
}

export function createVisualNovelRuntime(
  realization: NativeVisualNovelRealization
): VisualNovelRuntimeState {
  const root = rootBranch(realization);

  return {
    version: "0.4.3",
    path: [...root.eventIds],
    cursor: 0,
    selectedOptionIds: [],
    worldState: {},
    status: "PLAYING"
  };
}

export function getVisualNovelRuntimeSnapshot(
  realization: NativeVisualNovelRealization,
  runtime: VisualNovelRuntimeState
): VisualNovelRuntimeSnapshot {
  const currentEventId = runtime.path[runtime.cursor] ?? null;
  const currentScene =
    currentEventId === null
      ? null
      : realization.scenes.find(
          (scene) => scene.eventId === currentEventId
        ) ?? null;

  const currentChoice =
    currentEventId === null
      ? null
      : realization.choices.find(
          (choice) =>
            choice.atEventId === currentEventId &&
            !choice.options.some((option) =>
              runtime.selectedOptionIds.includes(option.id)
            )
        ) ?? null;

  const finished =
    runtime.path.length > 0 &&
    runtime.cursor >= runtime.path.length - 1 &&
    currentChoice === null;

  return {
    currentEventId,
    currentSceneRevisionId:
      currentScene?.sceneRevisionId ?? null,
    currentChoice,
    finished,
    waitingChoice: currentChoice !== null
  };
}

function optionById(
  realization: NativeVisualNovelRealization,
  optionId: string
): {
  choice: VisualNovelChoice;
  option: VisualNovelChoiceOption;
} {
  for (const choice of realization.choices) {
    const option = choice.options.find(
      (candidate) => candidate.id === optionId
    );

    if (option) {
      return { choice, option };
    }
  }

  throw new Error(`VISUAL_NOVEL_OPTION_NOT_FOUND:${optionId}`);
}

export function chooseVisualNovelOption(
  realization: NativeVisualNovelRealization,
  runtime: VisualNovelRuntimeState,
  optionId: string
): VisualNovelRuntimeState {
  const snapshot = getVisualNovelRuntimeSnapshot(
    realization,
    runtime
  );

  if (!snapshot.waitingChoice || !snapshot.currentChoice) {
    throw new Error("VISUAL_NOVEL_NOT_WAITING_FOR_CHOICE");
  }

  const { choice, option } = optionById(
    realization,
    optionId
  );

  if (choice.id !== snapshot.currentChoice.id) {
    throw new Error("VISUAL_NOVEL_OPTION_NOT_AVAILABLE_HERE");
  }

  const branch = realization.branches.find(
    (candidate) => candidate.id === option.branchId
  );
  const transition = realization.stateTransitions.find(
    (candidate) => candidate.id === option.transitionId
  );

  if (!branch) {
    throw new Error("VISUAL_NOVEL_OPTION_BRANCH_MISSING");
  }

  if (!transition) {
    throw new Error("VISUAL_NOVEL_OPTION_TRANSITION_MISSING");
  }

  const worldState = { ...runtime.worldState };
  for (const patch of transition.patches) {
    if (patch.op === "SET") {
      worldState[patch.path] = patch.value;
    }
  }

  return {
    ...runtime,
    path: [...runtime.path, ...branch.eventIds],
    selectedOptionIds: [
      ...runtime.selectedOptionIds,
      option.id
    ],
    worldState,
    status: "PLAYING"
  };
}

export function advanceVisualNovelRuntime(
  realization: NativeVisualNovelRealization,
  runtime: VisualNovelRuntimeState
): VisualNovelRuntimeState {
  const snapshot = getVisualNovelRuntimeSnapshot(
    realization,
    runtime
  );

  if (snapshot.waitingChoice) {
    return {
      ...runtime,
      status: "WAITING_CHOICE"
    };
  }

  if (snapshot.finished) {
    return {
      ...runtime,
      status: "FINISHED"
    };
  }

  return {
    ...runtime,
    cursor: Math.min(
      runtime.cursor + 1,
      runtime.path.length - 1
    ),
    status: "PLAYING"
  };
}

export function resetVisualNovelRuntime(
  realization: NativeVisualNovelRealization
) {
  return createVisualNovelRuntime(realization);
}
