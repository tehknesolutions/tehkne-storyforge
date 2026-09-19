import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAuthenticatedContext } from "./auth";
import { isSupabaseConfigured } from "./supabase/env";
import type {
  CreateDurableWorkspaceInput,
  DurableStoryWorkspacePayload,
  DurableWorkspaceRecord,
  DurableWorkspaceSummary,
  UpdateDurableWorkspaceInput
} from "./workspace-persistence";
import type {
  MediaTarget,
  StoryLocale
} from "./storyforge-local";

type WorkspaceRow = {
  id: string;
  title: string;
  workspace_version: string;
  locale: StoryLocale;
  target_media: MediaTarget;
  payload: DurableStoryWorkspacePayload;
  revision: number;
  created_at: string;
  updated_at: string;
};

type WorkspaceSummaryRow = Omit<WorkspaceRow, "payload">;

function fromSummaryRow(
  row: WorkspaceSummaryRow
): DurableWorkspaceSummary {
  return {
    id: row.id,
    title: row.title,
    workspaceVersion: row.workspace_version,
    locale: row.locale,
    targetMedia: row.target_media,
    revision: Number(row.revision),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function fromRow(row: WorkspaceRow): DurableWorkspaceRecord {
  return {
    ...fromSummaryRow(row),
    payload: row.payload
  };
}

export class SupabaseWorkspaceStore {
  readonly durability = "DURABLE" as const;

  constructor(private readonly supabase: SupabaseClient) {}

  async list(): Promise<DurableWorkspaceSummary[]> {
    const { data, error } = await this.supabase
      .from("storyforge_workspaces")
      .select(
        "id,title,workspace_version,locale,target_media,revision,created_at,updated_at"
      )
      .order("updated_at", { ascending: false });

    if (error) throw new Error(error.message);
    return ((data ?? []) as WorkspaceSummaryRow[]).map(
      fromSummaryRow
    );
  }

  async get(id: string): Promise<DurableWorkspaceRecord | null> {
    const { data, error } = await this.supabase
      .from("storyforge_workspaces")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? fromRow(data as WorkspaceRow) : null;
  }

  async create(
    input: CreateDurableWorkspaceInput
  ): Promise<DurableWorkspaceRecord> {
    const { data, error } = await this.supabase
      .from("storyforge_workspaces")
      .insert({
        title: input.title,
        workspace_version: input.workspaceVersion,
        locale: input.locale,
        target_media: input.targetMedia,
        payload: input.payload,
        revision: 1,
        updated_at: new Date().toISOString()
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return fromRow(data as WorkspaceRow);
  }

  async update(
    id: string,
    input: UpdateDurableWorkspaceInput
  ): Promise<DurableWorkspaceRecord> {
    const nextRevision = input.expectedRevision + 1;
    const { data, error } = await this.supabase
      .from("storyforge_workspaces")
      .update({
        title: input.title,
        workspace_version: input.workspaceVersion,
        locale: input.locale,
        target_media: input.targetMedia,
        payload: input.payload,
        revision: nextRevision,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("revision", input.expectedRevision)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (data) return fromRow(data as WorkspaceRow);

    const current = await this.get(id);
    if (!current) throw new Error("WORKSPACE_NOT_FOUND");
    throw new Error(
      `WORKSPACE_VERSION_CONFLICT:${input.expectedRevision}:${current.revision}`
    );
  }

  async delete(
    id: string,
    expectedRevision: number
  ): Promise<void> {
    const { data, error } = await this.supabase
      .from("storyforge_workspaces")
      .delete()
      .eq("id", id)
      .eq("revision", expectedRevision)
      .select("id")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (data) return;

    const current = await this.get(id);
    if (!current) throw new Error("WORKSPACE_NOT_FOUND");
    throw new Error(
      `WORKSPACE_VERSION_CONFLICT:${expectedRevision}:${current.revision}`
    );
  }
}

export async function durableWorkspaceStore() {
  if (!isSupabaseConfigured()) {
    throw new Error("DURABLE_BACKEND_NOT_CONFIGURED");
  }

  const { supabase } = await requireAuthenticatedContext();
  return new SupabaseWorkspaceStore(supabase);
}
