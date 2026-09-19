import fs from "node:fs/promises";
import process from "node:process";

const samplePath = process.argv[2]
  ? new URL(`../${process.argv[2]}`, import.meta.url)
  : new URL("../examples/micro-universe.json", import.meta.url);

const universe = JSON.parse(await fs.readFile(samplePath, "utf8"));
const errors = [];

const ensureUnique = (items, label) => {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item.id)) errors.push(`${label}: duplicate id ${item.id}`);
    seen.add(item.id);
  }
};

ensureUnique(universe.entities, "entities");
ensureUnique(universe.canon, "canon");
ensureUnique(universe.relationships, "relationships");
ensureUnique(universe.events, "events");
ensureUnique(universe.causalLinks, "causalLinks");
ensureUnique(universe.stories, "stories");
ensureUnique(universe.mediaManifests, "mediaManifests");

const entities = new Map(universe.entities.map((x) => [x.id, x]));
const events = new Map(universe.events.map((x) => [x.id, x]));
const stories = new Map(universe.stories.map((x) => [x.id, x]));

const requireEntity = (id, context) => {
  if (typeof id === "string" && id.startsWith("entity:") && !entities.has(id)) {
    errors.push(`${context}: unknown entity ${id}`);
  }
};

const requireEvent = (id, context) => {
  if (id && !events.has(id)) errors.push(`${context}: unknown event ${id}`);
};

for (const fact of universe.canon) {
  requireEntity(fact.subject, `canon ${fact.id} subject`);
  if (typeof fact.object === "string") requireEntity(fact.object, `canon ${fact.id} object`);
  requireEvent(fact.validFromEventId, `canon ${fact.id} validFromEventId`);
  requireEvent(fact.validUntilEventId, `canon ${fact.id} validUntilEventId`);
}

for (const relation of universe.relationships) {
  requireEntity(relation.from, `relationship ${relation.id} from`);
  requireEntity(relation.to, `relationship ${relation.id} to`);
  requireEvent(relation.validFromEventId, `relationship ${relation.id} validFromEventId`);
  requireEvent(relation.validUntilEventId, `relationship ${relation.id} validUntilEventId`);
}

for (const event of universe.events) {
  for (const participant of event.participants) requireEntity(participant, `event ${event.id} participant`);
  requireEntity(event.locationId, `event ${event.id} locationId`);
  for (const ref of event.causedBy ?? []) requireEvent(ref, `event ${event.id} causedBy`);
  for (const ref of event.causes ?? []) requireEvent(ref, `event ${event.id} causes`);
}

for (const link of universe.causalLinks) {
  requireEvent(link.fromEventId, `causalLink ${link.id} fromEventId`);
  requireEvent(link.toEventId, `causalLink ${link.id} toEventId`);
  if (link.fromEventId === link.toEventId) {
    errors.push(`causalLink ${link.id}: self-causation is not allowed`);
  }
}

for (const story of universe.stories) {
  for (const eventId of story.eventIds) requireEvent(eventId, `story ${story.id} eventIds`);
  for (const scene of story.scenes ?? []) {
    requireEntity(scene.povEntityId, `scene ${scene.id} povEntityId`);
    requireEntity(scene.locationId, `scene ${scene.id} locationId`);
    for (const eventId of scene.eventIds) requireEvent(eventId, `scene ${scene.id} eventIds`);
    for (const beat of scene.beats ?? []) {
      for (const eventId of beat.eventIds ?? []) requireEvent(eventId, `beat ${beat.id} eventIds`);
    }
  }
}

for (const manifest of universe.mediaManifests) {
  if (!stories.has(manifest.storyId)) {
    errors.push(`mediaManifest ${manifest.id}: unknown story ${manifest.storyId}`);
  }
}

for (const character of universe.entities.filter((x) => x.type === "CHARACTER")) {
  const goalIds = new Set(character.goals.map((x) => x.id));
  const beliefIds = new Set(character.beliefs.map((x) => x.id));
  const knowledgeIds = new Set(character.knowledge.map((x) => x.id));

  ensureUnique(character.beliefs, `${character.id}.beliefs`);
  ensureUnique(character.knowledge, `${character.id}.knowledge`);
  ensureUnique(character.goals, `${character.id}.goals`);
  ensureUnique(character.plans, `${character.id}.plans`);
  ensureUnique(character.secrets, `${character.id}.secrets`);
  ensureUnique(character.intentions, `${character.id}.intentions`);

  for (const belief of character.beliefs) {
    if (belief.holder !== character.id) errors.push(`belief ${belief.id}: holder must equal parent character ${character.id}`);
    requireEvent(belief.acquiredAtEventId, `belief ${belief.id} acquiredAtEventId`);
    requireEvent(belief.revisedAtEventId, `belief ${belief.id} revisedAtEventId`);
  }

  for (const knowledge of character.knowledge) {
    if (knowledge.holder !== character.id) errors.push(`knowledge ${knowledge.id}: holder must equal parent character ${character.id}`);
    requireEvent(knowledge.acquiredAtEventId, `knowledge ${knowledge.id} acquiredAtEventId`);
    requireEntity(knowledge.sourceEntityId, `knowledge ${knowledge.id} sourceEntityId`);
  }

  for (const goal of character.goals) {
    if (goal.owner !== character.id) errors.push(`goal ${goal.id}: owner must equal parent character ${character.id}`);
    requireEvent(goal.createdAtEventId, `goal ${goal.id} createdAtEventId`);
    requireEvent(goal.resolvedAtEventId, `goal ${goal.id} resolvedAtEventId`);
  }

  for (const plan of character.plans) {
    if (plan.owner !== character.id) errors.push(`plan ${plan.id}: owner must equal parent character ${character.id}`);
    if (!goalIds.has(plan.goalId)) errors.push(`plan ${plan.id}: unknown goal ${plan.goalId} for ${character.id}`);
    requireEvent(plan.createdAtEventId, `plan ${plan.id} createdAtEventId`);
    ensureUnique(plan.steps, `${plan.id}.steps`);
    const stepIds = new Set(plan.steps.map((x) => x.id));
    if (plan.currentStepId && !stepIds.has(plan.currentStepId)) {
      errors.push(`plan ${plan.id}: currentStepId ${plan.currentStepId} is not in plan steps`);
    }
    for (const step of plan.steps) {
      requireEntity(step.targetId, `plan step ${step.id} targetId`);
      requireEvent(step.completedAtEventId, `plan step ${step.id} completedAtEventId`);
    }
  }

  for (const intention of character.intentions) {
    if (intention.owner !== character.id) errors.push(`intention ${intention.id}: owner must equal parent character ${character.id}`);
    if (intention.goalId && !goalIds.has(intention.goalId)) errors.push(`intention ${intention.id}: unknown goal ${intention.goalId}`);
    requireEntity(intention.targetId, `intention ${intention.id} targetId`);
    requireEvent(intention.formedAtEventId, `intention ${intention.id} formedAtEventId`);
  }

  for (const secret of character.secrets) {
    for (const entityId of secret.about) requireEntity(entityId, `secret ${secret.id} about`);
    for (const entityId of secret.knownBy) requireEntity(entityId, `secret ${secret.id} knownBy`);
    for (const entityId of secret.hiddenFrom) requireEntity(entityId, `secret ${secret.id} hiddenFrom`);
    requireEvent(secret.revealedAtEventId, `secret ${secret.id} revealedAtEventId`);
    if (secret.status === "REVEALED" && !secret.revealedAtEventId) {
      errors.push(`secret ${secret.id}: REVEALED requires revealedAtEventId`);
    }
  }

  requireEntity(character.currentState.locationId, `${character.id}.currentState.locationId`);
  requireEvent(character.currentState.atEventId, `${character.id}.currentState.atEventId`);

  for (const event of universe.events) {
    for (const effect of event.knowledgeEffects ?? []) {
      if (effect.holder !== character.id) continue;
      if (effect.knowledgeId && !knowledgeIds.has(effect.knowledgeId)) {
        errors.push(`event ${event.id}: unknown knowledge ${effect.knowledgeId} for ${character.id}`);
      }
      if (effect.beliefId && !beliefIds.has(effect.beliefId)) {
        errors.push(`event ${event.id}: unknown belief ${effect.beliefId} for ${character.id}`);
      }
    }
    for (const effect of event.goalEffects ?? []) {
      if (effect.owner !== character.id) continue;
      if (!goalIds.has(effect.goalId)) {
        errors.push(`event ${event.id}: unknown goal ${effect.goalId} for ${character.id}`);
      }
    }
  }
}

if (errors.length) {
  console.error("T-NIR semantic validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("T-NIR semantic validation passed.");
