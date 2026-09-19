export type CanonAuthority =
  | "IDEA"
  | "CANDIDATE"
  | "APPROVED"
  | "CANON"
  | "DEPRECATED"
  | "CONTRADICTED"
  | "RETCON"
  | "ALTERNATE_TIMELINE"
  | "NON_CANON";

export type EntityType =
  | "CHARACTER"
  | "CREATURE"
  | "LOCATION"
  | "OBJECT"
  | "ORGANIZATION"
  | "FACTION"
  | "SPECIES"
  | "CULTURE"
  | "TECHNOLOGY"
  | "POWER"
  | "CONCEPT"
  | "ARTIFACT";

export type MediaTarget =
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

export interface Provenance {
  createdBy: "CREATOR" | "AI" | "IMPORT" | "SYSTEM";
  source?: string;
  sourceVersion?: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  confidence?: number;
  rationale?: string;
}

export interface StoryDNA {
  premise: string;
  themes: string[];
  genres: string[];
  tone: string[];
  audience?: string[];
  emotionalPromise?: string[];
  aestheticDirection?: string[];
  creatorIntent?: string;
  inspirations?: string[];
  constraints?: string[];
  forbiddenDirections?: string[];
  narrativeQuestions?: string[];
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  aliases?: string[];
  description?: string;
  tags?: string[];
  attributes?: Record<string, unknown>;
  canonStatus: CanonAuthority;
  provenance: Provenance;
}

export interface CanonFact {
  id: string;
  subject: string;
  predicate: string;
  object: string | number | boolean | Record<string, unknown>;
  authority: CanonAuthority;
  validFromEventId?: string;
  validUntilEventId?: string;
  provenance: Provenance;
}

export interface Belief {
  id: string;
  holder: string;
  claim: string | Record<string, unknown>;
  confidence: number;
  truthRelation: "TRUE" | "FALSE" | "UNKNOWN" | "PARTIAL";
  acquiredAtEventId?: string;
}

export interface Goal {
  id: string;
  owner: string;
  desiredState: Record<string, unknown>;
  priority: number;
  status: "ACTIVE" | "BLOCKED" | "ACHIEVED" | "ABANDONED" | "FAILED";
  motivatedBy?: string[];
  createdAtEventId?: string;
}

export interface Character extends Entity {
  type: "CHARACTER";
  traits?: string[];
  values?: string[];
  beliefs?: Belief[];
  knowledge?: string[];
  desires?: string[];
  needs?: string[];
  fears?: string[];
  intentions?: string[];
  secrets?: string[];
  goals?: Goal[];
  capabilities?: string[];
  resources?: string[];
  limitations?: string[];
  currentState?: Record<string, unknown>;
  emotionalState?: Record<string, unknown>;
  arcIds?: string[];
}

export interface Relationship {
  id: string;
  from: string;
  type: string;
  to: string;
  directed: boolean;
  intensity?: number;
  validFromEventId?: string;
  validUntilEventId?: string;
  provenance: Provenance;
}

export type CausalLinkType =
  | "ENABLES"
  | "CAUSES"
  | "MOTIVATES"
  | "PREVENTS"
  | "REVEALS"
  | "INVALIDATES"
  | "TRIGGERS"
  | "RESOLVES";

export interface CausalLink {
  id: string;
  fromEventId: string;
  toEventId: string;
  type: CausalLinkType;
  rationale?: string;
}

export interface NarrativeEvent {
  id: string;
  type: string;
  participants: string[];
  locationId?: string;
  preconditions?: Array<Record<string, unknown>>;
  actions?: Array<Record<string, unknown>>;
  effects: Array<Record<string, unknown>>;
  causedBy?: string[];
  causes?: string[];
  time?: Record<string, unknown>;
  knowledgeEffects?: Array<Record<string, unknown>>;
  goalEffects?: Array<Record<string, unknown>>;
  canonStatus: CanonAuthority;
  provenance: Provenance;
}

export interface Beat {
  id: string;
  type:
    | "REVELATION"
    | "DECISION"
    | "REACTION"
    | "ATTACK"
    | "DISCOVERY"
    | "REVERSAL"
    | "SETUP"
    | "PAYOFF"
    | "SILENCE"
    | "CUSTOM";
  purpose?: string;
  eventIds?: string[];
}

export interface Scene {
  id: string;
  title?: string;
  povEntityId?: string;
  locationId?: string;
  eventIds: string[];
  dramaticPurpose?: string;
  informationRevealed?: string[];
  informationWithheld?: string[];
  beats?: Beat[];
  mediaAnnotations?: Record<string, unknown>;
}

export interface Story {
  id: string;
  title: string;
  premise?: string;
  eventIds: string[];
  scenes?: Scene[];
  arcIds?: string[];
}

export interface MediaManifest {
  id: string;
  targetMedia: MediaTarget;
  storyId: string;
  audience?: string[];
  format?: Record<string, unknown>;
  targetLength?: Record<string, unknown>;
  visualStyle?: Record<string, unknown>;
  interactionModel?: Record<string, unknown>;
  pacingProfile?: Record<string, unknown>;
  contentConstraints?: string[];
  assetRequirements?: string[];
  compilerConfig?: Record<string, unknown>;
}

export interface Universe {
  id: string;
  title: string;
  version: string;
  storyDNA: StoryDNA;
  canon: CanonFact[];
  entities: Entity[];
  relationships: Relationship[];
  events: NarrativeEvent[];
  causalLinks: CausalLink[];
  stories: Story[];
  mediaManifests: MediaManifest[];
  provenance: Provenance;
}
