"use client";

import { useCallback, useEffect, useState } from "react";

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
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [durability, setDurability] = useState<"EPHEMERAL" | "DURABLE">(
    "EPHEMERAL"
  );
  const [message, setMessage] = useState("Loading review queue…");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmations, setConfirmations] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const response = await fetch("/api/review/_all", { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error ?? "Review queue unavailable.");
      return;
    }

    setItems(data.items ?? []);
    setDurability(data.durability ?? "EPHEMERAL");
    setMessage(
      data.items?.length
        ? "Creator Authority queue loaded."
        : "No CanonProposals are waiting for review."
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
        setMessage(data.error ?? "Review update failed.");
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
          ? "Review approved. A separate explicit Canon commit is now available."
          : data.nextRequiredStep === "DURABLE_BACKEND_REQUIRED_FOR_CANON_COMMIT"
            ? "Review approved in preview only. Durable backend is required for Canon commit."
            : "Review state updated. Canon remains unchanged."
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
        setMessage(data.error ?? "Canon commit failed.");
        return;
      }

      setMessage(
        `CANON committed transactionally: ${data.result?.canonFactId ?? "fact created"}.`
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
          REVIEW STORE:{durability}
        </span>
        <span className="muted">{message}</span>
      </div>

      {items.map((item) => {
        const proposal = item.proposal ?? {};
        const busy = busyId === item.id;
        const commitReady =
          durability === "DURABLE" && item.status === "APPROVED";

        return (
          <article className="review-card" key={item.id}>
            <div className="review-head">
              <span
                className={`status ${
                  item.status === "PENDING" ||
                  item.status === "EDIT_REQUIRED"
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
                <small>SUBJECT</small>
                <strong>{String(proposal.subject ?? "—")}</strong>
              </div>
              <div>
                <small>PREDICATE</small>
                <strong>{String(proposal.predicate ?? "—")}</strong>
              </div>
              <div>
                <small>OBJECT</small>
                <strong>{JSON.stringify(proposal.object ?? null)}</strong>
              </div>
            </div>

            <p>{String(proposal.rationale ?? "No rationale supplied.")}</p>

            {item.status !== "COMMITTED" ? (
              <div className="review-actions">
                <button
                  className="secondary"
                  type="button"
                  disabled={busy}
                  onClick={() => decide(item, "REJECT")}
                >
                  Reject
                </button>
                <button
                  className="secondary"
                  type="button"
                  disabled={busy}
                  onClick={() => decide(item, "EDIT")}
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => decide(item, "APPROVE")}
                >
                  Approve review
                </button>
              </div>
            ) : null}

            {commitReady ? (
              <div className="canon-commit-zone">
                <div className="eyebrow">EXPLICIT CANON COMMIT</div>
                <p className="muted">
                  Type <code>COMMIT TO CANON</code>. This is a separate,
                  transactional authority action.
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
                  disabled={
                    busy ||
                    confirmations[item.id] !== "COMMIT TO CANON"
                  }
                  onClick={() => commit(item)}
                >
                  Commit approved proposal to CANON
                </button>
              </div>
            ) : null}
          </article>
        );
      })}

      {!items.length ? (
        <article className="review-card">
          <p>No review items are currently available.</p>
        </article>
      ) : null}
    </div>
  );
}
