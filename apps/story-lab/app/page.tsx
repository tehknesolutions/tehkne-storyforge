import { IdeaIntake } from "./idea-intake";

const pipeline = [
  ["01", "Intention", "Raw creator input"],
  ["02", "Story DNA", "Theme, tone, promise"],
  ["03", "Canon Graph", "World truth + provenance"],
  ["04", "Character Mind", "Beliefs, goals, plans"],
  ["05", "Event Graph", "Causality + timelines"],
  ["06", "Resolution", "Linear or interactive"],
  ["07", "Media Plan", "Native media grammar"],
  ["08", "Realization", "Generated artifact + assertions"]
];

const targets = [
  "Short Story",
  "Novel",
  "Light Novel",
  "Manga",
  "Webtoon",
  "Manhwa",
  "Manhua",
  "Anime",
  "Game",
  "Visual Novel",
  "Audio Drama"
];

export default function HomePage() {
  return (
    <main>
      <header className="topbar">
        <div>
          <div className="brand">TEHKNÉ STORYFORGE</div>
          <div className="tagline">Forge an idea into a universe.</div>
        </div>
        <div className="status-row">
          <span className="status canon">CANON-FIRST</span>
          <a className="review-link" href="/game">Play probe</a>
          <a className="review-link" href="/review">Review candidates</a>
          <span className="version">Story Lab 0.1</span>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">TEHKNÉ NARRATIVE ENGINE</div>
          <h1>One universe. Many media.</h1>
          <p>
            Build the canonical world once, then realize it as prose, manga,
            webtoon, anime, game or another medium without surrendering creator
            authority.
          </p>
        </div>
        <div className="runtime-card">
          <div className="runtime-title">STORYFORGE V0.6</div>
          <strong>T-NIR V0.5 · T-PIR V0.1</strong>
          <code>AI → CANDIDATE → REVIEW → CANON</code>
          <span>Automatic canon promotion: OFF</span>
        </div>
      </section>

      <IdeaIntake />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <div className="eyebrow">PIPELINE</div>
            <h2>From thought to realized media</h2>
          </div>
          <span className="muted">Traceable at every stage</span>
        </div>
        <div className="pipeline-grid">
          {pipeline.map(([step, title, description]) => (
            <article className="pipeline-card" key={step}>
              <span className="step">{step}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block media-section">
        <div>
          <div className="eyebrow">MEDIA COMPILERS</div>
          <h2>Native targets, not cosmetic aliases</h2>
          <p className="muted">
            Manga keeps page-turn rhythm. Webtoon keeps vertical-scroll pacing.
            Anime keeps shot timing. Interactive formats preserve choices.
          </p>
        </div>
        <div className="target-cloud">
          {targets.map((target) => (
            <span key={target}>{target}</span>
          ))}
        </div>
      </section>

      <footer>
        <span>TEHKNÉ Solutions · STORYFORGE</span>
        <span>Provider-agnostic · Canon-safe · Transmedia by design</span>
      </footer>
    </main>
  );
}
