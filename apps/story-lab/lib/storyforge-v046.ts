import type { StoryLocale } from "./storyforge-local";
import { expandSelectedScenes } from "./storyforge-v041";
import type { SceneAuthorityWorkspace } from "./storyforge-v04";

export type AnimeShot = {
  id: string;
  shotNumber: number;
  durationSeconds: number;
  framing: "WIDE" | "MEDIUM" | "CLOSE_UP" | "INSERT";
  camera: "STATIC" | "PAN" | "PUSH_IN" | "TRACK";
  action: string;
  dialogue: Array<{ speakerName: string; text: string }>;
  audio: { ambience: string[]; sfx: string[]; musicCue: string | null };
  animationPriority: "LOW" | "MEDIUM" | "HIGH";
  trace: {
    sceneId: string;
    sceneRevisionId: string;
    sceneRevision: number;
    eventId: string;
    sourceClaimIds: string[];
  };
  authority: "CANDIDATE";
};

export type AnimeScene = {
  id: string;
  sceneNumber: number;
  title: string;
  shots: AnimeShot[];
  durationSeconds: number;
  trace: { sceneRevisionId: string; eventId: string };
  authority: "CANDIDATE";
};

export type NativeAnimeEpisode = {
  id: string;
  version: "0.4.6";
  target: "ANIME_EPISODE";
  episodeNumber: 1;
  title: string;
  scenes: AnimeScene[];
  durationSeconds: number;
  shotCount: number;
  sceneRevisionIds: string[];
  eventIds: string[];
  authority: "CANDIDATE";
  createdAt: string;
};

const framing: AnimeShot["framing"][] = ["WIDE", "MEDIUM", "CLOSE_UP", "INSERT"];
const camera: AnimeShot["camera"][] = ["STATIC", "TRACK", "PUSH_IN", "PAN"];

export function realizeNativeAnimeEpisode(
  workspace: SceneAuthorityWorkspace,
  locale: StoryLocale
): NativeAnimeEpisode {
  const expanded = expandSelectedScenes(workspace, locale);
  if (!expanded.length) throw new Error("ANIME_REQUIRES_SELECTED_SCENES");

  let shotNumber = 1;
  const scenes: AnimeScene[] = expanded.map((scene, sceneIndex) => {
    const actions = scene.observableActions.length
      ? scene.observableActions.slice(0, 4)
      : [scene.goal, scene.conflict, scene.exitState];

    const shots: AnimeShot[] = actions.map((action, index) => {
      const dialogue = index === Math.min(2, actions.length - 1)
        ? scene.dialogueExchange.slice(0, 2).map((line) => ({
            speakerName: line.speakerName,
            text: line.text
          }))
        : [];
      const shot: AnimeShot = {
        id: `shot:anime:${sceneIndex + 1}:${index + 1}`,
        shotNumber: shotNumber++,
        durationSeconds: dialogue.length ? 6 : index === 0 ? 4 : 3,
        framing: framing[index % framing.length],
        camera: camera[index % camera.length],
        action,
        dialogue,
        audio: {
          ambience: [],
          sfx: [],
          musicCue: index === 0 ? "SCENE_ENTRY_CUE" : null
        },
        animationPriority: index === actions.length - 1 ? "HIGH" : index === 0 ? "MEDIUM" : "LOW",
        trace: {
          sceneId: scene.sceneId,
          sceneRevisionId: scene.sceneRevisionId,
          sceneRevision: scene.sceneRevision,
          eventId: scene.eventId,
          sourceClaimIds: [...scene.sourceClaimIds]
        },
        authority: "CANDIDATE"
      };
      return shot;
    });

    return {
      id: `scene:anime:${sceneIndex + 1}`,
      sceneNumber: sceneIndex + 1,
      title: scene.title,
      shots,
      durationSeconds: shots.reduce((sum, shot) => sum + shot.durationSeconds, 0),
      trace: { sceneRevisionId: scene.sceneRevisionId, eventId: scene.eventId },
      authority: "CANDIDATE"
    };
  });

  return {
    id: `realization:anime:v0.4.6:${crypto.randomUUID()}`,
    version: "0.4.6",
    target: "ANIME_EPISODE",
    episodeNumber: 1,
    title: locale === "pt-BR" ? "Episódio 1 — Revisões de cena selecionadas" : locale === "es" ? "Episodio 1 — Revisiones de escena seleccionadas" : "Episode 1 — Selected Scene Revisions",
    scenes,
    durationSeconds: scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0),
    shotCount: scenes.flatMap((scene) => scene.shots).length,
    sceneRevisionIds: expanded.map((scene) => scene.sceneRevisionId),
    eventIds: expanded.map((scene) => scene.eventId),
    authority: "CANDIDATE",
    createdAt: new Date().toISOString()
  };
}
