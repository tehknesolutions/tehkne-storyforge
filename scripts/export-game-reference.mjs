import fs from "node:fs/promises";

const universe = JSON.parse(
  await fs.readFile(new URL("../examples/micro-universe.json", import.meta.url), "utf8")
);
const story = universe.stories.find((item) => item.id === "story:first-light");
if (!story) throw new Error("story:first-light not found");

const storyEventIds = new Set(story.eventIds);
const artifact = {
  format: "STORYFORGE_GAME_JSON",
  version: "0.1.0",
  source: {
    universeId: universe.id,
    universeVersion: universe.version,
    storyId: story.id
  },
  nodes: universe.events
    .filter((event) => storyEventIds.has(event.id))
    .map((event) => ({
      id: `game-node:${event.id}`,
      eventId: event.id,
      type: event.type,
      participants: event.participants,
      ...(event.locationId ? { locationId: event.locationId } : {})
    })),
  choices: universe.choices
    .filter((choice) => storyEventIds.has(choice.atEventId))
    .map((choice) => ({
      id: choice.id,
      atEventId: choice.atEventId,
      prompt: choice.prompt,
      options: choice.options
    })),
  transitions: universe.stateTransitions,
  rules: universe.worldRules,
  authority: {
    eventProposalsIncluded: false,
    canonProposalsIncluded: false
  }
};

console.log(JSON.stringify(artifact, null, 2));
