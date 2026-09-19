"use client";

import { useState } from "react";

type ReviewStatus = "PENDING" | "APPROVED" | "EDIT_REQUIRED" | "REJECTED";

export function ReviewCard() {
  const proposalId = "canon-proposal:grandmother-authored-lantern";
  const [status, setStatus] = useState<ReviewStatus>("PENDING");
  const [message, setMessage] = useState(
    "No canon mutation has occurred."
  );
  const [busy, setBusy] = useState(false);

  async function decide(decision: "APPROVE" | "EDIT" | "REJECT") {
    setBusy(true);
    try {
      const response = await fetch(
        `/api/review/${encodeURIComponent(proposalId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision })
        }
      );

      const data = (await response.json()) as {
        state?: { status?: ReviewStatus };
        canonMutationEnabled?: boolean;
        nextRequiredStep?: string | null;
        error?: string;
      };

      if (!response.ok || !data.state?.status) {
        throw new Error(data.error ?? "Review update failed");
      }

      setStatus(data.state.status);
      setMessage(
        data.nextRequiredStep === "EXPLICIT_CANON_COMMIT_NOT_IMPLEMENTED"
          ? "Review approved. Canon commit remains disabled and requires a future explicit authority step."
          : "Review state updated. Canon remains unchanged."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="review-card">
      <div className="review-head">
        <span className={`status ${status === "PENDING" ? "candidate" : "canon"}`}>
          {status}
        </span>
        <code>{proposalId}</code>
      </div>

      <div className="triple">
        <div><small>SUBJECT</small><strong>Memory Lantern</strong></div>
        <div><small>PREDICATE</small><strong>wasCreatedBy</strong></div>
        <div><small>OBJECT</small><strong>Grandmother</strong></div>
      </div>

      <p>
        The current canon establishes that Grandmother hid the lantern, not
        that she created it.
      </p>

      <div className="canon-warning">
        Existing CANON: Memory Lantern → wasHiddenBy → Grandmother
      </div>

      <div className="review-actions">
        <button
          className="secondary"
          type="button"
          disabled={busy}
          onClick={() => decide("REJECT")}
        >
          Reject
        </button>
        <button
          className="secondary"
          type="button"
          disabled={busy}
          onClick={() => decide("EDIT")}
        >
          Edit
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => decide("APPROVE")}
        >
          Approve candidate
        </button>
      </div>

      <p className="muted footnote" role="status">
        {message}
      </p>
    </article>
  );
}
