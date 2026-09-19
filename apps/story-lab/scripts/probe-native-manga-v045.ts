import {
  createNarrativeDraft,
  createUniverseDraft,
  forgeStoryDNA
} from "../lib/storyforge-local";
import { forgeNarrativeV03 } from "../lib/storyforge-v03";
import { createSceneAuthorityWorkspace } from "../lib/storyforge-v04";
import { realizeNativeManga } from "../lib/storyforge-v045";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const idea =
  "Uma menina encontra uma cidade onde ninguém consegue mentir, mas descobre que sua mãe vive escondida ali há vinte anos.";

const storyDNA = forgeStoryDNA(idea, "pt-BR");
storyDNA.status = "APPROVED_LOCAL";
const universe = createUniverseDraft(storyDNA, "pt-BR");
universe.status = "APPROVED_LOCAL";
const narrative = createNarrativeDraft(storyDNA, universe, "pt-BR");
narrative.status = "APPROVED_LOCAL";

const forgeV03 = forgeNarrativeV03({
  storyDNA,
  universe,
  narrative,
  targetMedia: "MANGA",
  locale: "pt-BR"
});

const authority = createSceneAuthorityWorkspace(forgeV03);
const before = JSON.stringify(authority);
const manga = realizeNativeManga(authority, "pt-BR");
const after = JSON.stringify(authority);

assert(before === after, "Native Manga compiler must not mutate Scene Authority.");
assert(manga.target === "MANGA", "Native Manga target mismatch.");
assert(manga.authority === "CANDIDATE", "Native Manga must remain CANDIDATE.");
assert(manga.readingDirection === "RIGHT_TO_LEFT", "Manga must use RTL reading.");
assert(manga.pages.length > 0, "Manga must contain pages.");
assert(manga.pageCount === manga.pages.length, "pageCount mismatch.");
assert(
  manga.panelCount === manga.pages.flatMap((page) => page.panels).length,
  "panelCount mismatch."
);
assert(
  manga.pages[manga.pages.length - 1].pageTurnRole === "HOOK",
  "Final page must be a HOOK."
);

const panels = manga.pages.flatMap((page) => page.panels);
panels.forEach((panel, index) => {
  assert(panel.readingOrder === index + 1, "Panel readingOrder must be contiguous.");
  assert(panel.authority === "CANDIDATE", "Panel must remain CANDIDATE.");
  assert(Boolean(panel.trace.sceneRevisionId), "Panel sceneRevision trace missing.");
  assert(Boolean(panel.trace.eventId), "Panel event trace missing.");
});

manga.pages.forEach((page, index) => {
  assert(page.pageNumber === index + 1, "Page numbering must be contiguous.");
  assert(page.authority === "CANDIDATE", "Page must remain CANDIDATE.");
  assert(page.trace.sceneRevisionIds.length > 0, "Page scene revision trace missing.");
  assert(page.trace.eventIds.length > 0, "Page event trace missing.");
});

console.log("Story Workspace V0.4.5 Native Manga executable probe passed.");
console.log(JSON.stringify({
  pages: manga.pageCount,
  panels: manga.panelCount,
  readingDirection: manga.readingDirection,
  finalPageTurnRole: manga.pages[manga.pages.length - 1].pageTurnRole,
  authority: manga.authority,
  inputMutated: before !== after
}, null, 2));
