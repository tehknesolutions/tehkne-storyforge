import { execFileSync } from "node:child_process";

const run = (optionId) => {
  const stdout = execFileSync(
    process.execPath,
    ["scripts/run-reference-runtime.mjs", optionId],
    { encoding: "utf8" }
  );
  return JSON.parse(stdout);
};

const descend = run("choice-option:descend");
const returning = run("choice-option:return");
const errors = [];

const expect = (condition, message) => {
  if (!condition) errors.push(message);
};

for (const result of [descend, returning]) {
  expect(result.evidenceApplied.includes("evidence:grandmother-mark"), "Grandmother evidence was not applied");
  expect(result.beliefRevisionsApplied.length === 2, "Expected two belief revisions");
  expect(result.replansApplied.length === 2, "Expected two replanning rules");
  expect(result.allowedEventIds.includes("event:006"), "World rule did not allow event:006");

  expect(
    result.characters["entity:lia"].beliefs["belief:lia-father-hid-lantern"].confidence === 0.2,
    "Lia belief confidence was not revised to 0.2"
  );
  expect(
    result.characters["entity:leo"].beliefs["belief:leo-stranger-trap"].confidence === 0.25,
    "Leo belief confidence was not revised to 0.25"
  );

  expect(
    result.characters["entity:lia"].plans["plan:lia-investigate"].status === "ABANDONED",
    "Lia v1 plan was not abandoned"
  );
  expect(
    result.characters["entity:lia"].plans["plan:lia-follow-grandmother-clue"].status === "ACTIVE",
    "Lia v2 plan was not activated"
  );
  expect(
    result.characters["entity:leo"].plans["plan:leo-control-risk"].status === "ABANDONED",
    "Leo v1 plan was not abandoned"
  );
  expect(
    result.characters["entity:leo"].plans["plan:leo-protect-and-verify"].status === "ACTIVE",
    "Leo v2 plan was not activated"
  );
}

expect(descend.activeBranchId === "branch:descend", "Descend branch not selected");
expect(descend.relationshipState["relationship:siblings"].intensity === 1, "Descend transition did not increase sibling intensity to 1");
expect(descend.occurredEventIds.includes("event:009a"), "Descend outcome event missing");

expect(returning.activeBranchId === "branch:return", "Return branch not selected");
expect(returning.worldState.mysteryDeferred === true, "Return transition did not defer mystery");
expect(returning.occurredEventIds.includes("event:009b"), "Return outcome event missing");

if (errors.length) {
  console.error("Reference runtime validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Reference runtime validation passed.");
console.log(JSON.stringify({
  descend: {
    branch: descend.activeBranchId,
    events: descend.occurredEventIds.length,
    revisedBeliefs: descend.beliefRevisionsApplied.length,
    replans: descend.replansApplied.length
  },
  return: {
    branch: returning.activeBranchId,
    events: returning.occurredEventIds.length,
    revisedBeliefs: returning.beliefRevisionsApplied.length,
    replans: returning.replansApplied.length
  }
}, null, 2));
