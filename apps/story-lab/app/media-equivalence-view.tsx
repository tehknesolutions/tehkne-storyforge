"use client";
import { useMemo, useState } from "react";
import type { MediaEquivalenceMap } from "@/lib/storyforge-v047";

export function MediaEquivalenceView({ map }: { map: MediaEquivalenceMap }) {
  const [selected,setSelected]=useState(map.events[0]?.eventId ?? "");
  const event=useMemo(()=>map.events.find(x=>x.eventId===selected) ?? map.events[0],[map,selected]);
  if(!event) return null;
  return <section className="workspace-step media-equivalence">
    <div className="workspace-step-label">14 · MEDIA EQUIVALENCE LAYER</div>
    <div className="authority-note"><span className="status candidate">{map.authority}</span><span>ONE NARRATIVE EVENT · MULTIPLE NATIVE PROJECTIONS · CANON UNCHANGED</span></div>
    <label>EVENT
      <select value={event.eventId} onChange={e=>setSelected(e.target.value)}>
        {map.events.map(x=><option key={x.eventId} value={x.eventId}>{x.eventId}</option>)}
      </select>
    </label>
    <div className="equivalence-grid">
      {(["MANGA","ANIME_EPISODE","VISUAL_NOVEL"] as const).map(target=>{
        const p=event.projections.find(x=>x.target===target);
        return <article key={target}>
          <small>{target}</small>
          <h3>{p ? `${p.unitCount} native units` : "Not compiled"}</h3>
          {p?.unitIds.map(id=><code key={id}>{id}</code>)}
        </article>;
      })}
    </div>
    <details><summary>PROVENANCE</summary><code>{event.eventId}</code>{event.sceneRevisionIds.map(id=><code key={id}>{id}</code>)}<small>{event.sourceClaimIds.join(" · ") || "NO SOURCE CLAIM"}</small></details>
  </section>;
}
