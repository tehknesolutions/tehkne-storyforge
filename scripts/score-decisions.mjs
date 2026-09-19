import fs from "node:fs/promises";

const universe = JSON.parse(
  await fs.readFile(new URL("../examples/micro-universe.json", import.meta.url), "utf8")
);

const weights = {
  goalAlignment: 0.30,
  beliefSupport: 0.15,
  valueAlignment: 0.15,
  feasibility: 0.15,
  risk: -0.15,
  relationshipImpact: 0.05,
  dramaticPressure: 0.05
};

const score = (item) => Number((
  item.goalAlignment * weights.goalAlignment +
  item.beliefSupport * weights.beliefSupport +
  item.valueAlignment * weights.valueAlignment +
  item.feasibility * weights.feasibility +
  item.risk * weights.risk +
  item.relationshipImpact * weights.relationshipImpact +
  item.dramaticPressure * weights.dramaticPressure
).toFixed(4));

const proposals = new Map(universe.actionProposals.map((x) => [x.id, x]));
const rankedByActor = {};
const output = universe.decisionScores.map((item) => {
  const proposal = proposals.get(item.actionProposalId);
  if (!proposal) throw new Error(`Unknown action proposal: ${item.actionProposalId}`);

  const computedScore = score(item);
  const enriched = {
    ...item,
    authoredTotalScore: item.totalScore,
    computedScore,
    actorId: proposal.actorId,
    action: proposal.action
  };

  if (!rankedByActor[proposal.actorId]) rankedByActor[proposal.actorId] = [];
  rankedByActor[proposal.actorId].push(enriched);
  return enriched;
});

for (const values of Object.values(rankedByActor)) {
  values.sort((a, b) => b.computedScore - a.computedScore);
}

console.log(JSON.stringify({
  policyVersion: "0.1.0",
  weights,
  scores: output,
  rankedByActor
}, null, 2));
