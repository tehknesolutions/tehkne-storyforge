import {
  reviewStore,
  type ReviewDecision
} from "@/lib/review-store";

export const runtime = "nodejs";

function statusFor(error: unknown): number {
  return error instanceof Error && error.message === "AUTHENTICATION_REQUIRED"
    ? 401
    : 404;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const store = await reviewStore();

    if (id === "_all") {
      return Response.json({
        mutationScope: "REVIEW_STATE_ONLY",
        canonMutationEnabled: false,
        durability: store.durability,
        items: await store.list()
      });
    }

    const state = await store.get(id);
    if (!state) {
      return Response.json(
        { error: "REVIEW_NOT_FOUND" },
        { status: 404 }
      );
    }

    return Response.json({
      mutationScope: "REVIEW_STATE_ONLY",
      canonMutationEnabled: false,
      durability: store.durability,
      state
    });
  } catch (error) {
    return Response.json(
      {
        error: "REVIEW_READ_FAILED",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: statusFor(error) }
    );
  }
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

  if (
    !payload.decision ||
    !["APPROVE", "EDIT", "REJECT"].includes(payload.decision)
  ) {
    return Response.json(
      { error: "INVALID_REVIEW_DECISION" },
      { status: 400 }
    );
  }

  try {
    const store = await reviewStore();
    const state = await store.decide(id, payload.decision, payload.notes);

    return Response.json({
      mutationScope: "REVIEW_STATE_ONLY",
      canonMutationEnabled: false,
      durability: store.durability,
      canonCommitAvailable:
        store.durability === "DURABLE" &&
        state.status === "APPROVED" &&
        Boolean(state.updatedAt),
      state,
      nextRequiredStep:
        payload.decision === "APPROVE"
          ? store.durability === "DURABLE"
            ? "EXPLICIT_CANON_COMMIT_REQUIRED"
            : "DURABLE_BACKEND_REQUIRED_FOR_CANON_COMMIT"
          : null
    });
  } catch (error) {
    return Response.json(
      {
        error: "REVIEW_UPDATE_FAILED",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: statusFor(error) }
    );
  }
}
