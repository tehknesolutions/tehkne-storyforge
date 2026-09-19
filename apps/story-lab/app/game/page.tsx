"use client";

import { useState } from "react";
import { useI18n } from "../i18n";

export default function GamePage() {
  const { t } = useI18n();
  const [branch, setBranch] = useState<"descend" | "return" | null>(null);

  const root = [
    t("game.event1"),
    t("game.event2"),
    t("game.event3"),
    t("game.event4")
  ];

  return (
    <main className="review-shell">
      <a className="back-link" href="/">{t("common.back")}</a>
      <div className="eyebrow">{t("game.eyebrow")}</div>
      <h1>{t("game.title")}</h1>
      <p className="muted review-intro">{t("game.body")}</p>

      <ol className="game-events">
        {root.map((event) => (
          <li key={event}>{event}</li>
        ))}
      </ol>

      {!branch ? (
        <section className="review-card">
          <div className="eyebrow">{t("game.choiceEyebrow")}</div>
          <h2>{t("game.choiceTitle")}</h2>
          <div className="game-choice-grid">
            <button type="button" onClick={() => setBranch("descend")}>
              {t("game.descend")}
            </button>
            <button
              className="secondary"
              type="button"
              onClick={() => setBranch("return")}
            >
              {t("game.return")}
            </button>
          </div>
        </section>
      ) : (
        <section className="review-card">
          <span className="status canon">BRANCH:{branch.toUpperCase()}</span>
          <h2>
            {branch === "descend"
              ? t("game.descendResult")
              : t("game.returnResult")}
          </h2>
          <p className="muted">
            {branch === "descend"
              ? t("game.descendState")
              : t("game.returnState")}
          </p>
          <button type="button" onClick={() => setBranch(null)}>
            {t("game.replay")}
          </button>
        </section>
      )}
    </main>
  );
}
