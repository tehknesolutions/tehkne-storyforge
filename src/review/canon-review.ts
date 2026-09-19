import type { CanonProposal } from "../tnir/types.js";

export type CanonReviewDecision = "APPROVE" | "EDIT" | "REJECT";

export interface CanonReviewItem {
  proposal: CanonProposal;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EDIT_REQUIRED";
  decision?: CanonReviewDecision;
  reviewerId?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface CanonReviewBatch {
  id: string;
  universeId: string;
  universeVersion: string;
  sourceArtifactId: string;
  items: CanonReviewItem[];
  automaticPromotionAllowed: false;
}

export function createCanonReviewBatch(input: {
  id: string;
  universeId: string;
  universeVersion: string;
  sourceArtifactId: string;
  proposals: CanonProposal[];
}): CanonReviewBatch {
  return {
    id: input.id,
    universeId: input.universeId,
    universeVersion: input.universeVersion,
    sourceArtifactId: input.sourceArtifactId,
    items: input.proposals.map((proposal) => ({
      proposal,
      status: "PENDING"
    })),
    automaticPromotionAllowed: false
  };
}
