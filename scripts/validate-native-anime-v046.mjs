import fs from "node:fs/promises";
const read=(p)=>fs.readFile(new URL("../"+p,import.meta.url),"utf8");
const [compiler,workspace,view,persistence,pkg]=await Promise.all([
 read("apps/story-lab/lib/storyforge-v046.ts"),read("apps/story-lab/app/story-workspace.tsx"),
 read("apps/story-lab/app/anime-episode-view.tsx"),read("apps/story-lab/lib/workspace-persistence.ts"),
 read("apps/story-lab/package.json")
]);
const expect=(ok,msg)=>{if(!ok) throw new Error(msg);};
expect(compiler.includes("realizeNativeAnimeEpisode")&&compiler.includes('authority: "CANDIDATE"'),"Anime compiler contract missing");
expect(compiler.includes("sceneRevisionId")&&compiler.includes("eventId")&&compiler.includes("sourceClaimIds"),"Anime provenance missing");
expect(workspace.includes("realizeNativeAnimeEpisode(sceneAuthority, locale)")&&workspace.includes("<AnimeEpisodeView"),"Anime workspace integration missing");
expect(view.includes("shot.durationSeconds")&&view.includes("shot.framing")&&view.includes("shot.camera")&&view.includes("shot.trace.eventId"),"Anime storyboard surface incomplete");
expect(persistence.includes("animeRealizationV046?: NativeAnimeEpisode | null"),"Anime durable persistence missing");
expect(pkg.includes("probe-native-anime-v046.ts"),"Anime executable build gate missing");
console.log("Native Anime V0.4.6 static integration validation passed.");
