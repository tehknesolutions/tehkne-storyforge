import type { StoryLocale } from "./storyforge-local";
import { expandSelectedScenes, type ExpandedScene } from "./storyforge-v041";
import type { SceneAuthorityWorkspace } from "./storyforge-v04";

export type MangaPanelKind =
  | "ESTABLISHING"
  | "ACTION"
  | "DETAIL"
  | "REACTION"
  | "DIALOGUE"
  | "TURN"
  | "SILENT";

export type MangaBalloon = {
  id: string;
  kind: "SPEECH" | "NARRATION";
  speakerName?: string;
  text: string;
  readingOrder: number;
  authority: "CANDIDATE";
};

export type NativeMangaPanel = {
  id: string;
  pageNumber: number;
  panelNumber: number;
  readingOrder: number;
  kind: MangaPanelKind;
  size: "SMALL" | "MEDIUM" | "LARGE" | "SPLASH";
  visualIntent: string;
  balloons: MangaBalloon[];
  sfx: string[];
  trace: {
    sceneId: string;
    sceneRevisionId: string;
    sceneRevision: number;
    eventId: string;
    sourceClaimIds: string[];
  };
  authority: "CANDIDATE";
};

export type NativeMangaPage = {
  id: string;
  pageNumber: number;
  layout: "SINGLE" | "TWO_PANEL" | "THREE_PANEL" | "FOUR_PANEL" | "SPLASH";
  pageTurnRole: "SETUP" | "BUILD" | "REVEAL" | "HOOK";
  panels: NativeMangaPanel[];
  trace: {
    sceneRevisionIds: string[];
    eventIds: string[];
  };
  authority: "CANDIDATE";
};

export type NativeMangaChapter = {
  id: string;
  version: "0.4.5";
  target: "MANGA";
  readingDirection: "RIGHT_TO_LEFT";
  chapterNumber: 1;
  title: string;
  pages: NativeMangaPage[];
  pageCount: number;
  panelCount: number;
  sceneRevisionIds: string[];
  eventIds: string[];
  authority: "CANDIDATE";
  createdAt: string;
};

const localize = (locale: StoryLocale, values: Record<StoryLocale, string>) =>
  values[locale];

function panelIntent(scene: ExpandedScene, kind: MangaPanelKind, locale: StoryLocale) {
  const map: Record<MangaPanelKind, Record<StoryLocale, string>> = {
    ESTABLISHING: {
      "pt-BR": `Estabelecer “${scene.title}” com geografia, personagens e ação observável.`,
      en: `Establish “${scene.title}” with geography, characters, and observable action.`,
      es: `Establecer “${scene.title}” con geografía, personajes y acción observable.`
    },
    ACTION: {"pt-BR": scene.observableActions[0] ?? scene.goal, en: scene.observableActions[0] ?? scene.goal, es: scene.observableActions[0] ?? scene.goal},
    DETAIL: {"pt-BR": "Isolar o detalhe causal mais importante sem criar nova verdade.", en: "Isolate the most important causal detail without creating new truth.", es: "Aislar el detalle causal más importante sin crear nueva verdad."},
    REACTION: {"pt-BR": scene.observableActions[1] ?? scene.conflict, en: scene.observableActions[1] ?? scene.conflict, es: scene.observableActions[1] ?? scene.conflict},
    DIALOGUE: {"pt-BR": "Priorizar expressão, fala e leitura clara dos balões.", en: "Prioritize expression, dialogue, and clear balloon reading order.", es: "Priorizar expresión, diálogo y lectura clara de globos."},
    TURN: {"pt-BR": scene.observableActions[2] ?? scene.exitState, en: scene.observableActions[2] ?? scene.exitState, es: scene.observableActions[2] ?? scene.exitState},
    SILENT: {"pt-BR": "Beat silencioso para respiração, atmosfera e antecipação.", en: "Silent beat for breathing room, atmosphere, and anticipation.", es: "Beat silencioso para respiración, atmósfera y anticipación."}
  };
  return map[kind][locale];
}

function pageRole(pageNumber: number, pageCount: number): NativeMangaPage["pageTurnRole"] {
  if (pageNumber === pageCount) return "HOOK";
  if (pageNumber % 2 === 0) return "REVEAL";
  if (pageNumber === 1) return "SETUP";
  return "BUILD";
}

function panelSize(kind: MangaPanelKind): NativeMangaPanel["size"] {
  if (kind === "TURN") return "LARGE";
  if (kind === "ESTABLISHING") return "LARGE";
  if (kind === "DETAIL" || kind === "REACTION") return "SMALL";
  return "MEDIUM";
}

function makePanel(
  scene: ExpandedScene,
  pageNumber: number,
  panelNumber: number,
  readingOrder: number,
  kind: MangaPanelKind,
  locale: StoryLocale
): NativeMangaPanel {
  const balloons: MangaBalloon[] =
    kind === "DIALOGUE"
      ? scene.dialogueExchange.slice(0, 2).map((line, index) => ({
          id: `balloon:manga:${pageNumber}:${panelNumber}:${index + 1}`,
          kind: line.speakerId === "NARRATOR" ? "NARRATION" : "SPEECH",
          ...(line.speakerId === "NARRATOR" ? {} : { speakerName: line.speakerName }),
          text: line.text,
          readingOrder: index + 1,
          authority: "CANDIDATE" as const
        }))
      : [];

  return {
    id: `panel:manga:${pageNumber}:${panelNumber}`,
    pageNumber,
    panelNumber,
    readingOrder,
    kind,
    size: panelSize(kind),
    visualIntent: panelIntent(scene, kind, locale),
    balloons,
    sfx: [],
    trace: {
      sceneId: scene.sceneId,
      sceneRevisionId: scene.sceneRevisionId,
      sceneRevision: scene.sceneRevision,
      eventId: scene.eventId,
      sourceClaimIds: [...scene.sourceClaimIds]
    },
    authority: "CANDIDATE"
  };
}

export function realizeNativeManga(
  workspace: SceneAuthorityWorkspace,
  locale: StoryLocale
): NativeMangaChapter {
  const scenes = expandSelectedScenes(workspace, locale);
  if (!scenes.length) throw new Error("MANGA_REQUIRES_SELECTED_SCENES");

  const pages: NativeMangaPage[] = [];
  let readingOrder = 1;

  for (const scene of scenes) {
    const kinds: MangaPanelKind[] = scene.dialogueExchange.length
      ? ["ESTABLISHING", "ACTION", "REACTION", "DIALOGUE", "TURN"]
      : ["ESTABLISHING", "ACTION", "DETAIL", "REACTION", "TURN"];

    const firstPageNumber = pages.length + 1;
    const firstKinds = kinds.slice(0, 3);
    const secondKinds = kinds.slice(3);

    for (const [offset, pageKinds] of [firstKinds, secondKinds].entries()) {
      const pageNumber = firstPageNumber + offset;
      const panels = pageKinds.map((kind, index) => {
        const panel = makePanel(scene, pageNumber, index + 1, readingOrder, kind, locale);
        readingOrder += 1;
        return panel;
      });
      pages.push({
        id: `page:manga:${pageNumber}`,
        pageNumber,
        layout: panels.length === 1 ? "SINGLE" : panels.length === 2 ? "TWO_PANEL" : "THREE_PANEL",
        pageTurnRole: "BUILD",
        panels,
        trace: {
          sceneRevisionIds: [scene.sceneRevisionId],
          eventIds: [scene.eventId]
        },
        authority: "CANDIDATE"
      });
    }
  }

  for (const page of pages) page.pageTurnRole = pageRole(page.pageNumber, pages.length);

  return {
    id: `realization:manga:v0.4.5:${crypto.randomUUID()}`,
    version: "0.4.5",
    target: "MANGA",
    readingDirection: "RIGHT_TO_LEFT",
    chapterNumber: 1,
    title: localize(locale, {
      "pt-BR": "Capítulo 1 — Revisões de cena selecionadas",
      en: "Chapter 1 — Selected Scene Revisions",
      es: "Capítulo 1 — Revisiones de escena seleccionadas"
    }),
    pages,
    pageCount: pages.length,
    panelCount: pages.reduce((sum, page) => sum + page.panels.length, 0),
    sceneRevisionIds: scenes.map((scene) => scene.sceneRevisionId),
    eventIds: scenes.map((scene) => scene.eventId),
    authority: "CANDIDATE",
    createdAt: new Date().toISOString()
  };
}
