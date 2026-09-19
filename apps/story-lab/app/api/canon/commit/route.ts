import { isSupabaseConfigured } from "@/lib/supabase/env";
import { requireAuthenticatedContext } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      {
        error: "DURABLE_BACKEND_NOT_CONFIGURED",
        canonMutationPerformed: false
      },
      { status: 503 }
    );
  }

  const payload = (await request.json()) as {
    reviewId?: string;
    expectedUpdatedAt?: string;
    confirmation?: string;
  };

  if (
    !payload.reviewId ||
    !payload.expectedUpdatedAt ||
    payload.confirmation !== "COMMIT TO CANON"
  ) {
    return Response.json(
      {
        error: "EXPLICIT_CANON_CONFIRMATION_REQUIRED",
        requiredConfirmation: "COMMIT TO CANON",
        canonMutationPerformed: false
      },
      { status: 400 }
    );
  }

  try {
    const { supabase, user } = await requireAuthenticatedContext();

    const { data, error } = await supabase.rpc(
      "storyforge_commit_canon_proposal",
      {
        p_review_id: payload.reviewId,
        p_expected_updated_at: payload.expectedUpdatedAt
      }
    );

    if (error) {
      return Response.json(
        {
          error: "CANON_COMMIT_FAILED",
          message: error.message,
          canonMutationPerformed: false
        },
        { status: 409 }
      );
    }

    return Response.json({
      canonMutationPerformed: true,
      actorUserId: user.id,
      result: data
    });
  } catch (error) {
    return Response.json(
      {
        error: "CANON_COMMIT_AUTH_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
        canonMutationPerformed: false
      },
      { status: 401 }
    );
  }
}
