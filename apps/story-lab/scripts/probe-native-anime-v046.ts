import { createNarrativeDraft, createUniverseDraft, forgeStoryDNA } from "../lib/storyforge-local";
import { forgeNarrativeV03 } from "../lib/storyforge-v03";
import { createSceneAuthorityWorkspace } from "../lib/storyforge-v04";
import { realizeNativeAnimeEpisode } from "../lib/storyforge-v046";

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
const dna=forgeStoryDNA("Uma exploradora encontra uma estação impossível orbitando uma estrela morta.", "pt-BR"); dna.status="APPROVED_LOCAL";
const universe=createUniverseDraft(dna,"pt-BR"); universe.status="APPROVED_LOCAL";
const narrative=createNarrativeDraft(dna,universe,"pt-BR"); narrative.status="APPROVED_LOCAL";
const forge=forgeNarrativeV03({storyDNA:dna,universe,narrative,targetMedia:"ANIME_EPISODE",locale:"pt-BR"});
const authority=createSceneAuthorityWorkspace(forge);
const before=JSON.stringify(authority);
const anime=realizeNativeAnimeEpisode(authority,"pt-BR");
assert(before===JSON.stringify(authority),"Anime compiler must not mutate Scene Authority.");
assert(anime.target==="ANIME_EPISODE" && anime.authority==="CANDIDATE","Anime projection contract invalid.");
assert(anime.scenes.length>0 && anime.shotCount>0,"Anime must contain scenes and shots.");
assert(anime.durationSeconds===anime.scenes.reduce((s,x)=>s+x.durationSeconds,0),"Episode duration mismatch.");
const shots=anime.scenes.flatMap(x=>x.shots);
assert(shots.length===anime.shotCount,"shotCount mismatch.");
shots.forEach((shot,index)=>{assert(shot.shotNumber===index+1,"Shot numbering must be contiguous.");assert(shot.durationSeconds>0,"Shot duration must be positive.");assert(Boolean(shot.trace.sceneRevisionId)&&Boolean(shot.trace.eventId),"Shot provenance missing.");assert(shot.authority==="CANDIDATE","Shot must remain CANDIDATE.");});
console.log("Story Workspace V0.4.6 Native Anime executable probe passed.");
console.log(JSON.stringify({scenes:anime.scenes.length,shots:anime.shotCount,durationSeconds:anime.durationSeconds,authority:anime.authority,inputMutated:before!==JSON.stringify(authority)},null,2));
