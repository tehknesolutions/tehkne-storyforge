import fs from "node:fs/promises";
import process from "node:process";

const targetMedia = process.argv[2] ?? "MANGA";
const inputPath = process.argv[3]
  ? new URL(`../${process.argv[3]}`, import.meta.url)
  : new URL("../examples/micro-universe.json", import.meta.url);

const universe = JSON.parse(await fs.readFile(inputPath, "utf8"));
const manifest = universe.mediaManifests.find((x) => x.targetMedia === targetMedia);

if (!manifest) {
  console.error(`No MediaManifest found for target ${targetMedia}`);
  process.exit(1);
}

const story = universe.stories.find((x) => x.id === manifest.storyId);
if (!story) {
  console.error(`Story ${manifest.storyId} not found`);
  process.exit(1);
}

const events = new Map(universe.events.map((x) => [x.id, x]));
const traceability = [];

const trace = (unitId, eventIds, sceneId) => {
  traceability.push({
    unitId,
    eventIds,
    ...(sceneId ? { sceneId } : {})
  });
};

const eventSummary = (eventId) => {
  const event = events.get(eventId);
  return {
    eventId,
    eventType: event?.type ?? "UNKNOWN",
    participants: event?.participants ?? [],
    locationId: event?.locationId
  };
};

const compileProse = () => ({
  kind: "PROSE_PLAN",
  sections: (story.scenes ?? []).map((scene, index) => {
    const id = `section:${index + 1}`;
    trace(id, scene.eventIds, scene.id);
    return {
      id,
      title: scene.title ?? `Section ${index + 1}`,
      dramaticPurpose: scene.dramaticPurpose,
      sourceEvents: scene.eventIds.map(eventSummary)
    };
  })
});

const compileManga = () => ({
  kind: "MANGA_PLAN",
  readingDirection: manifest.format?.readingDirection ?? "RIGHT_TO_LEFT",
  chapters: [{
    id: "chapter:1",
    pages: (story.scenes ?? []).map((scene, pageIndex) => {
      const pageId = `page:${pageIndex + 1}`;
      const panels = scene.eventIds.map((eventId, panelIndex) => {
        const panelId = `${pageId}:panel:${panelIndex + 1}`;
        trace(panelId, [eventId], scene.id);
        return {
          id: panelId,
          source: eventSummary(eventId)
        };
      });
      return {
        id: pageId,
        sceneId: scene.id,
        title: scene.title,
        panels
      };
    })
  }]
});

const compileWebtoon = () => ({
  kind: "WEBTOON_PLAN",
  readingDirection: "VERTICAL_SCROLL",
  episodes: [{
    id: "episode:1",
    sequences: (story.scenes ?? []).map((scene, sequenceIndex) => ({
      id: `scroll-sequence:${sequenceIndex + 1}`,
      sceneId: scene.id,
      panels: scene.eventIds.map((eventId, panelIndex) => {
        const panelId = `scroll-sequence:${sequenceIndex + 1}:panel:${panelIndex + 1}`;
        trace(panelId, [eventId], scene.id);
        return {
          id: panelId,
          revealOrder: panelIndex + 1,
          source: eventSummary(eventId)
        };
      })
    }))
  }]
});

const compileAnime = () => {
  const seconds = manifest.targetLength?.seconds ?? 90;
  const duration = Number((seconds / Math.max(1, story.eventIds.length)).toFixed(2));
  return {
    kind: "ANIME_STORYBOARD_PLAN",
    targetSeconds: seconds,
    sequences: (story.scenes ?? []).map((scene, sequenceIndex) => ({
      id: `sequence:${sequenceIndex + 1}`,
      sceneId: scene.id,
      shots: scene.eventIds.map((eventId, shotIndex) => {
        const shotId = `sequence:${sequenceIndex + 1}:shot:${shotIndex + 1}`;
        trace(shotId, [eventId], scene.id);
        return {
          id: shotId,
          estimatedSeconds: duration,
          source: eventSummary(eventId)
        };
      })
    }))
  };
};

const compileVisualNovel = () => ({
  kind: "VISUAL_NOVEL_PLAN",
  nodes: story.eventIds.map((eventId) => {
    const id = `node:${eventId}`;
    trace(id, [eventId]);
    return {
      id,
      source: eventSummary(eventId)
    };
  }),
  choices: (universe.choices ?? []).map((choice) => ({
    id: choice.id,
    atEventId: choice.atEventId,
    prompt: choice.prompt,
    options: choice.options.map((option) => ({
      id: option.id,
      label: option.label,
      outcomeEventId: option.outcomeEventId,
      branchId: option.branchId,
      transitionId: option.transitionId
    }))
  }))
});

const compilers = {
  PROSE_SHORT: compileProse,
  MANGA: compileManga,
  WEBTOON: compileWebtoon,
  ANIME_EPISODE: compileAnime,
  VISUAL_NOVEL: compileVisualNovel
};

const compile = compilers[targetMedia];
if (!compile) {
  console.error(`Compiler not implemented for ${targetMedia}`);
  process.exit(1);
}

const artifact = {
  artifactType: "MEDIA_PLAN",
  compilerVersion: "0.1.0",
  targetMedia,
  source: {
    universeId: universe.id,
    universeVersion: universe.version,
    storyId: story.id,
    manifestId: manifest.id
  },
  output: compile(),
  traceability,
  validation: {
    mappedEventIds: [...new Set(traceability.flatMap((x) => x.eventIds))],
    storyEventIds: story.eventIds,
    unmappedStoryEventIds: story.eventIds.filter(
      (eventId) => !traceability.some((x) => x.eventIds.includes(eventId))
    )
  }
};

console.log(JSON.stringify(artifact, null, 2));
