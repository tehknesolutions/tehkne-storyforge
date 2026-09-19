export type PreviewMediaTarget =
  | "PROSE_SHORT"
  | "NOVEL"
  | "LIGHT_NOVEL"
  | "SCREENPLAY"
  | "GAME"
  | "VISUAL_NOVEL"
  | "COMIC"
  | "MANGA"
  | "MANHWA"
  | "MANHUA"
  | "WEBTOON"
  | "VERTICAL_COMIC"
  | "MOTION_COMIC"
  | "ANIMATION"
  | "ANIME_SHORT"
  | "ANIME_EPISODE"
  | "ANIME_SERIES"
  | "AUDIO_DRAMA";

export interface PreviewProductionSource {
  universeId: string;
  universeVersion: string;
  storyId: string;
  realizationProfileId?: string;
}

export interface PreviewProductionJob {
  id: string;
  targetMedia: PreviewMediaTarget;
  stage: "PLAN" | "BRIEF" | "GENERATE" | "VALIDATE" | "REVIEW" | "APPROVE" | "EXPORT";
  status:
    | "QUEUED"
    | "RUNNING"
    | "BLOCKED"
    | "REVIEW_REQUIRED"
    | "APPROVED"
    | "REJECTED"
    | "FAILED"
    | "COMPLETE";
  source: PreviewProductionSource;
  providerId?: string;
  adapterId?: string;
  assetRequests?: unknown[];
  createdAt: string;
  updatedAt: string;
}
