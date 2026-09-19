"use client";

import { IdeaIntake } from "./idea-intake";
import { useI18n } from "./i18n";

const pipeline = [
  ["01", "pipeline.01.title", "pipeline.01.desc"],
  ["02", "pipeline.02.title", "pipeline.02.desc"],
  ["03", "pipeline.03.title", "pipeline.03.desc"],
  ["04", "pipeline.04.title", "pipeline.04.desc"],
  ["05", "pipeline.05.title", "pipeline.05.desc"],
  ["06", "pipeline.06.title", "pipeline.06.desc"],
  ["07", "pipeline.07.title", "pipeline.07.desc"],
  ["08", "pipeline.08.title", "pipeline.08.desc"]
] as const;

const targets = [
  "target.shortStory",
  "target.novel",
  "target.lightNovel",
  "target.manga",
  "target.webtoon",
  "target.manhwa",
  "target.manhua",
  "target.anime",
  "target.game",
  "target.visualNovel",
  "target.audioDrama"
] as const;

export default function HomePage() {
  const { t } = useI18n();

  return (
    <main>
      <header className="topbar">
        <div>
          <div className="brand">TEHKNÉ STORYFORGE</div>
          <div className="tagline">{t("brand.tagline")}</div>
        </div>
        <div className="status-row">
          <span className="status canon">{t("nav.canonFirst")}</span>
          <a className="review-link" href="/login">{t("nav.signIn")}</a>
          <a className="review-link" href="/authority-audit">{t("nav.audit")}</a>
          <a className="review-link" href="/generate">{t("nav.generate")}</a>
          <a className="review-link" href="/production">{t("nav.production")}</a>
          <a className="review-link" href="/game">{t("nav.playProbe")}</a>
          <a className="review-link" href="/review">{t("nav.review")}</a>
          <span className="version">Story Lab 0.3 RC1</span>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">{t("home.eyebrow")}</div>
          <h1>{t("home.heroTitle")}</h1>
          <p>{t("home.heroBody")}</p>
        </div>
        <div className="runtime-card">
          <div className="runtime-title">STORYFORGE V0.8 RC1</div>
          <strong>T-NIR V0.5 · T-PIR V0.1</strong>
          <code>AI → CANDIDATE → REVIEW → CANON</code>
          <span>{t("home.autoCanonOff")}</span>
        </div>
      </section>

      <IdeaIntake />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="eyebrow">{t("home.pipelineEyebrow")}</div>
            <h2>{t("home.pipelineTitle")}</h2>
          </div>
          <span className="muted">{t("home.traceable")}</span>
        </div>
        <div className="pipeline-grid">
          {pipeline.map(([step, title, description]) => (
            <article className="pipeline-card" key={step}>
              <span className="step">{step}</span>
              <h3>{t(title)}</h3>
              <p>{t(description)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block media-section">
        <div>
          <div className="eyebrow">{t("home.mediaEyebrow")}</div>
          <h2>{t("home.mediaTitle")}</h2>
          <p className="muted">{t("home.mediaBody")}</p>
        </div>
        <div className="target-cloud">
          {targets.map((target) => (
            <span key={target}>{t(target)}</span>
          ))}
        </div>
      </section>

      <footer>
        <span>TEHKNÉ Solutions · STORYFORGE</span>
        <span>{t("home.footer")}</span>
      </footer>
    </main>
  );
}
