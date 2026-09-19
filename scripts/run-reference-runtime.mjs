import fs from "node:fs/promises";
import process from "node:process";

const selectedOptionId = process.argv[2] ?? "choice-option:descend";
const inputPath = process.argv[3]
  ? new URL(`../${process.argv[3]}`, import.meta.url)
  : new URL("../examples/micro-universe.json", import.meta.url);

const universe = JSON.parse(await fs.readFile(inputPath, "utf8"));

const entities = new Map(universe.entities.map((x) => [x.id, structuredClone(x)]));
const events = new Map(universe.events.map((x) => [x.id, x]));
const facts = new Map(universe.canon.map((x) => [x.id, x]));
const transitions = new Map(universe.stateTransitions.map((x) => [x.id, x]));
const branches = new Map(universe.branches.map((x) => [x.id, x]));
const evidenceById = new Map(universe.evidence.map((x) => [x.id, x]));

const rootBranch = universe.branches.find((x) => x.status === "CANON") ?? universe.branches[0];
if (!rootBranch) throw new Error("No root branch found");

const choice = universe.choices.find((c) => c.options.some((o) => o.id === selectedOptionId));
if (!choice) throw new Error(`Choice option not found: ${selectedOptionId}`);

const option = choice.options.find((o) => o.id === selectedOptionId);
if (!option) throw new Error(`Choice option not found: ${selectedOptionId}`);

const activeBranch = option.branchId ? branches.get(option.branchId) : undefined;
if (!activeBranch) throw new Error(`Branch not found for option: ${selectedOptionId}`);

const occurredEvents = new Set(rootBranch.eventIds);
const worldState = {};
const relationshipState = Object.fromEntries(
  universe.relationships.map((r) => [r.id, { intensity: r.intensity ?? 0 }])
);

const getAtPath = (obj, path) => {
  const keys = path.split(".").filter(Boolean);
  let current = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[key];
  }
  return current;
};

const setAtPath = (obj, path, value) => {
  const keys = path.split(".").filter(Boolean);
  if (!keys.length) throw new Error("State patch path cannot be empty");
  let current = obj;
  for (const key of keys.slice(0, -1)) {
    if (!current[key] || typeof current[key] !== "object") current[key] = {};
    current = current[key];
  }
  current[keys.at(-1)] = value;
};

const removeAtPath = (obj, path) => {
  const keys = path.split(".").filter(Boolean);
  let current = obj;
  for (const key of keys.slice(0, -1)) {
    if (!current?.[key] || typeof current[key] !== "object") return;
    current = current[key];
  }
  delete current[keys.at(-1)];
};

const applyPatch = (target, patch) => {
  const previous = getAtPath(target, patch.path);
  switch (patch.op) {
    case "SET":
      setAtPath(target, patch.path, patch.value);
      break;
    case "UNSET":
      removeAtPath(target, patch.path);
      break;
    case "INCREMENT":
      setAtPath(target, patch.path, Number(previous ?? 0) + Number(patch.value ?? 0));
      break;
    case "DECREMENT":
      setAtPath(target, patch.path, Number(previous ?? 0) - Number(patch.value ?? 0));
      break;
    case "ADD": {
      const next = Array.isArray(previous) ? [...previous] : [];
      if (!next.includes(patch.value)) next.push(patch.value);
      setAtPath(target, patch.path, next);
      break;
    }
    case "REMOVE": {
      const next = Array.isArray(previous)
        ? previous.filter((x) => JSON.stringify(x) !== JSON.stringify(patch.value))
        : [];
      setAtPath(target, patch.path, next);
      break;
    }
    default:
      throw new Error(`Unsupported state patch operation: ${patch.op}`);
  }
};

const characterRuntime = {};
for (const entity of entities.values()) {
  if (entity.type !== "CHARACTER") continue;
  characterRuntime[entity.id] = {
    beliefs: Object.fromEntries(entity.beliefs.map((b) => [b.id, {
      confidence: b.confidence,
      truthRelation: b.truthRelation,
      status: b.status
    }])),
    plans: Object.fromEntries(entity.plans.map((p) => [p.id, {
      revision: p.revision,
      status: p.status,
      goalId: p.goalId
    }]))
  };
}

const evidenceApplied = [];
const beliefRevisionsApplied = [];
const changedBeliefIds = new Set();

for (const revision of universe.beliefRevisions) {
  const evidence = evidenceById.get(revision.evidenceId);
  if (!evidence || !occurredEvents.has(evidence.discoveredAtEventId)) continue;

  const runtimeCharacter = characterRuntime[revision.holder];
  const runtimeBelief = runtimeCharacter?.beliefs?.[revision.beliefId];
  if (!runtimeBelief) continue;

  runtimeBelief.confidence = revision.newConfidence;
  if (revision.newTruthRelation) runtimeBelief.truthRelation = revision.newTruthRelation;
  if (revision.newStatus) runtimeBelief.status = revision.newStatus;

  changedBeliefIds.add(revision.beliefId);
  evidenceApplied.push(evidence.id);
  beliefRevisionsApplied.push(revision.id);
}

const replansApplied = [];
for (const rule of universe.replanRules) {
  if (!rule.whenBeliefIdsChanged.some((id) => changedBeliefIds.has(id))) continue;
  const runtimeCharacter = characterRuntime[rule.owner];
  if (!runtimeCharacter) continue;

  const oldPlan = runtimeCharacter.plans[rule.supersedePlanId];
  const newPlan = runtimeCharacter.plans[rule.activatePlanId];
  if (!oldPlan || !newPlan) continue;

  oldPlan.status = "ABANDONED";
  newPlan.status = "ACTIVE";
  replansApplied.push(rule.id);
}

const stateTarget = (targetId) => {
  if (targetId === "WORLD") return worldState;
  if (targetId.startsWith("relationship:")) return relationshipState[targetId];
  if (targetId.startsWith("entity:")) {
    const entity = entities.get(targetId);
    if (!entity) throw new Error(`State transition target not found: ${targetId}`);
    if (!entity.runtimeState) entity.runtimeState = {};
    return entity.runtimeState;
  }
  throw new Error(`Unsupported state target: ${targetId}`);
};

const ruleEvaluations = [];
const allowedEvents = new Set();
const deniedEvents = new Map();

const conditionPasses = (condition) => {
  if (condition.type === "EVENT_OCCURRED") return occurredEvents.has(condition.eventId);
  if (condition.type === "FACT_EQUALS") return facts.has(condition.factId);
  if (condition.type === "STATE_EQUALS") {
    return JSON.stringify(getAtPath(stateTarget(condition.targetId), condition.path))
      === JSON.stringify(condition.value);
  }
  return false;
};

const expressionPasses = (expression) => {
  if (!expression) return true;
  if (expression.type === "ATOM") return conditionPasses(expression.condition);
  if (expression.type === "ALL") return expression.children.every(expressionPasses);
  if (expression.type === "ANY") return expression.children.some(expressionPasses);
  if (expression.type === "NOT") return !expressionPasses(expression.child);
  return false;
};

for (const rule of universe.worldRules) {
  const passed = rule.expression
    ? expressionPasses(rule.expression)
    : rule.conditions.every(conditionPasses);
  const effectsApplied = [];

  if (passed) {
    for (const effect of rule.effects) {
      if (effect.type === "ALLOW_EVENT") {
        allowedEvents.add(effect.eventId);
        effectsApplied.push(effect);
      } else if (effect.type === "DENY_EVENT") {
        deniedEvents.set(effect.eventId, effect.reason);
        effectsApplied.push(effect);
      } else if (effect.type === "SET_STATE") {
        setAtPath(stateTarget(effect.targetId), effect.path, effect.value);
        effectsApplied.push(effect);
      }
    }
  }

  ruleEvaluations.push({
    ruleId: rule.id,
    passed,
    effectsApplied
  });
}

if (option.transitionId) {
  const transition = transitions.get(option.transitionId);
  if (!transition) throw new Error(`Transition not found: ${option.transitionId}`);
  const target = stateTarget(transition.targetId);
  for (const patch of transition.patches) applyPatch(target, patch);
}

for (const eventId of activeBranch.eventIds) {
  if (deniedEvents.has(eventId)) {
    throw new Error(`Event ${eventId} denied by rule: ${deniedEvents.get(eventId)}`);
  }
  occurredEvents.add(eventId);
}

const chronology = [...occurredEvents]
  .map((id) => events.get(id))
  .filter(Boolean)
  .sort((a, b) => Number(a.time?.sequence ?? 0) - Number(b.time?.sequence ?? 0))
  .map((event) => event.id);

const output = {
  runtimeVersion: "0.4.0",
  source: {
    universeId: universe.id,
    universeVersion: universe.version
  },
  input: {
    choiceId: choice.id,
    selectedOptionId
  },
  activeBranchId: activeBranch.id,
  occurredEventIds: chronology,
  evidenceApplied: [...new Set(evidenceApplied)],
  beliefRevisionsApplied,
  changedBeliefIds: [...changedBeliefIds],
  replansApplied,
  ruleEvaluations,
  allowedEventIds: [...allowedEvents],
  worldState,
  relationshipState,
  characters: characterRuntime
};

console.log(JSON.stringify(output, null, 2));
