"use client";

import type { NativeVisualNovelRealization } from "@/lib/storyforge-v041";
import { useI18n } from "./i18n";

type Props = {
  realization: NativeVisualNovelRealization;
  onExport: () => void;
};

export function VisualNovelView({ realization, onExport }: Props) {
  const { t } = useI18n();

  return (
    <section className="workspace-step visual-novel-view">
      <div className="workspace-step-label">
        11 · {t("vn.title")}
      </div>
      <p className="muted forge-intro">{t("vn.body")}</p>

      <div className="visual-novel-summary">
        <div>
          <small>{t("vn.mode")}</small>
          <strong>{realization.mode}</strong>
        </div>
        <div>
          <small>{t("vn.scenes")}</small>
          <strong>{realization.scenes.length}</strong>
        </div>
        <div>
          <small>{t("vn.choices")}</small>
          <strong>{realization.choices.length}</strong>
        </div>
        <div>
          <small>{t("vn.branches")}</small>
          <strong>{realization.branches.length}</strong>
        </div>
        <span className="status candidate">{realization.authority}</span>
      </div>

      <div className="visual-novel-grid">
        <article>
          <h3>{t("vn.choiceGraph")}</h3>
          {realization.choices.map((choice) => (
            <div className="vn-choice" key={choice.id}>
              <small>{choice.atEventId}</small>
              <p><strong>{choice.prompt}</strong></p>
              <div className="vn-options">
                {choice.options.map((option) => (
                  <div key={option.id}>
                    <strong>{option.label}</strong>
                    <code>{option.outcomeEventId}</code>
                    <code>{option.branchId}</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </article>

        <article>
          <h3>{t("vn.stateTransitions")}</h3>
          {realization.stateTransitions.map((transition) => (
            <div className="vn-transition" key={transition.id}>
              <code>{transition.id}</code>
              <small>
                {transition.triggeredBy.type} · {transition.triggeredBy.id}
              </small>
              <ul>
                {transition.patches.map((patch) => (
                  <li key={`${transition.id}:${patch.path}`}>
                    <code>{patch.path}</code> → {patch.value}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </article>

        <article className="wide">
          <h3>{t("vn.branchGraph")}</h3>
          <div className="vn-branches">
            {realization.branches.map((branch) => (
              <div key={branch.id}>
                <strong>{branch.id}</strong>
                <span className="status candidate">{branch.status}</span>
                <p>{branch.eventIds.join(" → ")}</p>
              </div>
            ))}
          </div>
          <p className="muted">
            {t("vn.convergence")}:{" "}
            <code>{realization.convergenceEventId ?? "—"}</code>
          </p>
        </article>
      </div>

      <div className="expanded-scene-list">
        <h3>{t("vn.expandedScenes")}</h3>
        {realization.scenes.map((scene) => (
          <article key={scene.id}>
            <div className="scene-revision-head">
              <div>
                <span className="step">
                  {String(scene.sceneRevision).padStart(2, "0")}
                </span>
                <div>
                  <h3>{scene.title}</h3>
                  <code>{scene.sceneRevisionId}</code>
                </div>
              </div>
              <span className="status candidate">{scene.authority}</span>
            </div>

            <div className="scene-field">
              <small>{t("vn.goal")}</small>
              <p>{scene.goal}</p>
            </div>
            <div className="scene-field">
              <small>{t("vn.conflict")}</small>
              <p>{scene.conflict}</p>
            </div>

            <div className="vn-state-pair">
              <div>
                <small>{t("vn.entryState")}</small>
                <p>{scene.entryState}</p>
              </div>
              <div>
                <small>{t("vn.exitState")}</small>
                <p>{scene.exitState}</p>
              </div>
            </div>

            <div className="scene-field">
              <small>{t("vn.observableActions")}</small>
              <ol>
                {scene.observableActions.map((action, index) => (
                  <li key={`${scene.id}:action:${index}`}>{action}</li>
                ))}
              </ol>
            </div>

            <div className="scene-field">
              <small>{t("vn.beats")}</small>
              <ol className="vn-beats">
                {scene.beats.map((beat) => (
                  <li key={beat.id}>
                    <code>{beat.kind}</code> {beat.purpose}
                  </li>
                ))}
              </ol>
            </div>

            <div className="dialogue-block">
              <small>{t("vn.dialogueExchange")}</small>
              {scene.dialogueExchange.map((line) => (
                <p key={line.id}>
                  <strong>{line.speakerName}:</strong> {line.text}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="workspace-actions">
        <button type="button" onClick={onExport}>
          {t("vn.export")}
        </button>
      </div>
    </section>
  );
}
