import type { Universe } from "../tnir/types.js";

export interface StoryforgeGameExport {
  format: "STORYFORGE_GAME_JSON";
  version: "0.1.0";
  source: {
    universeId: string;
    universeVersion: string;
    storyId: string;
  };
  nodes: Array<{
    id: string;
    eventId: string;
    type: string;
    participants: string[];
    locationId?: string;
  }>;
  choices: Array<{
    id: string;
    atEventId: string;
    prompt: string;
    options: Array<{
      id: string;
      label: string;
      outcomeEventId: string;
      branchId?: string;
      transitionId?: string;
    }>;
  }>;
  transitions: Universe["stateTransitions"];
  rules: Universe["worldRules"];
}

export function exportGameJson(universe: Universe, storyId: string): StoryforgeGameExport {
  const story = universe.stories.find((item) => item.id === storyId);
  if (!story) throw new Error(`Story not found: ${storyId}`);

  const storyEventIds = new Set(story.eventIds);
  const events = universe.events.filter((event) => storyEventIds.has(event.id));

  return {
    format: "STORYFORGE_GAME_JSON",
    version: "0.1.0",
    source: {
      universeId: universe.id,
      universeVersion: universe.version,
      storyId
    },
    nodes: events.map((event) => ({
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
        options: choice.options.map((option) => ({
          id: option.id,
          label: option.label,
          outcomeEventId: option.outcomeEventId,
          ...(option.branchId ? { branchId: option.branchId } : {}),
          ...(option.transitionId ? { transitionId: option.transitionId } : {})
        }))
      })),
    transitions: universe.stateTransitions,
    rules: universe.worldRules
  };
}
