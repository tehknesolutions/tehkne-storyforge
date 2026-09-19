export type ReviewDecision = "APPROVE" | "EDIT" | "REJECT";

export interface ReviewState {
  id: string;
  status: "PENDING" | "APPROVED" | "EDIT_REQUIRED" | "REJECTED";
  decision?: ReviewDecision;
  notes?: string;
  reviewedAt?: string;
}

declare global {
  var __storyforgeReviewStates: Map<string, ReviewState> | undefined;
}

const states =
  globalThis.__storyforgeReviewStates ??
  new Map<string, ReviewState>([
    [
      "canon-proposal:grandmother-authored-lantern",
      {
        id: "canon-proposal:grandmother-authored-lantern",
        status: "PENDING"
      }
    ]
  ]);

if (process.env.NODE_ENV !== "production") {
  globalThis.__storyforgeReviewStates = states;
}

export function getReviewState(id: string): ReviewState | null {
  return states.get(id) ?? null;
}

export function listReviewStates(): ReviewState[] {
  return [...states.values()];
}

export function decideReview(
  id: string,
  decision: ReviewDecision,
  notes?: string
): ReviewState {
  const current = states.get(id);
  if (!current) throw new Error(`Review proposal not found: ${id}`);

  const status =
    decision === "APPROVE"
      ? "APPROVED"
      : decision === "EDIT"
        ? "EDIT_REQUIRED"
        : "REJECTED";

  const next: ReviewState = {
    ...current,
    status,
    decision,
    notes,
    reviewedAt: new Date().toISOString()
  };

  states.set(id, next);
  return next;
}
