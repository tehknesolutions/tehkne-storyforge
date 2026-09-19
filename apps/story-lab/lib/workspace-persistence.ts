import type {
  MediaTarget,
  StoryLocale,
  StoryWorkspaceState
} from "./storyforge-local";
import type { NarrativeForgeV03 } from "./storyforge-v03";
import type {
  SceneAuthorityWorkspace,
  V04WebtoonRealization
} from "./storyforge-v04";
import type { NativeVisualNovelRealization } from "./storyforge-v041";
import type { SemanticAssertionLedger } from "./storyforge-v042";
import type { NativeMangaChapter } from "./storyforge-v045";
import type { NativeAnimeEpisode } from "./storyforge-v046";

export const DURABLE_WORKSPACE_VERSION = "0.4.4" as const;

export const DURABLE_WORKSPACE_REF_STORAGE_KEY =
  "tehkne:storyforge:durable-workspace-ref:v0.4.4";

export type DurableStoryWorkspacePayload = {
  workspace: StoryWorkspaceState;
  narrativeForgeV03: NarrativeForgeV03 | null;
  sceneAuthorityV04: SceneAuthorityWorkspace | null;
  webtoonRealizationV04: V04WebtoonRealization | null;
  visualNovelRealizationV041: NativeVisualNovelRealization | null;
  mangaRealizationV045?: NativeMangaChapter | null;
  animeRealizationV046?: NativeAnimeEpisode | null;
  semanticAssertionLedgerV042: SemanticAssertionLedger | null;
};

export type DurableWorkspaceRef = {
  id: string;
  revision: number;
};

export type DurableWorkspaceSummary = {
  id: string;
  title: string;
  workspaceVersion: string;
  locale: StoryLocale;
  targetMedia: MediaTarget;
  revision: number;
  createdAt: string;
  updatedAt: string;
};

export type DurableWorkspaceRecord = DurableWorkspaceSummary & {
  payload: DurableStoryWorkspacePayload;
};

export type CreateDurableWorkspaceInput = {
  title: string;
  workspaceVersion: typeof DURABLE_WORKSPACE_VERSION;
  locale: StoryLocale;
  targetMedia: MediaTarget;
  payload: DurableStoryWorkspacePayload;
};

export type UpdateDurableWorkspaceInput =
  CreateDurableWorkspaceInput & {
    expectedRevision: number;
  };
