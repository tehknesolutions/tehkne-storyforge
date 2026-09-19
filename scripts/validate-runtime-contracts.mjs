import fs from "node:fs/promises";
import process from "node:process";

const samplePath = process.argv[2]
  ? new URL(`../${process.argv[2]}`, import.meta.url)
  : new URL("../examples/micro-universe.json", import.meta.url);

const universe = JSON.parse(await fs.readFile(samplePath, "utf8"));
const errors = [];

const entities = new Map(universe.entities.map((x) => [x.id, x]));
const events = new Map(universe.events.map((x) => [x.id, x]));
const facts = new Map(universe.canon.map((x) => [x.id, x]));
const evidence = new Map(universe.evidence.map((x) => [x.id, x]));

const beliefs = new Map();
const plans = new Map();
const goals = new Map();

for (const character of universe.entities.filter((x) => x.type === "CHARACTER")) {
  for (const belief of character.beliefs) beliefs.set(belief.id, { ...belief, parentId: character.id });
  for (const plan of character.plans) plans.set(plan.id, { ...plan, parentId: character.id });
  for (const goal of character.goals) goals.set(goal.id, { ...goal, parentId: character.id });

  for (const plan of character.plans) {
    for (const beliefId of plan.dependsOnBeliefIds ?? []) {
      if (!beliefs.has(beliefId) && !character.beliefs.some((b) => b.id === beliefId)) {
        errors.push(`plan ${plan.id}: dependency belief not found: ${beliefId}`);
      }
    }
    if (plan.supersedesPlanId && !character.plans.some((p) => p.id === plan.supersedesPlanId)) {
      errors.push(`plan ${plan.id}: supersedes plan not found: ${plan.supersedesPlanId}`);
    }
  }
}

for (const item of universe.evidence) {
  if (!events.has(item.discoveredAtEventId)) {
    errors.push(`evidence ${item.id}: unknown discovery event ${item.discoveredAtEventId}`);
  }
  for (const entityId of item.sourceEntityIds) {
    if (!entities.has(entityId)) errors.push(`evidence ${item.id}: unknown source entity ${entityId}`);
  }
  for (const beliefId of item.affectsBeliefIds) {
    if (!beliefs.has(beliefId)) errors.push(`evidence ${item.id}: unknown affected belief ${beliefId}`);
  }
}

for (const revision of universe.beliefRevisions) {
  const evidenceItem = evidence.get(revision.evidenceId);
  const belief = beliefs.get(revision.beliefId);

  if (!evidenceItem) errors.push(`beliefRevision ${revision.id}: unknown evidence ${revision.evidenceId}`);
  if (!belief) errors.push(`beliefRevision ${revision.id}: unknown belief ${revision.beliefId}`);
  if (belief && belief.holder !== revision.holder) {
    errors.push(`beliefRevision ${revision.id}: holder mismatch`);
  }
  if (belief && belief.confidence !== revision.previousConfidence) {
    errors.push(`beliefRevision ${revision.id}: previousConfidence does not match authored belief`);
  }
  if (evidenceItem && !evidenceItem.affectsBeliefIds.includes(revision.beliefId)) {
    errors.push(`beliefRevision ${revision.id}: evidence does not declare affected belief`);
  }
}

for (const rule of universe.replanRules) {
  const owner = entities.get(rule.owner);
  if (!owner || owner.type !== "CHARACTER") {
    errors.push(`replanRule ${rule.id}: owner is not a character`);
    continue;
  }

  const goal = goals.get(rule.goalId);
  const oldPlan = plans.get(rule.supersedePlanId);
  const newPlan = plans.get(rule.activatePlanId);

  if (!goal || goal.parentId !== rule.owner) errors.push(`replanRule ${rule.id}: goal mismatch`);
  if (!oldPlan || oldPlan.parentId !== rule.owner) errors.push(`replanRule ${rule.id}: supersedePlan mismatch`);
  if (!newPlan || newPlan.parentId !== rule.owner) errors.push(`replanRule ${rule.id}: activatePlan mismatch`);

  if (newPlan && newPlan.supersedesPlanId !== rule.supersedePlanId) {
    errors.push(`replanRule ${rule.id}: activated plan must declare supersedesPlanId`);
  }

  for (const beliefId of rule.whenBeliefIdsChanged) {
    if (!beliefs.has(beliefId)) errors.push(`replanRule ${rule.id}: trigger belief not found: ${beliefId}`);
    if (oldPlan && !(oldPlan.dependsOnBeliefIds ?? []).includes(beliefId)) {
      errors.push(`replanRule ${rule.id}: superseded plan does not depend on trigger belief ${beliefId}`);
    }
  }
}

const validateExpression = (expression, ruleId) => {
  if (!expression) return;
  if (expression.type === "ATOM") {
    const condition = expression.condition;
    if (condition.type === "EVENT_OCCURRED" && !events.has(condition.eventId)) {
      errors.push(`worldRule ${ruleId}: unknown expression event ${condition.eventId}`);
    }
    if (condition.type === "FACT_EQUALS" && !facts.has(condition.factId)) {
      errors.push(`worldRule ${ruleId}: unknown expression fact ${condition.factId}`);
    }
    return;
  }
  if (expression.type === "ALL" || expression.type === "ANY") {
    for (const child of expression.children) validateExpression(child, ruleId);
    return;
  }
  if (expression.type === "NOT") validateExpression(expression.child, ruleId);
};

for (const rule of universe.worldRules) {
  validateExpression(rule.expression, rule.id);
  for (const condition of rule.conditions) {
    if (condition.type === "EVENT_OCCURRED" && !events.has(condition.eventId)) {
      errors.push(`worldRule ${rule.id}: unknown condition event ${condition.eventId}`);
    }
    if (condition.type === "FACT_EQUALS" && !facts.has(condition.factId)) {
      errors.push(`worldRule ${rule.id}: unknown condition fact ${condition.factId}`);
    }
  }

  for (const effect of rule.effects) {
    if ((effect.type === "ALLOW_EVENT" || effect.type === "DENY_EVENT") && !events.has(effect.eventId)) {
      errors.push(`worldRule ${rule.id}: unknown effect event ${effect.eventId}`);
    }
  }
}

if (errors.length) {
  console.error("Runtime contract validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Runtime contract validation passed.");
