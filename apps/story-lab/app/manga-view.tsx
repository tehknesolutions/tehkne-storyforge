"use client";

import { useState } from "react";
import type { NativeMangaChapter } from "@/lib/storyforge-v045";

type Props = {
  realization: NativeMangaChapter;
  onExport: () => void;
};

export function MangaView({ realization, onExport }: Props) {
  const [pageIndex, setPageIndex] = useState(0);
  const page = realization.pages[pageIndex];

  return (
    <section className="workspace-step manga-view">
      <div className="workspace-step-label">12 · NATIVE MANGA</div>
      <div className="manga-summary">
        <div><small>CHAPTER</small><strong>{realization.chapterNumber}</strong></div>
        <div><small>PAGES</small><strong>{realization.pageCount}</strong></div>
        <div><small>PANELS</small><strong>{realization.panelCount}</strong></div>
        <div><small>READING</small><strong>RIGHT → LEFT</strong></div>
        <span className="status candidate">{realization.authority}</span>
      </div>

      <div className="manga-reader">
        <div className="manga-reader-head">
          <div>
            <small>{realization.title}</small>
            <h3>Page {page.pageNumber} / {realization.pageCount}</h3>
          </div>
          <span className="status candidate">{page.pageTurnRole}</span>
        </div>

        <div className={`manga-page layout-${page.layout.toLowerCase()}`} dir="rtl">
          {page.panels.map((panel) => (
            <article className={`manga-panel size-${panel.size.toLowerCase()}`} key={panel.id}>
              <div className="manga-panel-meta">
                <span>P{panel.panelNumber}</span>
                <code>{panel.kind}</code>
              </div>
              <div className="manga-art-placeholder">
                <p>{panel.visualIntent}</p>
              </div>
              {panel.balloons.length ? (
                <div className="manga-balloons" dir="ltr">
                  {panel.balloons.map((balloon) => (
                    <div className={`manga-balloon ${balloon.kind.toLowerCase()}`} key={balloon.id}>
                      {balloon.speakerName ? <strong>{balloon.speakerName}</strong> : null}
                      <p>{balloon.text}</p>
                    </div>
                  ))}
                </div>
              ) : null}
              <details className="manga-trace" dir="ltr">
                <summary>TRACE</summary>
                <code>{panel.trace.sceneRevisionId}</code>
                <code>{panel.trace.eventId}</code>
                <small>{panel.trace.sourceClaimIds.join(" · ") || "NO SOURCE CLAIM"}</small>
              </details>
            </article>
          ))}
        </div>

        <div className="manga-reader-controls">
          <button
            className="secondary"
            type="button"
            disabled={pageIndex >= realization.pages.length - 1}
            onClick={() => setPageIndex((current) => Math.min(realization.pages.length - 1, current + 1))}
          >
            ← Next page
          </button>
          <span>RTL PAGE TURN</span>
          <button
            className="secondary"
            type="button"
            disabled={pageIndex === 0}
            onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
          >
            Previous page →
          </button>
        </div>
      </div>

      <div className="workspace-actions">
        <button type="button" onClick={onExport}>Export Manga JSON</button>
      </div>
    </section>
  );
}
