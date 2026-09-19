import fs from "node:fs/promises";
import process from "node:process";
import { execFileSync } from "node:child_process";

const targetMedia = process.argv[2] ?? "MANGA";
const inputPath = process.argv[3] ?? "examples/micro-universe.json";

const universe = JSON.parse(
  await fs.readFile(new URL(`../${inputPath}`, import.meta.url), "utf8")
);

const mediaPlan = JSON.parse(
  execFileSync(
    process.execPath,
    ["scripts/compile-reference.mjs", targetMedia, inputPath],
    { encoding: "utf8" }
  )
);

const events = new Map(universe.events.map((x) => [x.id, x]));
const entities = new Map(universe.entities.map((x) => [x.id, x]));

const compactEntity = (id) => {
  const entity = entities.get(id);
  if (!entity) return { id };
  return {
    id: entity.id,
    type: entity.type,
    name: entity.name,
    ...(entity.description ? { description: entity.description } : {})
  };
};

const units = mediaPlan.traceability.map((trace) => ({
  unitId: trace.unitId,
  source: {
    eventIds: trace.eventIds,
    ...(trace.sceneId ? { sceneId: trace.sceneId } : {}),
    ...(trace.choiceIds ? { choiceIds: trace.choiceIds } : {}),
    ...(trace.ruleIds ? { ruleIds: trace.ruleIds } : {}),
    ...(trace.evidenceIds ? { evidenceIds: trace.evidenceIds } : {})
  },
  events: trace.eventIds.map((eventId) => {
    const event = events.get(eventId);
    return {
      id: eventId,
      type: event?.type,
      participants: (event?.participants ?? []).map(compactEntity),
      ...(event?.locationId ? { location: compactEntity(event.locationId) } : {}),
      actions: event?.actions ?? [],
      effects: event?.effects ?? [],
      knowledgeEffects: event?.knowledgeEffects ?? [],
      goalEffects: event?.goalEffects ?? []
    };
  })
}));

const brief = {
  artifactType: "GENERATION_BRIEF",
  briefVersion: "0.1.0",
  targetMedia,
  source: mediaPlan.source,
  creatorIntent: universe.storyDNA.creatorIntent,
  storyDNA: {
    premise: universe.storyDNA.premise,
    themes: universe.storyDNA.themes,
    genres: universe.storyDNA.genres,
    tone: universe.storyDNA.tone,
    audience: universe.storyDNA.audience ?? [],
    emotionalPromise: universe.storyDNA.emotionalPromise ?? []
  },
  authorityContract: {
    canonicalAuthority: "CANON",
    mayInventCanon: false,
    newUnapprovedFactsBecome: "CANDIDATE",
    preserveEventCausality: true,
    preserveCharacterKnowledgeBoundaries: true,
    preserveTraceability: true
  },
  authoritativeCanon: universe.canon
    .filter((fact) => fact.authority === "CANON")
    .map((fact) => ({
      id: fact.id,
      subject: fact.subject,
      predicate: fact.predicate,
      object: fact.object
    })),
  units
};

console.log(JSON.stringify(brief, null, 2));
