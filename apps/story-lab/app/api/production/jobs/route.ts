import { productionStore } from "@/lib/production-store";
import type { PreviewProductionJob as ProductionJob } from "@/lib/production-types";

export const runtime = "nodejs";

export async function GET() {
  const store = productionStore();
  return Response.json({
    durability: store.durability,
    productionSafe: store.durability === "DURABLE",
    jobs: await store.listJobs()
  });
}

export async function POST(request: Request) {
  const store = productionStore();
  const payload = (await request.json()) as Partial<ProductionJob>;

  if (
    typeof payload.id !== "string" ||
    typeof payload.targetMedia !== "string" ||
    !payload.source ||
    typeof payload.source.universeId !== "string" ||
    typeof payload.source.universeVersion !== "string" ||
    typeof payload.source.storyId !== "string"
  ) {
    return Response.json(
      { error: "INVALID_PRODUCTION_JOB" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const job: ProductionJob = {
    id: payload.id,
    targetMedia: payload.targetMedia,
    stage: payload.stage ?? "PLAN",
    status: payload.status ?? "QUEUED",
    source: payload.source,
    providerId: payload.providerId,
    adapterId: payload.adapterId,
    assetRequests: payload.assetRequests ?? [],
    createdAt: payload.createdAt ?? now,
    updatedAt: now
  } as ProductionJob;

  try {
    const created = await store.createJob(job);
    return Response.json(
      {
        durability: store.durability,
        productionSafe: store.durability === "DURABLE",
        job: created
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      {
        error: "PRODUCTION_JOB_CREATE_FAILED",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 409 }
    );
  }
}
