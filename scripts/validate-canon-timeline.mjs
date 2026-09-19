import fs from "node:fs/promises";
import process from "node:process";

const samplePath = process.argv[2]
  ? new URL(`../${process.argv[2]}`, import.meta.url)
  : new URL("../examples/micro-universe.json", import.meta.url);

const universe = JSON.parse(await fs.readFile(samplePath, "utf8"));
const errors = [];

const events = new Map(universe.events.map((x) => [x.id, x]));
const branches = new Map(universe.branches.map((x) => [x.id, x]));

const eventSequence = (eventId) => Number(events.get(eventId)?.time?.sequence ?? NaN);

for (const event of universe.events) {
  if (!Number.isFinite(eventSequence(event.id))) {
    errors.push(`event ${event.id}: missing numeric time.sequence`);
  }
  const branchId = event.time?.branchId;
  if (branchId && !branches.has(branchId)) {
    errors.push(`event ${event.id}: unknown time.branchId ${branchId}`);
  }
}

for (const link of universe.causalLinks) {
  const from = eventSequence(link.fromEventId);
  const to = eventSequence(link.toEventId);
  if (Number.isFinite(from) && Number.isFinite(to) && from >= to) {
    errors.push(`causalLink ${link.id}: cause sequence ${from} must be before effect sequence ${to}`);
  }
}

for (const branch of universe.branches) {
  let previous = -Infinity;
  for (const eventId of branch.eventIds) {
    const sequence = eventSequence(eventId);
    if (sequence < previous) {
      errors.push(`branch ${branch.id}: event order decreases at ${eventId}`);
    }
    previous = sequence;

    const eventBranchId = events.get(eventId)?.time?.branchId;
    if (eventBranchId && eventBranchId !== branch.id) {
      errors.push(`branch ${branch.id}: event ${eventId} declares branch ${eventBranchId}`);
    }
  }
}

const canonicalFacts = universe.canon.filter((x) => x.authority === "CANON");
const factGroups = new Map();

for (const fact of canonicalFacts) {
  const key = `${fact.subject}::${fact.predicate}`;
  if (!factGroups.has(key)) factGroups.set(key, []);
  factGroups.get(key).push(fact);
}

for (const [key, facts] of factGroups) {
  const distinct = new Set(facts.map((x) => JSON.stringify(x.object)));
  if (distinct.size > 1 && facts.every((x) => !x.validFromEventId && !x.validUntilEventId)) {
    errors.push(`canon contradiction for ${key}: multiple timeless CANON objects`);
  }
}

for (const character of universe.entities.filter((x) => x.type === "CHARACTER")) {
  const stateSequence = character.currentState?.atEventId
    ? eventSequence(character.currentState.atEventId)
    : Infinity;

  for (const knowledge of character.knowledge) {
    if (!knowledge.acquiredAtEventId) continue;
    const acquired = eventSequence(knowledge.acquiredAtEventId);
    if (Number.isFinite(stateSequence) && Number.isFinite(acquired) && acquired > stateSequence) {
      errors.push(`knowledge ${knowledge.id}: acquired after character currentState snapshot`);
    }
  }
}

if (errors.length) {
  console.error("Canon/timeline validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Canon/timeline validation passed.");
