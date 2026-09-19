import fs from "node:fs/promises";

const read = async (path) =>
  JSON.parse(await fs.readFile(new URL(`../${path}`, import.meta.url), "utf8"));

const universe = await read("examples/micro-universe.json");
const compiledPaths = [
  "examples/compiled/prose-plan.json",
  "examples/compiled/manga-plan.json",
  "examples/compiled/webtoon-plan.json",
  "examples/compiled/anime-plan.json",
  "examples/compiled/visual-novel-plan.json"
];
const realizedPaths = [
  "examples/realized/prose-descend.json",
  "examples/realized/manga-descend.json",
  "examples/realized/webtoon-descend.json",
  "examples/realized/anime-descend.json"
];

const compiled = await Promise.all(compiledPaths.map(read));
const realized = await Promise.all(realizedPaths.map(read));
const descend = await read("examples/runtime/descend.json");
const returning = await read("examples/runtime/return.json");
const brief = await read("examples/generation/manga-brief.json");
const assertionTest = await read("examples/realized/assertion-test.json");
const assertionConflict = await read("examples/realized/assertion-conflict.json");

const errors = [];
const expect = (condition, message) => {
  if (!condition) errors.push(message);
};

expect(universe.version === "0.5.0", "Universe must be v0.5.0");

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

for (const item of universe.decisionScores) {
  expect(
    item.totalScore === score(item),
    `Decision score mismatch: ${item.id} authored=${item.totalScore} computed=${score(item)}`
  );
}

const proposals = new Map(universe.actionProposals.map((x) => [x.id, x]));
const ranked = {};
for (const item of universe.decisionScores) {
  const actor = proposals.get(item.actionProposalId)?.actorId;
  if (!actor) {
    errors.push(`Decision score references unknown proposal: ${item.id}`);
    continue;
  }
  if (!ranked[actor]) ranked[actor] = [];
  ranked[actor].push(item);
}
for (const list of Object.values(ranked)) list.sort((a, b) => b.totalScore - a.totalScore);

expect(
  ranked["entity:lia"]?.[0]?.actionProposalId === "action-proposal:lia-trace-mark",
  "Lia top-ranked action must be trace-mark"
);
expect(
  ranked["entity:leo"]?.[0]?.actionProposalId === "action-proposal:leo-follow",
  "Leo top-ranked action must be follow"
);

for (const proposal of universe.eventProposals) {
  expect(proposal.authority === "CANDIDATE", `EventProposal promoted unexpectedly: ${proposal.id}`);
  expect(proposal.proposedEvent.canonStatus === "CANDIDATE", `Proposed Event is not CANDIDATE: ${proposal.id}`);
  expect(
    !universe.events.some((event) => event.id === proposal.proposedEvent.id),
    `Candidate Event leaked into canonical event graph: ${proposal.proposedEvent.id}`
  );
}

for (const proposal of universe.canonProposals) {
  expect(proposal.authority === "CANDIDATE", `CanonProposal promoted unexpectedly: ${proposal.id}`);
}

const root = universe.branches.find((x) => x.status === "CANON");
const branchDescend = universe.branches.find((x) => x.id === "branch:descend");
const allowedLinearEvents = new Set([...(root?.eventIds ?? []), ...(branchDescend?.eventIds ?? [])]);

for (const profile of universe.realizationProfiles) {
  if (profile.mode === "LINEAR") {
    expect(Boolean(profile.selectedBranchId), `Linear profile lacks selectedBranchId: ${profile.id}`);
  }
  if (profile.mode === "INTERACTIVE") {
    expect(!profile.selectedBranchId, `Interactive profile should not force branch: ${profile.id}`);
  }
}

for (const artifact of compiled) {
  expect(
    artifact.source.universeVersion === universe.version,
    `Stale compiled artifact: ${artifact.targetMedia}`
  );
  expect(
    artifact.validation.unmappedStoryEventIds.length === 0,
    `Compiled artifact has unmapped events: ${artifact.targetMedia}`
  );
}

for (const artifact of realized) {
  expect(
    artifact.source.universeVersion === universe.version,
    `Stale realized artifact: ${artifact.targetMedia}`
  );
  expect(
    artifact.output.selectedBranchId === "branch:descend",
    `Linear realization did not select descend branch: ${artifact.targetMedia}`
  );
  expect(
    !artifact.traceability.some((trace) => trace.sourceEventId === "event:009b"),
    `Linear realization leaked return branch event: ${artifact.targetMedia}`
  );
  for (const trace of artifact.traceability) {
    expect(
      allowedLinearEvents.has(trace.sourceEventId),
      `Realized artifact uses event outside resolved branch: ${artifact.targetMedia}/${trace.sourceEventId}`
    );
  }
}

const manga = realized.find((x) => x.targetMedia === "MANGA");
const webtoon = realized.find((x) => x.targetMedia === "WEBTOON");
const anime = realized.find((x) => x.targetMedia === "ANIME_EPISODE");
const prose = realized.find((x) => x.targetMedia === "PROSE_SHORT");

expect(manga?.output.readingDirection === "RIGHT_TO_LEFT", "Manga must be RIGHT_TO_LEFT");
expect(manga?.output.chapter.pages.length === 9, "Manga realized page count must be 9");
expect(webtoon?.output.readingDirection === "VERTICAL_SCROLL", "Webtoon must be VERTICAL_SCROLL");
expect(webtoon?.output.episode.panels.length === 9, "Webtoon realized panel count must be 9");
expect(
  webtoon?.output.episode.panels.some((panel) => panel.gapAfter === "LONG"),
  "Webtoon must use scroll pacing gaps"
);
const animeSeconds = (anime?.output.shots ?? []).reduce(
  (sum, shot) => sum + Number(shot.durationSeconds ?? 0),
  0
);
expect(Math.abs(animeSeconds - 90) < 0.01, `Anime duration must equal 90s, got ${animeSeconds}`);
expect(Boolean(prose?.output.text?.includes("Grandmother's mark")), "Prose realization missing core clue");

expect(descend.source.universeVersion === universe.version, "Stale descend runtime snapshot");
expect(returning.source.universeVersion === universe.version, "Stale return runtime snapshot");
expect(descend.runtimeVersion === "0.5.0", "Descend runtime is not v0.5");
expect(returning.runtimeVersion === "0.5.0", "Return runtime is not v0.5");
expect(descend.activeBranchId === "branch:descend", "Descend snapshot wrong branch");
expect(returning.activeBranchId === "branch:return", "Return snapshot wrong branch");
expect(descend.beliefRevisionsApplied.length === 2, "Descend must apply 2 belief revisions");
expect(descend.replansApplied.length === 2, "Descend must apply 2 replans");
expect(descend.relationshipState["relationship:siblings"].intensity === 1, "Descend trust transition mismatch");
expect(returning.worldState.mysteryDeferred === true, "Return state transition mismatch");

const occurred = new Set(root?.eventIds ?? []);
const conditionPasses = (condition) => {
  if (condition.type === "EVENT_OCCURRED") return occurred.has(condition.eventId);
  if (condition.type === "FACT_EQUALS") return universe.canon.some((f) => f.id === condition.factId);
  return false;
};
const expressionPasses = (expression) => {
  if (expression.type === "ATOM") return conditionPasses(expression.condition);
  if (expression.type === "ALL") return expression.children.every(expressionPasses);
  if (expression.type === "ANY") return expression.children.some(expressionPasses);
  if (expression.type === "NOT") return !expressionPasses(expression.child);
  return false;
};
for (const rule of universe.worldRules) {
  if (rule.expression) expect(expressionPasses(rule.expression), `Rule expression should pass: ${rule.id}`);
}

expect(brief.source.universeVersion === universe.version, "Stale Generation Brief");
expect(brief.authorityContract.mayInventCanon === false, "Generation Brief allows canon invention");
expect(
  brief.authorityContract.newUnapprovedFactsBecome === "CANDIDATE",
  "Generation Brief does not route new facts to CANDIDATE"
);

const canon = universe.canon.filter((x) => x.authority === "CANON");
const byKey = new Map();
for (const fact of canon) {
  const key = `${fact.subject}::${fact.predicate}`;
  if (!byKey.has(key)) byKey.set(key, []);
  byKey.get(key).push(fact);
}

const classify = (assertion) => {
  const key = `${assertion.subject}::${assertion.predicate}`;
  const existing = byKey.get(key) ?? [];
  if (!existing.length) return "UNSUPPORTED_NEW_FACT";
  if (existing.some((fact) => JSON.stringify(fact.object) === JSON.stringify(assertion.object))) {
    return "CANON_RESTATEMENT";
  }
  return "CANON_CONTRADICTION";
};

const testClasses = assertionTest.assertions.map(classify);
expect(
  testClasses.filter((x) => x === "UNSUPPORTED_NEW_FACT").length === 1,
  "Assertion test must detect exactly one unsupported fact"
);
expect(
  testClasses.filter((x) => x === "CANON_RESTATEMENT").length === 2,
  "Assertion test must detect two canon restatements"
);
expect(
  assertionConflict.assertions.map(classify).includes("CANON_CONTRADICTION"),
  "Explicit contradiction fixture was not detected"
);

if (errors.length) {
  console.error("T-NIR V0.5 validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("T-NIR V0.5 validation passed.");
console.log(JSON.stringify({
  universeVersion: universe.version,
  actionProposals: universe.actionProposals.length,
  decisionScores: universe.decisionScores.length,
  eventProposals: universe.eventProposals.length,
  canonProposals: universe.canonProposals.length,
  realizationProfiles: universe.realizationProfiles.length,
  realizedMedia: realized.map((x) => x.targetMedia),
  linearEvents: allowedLinearEvents.size,
  unsupportedAssertionTest: 1,
  contradictionTest: 1
}, null, 2));
