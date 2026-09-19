"use client";

import type { SemanticAssertionLedger } from "@/lib/storyforge-v042";
import { useI18n } from "./i18n";

type Props = {
  ledger: SemanticAssertionLedger;
  onExport: () => void;
};

function statusClass(authority: string) {
  return authority === "IDEA"
    ? "canon"
    : authority === "GOVERNANCE"
      ? "governance"
      : "candidate";
}

export function SemanticAuthorityView({ ledger, onExport }: Props) {
  const { t } = useI18n();

  return (
    <section className="workspace-step semantic-authority-view">
      <div className="workspace-step-label">
        07.5 · {t("semantic.title")}
      </div>
      <p className="muted forge-intro">{t("semantic.body")}</p>

      <div className="semantic-summary">
        <div>
          <small>{t("semantic.total")}</small>
          <strong>{ledger.summary.total}</strong>
        </div>
        <div>
          <small>IDEA</small>
          <strong>{ledger.summary.idea}</strong>
        </div>
        <div>
          <small>CANDIDATE</small>
          <strong>{ledger.summary.candidate}</strong>
        </div>
        <div>
          <small>GOVERNANCE</small>
          <strong>{ledger.summary.governance}</strong>
        </div>
      </div>

      <div className="semantic-assertion-list">
        {ledger.assertions.map((item) => (
          <article key={item.id}>
            <div className="review-head">
              <div>
                <small>{item.scope}</small>
                <code>{item.fieldPath}</code>
              </div>
              <span className={`status ${statusClass(item.authority)}`}>
                {item.authority}
              </span>
            </div>

            <p>{item.text}</p>
            <small>{item.rationale}</small>

            <div className="semantic-meta">
              <span>{t("semantic.createdBy")}: {item.createdBy}</span>
              <span>
                {t("semantic.sourceClaims")}:{" "}
                {item.sourceClaimIds.length
                  ? item.sourceClaimIds.join(", ")
                  : "—"}
              </span>
            </div>
          </article>
        ))}
      </div>

      {ledger.entityTypeReview.length ? (
        <div className="semantic-entity-review">
          <h3>{t("semantic.entityTypeReview")}</h3>
          <p className="muted">{t("semantic.entityTypeBody")}</p>
          {ledger.entityTypeReview.map((item) => (
            <article key={item.entityId}>
              <div className="review-head">
                <code>{item.entityId}</code>
                <span className="status candidate">{item.status}</span>
              </div>
              <p>{item.rationale}</p>
              <small>
                {t("semantic.currentType")}: {item.currentType}
              </small>
              <p>
                {t("semantic.candidateTypes")}:{" "}
                {item.candidateTypes.join(" / ")}
              </p>
            </article>
          ))}
        </div>
      ) : null}

      <div className="workspace-actions">
        <button type="button" onClick={onExport}>
          {t("semantic.export")}
        </button>
      </div>
    </section>
  );
}
