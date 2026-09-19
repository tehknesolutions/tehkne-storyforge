import type { MediaTarget } from "../tnir/types.js";

export type AssetKind =
  | "IMAGE"
  | "STORYBOARD_FRAME"
  | "MANGA_PANEL"
  | "WEBTOON_PANEL"
  | "CHARACTER_SHEET"
  | "ENVIRONMENT"
  | "SPRITE"
  | "VOICE"
  | "MUSIC"
  | "SFX"
  | "VIDEO_CLIP"
  | "ANIMATION_CLIP";

export interface AssetSourceTrace {
  universeId: string;
  universeVersion: string;
  entityIds?: string[];
  eventIds?: string[];
  sceneIds?: string[];
  mediaUnitIds?: string[];
  canonFactIds?: string[];
}

export interface AssetRequest {
  id: string;
  kind: AssetKind;
  targetMedia: MediaTarget;
  source: AssetSourceTrace;
  prompt?: string;
  negativeConstraints?: string[];
  styleProfileId?: string;
  continuityKeys?: string[];
  dimensions?: {
    width?: number;
    height?: number;
    aspectRatio?: string;
  };
  durationSeconds?: number;
  providerId?: string;
}

export interface AssetArtifact {
  id: string;
  requestId: string;
  kind: AssetKind;
  providerId: string;
  providerAssetId?: string;
  mimeType: string;
  uri: string;
  source: AssetSourceTrace;
  generatedAssertions: Array<{
    subject: string;
    predicate: string;
    object: unknown;
  }>;
  canonStatus: "NON_CANON_ASSET";
  createdAt: string;
}

export interface CharacterContinuitySheet {
  id: string;
  characterId: string;
  canonicalFactIds: string[];
  immutableTraits: Record<string, unknown>;
  visualTraits: Record<string, unknown>;
  forbiddenChanges: string[];
  approvedAssetIds: string[];
}
