import fs from "node:fs/promises";
import process from "node:process";

const artifactPath = process.argv[2];
if (!artifactPath) {
  console.error("Usage: node scripts/check-canon-conflicts.mjs <artifact.json>");
  process.exit(1);
}

const universe = JSON.parse(
  await fs.readFile(new URL("../examples/micro-universe.json", import.meta.url), "utf8")
);
const artifact = JSON.parse(
  await fs.readFile(new URL(`../${artifactPath}`, import.meta.url), "utf8")
);

const canon = universe.canon.filter((x) => x.authority === "CANON");
const bySubjectPredicate = new Map();

for (const fact of canon) {
  const key = `${fact.subject}::${fact.predicate}`;
  if (!bySubjectPredicate.has(key)) bySubjectPredicate.set(key, []);
  bySubjectPredicate.get(key).push(fact);
}

const findings = [];

for (const assertion of artifact.assertions ?? []) {
  const key = `${assertion.subject}::${assertion.predicate}`;
  const existing = bySubjectPredicate.get(key) ?? [];

  if (!existing.length) {
    findings.push({
      type: "UNSUPPORTED_NEW_FACT",
      assertion,
      requiredAuthority: "CANDIDATE"
    });
    continue;
  }

  const exact = existing.find((fact) =>
    JSON.stringify(fact.object) === JSON.stringify(assertion.object)
  );

  if (exact) {
    findings.push({
      type: "CANON_RESTATEMENT",
      assertion,
      canonFactId: exact.id
    });
  } else {
    findings.push({
      type: "CANON_CONTRADICTION",
      assertion,
      conflictsWithFactIds: existing.map((x) => x.id)
    });
  }
}

const conflicts = findings.filter((x) => x.type === "CANON_CONTRADICTION");
const unsupported = findings.filter((x) => x.type === "UNSUPPORTED_NEW_FACT");

console.log(JSON.stringify({
  artifactId: artifact.source?.realizationProfileId ?? artifact.artifactType,
  status: conflicts.length ? "FAIL" : "PASS",
  conflicts,
  unsupported,
  restatements: findings.filter((x) => x.type === "CANON_RESTATEMENT")
}, null, 2));

if (conflicts.length) process.exit(1);
