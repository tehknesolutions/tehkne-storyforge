"use client";

import type { NarrativeForgeV03 } from "@/lib/storyforge-v03";
import { useI18n } from "./i18n";

type Props = {
  forge: NarrativeForgeV03;
  onExportForge: () => void;
  onExportTnir: () => void;
  onExportWebtoon: () => void;
};

export function NarrativeForgeView({
  forge,
  onExportForge,
  onExportTnir,
  onExportWebtoon
}: Props) {
  const { t } = useI18n();

  return (
    <>
      <div className="workspace-step">
        <div className="workspace-step-label">
          07 · {t("forge.claimLedger")}
        </div>
        <p className="muted forge-intro">{t("forge.claimLedgerBody")}</p>

        <div className="claim-ledger">
          {forge.claims.map((claim) => (
            <article key={claim.id}>
              <div className="review-head">
                <code>{claim.id}</code>
                <span
                  className={`status ${
                    claim.authority === "IDEA" ? "canon" : "candidate"
                  }`}
                >
                  {claim.authority}
                </span>
              </div>
              <p>{claim.text}</p>
              <small>{claim.rationale}</small>
            </article>
          ))}
        </div>
      </div>

      <div className="workspace-step">
        <div className="workspace-step-label">
          08 · {t("forge.scenes")}
        </div>
        <p className="muted forge-intro">{t("forge.scenesBody")}</p>

        <div className="scene-forge-list">
          {forge.scenes.map((scene) => (
            <article key={scene.id}>
              <div className="scene-forge-head">
                <div>
                  <span className="step">
                    {String(scene.index).padStart(2, "0")}
                  </span>
                  <h3>{scene.title}</h3>
                </div>
                <span
                  className={`status ${
                    scene.eventAuthority === "SOURCE"
                      ? "canon"
                      : "candidate"
                  }`}
                >
                  {scene.eventAuthority}
                </span>
              </div>

              <div className="scene-field">
                <small>{t("forge.dramaticPurpose")}</small>
                <p>{scene.dramaticPurpose}</p>
              </div>

              <div className="scene-field">
                <small>{t("forge.action")}</small>
                <p>{scene.action}</p>
              </div>

              <div className="scene-beats">
                {scene.beats.map((beat) => (
                  <div key={beat.id}>
                    <span>{beat.type}</span>
                    <p>{beat.purpose}</p>
                  </div>
                ))}
              </div>

              <div className="dialogue-block">
                <small>{t("forge.dialogue")}</small>
                {scene.dialogue.map((line) => (
                  <p key={line.id}>
                    <strong>{line.speakerName}:</strong> {line.text}
                    <span className="dialogue-authority">CANDIDATE</span>
                  </p>
                ))}
              </div>

              {scene.informationWithheld.length ? (
                <div className="scene-withheld">
                  <small>{t("forge.withheld")}</small>
                  <p>{scene.informationWithheld.join(" · ")}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      {forge.webtoon ? (
        <div className="workspace-step">
          <div className="workspace-step-label">
            09 · {t("forge.webtoon")}
          </div>
          <div className="webtoon-summary">
            <div>
              <small>{t("forge.episode")}</small>
              <h3>{forge.webtoon.title}</h3>
            </div>
            <div>
              <small>{t("forge.panelCount")}</small>
              <strong>{forge.webtoon.panelCount}</strong>
            </div>
            <span className="status candidate">
              {forge.webtoon.authority}
            </span>
          </div>

          <div className="webtoon-sequences">
            {forge.scenes.map((scene) => {
              const panels = forge.webtoon?.panels.filter(
                (panel) => panel.sceneId === scene.id
              ) ?? [];

              return (
                <section key={scene.id}>
                  <div className="webtoon-sequence-head">
                    <span>SEQ {String(scene.index).padStart(2, "0")}</span>
                    <strong>{scene.title}</strong>
                    <small>{panels.length} panels</small>
                  </div>

                  <div className="webtoon-panel-list">
                    {panels.map((panel) => (
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
                          <span>
                            {t("forge.scrollGap")}: {panel.scrollGapAfter}px
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="workspace-step">
        <div className="workspace-step-label">
          10 · {t("forge.exports")}
        </div>
        <p className="muted forge-intro">{t("forge.exportsBody")}</p>
        <div className="workspace-actions">
          <button type="button" onClick={onExportForge}>
            {t("forge.exportForge")}
          </button>
          <button className="secondary" type="button" onClick={onExportTnir}>
            {t("forge.exportTnir")}
          </button>
          {forge.webtoon ? (
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
