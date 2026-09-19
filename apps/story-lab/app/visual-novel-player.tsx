"use client";

import { useMemo, useState } from "react";
import type {
  NativeVisualNovelRealization,
  VisualNovelChoiceOption
} from "@/lib/storyforge-v041";
import { useI18n } from "./i18n";

type Props = {
  realization: NativeVisualNovelRealization;
};

type RuntimeState = Record<string, string>;

function applyPatches(
  current: RuntimeState,
  patches: Array<{ path: string; value: string }>
) {
  const next = { ...current };
  for (const patch of patches) {
    next[patch.path] = patch.value;
  }
  return next;
}

export function VisualNovelPlayer({ realization }: Props) {
  const { t } = useI18n();
  const root = realization.branches[0];

  const initialPath = useMemo(
    () => [...root.eventIds],
    [root.eventIds]
  );

  const [path, setPath] = useState<string[]>(initialPath);
  const [cursor, setCursor] = useState(0);
  const [selectedOptionId, setSelectedOptionId] =
    useState<string | null>(null);
  const [runtimeState, setRuntimeState] =
    useState<RuntimeState>({});

  const sceneByEvent = useMemo(
    () =>
      new Map(
        realization.scenes.map((scene) => [
          scene.eventId,
          scene
        ])
      ),
    [realization.scenes]
  );

  const currentEventId = path[cursor] ?? null;
  const currentScene =
    currentEventId
      ? sceneByEvent.get(currentEventId) ?? null
      : null;

  const choice =
    currentEventId
      ? realization.choices.find(
          (item) => item.atEventId === currentEventId
        ) ?? null
      : null;

  const atChoice =
    Boolean(choice) && selectedOptionId === null;

  const finished =
    path.length > 0 &&
    cursor >= path.length - 1 &&
    !atChoice;

  function choose(option: VisualNovelChoiceOption) {
    const branch = realization.branches.find(
      (item) => item.id === option.branchId
    );
    const transition = realization.stateTransitions.find(
      (item) => item.id === option.transitionId
    );

    if (!branch || !transition) return;

    setSelectedOptionId(option.id);
    setRuntimeState((current) =>
      applyPatches(current, transition.patches)
    );
    setPath((current) => [
      ...current,
      ...branch.eventIds
    ]);
  }

  function next() {
    if (atChoice || finished) return;
    setCursor((current) =>
      Math.min(current + 1, path.length - 1)
    );
  }

  function restart() {
    setPath(initialPath);
    setCursor(0);
    setSelectedOptionId(null);
    setRuntimeState({});
  }

  return (
    <div className="vn-player">
      <div className="vn-player-head">
        <div>
          <small>{t("vn.player")}</small>
          <h3>{currentScene?.title ?? t("vn.finished")}</h3>
        </div>
        <span className="status candidate">
          {cursor + 1}/{path.length}
        </span>
      </div>

      {currentScene ? (
        <>
          <div className="vn-player-scene">
            <p>{currentScene.entryState}</p>

            <div className="vn-player-dialogue">
              {currentScene.dialogueExchange.map((line) => (
                <p key={line.id}>
                  <strong>{line.speakerName}:</strong>{" "}
                  {line.text}
                </p>
              ))}
            </div>

            <ul>
              {currentScene.observableActions.map(
                (action, index) => (
                  <li key={`${currentScene.id}:runtime:${index}`}>
                    {action}
                  </li>
                )
              )}
            </ul>

            <p className="muted">
              {currentScene.exitState}
            </p>
          </div>

          {choice && selectedOptionId === null ? (
            <div className="vn-player-choice">
              <strong>{choice.prompt}</strong>
              <div>
                {choice.options.map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => choose(option)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <p>{t("vn.finished")}</p>
      )}

      <div className="vn-player-runtime-state">
        <small>{t("vn.runtimeState")}</small>
        {Object.keys(runtimeState).length ? (
          <dl>
            {Object.entries(runtimeState).map(
              ([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              )
            )}
          </dl>
        ) : (
          <p className="muted">{t("vn.runtimeStateEmpty")}</p>
        )}
      </div>

      <div className="workspace-actions">
        <button
          type="button"
          onClick={next}
          disabled={atChoice || finished}
        >
          {finished ? t("vn.finished") : t("vn.next")}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={restart}
        >
          {t("vn.restart")}
        </button>
      </div>
    </div>
  );
}
