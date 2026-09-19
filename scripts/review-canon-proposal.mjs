import fs from "node:fs/promises";
import process from "node:process";

const proposalId = process.argv[2] ?? "canon-proposal:grandmother-authored-lantern";
const universe = JSON.parse(
  await fs.readFile(new URL("../examples/micro-universe.json", import.meta.url), "utf8")
);

const proposal = universe.canonProposals.find((x) => x.id === proposalId);
if (!proposal) {
  console.error(`CanonProposal not found: ${proposalId}`);
  process.exit(1);
}

const samePredicateFacts = universe.canon.filter(
  (fact) => fact.authority === "CANON" &&
    fact.subject === proposal.subject &&
    fact.predicate === proposal.predicate
);

const exact = samePredicateFacts.find(
  (fact) => JSON.stringify(fact.object) === JSON.stringify(proposal.object)
);

let status;
if (exact) status = "ALREADY_CANON";
else if (samePredicateFacts.length) status = "CONFLICT_REQUIRES_CREATOR";
else status = "READY_FOR_CREATOR_REVIEW";

console.log(JSON.stringify({
  reviewVersion: "0.1.0",
  proposalId,
  proposalAuthority: proposal.authority,
  status,
  exactCanonFactId: exact?.id,
  conflictsWithFactIds: samePredicateFacts
    .filter((fact) => !exact || fact.id !== exact.id)
    .map((fact) => fact.id),
  rationale: proposal.rationale,
  automaticPromotionAllowed: false,
  creatorDecisionRequired: status !== "ALREADY_CANON"
}, null, 2));
