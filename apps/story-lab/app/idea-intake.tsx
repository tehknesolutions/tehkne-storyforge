"use client";

import { useMemo, useState } from "react";
import { useI18n } from "./i18n";

export function IdeaIntake() {
  const { t } = useI18n();
  const [idea, setIdea] = useState("");
  const normalized = idea.trim();
  const wordCount = useMemo(
    () => (normalized ? normalized.split(/\s+/).length : 0),
    [normalized]
  );

  return (
    <section className="intake-card" aria-labelledby="intake-title">
      <div className="eyebrow">{t("idea.eyebrow")}</div>
      <h2 id="intake-title">{t("idea.title")}</h2>
      <p className="muted">{t("idea.body")}</p>

      <textarea
        value={idea}
        onChange={(event) => setIdea(event.target.value)}
        placeholder={t("idea.placeholder")}
        rows={7}
        aria-label={t("idea.aria")}
      />

      <div className="intake-footer">
        <span>{wordCount} {t("idea.words")}</span>
        <button type="button" disabled={!normalized}>
          {t("idea.forge")}
        </button>
      </div>

      {normalized ? (
        <div className="candidate-preview">
          <span className="status candidate">{t("idea.candidate")}</span>
          <p>{normalized}</p>
        </div>
      ) : null}
    </section>
  );
}
