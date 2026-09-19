import { durableWorkspaceStore } from "@/lib/workspace-store";
import {
  DURABLE_WORKSPACE_VERSION,
  type DurableStoryWorkspacePayload,
  type UpdateDurableWorkspaceInput
} from "@/lib/workspace-persistence";
import type {
  MediaTarget,
  StoryLocale
} from "@/lib/storyforge-local";

export const runtime = "nodejs";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const LOCALES: StoryLocale[] = ["pt-BR", "en", "es"];
const TARGETS: MediaTarget[] = [
  "PROSE_SHORT",
  "NOVEL",
  "MANGA",
  "WEBTOON",
  "ANIME_EPISODE",
  "GAME",
  "VISUAL_NOVEL",
  "AUDIO_DRAMA"
];

function statusFor(error: unknown) {
  const message =
    error instanceof Error ? error.message : "UNKNOWN";

  if (message === "AUTHENTICATION_REQUIRED") return 401;
  if (message === "DURABLE_BACKEND_NOT_CONFIGURED") return 503;
  if (message === "WORKSPACE_NOT_FOUND") return 404;
  if (message.startsWith("WORKSPACE_VERSION_CONFLICT:")) return 409;
  return 500;
}

function validPayload(
  value: unknown
): value is DurableStoryWorkspacePayload {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function payloadWithinLimit(value: unknown) {
  try {
    return JSON.stringify(value).length <= 2_000_000;
  } catch {
    return false;
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!UUID.test(id)) {
    return Response.json(
      { error: "INVALID_WORKSPACE_ID" },
      { status: 400 }
    );
  }

  try {
    const store = await durableWorkspaceStore();
    const workspace = await store.get(id);

    if (!workspace) {
      return Response.json(
        { error: "WORKSPACE_NOT_FOUND" },
        { status: 404 }
      );
    }

    return Response.json({
      durability: "DURABLE",
      canonMutationEnabled: false,
      workspace
    });
  } catch (error) {
    return Response.json(
      {
        error: "WORKSPACE_READ_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Unknown error"
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
  if (!UUID.test(id)) {
    return Response.json(
      { error: "INVALID_WORKSPACE_ID" },
      { status: 400 }
    );
  }

  let payload: Partial<UpdateDurableWorkspaceInput>;
  try {
    payload =
      (await request.json()) as Partial<UpdateDurableWorkspaceInput>;
  } catch {
    return Response.json(
      { error: "INVALID_WORKSPACE_JSON" },
      { status: 400 }
    );
  }

  const title =
    typeof payload.title === "string"
      ? payload.title.trim().slice(0, 200)
      : "";

  if (
    !Number.isInteger(payload.expectedRevision) ||
    Number(payload.expectedRevision) < 1 ||
    !title ||
    payload.workspaceVersion !== DURABLE_WORKSPACE_VERSION ||
    !LOCALES.includes(payload.locale as StoryLocale) ||
    !TARGETS.includes(payload.targetMedia as MediaTarget) ||
    !validPayload(payload.payload) ||
    !payloadWithinLimit(payload.payload)
  ) {
    return Response.json(
      { error: "INVALID_DURABLE_WORKSPACE_UPDATE" },
      { status: 400 }
    );
  }

  try {
    const store = await durableWorkspaceStore();
    const workspace = await store.update(id, {
      expectedRevision: Number(payload.expectedRevision),
      title,
      workspaceVersion: DURABLE_WORKSPACE_VERSION,
      locale: payload.locale as StoryLocale,
      targetMedia: payload.targetMedia as MediaTarget,
      payload: payload.payload
    });

    return Response.json({
      durability: "DURABLE",
      canonMutationEnabled: false,
      workspace
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error &&
          error.message.startsWith("WORKSPACE_VERSION_CONFLICT:")
            ? "WORKSPACE_VERSION_CONFLICT"
            : "WORKSPACE_UPDATE_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Unknown error"
      },
      { status: statusFor(error) }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const expected = Number(
    new URL(request.url).searchParams.get("expectedRevision")
  );

  if (!UUID.test(id) || !Number.isInteger(expected) || expected < 1) {
    return Response.json(
      { error: "INVALID_WORKSPACE_DELETE" },
      { status: 400 }
    );
  }

  try {
    const store = await durableWorkspaceStore();
    await store.delete(id, expected);
    return Response.json({
      durability: "DURABLE",
      canonMutationEnabled: false,
      deleted: true
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error &&
          error.message.startsWith("WORKSPACE_VERSION_CONFLICT:")
            ? "WORKSPACE_VERSION_CONFLICT"
            : "WORKSPACE_DELETE_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Unknown error"
      },
      { status: statusFor(error) }
    );
  }
}
