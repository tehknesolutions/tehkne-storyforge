"use client";

import type { NativeAnimeEpisode } from "@/lib/storyforge-v046";

type Props = { realization: NativeAnimeEpisode; onExport: () => void };

export function AnimeEpisodeView({ realization, onExport }: Props) {
  return (
    <section className="workspace-step anime-view">
      <div className="workspace-step-label">13 · NATIVE ANIME EPISODE</div>
      <div className="anime-summary">
        <div><small>EPISODE</small><strong>{realization.episodeNumber}</strong></div>
        <div><small>SCENES</small><strong>{realization.scenes.length}</strong></div>
        <div><small>SHOTS</small><strong>{realization.shotCount}</strong></div>
        <div><small>DURATION</small><strong>{realization.durationSeconds}s</strong></div>
        <span className="status candidate">{realization.authority}</span>
      </div>
      <div className="anime-timeline">
        {realization.scenes.map((scene) => (
          <article className="anime-scene" key={scene.id}>
            <div className="anime-scene-head">
              <div><small>SCENE {scene.sceneNumber}</small><h3>{scene.title}</h3></div>
              <strong>{scene.durationSeconds}s</strong>
            </div>
            <div className="anime-shot-strip">
              {scene.shots.map((shot) => (
                <div className="anime-shot" key={shot.id}>
                  <div className="anime-shot-head">
                    <strong>SHOT {shot.shotNumber}</strong><span>{shot.durationSeconds}s</span>
                  </div>
                  <div className="anime-frame">
                    <span>{shot.framing}</span><span>{shot.camera}</span>
                    <p>{shot.action}</p>
                  </div>
                  {shot.dialogue.map((line, index) => (
                    <p className="anime-dialogue" key={`${shot.id}:dialogue:${index}`}>
                      <strong>{line.speakerName}:</strong> {line.text}
                    </p>
                  ))}
                  <div className="anime-production-meta">
                    <code>ANIM {shot.animationPriority}</code>
                    <code>{shot.audio.musicCue ?? "NO MUSIC CUE"}</code>
                  </div>
                  <details className="anime-trace">
                    <summary>TRACE</summary>
                    <code>{shot.trace.sceneRevisionId}</code>
                    <code>{shot.trace.eventId}</code>
                    <small>{shot.trace.sourceClaimIds.join(" · ") || "NO SOURCE CLAIM"}</small>
                  </details>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="workspace-actions"><button type="button" onClick={onExport}>Export Anime JSON</button></div>
    </section>
  );
}
