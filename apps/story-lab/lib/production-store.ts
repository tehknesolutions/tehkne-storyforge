import type { SupabaseClient } from "@supabase/supabase-js";
import type { PreviewProductionJob as ProductionJob } from "./production-types";
import { isSupabaseConfigured } from "./supabase/env";
import { requireAuthenticatedContext } from "./auth";

export interface ProductionStore {
  readonly durability: "EPHEMERAL" | "DURABLE";
  listJobs(): Promise<ProductionJob[]>;
  getJob(id: string): Promise<ProductionJob | null>;
  createJob(job: ProductionJob): Promise<ProductionJob>;
  updateJob(
    id: string,
    update: Partial<
      Pick<
        ProductionJob,
        "stage" | "status" | "providerId" | "adapterId" | "updatedAt"
      >
    >
  ): Promise<ProductionJob>;
}

type ProductionJobRow = {
  id: string;
  target_media: ProductionJob["targetMedia"];
  stage: ProductionJob["stage"];
  status: ProductionJob["status"];
  universe_id: string;
  universe_version: string;
  story_id: string;
  realization_profile_id: string | null;
  provider_id: string | null;
  adapter_id: string | null;
  asset_requests: unknown[];
  created_at: string;
  updated_at: string;
};

function fromRow(row: ProductionJobRow): ProductionJob {
  return {
    id: row.id,
    targetMedia: row.target_media,
    stage: row.stage,
    status: row.status,
    source: {
      universeId: row.universe_id,
      universeVersion: row.universe_version,
      storyId: row.story_id,
      ...(row.realization_profile_id
        ? { realizationProfileId: row.realization_profile_id }
        : {})
    },
    ...(row.provider_id ? { providerId: row.provider_id } : {}),
    ...(row.adapter_id ? { adapterId: row.adapter_id } : {}),
    assetRequests: row.asset_requests ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toInsert(job: ProductionJob) {
  return {
    id: job.id,
    target_media: job.targetMedia,
    stage: job.stage,
    status: job.status,
    universe_id: job.source.universeId,
    universe_version: job.source.universeVersion,
    story_id: job.source.storyId,
    realization_profile_id: job.source.realizationProfileId ?? null,
    provider_id: job.providerId ?? null,
    adapter_id: job.adapterId ?? null,
    asset_requests: job.assetRequests ?? []
  };
}

declare global {
  var __storyforgeProductionJobs: Map<string, ProductionJob> | undefined;
}

const memoryJobs =
  globalThis.__storyforgeProductionJobs ??
  new Map<string, ProductionJob>();

if (process.env.NODE_ENV !== "production") {
  globalThis.__storyforgeProductionJobs = memoryJobs;
}

export class MemoryProductionStore implements ProductionStore {
  readonly durability = "EPHEMERAL" as const;

  async listJobs(): Promise<ProductionJob[]> {
    return [...memoryJobs.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  }

  async getJob(id: string): Promise<ProductionJob | null> {
    return memoryJobs.get(id) ?? null;
  }

  async createJob(job: ProductionJob): Promise<ProductionJob> {
    if (memoryJobs.has(job.id)) {
      throw new Error(`ProductionJob already exists: ${job.id}`);
    }
    memoryJobs.set(job.id, structuredClone(job));
    return structuredClone(job);
  }

  async updateJob(
    id: string,
    update: Partial<
      Pick<
        ProductionJob,
        "stage" | "status" | "providerId" | "adapterId" | "updatedAt"
      >
    >
  ): Promise<ProductionJob> {
    const current = memoryJobs.get(id);
    if (!current) throw new Error(`ProductionJob not found: ${id}`);

    const next = {
      ...current,
      ...update,
      updatedAt: update.updatedAt ?? new Date().toISOString()
    };

    memoryJobs.set(id, next);
    return structuredClone(next);
  }
}

export class SupabaseProductionStore implements ProductionStore {
  readonly durability = "DURABLE" as const;

  constructor(private readonly supabase: SupabaseClient) {}

  async listJobs(): Promise<ProductionJob[]> {
    const { data, error } = await this.supabase
      .from("storyforge_production_jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return ((data ?? []) as ProductionJobRow[]).map(fromRow);
  }

  async getJob(id: string): Promise<ProductionJob | null> {
    const { data, error } = await this.supabase
      .from("storyforge_production_jobs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? fromRow(data as ProductionJobRow) : null;
  }

  async createJob(job: ProductionJob): Promise<ProductionJob> {
    const { data, error } = await this.supabase
      .from("storyforge_production_jobs")
      .insert(toInsert(job))
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return fromRow(data as ProductionJobRow);
  }

  async updateJob(
    id: string,
    update: Partial<
      Pick<
        ProductionJob,
        "stage" | "status" | "providerId" | "adapterId" | "updatedAt"
      >
    >
  ): Promise<ProductionJob> {
    const patch = {
      ...(update.stage ? { stage: update.stage } : {}),
      ...(update.status ? { status: update.status } : {}),
      ...(update.providerId !== undefined
        ? { provider_id: update.providerId }
        : {}),
      ...(update.adapterId !== undefined
        ? { adapter_id: update.adapterId }
        : {})
    };

    const { data, error } = await this.supabase
      .from("storyforge_production_jobs")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return fromRow(data as ProductionJobRow);
  }
}

export async function productionStore(): Promise<ProductionStore> {
  if (!isSupabaseConfigured()) {
    return new MemoryProductionStore();
  }

  const { supabase } = await requireAuthenticatedContext();
  return new SupabaseProductionStore(supabase);
}
