import type { NativeVisualNovelRealization } from "./storyforge-v041";
import type { NativeMangaChapter } from "./storyforge-v045";
import type { NativeAnimeEpisode } from "./storyforge-v046";

export type MediaEquivalenceProjection = {
  target: "MANGA" | "ANIME_EPISODE" | "VISUAL_NOVEL";
  unitIds: string[];
  unitCount: number;
  authority: "CANDIDATE";
};

export type MediaEquivalenceEvent = {
  eventId: string;
  sceneRevisionIds: string[];
  sourceClaimIds: string[];
  projections: MediaEquivalenceProjection[];
};

export type MediaEquivalenceMap = {
  id: string;
  version: "0.4.7";
  events: MediaEquivalenceEvent[];
  authority: "CANDIDATE";
  canonicalEventGraphMutated: false;
  createdAt: string;
};

export function buildMediaEquivalenceMap(input: {
  manga?: NativeMangaChapter | null;
  anime?: NativeAnimeEpisode | null;
  visualNovel?: NativeVisualNovelRealization | null;
}): MediaEquivalenceMap {
  const byEvent = new Map<string, MediaEquivalenceEvent>();
  const ensure = (eventId: string) => {
    const current = byEvent.get(eventId);
    if (current) return current;
    const next: MediaEquivalenceEvent = { eventId, sceneRevisionIds: [], sourceClaimIds: [], projections: [] };
    byEvent.set(eventId, next);
    return next;
  };
  const merge = (eventId:string, target:MediaEquivalenceProjection["target"], unitId:string, sceneRevisionId:string, claims:string[]) => {
    const event=ensure(eventId);
    if(!event.sceneRevisionIds.includes(sceneRevisionId)) event.sceneRevisionIds.push(sceneRevisionId);
    for(const claim of claims) if(!event.sourceClaimIds.includes(claim)) event.sourceClaimIds.push(claim);
    let projection=event.projections.find(p=>p.target===target);
    if(!projection){ projection={target,unitIds:[],unitCount:0,authority:"CANDIDATE"}; event.projections.push(projection); }
    if(!projection.unitIds.includes(unitId)) projection.unitIds.push(unitId);
    projection.unitCount=projection.unitIds.length;
  };

  for(const page of input.manga?.pages ?? []) for(const panel of page.panels)
    merge(panel.trace.eventId,"MANGA",panel.id,panel.trace.sceneRevisionId,panel.trace.sourceClaimIds);

  for(const scene of input.anime?.scenes ?? []) for(const shot of scene.shots)
    merge(shot.trace.eventId,"ANIME_EPISODE",shot.id,shot.trace.sceneRevisionId,shot.trace.sourceClaimIds);

  for(const scene of input.visualNovel?.scenes ?? [])
    merge(scene.eventId,"VISUAL_NOVEL",scene.id,scene.sceneRevisionId,scene.sourceClaimIds);

  return {
    id:`media-equivalence:v0.4.7:${crypto.randomUUID()}`,
    version:"0.4.7",
    events:[...byEvent.values()],
    authority:"CANDIDATE",
    canonicalEventGraphMutated:false,
    createdAt:new Date().toISOString()
  };
}


export function buildV047TnirMediaEquivalence(input: {
  baseTnir: Record<string, unknown>;
  manga?: NativeMangaChapter | null;
  anime?: NativeAnimeEpisode | null;
  visualNovel?: NativeVisualNovelRealization | null;
}) {
  const mediaEquivalence = buildMediaEquivalenceMap({
    manga: input.manga,
    anime: input.anime,
    visualNovel: input.visualNovel
  });
  return {
    ...input.baseTnir,
    mediaEquivalence,
    nativeMedia: {
      ...(input.manga ? { manga: input.manga } : {}),
      ...(input.anime ? { animeEpisode: input.anime } : {}),
      ...(input.visualNovel ? { visualNovel: input.visualNovel } : {})
    },
    provenance: {
      ...((input.baseTnir.provenance as Record<string, unknown>) ?? {}),
      mediaEquivalenceVersion: "0.4.7",
      mediaProjectionAuthority: "CANDIDATE",
      canonicalEventGraphMutated: false
    }
  };
}
