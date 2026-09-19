import type { PreviewProductionJob as ProductionJob } from "./production-types";

export interface ProductionStore {
  readonly durability: "EPHEMERAL" | "DURABLE";
  listJobs(): Promise<ProductionJob[]>;
  getJob(id: string): Promise<ProductionJob | null>;
  createJob(job: ProductionJob): Promise<ProductionJob>;
  updateJob(
    id: string,
    update: Partial<Pick<ProductionJob, "stage" | "status" | "providerId" | "adapterId" | "updatedAt">>
  ): Promise<ProductionJob>;
}

declare global {
  var __storyforgeProductionJobs: Map<string, ProductionJob> | undefined;
}

const jobs =
  globalThis.__storyforgeProductionJobs ??
  new Map<string, ProductionJob>();

if (process.env.NODE_ENV !== "production") {
  globalThis.__storyforgeProductionJobs = jobs;
}

export class MemoryProductionStore implements ProductionStore {
  readonly durability = "EPHEMERAL" as const;

  async listJobs(): Promise<ProductionJob[]> {
    return [...jobs.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  }

  async getJob(id: string): Promise<ProductionJob | null> {
    return jobs.get(id) ?? null;
  }

  async createJob(job: ProductionJob): Promise<ProductionJob> {
    if (jobs.has(job.id)) {
      throw new Error(`ProductionJob already exists: ${job.id}`);
    }
    jobs.set(job.id, structuredClone(job));
    return structuredClone(job);
  }

  async updateJob(
    id: string,
    update: Partial<Pick<ProductionJob, "stage" | "status" | "providerId" | "adapterId" | "updatedAt">>
  ): Promise<ProductionJob> {
    const current = jobs.get(id);
    if (!current) throw new Error(`ProductionJob not found: ${id}`);

    const next = {
      ...current,
      ...update,
      updatedAt: update.updatedAt ?? new Date().toISOString()
    };

    jobs.set(id, next);
    return structuredClone(next);
  }
}

export function productionStore(): ProductionStore {
  return new MemoryProductionStore();
}
