import { productionStore } from "@/lib/production-store";

export const runtime = "nodejs";

const STAGES = [
  "PLAN",
  "BRIEF",
  "GENERATE",
  "VALIDATE",
  "REVIEW",
  "APPROVE",
  "EXPORT"
] as const;

const STATUSES = [
  "QUEUED",
  "RUNNING",
  "BLOCKED",
  "REVIEW_REQUIRED",
  "APPROVED",
  "REJECTED",
  "FAILED",
  "COMPLETE"
] as const;

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
    const store = await productionStore();
    const job = await store.getJob(id);

    if (!job) {
      return Response.json(
        { error: "PRODUCTION_JOB_NOT_FOUND" },
        { status: 404 }
      );
    }

    return Response.json({
      durability: store.durability,
      productionSafe: store.durability === "DURABLE",
      job
    });
  } catch (error) {
    return Response.json(
      {
        error: "PRODUCTION_JOB_READ_FAILED",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: statusFor(error) }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const payload = (await request.json()) as {
    stage?: string;
    status?: string;
    providerId?: string;
    adapterId?: string;
  };

  if (payload.stage && !STAGES.includes(payload.stage as (typeof STAGES)[number])) {
    return Response.json(
      { error: "INVALID_PRODUCTION_STAGE" },
      { status: 400 }
    );
  }

  if (payload.status && !STATUSES.includes(payload.status as (typeof STATUSES)[number])) {
    return Response.json(
      { error: "INVALID_PRODUCTION_STATUS" },
      { status: 400 }
    );
  }

  try {
    const store = await productionStore();
    const job = await store.updateJob(id, {
      ...(payload.stage ? { stage: payload.stage as never } : {}),
      ...(payload.status ? { status: payload.status as never } : {}),
      ...(payload.providerId !== undefined
        ? { providerId: payload.providerId }
        : {}),
      ...(payload.adapterId !== undefined
        ? { adapterId: payload.adapterId }
        : {}),
      updatedAt: new Date().toISOString()
    });

    return Response.json({
      durability: store.durability,
      productionSafe: store.durability === "DURABLE",
      job
    });
  } catch (error) {
    return Response.json(
      {
        error: "PRODUCTION_JOB_UPDATE_FAILED",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: statusFor(error) }
    );
  }
}
