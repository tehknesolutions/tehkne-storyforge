import { durableWorkspaceStore } from "@/lib/workspace-store";
import {
  DURABLE_WORKSPACE_VERSION,
  type CreateDurableWorkspaceInput,
  type DurableStoryWorkspacePayload
} from "@/lib/workspace-persistence";
import type {
  MediaTarget,
  StoryLocale
} from "@/lib/storyforge-local";

export const runtime = "nodejs";

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

export async function GET() {
  try {
    const store = await durableWorkspaceStore();
    return Response.json({
      durability: "DURABLE",
      canonMutationEnabled: false,
      workspaces: await store.list()
    });
  } catch (error) {
    return Response.json(
      {
        error: "WORKSPACE_LIST_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
        workspaces: []
      },
      { status: statusFor(error) }
    );
  }
}

export async function POST(request: Request) {
  let payload: Partial<CreateDurableWorkspaceInput>;
  try {
    payload =
      (await request.json()) as Partial<CreateDurableWorkspaceInput>;
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
    !title ||
    payload.workspaceVersion !== DURABLE_WORKSPACE_VERSION ||
    !LOCALES.includes(payload.locale as StoryLocale) ||
    !TARGETS.includes(payload.targetMedia as MediaTarget) ||
    !validPayload(payload.payload) ||
    !payloadWithinLimit(payload.payload)
  ) {
    return Response.json(
      { error: "INVALID_DURABLE_WORKSPACE" },
      { status: 400 }
    );
  }

  try {
    const store = await durableWorkspaceStore();
    const workspace = await store.create({
      title,
      workspaceVersion: DURABLE_WORKSPACE_VERSION,
      locale: payload.locale as StoryLocale,
      targetMedia: payload.targetMedia as MediaTarget,
      payload: payload.payload
    });

    return Response.json(
      {
        durability: "DURABLE",
        canonMutationEnabled: false,
        workspace
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      {
        error: "WORKSPACE_CREATE_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Unknown error"
      },
      { status: statusFor(error) }
    );
  }
}
