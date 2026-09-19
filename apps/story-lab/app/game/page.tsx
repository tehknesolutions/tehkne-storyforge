"use client";

import { useState } from "react";

const ROOT = [
  "Lia and Leo discover the Memory Lantern.",
  "The lantern activates and reacts to the cellar wall.",
  "A hidden passage opens.",
  "Inside the tunnel they discover Grandmother's mark."
];

export default function GamePage() {
  const [branch, setBranch] = useState<"descend" | "return" | null>(null);

  return (
    <main className="review-shell">
      <a className="back-link" href="/">← Story Lab</a>
      <div className="eyebrow">GAME EXPORT / RUNTIME PROBE</div>
      <h1>First Light — playable branch</h1>
      <p className="muted review-intro">
        This prototype uses the same reference Choice and branch semantics as
        STORYFORGE_GAME_JSON. Candidate events and CanonProposals are excluded.
      </p>

      <ol className="game-events">
        {ROOT.map((event) => (
          <li key={event}>{event}</li>
        ))}
      </ol>

      {!branch ? (
        <section className="review-card">
          <div className="eyebrow">CHOICE</div>
          <h2>What should Lia and Leo do?</h2>
          <div className="game-choice-grid">
            <button type="button" onClick={() => setBranch("descend")}>
              Descend together
            </button>
            <button
              className="secondary"
              type="button"
              onClick={() => setBranch("return")}
            >
              Seal the passage and return
            </button>
          </div>
        </section>
      ) : (
        <section className="review-card">
          <span className="status canon">BRANCH:{branch.toUpperCase()}</span>
          <h2>
            {branch === "descend"
              ? "They continue deeper together."
              : "They return to the house and defer the mystery."}
          </h2>
          <p className="muted">
            {branch === "descend"
              ? "StateTransition: sibling relationship intensity +0.1."
              : "StateTransition: worldState.mysteryDeferred = true."}
          </p>
          <button type="button" onClick={() => setBranch(null)}>
            Replay choice
          </button>
        </section>
      )}
    </main>
  );
}
