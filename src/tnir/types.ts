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
  revisedAtEventId?: string;
  status: "ACTIVE" | "REVISED" | "ABANDONED";
}

export interface KnowledgeItem {
  id: string;
  holder: string;
  proposition: string | Record<string, unknown>;
  certainty: number;
  status: "KNOWN" | "SUSPECTED" | "FORGOTTEN";
  acquiredAtEventId?: string;
  sourceEntityId?: string;
}

export interface Goal {
  id: string;
  owner: string;
  desiredState: Record<string, unknown>;
  priority: number;
  status: "ACTIVE" | "BLOCKED" | "ACHIEVED" | "ABANDONED" | "FAILED";
  motivatedBy?: string[];
  createdAtEventId?: string;
  resolvedAtEventId?: string;
}

export interface PlanStep {
  id: string;
  action: string;
  targetId?: string;
  requires?: string[];
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "FAILED" | "SKIPPED";
  completedAtEventId?: string;
}

export interface Plan {
  id: string;
  owner: string;
  goalId: string;
  status: "DRAFT" | "ACTIVE" | "BLOCKED" | "COMPLETED" | "ABANDONED" | "FAILED";
  revision: number;
  steps: PlanStep[];
  currentStepId?: string;
  createdAtEventId?: string;
  dependsOnBeliefIds?: string[];
  supersedesPlanId?: string;
}

export interface Secret {
  id: string;
  about: string[];
  proposition: string | Record<string, unknown>;
  knownBy: string[];
  hiddenFrom: string[];
  status: "HIDDEN" | "PARTIALLY_REVEALED" | "REVEALED";
  revealedAtEventId?: string;
}

export interface CharacterState {
  atEventId?: string;
  locationId?: string;
  physical?: Record<string, unknown>;
  emotional?: Record<string, number | string | boolean>;
  social?: Record<string, unknown>;
  resources?: Record<string, number | string | boolean>;
  flags?: string[];
}

export interface Intention {
  id: string;
  owner: string;
  action: string;
  targetId?: string;
  goalId?: string;
  formedAtEventId?: string;
  status: "ACTIVE" | "FULFILLED" | "ABANDONED" | "BLOCKED";
}

export interface Character extends Entity {
  type: "CHARACTER";
  traits?: string[];
  values?: string[];
  beliefs: Belief[];
  knowledge: KnowledgeItem[];
  desires?: string[];
  needs?: string[];
  fears?: string[];
  intentions: Intention[];
  secrets: Secret[];
  goals: Goal[];
  plans: Plan[];
  capabilities?: string[];
  resources?: string[];
  limitations?: string[];
  currentState: CharacterState;
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

export interface KnowledgeEffect {
  holder: string;
  op: "LEARN" | "SUSPECT" | "FORGET" | "REVISE_BELIEF";
  knowledgeId?: string;
  beliefId?: string;
}

export interface GoalEffect {
  owner: string;
  goalId: string;
  op: "CREATE" | "BLOCK" | "ACHIEVE" | "FAIL" | "ABANDON" | "REACTIVATE";
}

export interface ChoiceOption {
  id: string;
  label: string;
  outcomeEventId: string;
  conditions?: string[];
  transitionId?: string;
  branchId?: string;
}

export interface Choice {
  id: string;
  atEventId: string;
  actor: "PLAYER" | string;
  prompt: string;
  options: ChoiceOption[];
  selectedOptionId?: string;
  visibility?: Record<string, unknown>;
}

export interface StatePatch {
  op: "SET" | "UNSET" | "INCREMENT" | "DECREMENT" | "ADD" | "REMOVE";
  path: string;
  value?: unknown;
}

export interface StateTransition {
  id: string;
  triggeredBy: {
    type: "EVENT" | "CHOICE_OPTION";
    id: string;
  };
  targetId: "WORLD" | string;
  patches: StatePatch[];
}

export interface Evidence {
  id: string;
  discoveredAtEventId: string;
  proposition: string;
  sourceEntityIds: string[];
  strength: number;
  affectsBeliefIds: string[];
}

export interface BeliefRevision {
  id: string;
  evidenceId: string;
  beliefId: string;
  holder: string;
  previousConfidence: number;
  newConfidence: number;
  newTruthRelation?: "TRUE" | "FALSE" | "UNKNOWN" | "PARTIAL";
  newStatus?: "ACTIVE" | "REVISED" | "ABANDONED";
  rationale: string;
}

export interface ReplanRule {
  id: string;
  owner: string;
  goalId: string;
  whenBeliefIdsChanged: string[];
  supersedePlanId: string;
  activatePlanId: string;
}

export interface ActionProposal {
  id: string;
  actorId: string;
  action: string;
  targetId?: string;
  goalId?: string;
  planId?: string;
  planStepId?: string;
  expectedEffects?: Array<Record<string, unknown>>;
  provenance: Provenance;
}

export interface DecisionScore {
  id: string;
  actionProposalId: string;
  goalAlignment: number;
  beliefSupport: number;
  valueAlignment: number;
  feasibility: number;
  risk: number;
  relationshipImpact: number;
  dramaticPressure: number;
  totalScore: number;
  rationale: string[];
}

export interface EventProposal {
  id: string;
  sourceActionProposalId: string;
  proposedEvent: NarrativeEvent;
  authority: "CANDIDATE";
  validationNotes: string[];
}

export interface CanonProposal {
  id: string;
  subject: string;
  predicate: string;
  object: string | number | boolean | Record<string, unknown>;
  authority: "CANDIDATE";
  proposedFromArtifactId?: string;
  proposedFromEventId?: string;
  conflictsWithFactIds: string[];
  rationale: string;
}

export interface RealizationProfile {
  id: string;
  targetMedia: MediaTarget;
  storyId: string;
  mode: "LINEAR" | "INTERACTIVE";
  selectedBranchId?: string;
  includeRootBranch: boolean;
  styleProfileId?: string;
}

export type RuleCondition =
  | { type: "EVENT_OCCURRED"; eventId: string }
  | { type: "FACT_EQUALS"; factId: string }
  | { type: "STATE_EQUALS"; targetId: string; path: string; value: unknown };

export type RuleEffect =
  | { type: "ALLOW_EVENT"; eventId: string }
  | { type: "DENY_EVENT"; eventId: string; reason: string }
  | { type: "SET_STATE"; targetId: string; path: string; value: unknown };

export interface WorldRule {
  id: string;
  domain: string;
  description: string;
  conditions: RuleCondition[];
  effects: RuleEffect[];
  authority: CanonAuthority;
  provenance: Provenance;
}

export interface NarrativeBranch {
  id: string;
  parentBranchId?: string;
  forkEventId?: string;
  choiceOptionId?: string;
  eventIds: string[];
  status: "CANON" | "POSSIBLE" | "ACTIVE" | "ABANDONED";
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
  knowledgeEffects?: KnowledgeEffect[];
  goalEffects?: GoalEffect[];
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
  entities: Array<Entity | Character>;
  relationships: Relationship[];
  events: NarrativeEvent[];
  causalLinks: CausalLink[];
  choices: Choice[];
  stateTransitions: StateTransition[];
  evidence: Evidence[];
  beliefRevisions: BeliefRevision[];
  replanRules: ReplanRule[];
  actionProposals: ActionProposal[];
  decisionScores: DecisionScore[];
  eventProposals: EventProposal[];
  canonProposals: CanonProposal[];
  realizationProfiles: RealizationProfile[];
  worldRules: WorldRule[];
  branches: NarrativeBranch[];
  stories: Story[];
  mediaManifests: MediaManifest[];
  provenance: Provenance;
}
