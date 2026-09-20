import fs from "node:fs/promises";
const read=(p)=>fs.readFile(new URL("../"+p,import.meta.url),"utf8");
const [layer,view,workspace,pkg]=await Promise.all([
 read("apps/story-lab/lib/storyforge-v047.ts"),
 read("apps/story-lab/app/media-equivalence-view.tsx"),
 read("apps/story-lab/app/story-workspace.tsx"),
 read("apps/story-lab/package.json")
]);
const expect=(ok,msg)=>{if(!ok) throw new Error(msg);};
expect(layer.includes("buildMediaEquivalenceMap")&&layer.includes("buildV047TnirMediaEquivalence"),"Media equivalence compiler/export missing");
expect(layer.includes('canonicalEventGraphMutated: false'),"Canon mutation invariant missing");
expect(layer.includes('"MANGA"')&&layer.includes('"ANIME_EPISODE"')&&layer.includes('"VISUAL_NOVEL"'),"Three-media mapping missing");
expect(view.includes("MEDIA EQUIVALENCE LAYER")&&view.includes("event.projections"),"Equivalence inspector missing");
expect(workspace.includes("<MediaEquivalenceView")&&workspace.includes("buildV047TnirMediaEquivalence"),"Workspace equivalence/T-NIR integration missing");
expect(pkg.includes("probe-media-equivalence-v047.ts"),"Executable equivalence build gate missing");
console.log("Media Equivalence V0.4.7 static integration validation passed.");
