"use client";

import {
  approveSceneRevision,
  regenerateScene,
  rejectSceneRevision,
  selectedSceneRevisions,
  type SceneAuthorityWorkspace,
  type V04WebtoonRealization
} from "@/lib/storyforge-v04";
import type { MediaTarget, StoryLocale } from "@/lib/storyforge-local";
import { useI18n } from "./i18n";

type Props = {
  authority: SceneAuthorityWorkspace;
  locale: StoryLocale;
  webtoon: V04WebtoonRealization | null;
  targetMedia: MediaTarget;
  onChange: (next: SceneAuthorityWorkspace) => void;
  onCompile: () => void;
  onExportAuthority: () => void;
  onExportTnir: () => void;
  onExportWebtoon: () => void;
};

export function SceneAuthorityEditor({
  authority,
  locale,
  webtoon,
  targetMedia,
  onChange,
  onCompile,
  onExportAuthority,
  onExportTnir,
  onExportWebtoon
}: Props) {
  const { t } = useI18n();
  const scenes = selectedSceneRevisions(authority);

  return (
    <>
      <section className="workspace-step">
        <div className="workspace-step-label">
          08 · {t("scene.authorityTitle")}
        </div>
        <p className="muted forge-intro">
          {t("scene.authorityBody")}
        </p>

        <div className="scene-revision-list">
          {scenes.map((scene) => (
            <article key={scene.sceneId}>
              <div className="scene-revision-head">
                <div>
                  <span className="step">
                    {String(scene.index).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{scene.title}</h3>
                    <code>{scene.sceneId}</code>
                  </div>
                </div>
                <div className="scene-status-stack">
                  <span className="status candidate">
                    {scene.status}
                  </span>
                  <span className="revision-pill">
                    r{scene.revision}
                  </span>
                </div>
              </div>

              <div className="scene-event-lock">
                <span>{t("scene.eventLocked")}</span>
                <code>{scene.eventId}</code>
              </div>

              <div className="scene-field">
                <small>{t("forge.action")}</small>
                <p>{scene.action}</p>
              </div>

              <div className="scene-revision-actions">
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      approveSceneRevision(
                        authority,
                        scene.sceneId
                      )
                    )
                  }
                >
                  {t("scene.approve")}
                </button>

                <button
                  className="secondary"
                  type="button"
                  onClick={() =>
                    onChange(
                      regenerateScene(
                        authority,
                        scene.sceneId,
                        locale
                      )
                    )
                  }
                >
                  {t("scene.regenerate")}
                </button>

                <button
                  className="secondary"
                  type="button"
                  onClick={() =>
                    onChange(
                      regenerateScene(
                        authority,
                        scene.sceneId,
                        locale,
                        { alternative: true }
                      )
                    )
                  }
                >
                  {t("scene.alternative")}
                </button>

                <button
                  className="danger-button"
                  type="button"
                  onClick={() =>
                    onChange(
                      rejectSceneRevision(
                        authority,
                        scene.sceneId
                      )
                    )
                  }
                >
                  {t("scene.reject")}
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="scene-compile-zone">
          <p className="muted">
            {targetMedia === "WEBTOON"
              ? t("scene.compileBody")
              : t("scene.webtoonOnly")}
          </p>
          <button
            type="button"
            onClick={onCompile}
            disabled={targetMedia !== "WEBTOON"}
          >
            {t("scene.compileSelected")}
          </button>
        </div>
      </section>

      {webtoon ? (
        <section className="workspace-step">
          <div className="workspace-step-label">
            09 · {t("scene.selectedRealization")}
          </div>
          <p>
            {t("forge.panelCount")}:{" "}
            <strong>{webtoon.panelCount}</strong>
          </p>
          <p>
            {t("scene.selectedRevisions")}:{" "}
            <strong>
              {webtoon.selectedSceneRevisionIds.length}
            </strong>
          </p>
        </section>
      ) : null}

      <section className="workspace-step">
        <div className="workspace-step-label">
          10 · {t("scene.exports")}
        </div>
        <div className="workspace-actions">
          <button type="button" onClick={onExportAuthority}>
            {t("scene.exportAuthority")}
          </button>
          <button
            className="secondary"
            type="button"
            onClick={onExportTnir}
          >
            {t("forge.exportTnir")}
          </button>
          {webtoon ? (
            <button
              className="secondary"
              type="button"
              onClick={onExportWebtoon}
            >
              {t("forge.exportWebtoon")}
            </button>
          ) : null}
        </div>
      </section>
    </>
  );
}
