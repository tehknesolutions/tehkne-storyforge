import { execFileSync } from "node:child_process";

const targets = ["PROSE_SHORT", "MANGA", "WEBTOON", "ANIME_EPISODE", "VISUAL_NOVEL"];
const results = [];

for (const target of targets) {
  const stdout = execFileSync(
    process.execPath,
    ["scripts/compile-reference.mjs", target],
    { encoding: "utf8" }
  );
  const artifact = JSON.parse(stdout);
  const unmapped = artifact.validation?.unmappedStoryEventIds ?? [];

  if (unmapped.length > 0) {
    console.error(`Compiler ${target} left unmapped events: ${unmapped.join(", ")}`);
    process.exit(1);
  }

  results.push({
    target,
    traceUnits: artifact.traceability.length,
    mappedEvents: artifact.validation.mappedEventIds.length
  });
}

console.log("Media-plan compiler validation passed.");
console.log(JSON.stringify(results, null, 2));
