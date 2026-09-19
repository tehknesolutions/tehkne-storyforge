import {
  createNarrativeDraft,
  createUniverseDraft,
  forgeStoryDNA
} from "../lib/storyforge-local";
import { forgeNarrativeV03 } from "../lib/storyforge-v03";
import { createSceneAuthorityWorkspace } from "../lib/storyforge-v04";
import {
  buildSemanticAssertionLedger,
  buildV042TnirExport
} from "../lib/storyforge-v042";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const idea =
  "uma barata conhece um ser humano que consegue entende-la. na verdade a barata é resultado de um experimento cientifico que fez a mente de um ser humano ser transferida para a de uma barata.";

const storyDNA = forgeStoryDNA(idea, "pt-BR");
storyDNA.status = "APPROVED_LOCAL";

const universe = createUniverseDraft(storyDNA, "pt-BR");
universe.status = "APPROVED_LOCAL";

const narrative = createNarrativeDraft(storyDNA, universe, "pt-BR");
narrative.status = "APPROVED_LOCAL";

const forgeV03 = forgeNarrativeV03({
  storyDNA,
  universe,
  narrative,
  targetMedia: "VISUAL_NOVEL",
  locale: "pt-BR"
});

const authority = createSceneAuthorityWorkspace(forgeV03);

const ledger = buildSemanticAssertionLedger({
  storyDNA,
  universe,
  narrative,
  forgeV03
});

const byPath = (path: string) =>
  ledger.assertions.find((item) => item.fieldPath === path);

assert(
  byPath("sourceIdea")?.authority === "IDEA",
  "Literal creator sourceIdea must remain IDEA."
);

assert(
  byPath("premise")?.authority === "IDEA",
  "Literal-equivalent premise must remain IDEA."
);

for (const path of [
  "genre",
  "tone",
  "audience",
  "centralConflict",
  "narrativePromise"
]) {
  assert(
    byPath(path)?.authority === "CANDIDATE",
    `Derived Story DNA field must remain CANDIDATE: ${path}`
  );
}

assert(
  ledger.assertions
    .filter((item) => item.fieldPath.startsWith("invariants["))
    .every((item) => item.authority === "GOVERNANCE"),
  "Story DNA invariants must be GOVERNANCE, not narrative truth."
);

assert(
  ledger.assertions
    .filter((item) => item.fieldPath.startsWith("worldRules["))
    .slice(0, 2)
    .every((item) => item.authority === "GOVERNANCE"),
  "Workspace governance world rules must not become diegetic facts."
);

assert(
  ledger.assertions.some(
    (item) =>
      item.fieldPath === "centralConflict" &&
      item.createdBy === "SYSTEM"
  ),
  "centralConflict provenance must identify SYSTEM authoring."
);

assert(
  ledger.entityTypeReview.some(
    (item) =>
      item.status === "UNRESOLVED" &&
      item.candidateTypes.includes("CHARACTER") &&
      item.candidateTypes.includes("ORGANIZATION")
  ),
  "Ambiguous experiment-force type must be surfaced for review."
);

assert(
  ledger.summary.idea > 0 &&
    ledger.summary.candidate > 0 &&
    ledger.summary.governance > 0,
  "Semantic authority summary must include IDEA, CANDIDATE and GOVERNANCE."
);

const tnir = buildV042TnirExport({
  storyDNA,
  universe,
  narrative,
  forgeV03,
  sceneAuthority: authority,
  targetMedia: "VISUAL_NOVEL",
  locale: "pt-BR"
}) as {
  semanticAssertions?: Array<{
    fieldPath?: string;
    authority?: string;
  }>;
  semanticAuthoritySummary?: {
    idea?: number;
    candidate?: number;
    governance?: number;
  };
  entityTypeReview?: Array<{
    status?: string;
    candidateTypes?: string[];
  }>;
  provenance?: {
    semanticAssertionLedgerVersion?: string;
    objectApprovalDoesNotPromoteNestedAssertions?: boolean;
  };
};

assert(
  Array.isArray(tnir.semanticAssertions) &&
    tnir.semanticAssertions.length === ledger.assertions.length,
  "T-NIR export must include the complete Semantic Assertion Ledger."
);

assert(
  tnir.semanticAssertions?.some(
    (item) =>
      item.fieldPath === "centralConflict" &&
      item.authority === "CANDIDATE"
  ),
  "T-NIR must preserve centralConflict as CANDIDATE."
);

assert(
  tnir.semanticAuthoritySummary?.governance ===
    ledger.summary.governance,
  "T-NIR semantic authority summary mismatch."
);

assert(
  tnir.entityTypeReview?.some(
    (item) => item.status === "UNRESOLVED"
  ),
  "T-NIR must expose unresolved entity-type review."
);

assert(
  tnir.provenance?.semanticAssertionLedgerVersion === "0.4.2",
  "Semantic Assertion Ledger version missing from T-NIR provenance."
);

assert(
  tnir.provenance?.objectApprovalDoesNotPromoteNestedAssertions === true,
  "Object-level approval must not promote nested assertions."
);

console.log("Story Workspace V0.4.2 Semantic Assertion Ledger probe passed.");
console.log(JSON.stringify({
  totalAssertions: ledger.summary.total,
  idea: ledger.summary.idea,
  candidate: ledger.summary.candidate,
  governance: ledger.summary.governance,
  unresolvedEntityTypes: ledger.entityTypeReview.length,
  centralConflictAuthority: byPath("centralConflict")?.authority,
  narrativePromiseAuthority: byPath("narrativePromise")?.authority,
  objectApprovalPromotesNestedAssertions: false
}, null, 2));
