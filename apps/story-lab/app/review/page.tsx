"use client";

import { ReviewCard } from "./review-card";
import { useI18n } from "../i18n";

export default function ReviewPage() {
  const { t } = useI18n();

  return (
    <main className="review-shell">
      <a className="back-link" href="/">{t("common.back")}</a>
      <div className="eyebrow">{t("review.eyebrow")}</div>
      <h1>{t("review.title")}</h1>
      <p className="muted review-intro">{t("review.body")}</p>

      <ReviewCard />

      <p className="muted footnote">{t("review.footnote")}</p>
    </main>
  );
}
