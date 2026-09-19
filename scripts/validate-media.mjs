import fs from "node:fs/promises";

const fixtures = [
  ["PROSE_SHORT", "../examples/compiled/prose-plan.json"],
  ["MANGA", "../examples/compiled/manga-plan.json"],
  ["WEBTOON", "../examples/compiled/webtoon-plan.json"],
  ["ANIME_EPISODE", "../examples/compiled/anime-plan.json"],
  ["VISUAL_NOVEL", "../examples/compiled/visual-novel-plan.json"]
];

const errors = [];

for (const [target, relativePath] of fixtures) {
  const artifact = JSON.parse(await fs.readFile(new URL(relativePath, import.meta.url), "utf8"));

  if (artifact.targetMedia !== target) errors.push(`${target}: targetMedia mismatch`);
  if ((artifact.validation?.unmappedStoryEventIds ?? []).length > 0) {
    errors.push(`${target}: unmapped story events`);
  }

  const traceUnits = new Set();
  for (const trace of artifact.traceability ?? []) {
    if (traceUnits.has(trace.unitId)) errors.push(`${target}: duplicate trace unit ${trace.unitId}`);
    traceUnits.add(trace.unitId);
    if (!Array.isArray(trace.eventIds) || trace.eventIds.length === 0) {
      errors.push(`${target}: trace unit without event source ${trace.unitId}`);
    }
  }

  if (target === "PROSE_SHORT") {
    if (artifact.output?.kind !== "PROSE_PLAN") errors.push("PROSE_SHORT: invalid kind");
    if (!(artifact.output?.sections?.length > 0)) errors.push("PROSE_SHORT: no sections");
  }

  if (target === "MANGA") {
    if (artifact.output?.kind !== "MANGA_PLAN") errors.push("MANGA: invalid kind");
    if (artifact.output?.readingDirection !== "RIGHT_TO_LEFT") errors.push("MANGA: reading direction must be RIGHT_TO_LEFT");
    const pages = artifact.output?.chapters?.flatMap((c) => c.pages ?? []) ?? [];
    if (!pages.length || pages.some((p) => !(p.panels?.length > 0))) errors.push("MANGA: page without panels");
  }

  if (target === "WEBTOON") {
    if (artifact.output?.kind !== "WEBTOON_PLAN") errors.push("WEBTOON: invalid kind");
    if (artifact.output?.readingDirection !== "VERTICAL_SCROLL") errors.push("WEBTOON: reading direction must be VERTICAL_SCROLL");
    const panels = artifact.output?.episodes?.flatMap((e) => e.sequences ?? []).flatMap((s) => s.panels ?? []) ?? [];
    if (!panels.length) errors.push("WEBTOON: no panels");
  }

  if (target === "ANIME_EPISODE") {
    if (artifact.output?.kind !== "ANIME_STORYBOARD_PLAN") errors.push("ANIME_EPISODE: invalid kind");
    const shots = artifact.output?.sequences?.flatMap((s) => s.shots ?? []) ?? [];
    const total = shots.reduce((sum, shot) => sum + Number(shot.estimatedSeconds ?? 0), 0);
    const targetSeconds = Number(artifact.output?.targetSeconds ?? 0);
    if (Math.abs(total - targetSeconds) > 0.05) {
      errors.push(`ANIME_EPISODE: shot duration total ${total} != target ${targetSeconds}`);
    }
  }

  if (target === "VISUAL_NOVEL") {
    if (artifact.output?.kind !== "VISUAL_NOVEL_PLAN") errors.push("VISUAL_NOVEL: invalid kind");
    if (!(artifact.output?.choices?.length > 0)) errors.push("VISUAL_NOVEL: missing choices");
    const nodeEventIds = new Set((artifact.output?.nodes ?? []).map((n) => n.source?.eventId));
    for (const choice of artifact.output?.choices ?? []) {
      for (const option of choice.options ?? []) {
        if (!nodeEventIds.has(option.outcomeEventId)) {
          errors.push(`VISUAL_NOVEL: outcome event has no node ${option.outcomeEventId}`);
        }
      }
    }
  }
}

if (errors.length) {
  console.error("Media validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Media validation passed.");
