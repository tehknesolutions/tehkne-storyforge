"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "../i18n";

type ReviewStatus =
  | "PENDING"
  | "APPROVED"
  | "EDIT_REQUIRED"
  | "REJECTED"
  | "COMMITTED";

type ReviewItem = {
  id: string;
  status: ReviewStatus;
  decision?: "APPROVE" | "EDIT" | "REJECT";
  notes?: string;
  updatedAt: string;
  proposal?: {
    subject?: string;
    predicate?: string;
    object?: unknown;
    rationale?: string;
    authority?: string;
  };
};

export function ReviewCard() {
  const { t } = useI18n();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [durability, setDurability] = useState<"EPHEMERAL" | "DURABLE">("EPHEMERAL");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmations, setConfirmations] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const response = await fetch("/api/review/_all", { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error ?? t("review.unavailable"));
      return;
    }

    setItems(data.items ?? []);
    setDurability(data.durability ?? "EPHEMERAL");
    setMessage(data.items?.length ? t("review.loaded") : t("review.empty"));
  }, [t]);

  useEffect(() => {
    setMessage(t("review.loading"));
    void load();
  }, [load, t]);

  async function decide(
    item: ReviewItem,
    decision: "APPROVE" | "EDIT" | "REJECT"
  ) {
    setBusyId(item.id);

    try {
      const response = await fetch(
        `/api/review/${encodeURIComponent(item.id)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision })
        }
      );
      const data = await response.json();

      if (!response.ok || !data.state) {
        setMessage(data.error ?? t("review.updateFailed"));
        return;
      }

      setItems((current) =>
        current.map((candidate) =>
          candidate.id === item.id ? data.state : candidate
        )
      );

      setDurability(data.durability ?? durability);
      setMessage(
        data.nextRequiredStep === "EXPLICIT_CANON_COMMIT_REQUIRED"
          ? t("review.approvedCommit")
          : data.nextRequiredStep === "DURABLE_BACKEND_REQUIRED_FOR_CANON_COMMIT"
            ? t("review.approvedPreview")
            : t("review.updated")
      );
    } finally {
      setBusyId(null);
    }
  }

  async function commit(item: ReviewItem) {
    setBusyId(item.id);

    try {
      const response = await fetch("/api/canon/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: item.id,
          expectedUpdatedAt: item.updatedAt,
          confirmation: confirmations[item.id] ?? ""
        })
      });
      const data = await response.json();

      if (!response.ok || !data.canonMutationPerformed) {
        setMessage(data.error ?? t("review.commitFailed"));
        return;
      }

      setMessage(
        `${t("review.committed")}: ${data.result?.canonFactId ?? "fact"}.`
      );
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="job-list">
      <div className="review-head">
        <span className={`status ${durability === "DURABLE" ? "canon" : "candidate"}`}>
          {t("review.store")}:{durability}
        </span>
        <span className="muted">{message}</span>
      </div>

      {items.map((item) => {
        const proposal = item.proposal ?? {};
        const busy = busyId === item.id;
        const commitReady = durability === "DURABLE" && item.status === "APPROVED";

        return (
          <article className="review-card" key={item.id}>
            <div className="review-head">
              <span
                className={`status ${
                  item.status === "PENDING" || item.status === "EDIT_REQUIRED"
                    ? "candidate"
                    : "canon"
                }`}
              >
                {item.status}
              </span>
              <code>{item.id}</code>
            </div>

            <div className="triple">
              <div>
                <small>{t("review.subject")}</small>
                <strong>{String(proposal.subject ?? "—")}</strong>
              </div>
              <div>
                <small>{t("review.predicate")}</small>
                <strong>{String(proposal.predicate ?? "—")}</strong>
              </div>
              <div>
                <small>{t("review.object")}</small>
                <strong>{JSON.stringify(proposal.object ?? null)}</strong>
              </div>
            </div>

            <p>{String(proposal.rationale ?? t("review.noRationale"))}</p>

            {item.status !== "COMMITTED" ? (
              <div className="review-actions">
                <button className="secondary" type="button" disabled={busy} onClick={() => decide(item, "REJECT")}>
                  {t("review.reject")}
                </button>
                <button className="secondary" type="button" disabled={busy} onClick={() => decide(item, "EDIT")}>
                  {t("review.edit")}
                </button>
                <button type="button" disabled={busy} onClick={() => decide(item, "APPROVE")}>
                  {t("review.approve")}
                </button>
              </div>
            ) : null}

            {commitReady ? (
              <div className="canon-commit-zone">
                <div className="eyebrow">{t("review.commitEyebrow")}</div>
                <p className="muted">
                  {t("review.commitBody")}
                </p>
                <input
                  value={confirmations[item.id] ?? ""}
                  onChange={(event) =>
                    setConfirmations((current) => ({
                      ...current,
                      [item.id]: event.target.value
                    }))
                  }
                  autoComplete="off"
                  placeholder="COMMIT TO CANON"
                />
                <button
                  type="button"
                  disabled={busy || confirmations[item.id] !== "COMMIT TO CANON"}
                  onClick={() => commit(item)}
                >
                  {t("review.commitButton")}
                </button>
              </div>
            ) : null}
          </article>
        );
      })}

      {!items.length ? (
        <article className="review-card">
          <p>{t("review.noItems")}</p>
        </article>
      ) : null}
    </div>
  );
}
