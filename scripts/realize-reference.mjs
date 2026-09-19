import fs from "node:fs/promises";
import process from "node:process";

const targetMedia = process.argv[2] ?? "PROSE_SHORT";
const universe = JSON.parse(
  await fs.readFile(new URL("../examples/micro-universe.json", import.meta.url), "utf8")
);

const profile = universe.realizationProfiles.find((x) => x.targetMedia === targetMedia);
if (!profile) throw new Error(`No RealizationProfile for ${targetMedia}`);

const root = universe.branches.find((x) => x.status === "CANON");
if (!root) throw new Error("Root branch not found");

const selected = profile.mode === "LINEAR"
  ? universe.branches.find((x) => x.id === profile.selectedBranchId)
  : undefined;

const eventIds = profile.mode === "LINEAR"
  ? [...root.eventIds, ...(selected?.eventIds ?? [])]
  : universe.stories.find((x) => x.id === profile.storyId)?.eventIds ?? [];

const events = new Map(universe.events.map((x) => [x.id, x]));
const entities = new Map(universe.entities.map((x) => [x.id, x]));
const name = (id) => entities.get(id)?.name ?? id;

const textByEvent = {
  "event:001": [
    "Lia and Leo find the Memory Lantern inside the old chest.",
    "Lia's curiosity immediately turns the discovery into a question she wants answered."
  ],
  "event:002": [
    "When the lantern activates, it emits a pattern of light.",
    "Neither sibling yet knows what the pattern means."
  ],
  "event:003": [
    "Lia studies the lantern and finds an engraving.",
    "She still suspects that their father may have hidden it."
  ],
  "event:004": [
    "Leo moves the lantern near the wall beside the cellar stairs.",
    "The wall responds to the lantern, confirming that the object is connected to something in the house."
  ],
  "event:005": [
    "Their different explanations turn into an argument: Lia wants answers, while Leo treats the unknown as a risk.",
    "His protective goal becomes explicit even while he disagrees with her."
  ],
  "event:006": [
    "The concealed passage opens and reveals the hidden tunnel.",
    "The discovery changes the question from whether the lantern has a purpose to what waits along the path it reveals."
  ],
  "event:007": [
    "Lia decides to enter.",
    "Leo follows her rather than letting her investigate alone."
  ],
  "event:008": [
    "Inside the tunnel they discover Grandmother's mark.",
    "The evidence weakens Lia's belief that their father hid the lantern and Leo's belief that a stranger left it as a trap.",
    "Their plans shift: Lia now wants to follow Grandmother's clue, while Leo chooses to stay close and verify the route."
  ],
  "event:009a": [
    "They choose to continue deeper together.",
    "The choice does not solve the family mystery, but it increases their trust as they move forward."
  ]
};

const dialogueByEvent = {
  "event:001": [
    { speaker: "Lia", text: "This was hidden here for a reason." },
    { speaker: "Leo", text: "Or hidden because we were not supposed to find it." }
  ],
  "event:003": [
    { speaker: "Lia", text: "I thought Dad might have left this." }
  ],
  "event:004": [
    { speaker: "Leo", text: "It reacts to the wall." }
  ],
  "event:005": [
    { speaker: "Leo", text: "Finding something does not mean we have to follow it." },
    { speaker: "Lia", text: "And being afraid of it does not mean we should stop." }
  ],
  "event:006": [
    { speaker: "Lia", text: "There really is a passage." }
  ],
  "event:008": [
    { speaker: "Lia", text: "That mark is Grandmother's." },
    { speaker: "Leo", text: "Then my trap theory just got a lot weaker." }
  ],
  "event:009a": [
    { speaker: "Leo", text: "Together." },
    { speaker: "Lia", text: "Together." }
  ]
};

const traceability = eventIds.map((eventId) => ({
  sourceEventId: eventId,
  sourceBranchId: events.get(eventId)?.time?.branchId
}));

const assertions = universe.canon
  .filter((fact) => fact.authority === "CANON")
  .map((fact) => ({
    subject: fact.subject,
    predicate: fact.predicate,
    object: fact.object,
    authorityBasis: fact.id
  }));

const buildProse = () => {
  const paragraphs = [];
  paragraphs.push("# First Light\n");
  paragraphs.push("Lia and Leo's discovery begins with the Memory Lantern, an object hidden inside an old chest. They do not agree on what that discovery means. Lia approaches it as a question that can be answered; Leo approaches it as a danger that has not yet been understood.");

  for (const eventId of eventIds) {
    const lines = textByEvent[eventId] ?? [];
    const dialogue = dialogueByEvent[eventId] ?? [];
    const body = [...lines];

    for (const line of dialogue) {
      body.push(`“${line.text}” ${line.speaker} says.`);
    }

    if (body.length) paragraphs.push(body.join(" "));
  }

  paragraphs.push("The tunnel still holds the larger answer. Grandmother's connection is evidence, not a complete explanation. The siblings move deeper without pretending the mystery has already been solved.");

  return {
    kind: "PROSE_REALIZATION",
    format: "markdown",
    selectedBranchId: profile.selectedBranchId,
    text: paragraphs.join("\n\n")
  };
};

const framingFor = (type) => {
  const map = {
    DISCOVERY: "MEDIUM_TWO_SHOT",
    ACTIVATION: "CLOSE_UP",
    INSPECTION: "INSERT_CLOSE_UP",
    REACTION_TEST: "MEDIUM_SHOT",
    SIBLING_CONFLICT: "SHOT_REVERSE_SHOT",
    PASSAGE_REVEAL: "WIDE_REVEAL",
    DECISION: "MEDIUM_TWO_SHOT",
    CLUE_DISCOVERY: "INSERT_CLOSE_UP",
    BRANCH_DESCEND_TOGETHER: "WIDE_BACK_SHOT"
  };
  return map[type] ?? "MEDIUM_SHOT";
};

const buildManga = () => ({
  kind: "MANGA_PANEL_SCRIPT",
  readingDirection: "RIGHT_TO_LEFT",
  selectedBranchId: profile.selectedBranchId,
  chapter: {
    id: "chapter:1",
    title: "First Light",
    pages: eventIds.map((eventId, index) => {
      const event = events.get(eventId);
      return {
        page: index + 1,
        sourceEventId: eventId,
        panels: [{
          panel: 1,
          framing: framingFor(event?.type),
          visualDirection: (textByEvent[eventId] ?? [event?.type ?? eventId])[0],
          dialogue: dialogueByEvent[eventId] ?? [],
          sfx: event?.type === "ACTIVATION"
            ? ["HUM"]
            : event?.type === "PASSAGE_REVEAL"
              ? ["RUMBLE"]
              : [],
          trace: { eventIds: [eventId] }
        }]
      };
    })
  }
});

const cameraFor = (type) => {
  const map = {
    DISCOVERY: { framing: "MEDIUM_TWO_SHOT", movement: "STATIC" },
    ACTIVATION: { framing: "CLOSE_UP", movement: "SLOW_PUSH_IN" },
    INSPECTION: { framing: "INSERT_CLOSE_UP", movement: "STATIC" },
    REACTION_TEST: { framing: "MEDIUM_SHOT", movement: "TRACK_OBJECT" },
    SIBLING_CONFLICT: { framing: "MEDIUM_ALTERNATING", movement: "CUT" },
    PASSAGE_REVEAL: { framing: "WIDE_REVEAL", movement: "PULL_BACK" },
    DECISION: { framing: "MEDIUM_TWO_SHOT", movement: "STATIC" },
    CLUE_DISCOVERY: { framing: "INSERT_CLOSE_UP", movement: "SLOW_PUSH_IN" },
    BRANCH_DESCEND_TOGETHER: { framing: "WIDE_BACK_SHOT", movement: "SLOW_TRACK_FORWARD" }
  };
  return map[type] ?? { framing: "MEDIUM_SHOT", movement: "STATIC" };
};

const buildAnime = () => {
  const seconds = 90;
  const perShot = Number((seconds / eventIds.length).toFixed(2));
  return {
    kind: "ANIME_SHOT_DIRECTION",
    selectedBranchId: profile.selectedBranchId,
    targetSeconds: seconds,
    episodeSegment: "First Light",
    shots: eventIds.map((eventId, index) => {
      const event = events.get(eventId);
      return {
        shot: index + 1,
        sourceEventId: eventId,
        durationSeconds: index === eventIds.length - 1
          ? Number((seconds - perShot * (eventIds.length - 1)).toFixed(2))
          : perShot,
        camera: cameraFor(event?.type),
        action: (textByEvent[eventId] ?? [event?.type ?? eventId])[0],
        dialogue: dialogueByEvent[eventId] ?? [],
        audio: event?.type === "ACTIVATION"
          ? ["low lantern hum"]
          : event?.type === "PASSAGE_REVEAL"
            ? ["stone movement", "low rumble"]
            : [],
        trace: { eventIds: [eventId] }
      };
    })
  };
};

let output;
if (targetMedia === "PROSE_SHORT") output = buildProse();
else if (targetMedia === "MANGA") output = buildManga();
else if (targetMedia === "ANIME_EPISODE") output = buildAnime();
else throw new Error(`Reference realizer not implemented for ${targetMedia}`);

console.log(JSON.stringify({
  artifactType: "REALIZED_MEDIA",
  realizationVersion: "0.1.0",
  targetMedia,
  source: {
    universeId: universe.id,
    universeVersion: universe.version,
    realizationProfileId: profile.id,
    storyId: profile.storyId
  },
  output,
  assertions,
  traceability
}, null, 2));
