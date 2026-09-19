import {
  decideReview,
  getReviewState,
  listReviewStates,
  type ReviewDecision
} from "@/lib/review-store";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (id === "_all") {
    return Response.json({
      mutationScope: "REVIEW_STATE_ONLY",
      canonMutationEnabled: false,
      items: listReviewStates()
    });
  }

  const state = getReviewState(id);
  if (!state) {
    return Response.json({ error: "REVIEW_NOT_FOUND" }, { status: 404 });
  }

  return Response.json({
    mutationScope: "REVIEW_STATE_ONLY",
    canonMutationEnabled: false,
    state
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const payload = (await request.json()) as {
    decision?: ReviewDecision;
    notes?: string;
  };

  if (!payload.decision || !["APPROVE", "EDIT", "REJECT"].includes(payload.decision)) {
    return Response.json({ error: "INVALID_REVIEW_DECISION" }, { status: 400 });
  }

  try {
    const state = decideReview(id, payload.decision, payload.notes);
    return Response.json({
      mutationScope: "REVIEW_STATE_ONLY",
      canonMutationEnabled: false,
      state,
      nextRequiredStep:
        payload.decision === "APPROVE"
          ? "EXPLICIT_CANON_COMMIT_NOT_IMPLEMENTED"
          : null
    });
  } catch (error) {
    return Response.json(
      {
        error: "REVIEW_UPDATE_FAILED",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 404 }
    );
  }
}
