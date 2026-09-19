import fs from "node:fs/promises";
import process from "node:process";

const briefPath = process.argv[2]
  ? new URL(`../${process.argv[2]}`, import.meta.url)
  : new URL("../examples/generation/manga-brief.json", import.meta.url);

const universe = JSON.parse(
  await fs.readFile(new URL("../examples/micro-universe.json", import.meta.url), "utf8")
);
const brief = JSON.parse(await fs.readFile(briefPath, "utf8"));
const errors = [];

const eventIds = new Set(universe.events.map((x) => x.id));
const canonIds = new Set(universe.canon.filter((x) => x.authority === "CANON").map((x) => x.id));

if (brief.artifactType !== "GENERATION_BRIEF") errors.push("invalid artifactType");
if (brief.authorityContract?.mayInventCanon !== false) errors.push("mayInventCanon must be false");
if (brief.authorityContract?.newUnapprovedFactsBecome !== "CANDIDATE") {
  errors.push("new unapproved facts must become CANDIDATE");
}

const briefCanonIds = new Set((brief.authoritativeCanon ?? []).map((x) => x.id));
for (const id of canonIds) {
  if (!briefCanonIds.has(id)) errors.push(`missing canonical fact ${id}`);
}

for (const unit of brief.units ?? []) {
  if (!(unit.source?.eventIds?.length > 0)) errors.push(`unit ${unit.unitId}: missing event trace`);
  for (const id of unit.source?.eventIds ?? []) {
    if (!eventIds.has(id)) errors.push(`unit ${unit.unitId}: unknown event ${id}`);
  }
}

if (errors.length) {
  console.error("Generation brief validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Generation brief validation passed.");
