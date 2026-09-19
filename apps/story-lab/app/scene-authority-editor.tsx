"use client";

import { useMemo, useState } from "react";
import {
  approveSceneRevision,
  regenerateScene,
  rejectSceneRevision,
  reviseScene,
  selectSceneRevision,
  selectedSceneRevisions,
  updateDialogueLine,
  type SceneAuthorityWorkspace,
  type SceneRevision,
  type V04WebtoonRealization
} from "@/lib/storyforge-v04";
import type { StoryLocale } from "@/lib/storyforge-local";
import { useI18n } from "./i18n";

type Props = {
  authority: SceneAuthorityWorkspace;
  locale: StoryLocale;
  webtoon: V04WebtoonRealization | null;
  onChange: (next: SceneAuthorityWorkspace) => void;
  onCompile: () => void;
  onExportAuthority: () => void;
  onExportTnir: () => void;
  onExportWebtoon: () => void;
};

type EditState = {
  sceneId: string;
  title: string;
  dramaticPurpose: string;
  action: string;
  dialogue: string;
} | null;

function statusClass(status: SceneRevision["status"]) {
  return status === "APPROVED_LOCAL" ? "canon" : "candidate";
}

export function SceneAuthorityEditor({
  authority,
  locale,
  webtoon,
  onChange,
  onCompile,
  onExportAuthority,
  onExportTnir,
  onExportWebtoon
}: Props) {
  const { t } = useI18n();
  const [editing, setEditing] = useState<EditState>(null);

  const selected = useMemo(
    () => selectedSceneRevisions(authority),
    [authority]
  );

  const approvedCount = selected.filter(
    (scene) => scene.status === "APPROVED_LOCAL"
  ).length;
  const rejectedCount = selected.filter(
    (scene) => scene.status === "REJECTED"
  ).length;

  function startEdit(scene: SceneRevision) {
    setEditing({
      sceneId: scene.sceneId,
      title: scene.title,
      dramaticPurpose: scene.dramaticPurpose,
      action: scene.action,
      dialogue: scene.dialogue[0]?.text ?? ""
    });
  }

  function saveEdit(scene: SceneRevision) {
    if (!editing || editing.sceneId !== scene.sceneId) return;

    const dialogue = scene.dialogue.map((line, index) =>
      index === 0
        ? {
            ...line,
            text: editing.dialogue,
            status: "CANDIDATE" as const
          }
        : line
    );

    onChange(
      reviseScene(
        authority,
        scene.sceneId,
        {
          title: editing.title,
          dramaticPurpose: editing.dramaticPurpose,
          action: editing.action,
          dialogue
        },
        t("scene.manualRevisionRationale")
      )
    );
    setEditing(null);
  }

  return (
    <>
      <div className="workspace-step scene-authority-shell">
        <div className="workspace-step-label">
          08 · {t("scene.authorityTitle")}
        </div>
        <p className="muted forge-intro">{t("scene.authorityBody")}</p>

        <div className="scene-authority-summary">
          <div>
            <small>{t("scene.total")}</small>
            <strong>{selected.length}</strong>
          </div>
          <div>
            <small>{t("scene.approved")}</small>
            <strong>{approvedCount}</strong>
          </div>
          <div>
            <small>{t("scene.rejected")}</small>
            <strong>{rejectedCount}</strong>
          </div>
          <div>
            <small>{t("scene.version")}</small>
            <strong>{authority.version}</strong>
          </div>
        </div>

        <div className="scene-revision-list">
          {selected.map((scene) => {
            const entry = authority.sceneIndex[scene.sceneId];
            const isEditing = editing?.sceneId === scene.sceneId;

            return (
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
                    <span className={`status ${statusClass(scene.status)}`}>
                      {scene.status}
                    </span>
                    <span className="revision-pill">r{scene.revision}</span>
                  </div>
                </div>

                <div className="scene-event-lock">
                  <span>{t("scene.eventLocked")}</span>
                  <code>{scene.eventId}</code>
                </div>

                <div className="revision-history">
                  <small>{t("scene.history")}</small>
                  <div>
                    {entry?.revisionIds.map((revisionId) => {
                      const revision = authority.revisions[revisionId];
                      if (!revision) return null;
                      const selectedRevision =
                        entry.selectedRevisionId === revisionId;

                      return (
                        <button
                          type="button"
                          key={revisionId}
                          className={
                            selectedRevision
                              ? "revision-button active"
                              : "revision-button"
                          }
                          onClick={() =>
                            onChange(
                              selectSceneRevision(
                                authority,
                                scene.sceneId,
                                revisionId
                              )
                            )
                          }
                        >
                          r{revision.revision} · {revision.status}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isEditing && editing ? (
                  <div className="scene-edit-form">
                    <label>
                      <span>{t("scene.titleField")}</span>
                      <input
                        value={editing.title}
                        onChange={(event) =>
                          setEditing({
                            ...editing,
                            title: event.target.value
                          })
                        }
                      />
                    </label>

                    <label>
                      <span>{t("scene.purposeField")}</span>
                      <textarea
                        rows={3}
                        value={editing.dramaticPurpose}
                        onChange={(event) =>
                          setEditing({
                            ...editing,
                            dramaticPurpose: event.target.value
                          })
                        }
                      />
                    </label>

                    <label>
                      <span>{t("scene.actionField")}</span>
                      <textarea
                        rows={4}
                        value={editing.action}
                        onChange={(event) =>
                          setEditing({
                            ...editing,
                            action: event.target.value
                          })
                        }
                      />
                    </label>

                    <label>
                      <span>{t("scene.dialogueField")}</span>
                      <textarea
                        rows={3}
                        value={editing.dialogue}
                        onChange={(event) =>
                          setEditing({
                            ...editing,
                            dialogue: event.target.value
                          })
                        }
                      />
                    </label>

                    <div className="scene-edit-actions">
                      <button
                        type="button"
                        onClick={() => saveEdit(scene)}
                      >
                        {t("scene.saveRevision")}
                      </button>
                      <button
                        className="secondary"
                        type="button"
                        onClick={() => setEditing(null)}
                      >
                        {t("scene.cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="scene-field">
                      <small>{t("forge.dramaticPurpose")}</small>
                      <p>{scene.dramaticPurpose}</p>
                    </div>

                    <div className="scene-field">
                      <small>{t("forge.action")}</small>
                      <p>{scene.action}</p>
                    </div>

                    <div className="scene-source-claims">
                      <small>{t("scene.sourceClaims")}</small>
                      <div>
                        {scene.sourceClaimIds.map((claimId) => (
                          <code key={claimId}>{claimId}</code>
                        ))}
                      </div>
                    </div>

                    <div className="dialogue-block">
                      <small>{t("forge.dialogue")}</small>
                      {scene.dialogue.length ? (
                        scene.dialogue.map((line) => (
                          <div className="dialogue-revision-row" key={line.id}>
                            <p>
                              <strong>{line.speakerName}:</strong> {line.text}
                            </p>
                            <div>
                              <span
                                className={`status ${
                                  line.status === "APPROVED_LOCAL"
                                    ? "canon"
                                    : "candidate"
                                }`}
                              >
                                {line.status}
                              </span>
                              {line.status !== "APPROVED_LOCAL" ? (
                                <button
                                  className="micro-button"
                                  type="button"
                                  onClick={() =>
                                    onChange(
                                      updateDialogueLine(
                                        authority,
                                        scene.sceneId,
                                        line.id,
                                        { status: "APPROVED_LOCAL" }
                                      )
                                    )
                                  }
                                >
                                  {t("scene.approveLine")}
                                </button>
                              ) : null}
                              {line.status !== "REJECTED" ? (
                                <button
                                  className="micro-button secondary"
                                  type="button"
                                  onClick={() =>
                                    onChange(
                                      updateDialogueLine(
                                        authority,
                                        scene.sceneId,
                                        line.id,
                                        { status: "REJECTED" }
                                      )
                                    )
                                  }
                                >
                                  {t("scene.rejectLine")}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="muted">{t("scene.noDialogue")}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="scene-revision-actions">
                  {scene.status !== "APPROVED_LOCAL" ? (
                    <button
                      type="button"
                      onClick={() =>
                        onChange(
                          approveSceneRevision(authority, scene.sceneId)
                        )
                      }
                    >
                      {t("scene.approve")}
                    </button>
                  ) : null}

                  <button
                    className="secondary"
                    type="button"
                    onClick={() => startEdit(scene)}
                  >
                    {t("scene.edit")}
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

                  {scene.status !== "REJECTED" ? (
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() =>
                        onChange(
                          rejectSceneRevision(authority, scene.sceneId)
                        )
                      }
                    >
                      {t("scene.reject")}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        <div className="scene-compile-zone">
          <p className="muted">{t("scene.compileBody")}</p>
          <button type="button" onClick={onCompile}>
            {t("scene.compileSelected")}
          </button>
        </div>
      </div>

      {webtoon ? (
        <div className="workspace-step">
          <div className="workspace-step-label">
            09 · {t("scene.selectedRealization")}
          </div>

          <div className="webtoon-summary">
            <div>
              <small>{t("forge.episode")}</small>
              <h3>{webtoon.title}</h3>
            </div>
            <div>
              <small>{t("forge.panelCount")}</small>
              <strong>{webtoon.panelCount}</strong>
            </div>
            <div>
              <small>{t("scene.selectedRevisions")}</small>
              <strong>{webtoon.selectedSceneRevisionIds.length}</strong>
            </div>
            <span className="status candidate">{webtoon.authority}</span>
          </div>

          <div className="webtoon-panel-list">
            {webtoon.panels.map((panel) => (
              <article key={panel.id}>
                <div className="review-head">
                  <span className="step">
                    {String(panel.index).padStart(2, "0")}
                  </span>
                  <code>{panel.kind}</code>
                </div>
                <p>{panel.visualIntent}</p>
                {panel.text ? (
                  <blockquote>
                    {panel.speakerName ? (
                      <strong>{panel.speakerName}: </strong>
                    ) : null}
                    {panel.text}
                  </blockquote>
                ) : null}
                <div className="panel-meta">
                  <span>{panel.eventId}</span>
                  <span>{panel.sceneRevisionId}</span>
                  <span>
                    {t("forge.scrollGap")}: {panel.scrollGapAfter}px
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <div className="workspace-step">
        <div className="workspace-step-label">
          10 · {t("scene.exports")}
        </div>
        <p className="muted forge-intro">{t("scene.exportsBody")}</p>
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
      </div>
    </>
  );
}
