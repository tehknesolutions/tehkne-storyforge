"use client";

import { useMemo, useState } from "react";

const EXAMPLE =
  "Two siblings discover an object that reveals a hidden passage beneath their home.";

export function IdeaIntake() {
  const [idea, setIdea] = useState("");
  const normalized = idea.trim();
  const wordCount = useMemo(
    () => (normalized ? normalized.split(/\s+/).length : 0),
    [normalized]
  );

  return (
    <section className="intake-card" aria-labelledby="intake-title">
      <div className="eyebrow">ALEF / INTENTION</div>
      <h2 id="intake-title">What do you imagine?</h2>
      <p className="muted">
        Start with a fragment, premise, dream, character, scene or world rule.
        Nothing becomes canon until you approve it.
      </p>

      <textarea
        value={idea}
        onChange={(event) => setIdea(event.target.value)}
        placeholder={EXAMPLE}
        rows={7}
        aria-label="Creative idea"
      />

      <div className="intake-footer">
        <span>{wordCount} words</span>
        <button type="button" disabled={!normalized}>
          Forge Story DNA
        </button>
      </div>

      {normalized ? (
        <div className="candidate-preview">
          <span className="status candidate">CANDIDATE</span>
          <p>{normalized}</p>
        </div>
      ) : null}
    </section>
  );
}
