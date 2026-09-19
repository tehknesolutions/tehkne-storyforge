"use client";

import { useMemo, useState } from "react";
import type { NativeVisualNovelRealization } from "@/lib/storyforge-v041";
import {
  advanceVisualNovelRuntime,
  chooseVisualNovelOption,
  createVisualNovelRuntime,
  getVisualNovelRuntimeSnapshot,
  resetVisualNovelRuntime
} from "@/lib/storyforge-v043";
import { useI18n } from "./i18n";

type Props = {
  realization: NativeVisualNovelRealization;
};

export function VisualNovelPlayer({ realization }: Props) {
  const { t } = useI18n();
  const [runtime, setRuntime] = useState(() =>
    createVisualNovelRuntime(realization)
  );

  const snapshot = useMemo(
    () =>
      getVisualNovelRuntimeSnapshot(
        realization,
        runtime
      ),
    [realization, runtime]
  );

  const currentScene = useMemo(
    () =>
      snapshot.currentEventId
        ? realization.scenes.find(
            (scene) =>
              scene.eventId === snapshot.currentEventId
          ) ?? null
        : null,
    [realization.scenes, snapshot.currentEventId]
  );

  function choose(optionId: string) {
    setRuntime((current) =>
      chooseVisualNovelOption(
        realization,
        current,
        optionId
      )
    );
  }

  function next() {
    setRuntime((current) =>
      advanceVisualNovelRuntime(
        realization,
        current
      )
    );
  }

  function restart() {
    setRuntime(resetVisualNovelRuntime(realization));
  }

  return (
    <div className="vn-player">
      <div className="vn-player-head">
        <div>
          <small>{t("vn.player")}</small>
          <h3>{currentScene?.title ?? t("vn.finished")}</h3>
        </div>
        <span className="status candidate">
          {Math.min(runtime.cursor + 1, runtime.path.length)}/
          {runtime.path.length}
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

          {snapshot.currentChoice ? (
            <div className="vn-player-choice">
              <strong>{snapshot.currentChoice.prompt}</strong>
              <div>
                {snapshot.currentChoice.options.map(
                  (option) => (
                    <button
                      type="button"
                      key={option.id}
                      onClick={() => choose(option.id)}
                    >
                      {option.label}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <p>{t("vn.finished")}</p>
      )}

      <div className="vn-player-runtime-state">
        <small>{t("vn.runtimeState")}</small>
        {Object.keys(runtime.worldState).length ? (
          <dl>
            {Object.entries(runtime.worldState).map(
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
          disabled={
            snapshot.waitingChoice ||
            snapshot.finished
          }
        >
          {snapshot.finished ? t("vn.finished") : t("vn.next")}
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
