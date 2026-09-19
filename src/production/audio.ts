export interface VoiceProfile {
  id: string;
  characterId: string;
  language: string;
  locale?: string;
  agePresentation?: string;
  vocalQualities: string[];
  deliveryRules: string[];
  providerVoiceId?: string;
  referenceAssetIds?: string[];
}

export interface SpeechRequest {
  id: string;
  sourceEventIds: string[];
  characterId: string;
  voiceProfileId: string;
  text: string;
  direction?: string;
  emotion?: string;
  durationTargetSeconds?: number;
}

export interface AudioCue {
  id: string;
  type: "VOICE" | "MUSIC" | "SFX" | "AMBIENCE";
  sourceEventIds: string[];
  startSeconds?: number;
  durationSeconds?: number;
  description: string;
  assetId?: string;
}
