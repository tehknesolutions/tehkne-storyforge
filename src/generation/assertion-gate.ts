import type { CanonFact, CanonProposal } from "../tnir/types.js";
import type { GeneratedAssertion } from "./model-adapter.js";

export type AssertionClassification =
  | "CANON_RESTATEMENT"
  | "UNSUPPORTED_NEW_FACT"
  | "CANON_CONTRADICTION";

export interface AssertionFinding {
  assertion: GeneratedAssertion;
  classification: AssertionClassification;
  canonFactId?: string;
  conflictsWithFactIds?: string[];
}

export function classifyAssertions(
  assertions: GeneratedAssertion[],
  canon: CanonFact[],
  artifactId: string
): {
  findings: AssertionFinding[];
  proposals: CanonProposal[];
} {
  const authoritative = canon.filter((fact) => fact.authority === "CANON");
  const groups = new Map<string, CanonFact[]>();

  for (const fact of authoritative) {
    const key = `${fact.subject}::${fact.predicate}`;
    const list = groups.get(key) ?? [];
    list.push(fact);
    groups.set(key, list);
  }

  const findings: AssertionFinding[] = [];
  const proposals: CanonProposal[] = [];

  assertions.forEach((assertion, index) => {
    const key = `${assertion.subject}::${assertion.predicate}`;
    const existing = groups.get(key) ?? [];
    const exact = existing.find(
      (fact) => JSON.stringify(fact.object) === JSON.stringify(assertion.object)
    );

    if (exact) {
      findings.push({
        assertion,
        classification: "CANON_RESTATEMENT",
        canonFactId: exact.id
      });
      return;
    }

    if (existing.length) {
      findings.push({
        assertion,
        classification: "CANON_CONTRADICTION",
        conflictsWithFactIds: existing.map((fact) => fact.id)
      });
      return;
    }

    findings.push({
      assertion,
      classification: "UNSUPPORTED_NEW_FACT"
    });

    proposals.push({
      id: `canon-proposal:generated:${artifactId}:${index + 1}`,
      subject: assertion.subject,
      predicate: assertion.predicate,
      object: assertion.object as string | number | boolean | Record<string, unknown>,
      authority: "CANDIDATE",
      proposedFromArtifactId: artifactId,
      conflictsWithFactIds: [],
      rationale: `Generated assertion from unit ${assertion.sourceUnitId} is not supported by current CANON.`
    });
  });

  return { findings, proposals };
}
