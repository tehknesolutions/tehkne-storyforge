import type { CanonProposal, MediaTarget } from "../tnir/types.js";

export interface GenerationSourceRef {
  eventIds: string[];
  sceneId?: string;
  canonFactIds?: string[];
  choiceIds?: string[];
  ruleIds?: string[];
  evidenceIds?: string[];
}

export interface GenerationUnit {
  unitId: string;
  source: GenerationSourceRef;
  payload: Record<string, unknown>;
}

export interface GenerationAuthorityContract {
  mayInventCanon: false;
  newUnapprovedFactsBecome: "CANDIDATE";
  preserveEventCausality: true;
  preserveCharacterKnowledgeBoundaries: true;
  preserveTraceability: true;
}

export interface ModelGenerationRequest {
  requestId: string;
  targetMedia: MediaTarget;
  adapterId: string;
  authorityContract: GenerationAuthorityContract;
  units: GenerationUnit[];
  canonicalFacts: Array<{
    id: string;
    subject: string;
    predicate: string;
    object: unknown;
  }>;
  style?: Record<string, unknown>;
}

export interface GeneratedAssertion {
  subject: string;
  predicate: string;
  object: unknown;
  sourceUnitId: string;
}

export interface ModelGenerationResponse {
  requestId: string;
  adapterId: string;
  artifactId: string;
  targetMedia: MediaTarget;
  output: unknown;
  assertions: GeneratedAssertion[];
  canonProposals: CanonProposal[];
  traceability: GenerationSourceRef[];
}

export interface ModelAdapter {
  readonly id: string;
  readonly capabilities: MediaTarget[];
  generate(request: ModelGenerationRequest): Promise<ModelGenerationResponse>;
}
