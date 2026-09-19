import type { AssetArtifact, AssetRequest } from "./assets.js";
import type { SpeechRequest } from "./audio.js";

export interface AssetProviderAdapter {
  readonly id: string;
  readonly supportedKinds: AssetRequest["kind"][];
  generateAsset(request: AssetRequest): Promise<AssetArtifact>;
}

export interface SpeechArtifact {
  id: string;
  requestId: string;
  providerId: string;
  mimeType: string;
  uri: string;
  durationSeconds?: number;
  sourceEventIds: string[];
  characterId: string;
  createdAt: string;
}

export interface SpeechProviderAdapter {
  readonly id: string;
  synthesize(request: SpeechRequest): Promise<SpeechArtifact>;
}
