import fs from "node:fs/promises";
import process from "node:process";

const targetMedia = process.argv[2] ?? "MANGA";
const universe = JSON.parse(
  await fs.readFile(new URL("../examples/micro-universe.json", import.meta.url), "utf8")
);

const profile = universe.realizationProfiles.find((x) => x.targetMedia === targetMedia);
if (!profile) {
  console.error(`No RealizationProfile for ${targetMedia}`);
  process.exit(1);
}

const story = universe.stories.find((x) => x.id === profile.storyId);
if (!story) throw new Error(`Story not found: ${profile.storyId}`);

const root = universe.branches.find((x) => x.status === "CANON");
if (!root) throw new Error("Root CANON branch not found");

let eventIds;
if (profile.mode === "INTERACTIVE") {
  eventIds = [...story.eventIds];
} else {
  const selected = universe.branches.find((x) => x.id === profile.selectedBranchId);
  if (!selected) throw new Error(`Selected branch not found: ${profile.selectedBranchId}`);
  eventIds = [
    ...(profile.includeRootBranch ? root.eventIds : []),
    ...selected.eventIds
  ];
}

const storyEvents = new Set(story.eventIds);
eventIds = [...new Set(eventIds)].filter((id) => storyEvents.has(id));

const excludedEventIds = story.eventIds.filter((id) => !eventIds.includes(id));

console.log(JSON.stringify({
  resolutionVersion: "0.1.0",
  realizationProfileId: profile.id,
  targetMedia,
  mode: profile.mode,
  selectedBranchId: profile.selectedBranchId,
  eventIds,
  excludedEventIds
}, null, 2));
