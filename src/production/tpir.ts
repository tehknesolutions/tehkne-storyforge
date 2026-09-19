import type { MediaTarget } from "../tnir/types.js";
import type { AssetRequest } from "./assets.js";

export type ProductionStage =
  | "PLAN"
  | "BRIEF"
  | "GENERATE"
  | "VALIDATE"
  | "REVIEW"
  | "APPROVE"
  | "EXPORT";

export type ProductionStatus =
  | "QUEUED"
  | "RUNNING"
  | "BLOCKED"
  | "REVIEW_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "FAILED"
  | "COMPLETE";

export interface ProductionSource {
  universeId: string;
  universeVersion: string;
  storyId: string;
  realizationProfileId?: string;
  mediaPlanArtifactId?: string;
  generationBriefArtifactId?: string;
}

export interface ProductionJob {
  id: string;
  targetMedia: MediaTarget;
  stage: ProductionStage;
  status: ProductionStatus;
  source: ProductionSource;
  providerId?: string;
  adapterId?: string;
  assetRequests?: AssetRequest[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductionRun {
  id: string;
  jobId: string;
  providerId: string;
  adapterId: string;
  startedAt: string;
  completedAt?: string;
  inputHash?: string;
  outputArtifactIds: string[];
  assertionCount: number;
  canonProposalIds: string[];
  error?: string;
}

export interface ProductionManifest {
  id: string;
  version: "0.1.0";
  source: ProductionSource;
  jobs: ProductionJob[];
  runs: ProductionRun[];
  authority: {
    narrativeCanonSource: "T-NIR";
    providersCanPromoteCanon: false;
    generatedAssetsAreCanonByDefault: false;
    creatorReviewRequiredForCanonProposal: true;
  };
}
