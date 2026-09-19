import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./supabase/env";
import { requireAuthenticatedContext } from "./auth";

export type ReviewDecision = "APPROVE" | "EDIT" | "REJECT";
export type ReviewStatus =
  | "PENDING"
  | "APPROVED"
  | "EDIT_REQUIRED"
  | "REJECTED"
  | "COMMITTED";

export interface ReviewState {
  id: string;
  status: ReviewStatus;
  decision?: ReviewDecision;
  notes?: string;
  reviewedAt?: string;
  updatedAt: string;
  universeId?: string;
  universeVersion?: string;
  sourceArtifactId?: string;
  proposal?: Record<string, unknown>;
}

export interface ReviewStore {
  readonly durability: "EPHEMERAL" | "DURABLE";
  get(id: string): Promise<ReviewState | null>;
  list(): Promise<ReviewState[]>;
  decide(
    id: string,
    decision: ReviewDecision,
    notes?: string
  ): Promise<ReviewState>;
}

type ReviewRow = {
  id: string;
  universe_id: string;
  universe_version: string;
  source_artifact_id: string;
  proposal: Record<string, unknown>;
  status: ReviewStatus;
  decision: ReviewDecision | null;
  notes: string | null;
  reviewed_at: string | null;
  updated_at: string;
};

function fromRow(row: ReviewRow): ReviewState {
  return {
    id: row.id,
    status: row.status,
    ...(row.decision ? { decision: row.decision } : {}),
    ...(row.notes ? { notes: row.notes } : {}),
    ...(row.reviewed_at ? { reviewedAt: row.reviewed_at } : {}),
    updatedAt: row.updated_at,
    universeId: row.universe_id,
    universeVersion: row.universe_version,
    sourceArtifactId: row.source_artifact_id,
    proposal: row.proposal
  };
}

declare global {
  var __storyforgeReviewStates: Map<string, ReviewState> | undefined;
}

const initialTimestamp = "2026-09-19T00:00:00.000Z";
const memoryStates =
  globalThis.__storyforgeReviewStates ??
  new Map<string, ReviewState>([
    [
      "canon-proposal:grandmother-authored-lantern",
      {
        id: "canon-proposal:grandmother-authored-lantern",
        status: "PENDING",
        updatedAt: initialTimestamp,
        universeId: "universe:lantern-below",
        universeVersion: "0.5.0",
        sourceArtifactId: "artifact:model:reference",
        proposal: {
          id: "canon-proposal:grandmother-authored-lantern",
          subject: "entity:lantern",
          predicate: "wasCreatedBy",
          object: "entity:grandmother",
          authority: "CANDIDATE",
          rationale:
            "Current CANON proves Grandmother hid the lantern, not that she created it."
        }
      }
    ]
  ]);

if (process.env.NODE_ENV !== "production") {
  globalThis.__storyforgeReviewStates = memoryStates;
}

export class MemoryReviewStore implements ReviewStore {
  readonly durability = "EPHEMERAL" as const;

  async get(id: string): Promise<ReviewState | null> {
    return memoryStates.get(id) ?? null;
  }

  async list(): Promise<ReviewState[]> {
    return [...memoryStates.values()];
  }

  async decide(
    id: string,
    decision: ReviewDecision,
    notes?: string
  ): Promise<ReviewState> {
    const current = memoryStates.get(id);
    if (!current) throw new Error(`Review proposal not found: ${id}`);
    if (current.status === "COMMITTED") {
      throw new Error("COMMITTED_REVIEW_IS_IMMUTABLE");
    }

    const status: ReviewStatus =
      decision === "APPROVE"
        ? "APPROVED"
        : decision === "EDIT"
          ? "EDIT_REQUIRED"
          : "REJECTED";

    const now = new Date().toISOString();
    const next: ReviewState = {
      ...current,
      status,
      decision,
      notes,
      reviewedAt: now,
      updatedAt: now
    };

    memoryStates.set(id, next);
    return structuredClone(next);
  }
}

export class SupabaseReviewStore implements ReviewStore {
  readonly durability = "DURABLE" as const;

  constructor(private readonly supabase: SupabaseClient) {}

  async get(id: string): Promise<ReviewState | null> {
    const { data, error } = await this.supabase
      .from("storyforge_review_items")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? fromRow(data as ReviewRow) : null;
  }

  async list(): Promise<ReviewState[]> {
    const { data, error } = await this.supabase
      .from("storyforge_review_items")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw new Error(error.message);
    return ((data ?? []) as ReviewRow[]).map(fromRow);
  }

  async decide(
    id: string,
    decision: ReviewDecision,
    notes?: string
  ): Promise<ReviewState> {
    const status: ReviewStatus =
      decision === "APPROVE"
        ? "APPROVED"
        : decision === "EDIT"
          ? "EDIT_REQUIRED"
          : "REJECTED";

    const { data, error } = await this.supabase
      .from("storyforge_review_items")
      .update({
        status,
        decision,
        notes: notes ?? null,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", id)
      .neq("status", "COMMITTED")
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return fromRow(data as ReviewRow);
  }
}

export async function reviewStore(): Promise<ReviewStore> {
  if (!isSupabaseConfigured()) {
    return new MemoryReviewStore();
  }

  const { supabase } = await requireAuthenticatedContext();
  return new SupabaseReviewStore(supabase);
}
