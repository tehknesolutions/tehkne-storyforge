import fs from "node:fs/promises";
import process from "node:process";

const proposalId = process.argv[2] ?? "event-proposal:trace-grandmother-mark";
const universe = JSON.parse(
  await fs.readFile(new URL("../examples/micro-universe.json", import.meta.url), "utf8")
);

const proposal = universe.eventProposals.find((x) => x.id === proposalId);
if (!proposal) {
  console.error(`EventProposal not found: ${proposalId}`);
  process.exit(1);
}

if (proposal.authority !== "CANDIDATE" || proposal.proposedEvent.canonStatus !== "CANDIDATE") {
  throw new Error("Only CANDIDATE events may be simulated by this tool");
}

const existingIds = new Set(universe.events.map((x) => x.id));
if (existingIds.has(proposal.proposedEvent.id)) {
  throw new Error(`Proposed event ID already exists in canonical event graph: ${proposal.proposedEvent.id}`);
}

const branchId = proposal.proposedEvent.time?.branchId;
const branch = universe.branches.find((x) => x.id === branchId);
if (!branch) throw new Error(`Simulation branch not found: ${branchId}`);

const simulatedBranch = {
  ...branch,
  eventIds: [...branch.eventIds, proposal.proposedEvent.id]
};

console.log(JSON.stringify({
  simulationVersion: "0.1.0",
  proposalId,
  authority: proposal.authority,
  persisted: false,
  canonChanged: false,
  branchBefore: branch,
  branchAfter: simulatedBranch,
  simulatedEvent: proposal.proposedEvent,
  validationNotes: proposal.validationNotes,
  creatorDecisionRequired: true
}, null, 2));
