"use client";

import { useEffect, useMemo, useState } from "react";
import {
  compileMediaPlan,
  createUniverseDraft,
  forgeStoryDNA,
  type MediaTarget,
  type StoryWorkspaceState
} from "@/lib/storyforge-local";
import { useI18n } from "./i18n";

const STORAGE_KEY = "tehkne:storyforge:workspace:v0.1";

const targets: Array<{ id: MediaTarget; label: string }> = [
  { id: "PROSE_SHORT", label: "Conto / Short Story" },
  { id: "NOVEL", label: "Romance / Novel" },
  { id: "MANGA", label: "Mangá" },
  { id: "WEBTOON", label: "Webtoon" },
  { id: "ANIME_EPISODE", label: "Anime" },
  { id: "GAME", label: "Jogo / Game" },
  { id: "VISUAL_NOVEL", label: "Visual Novel" },
  { id: "AUDIO_DRAMA", label: "Audiodrama" }
];

function fresh(locale: "pt-BR" | "en" | "es"): StoryWorkspaceState {
  return {
    version: "0.1.0",
    locale,
    idea: "",
    storyDNA: null,
    universe: null,
    mediaPlan: null,
    targetMedia: "MANGA",
    updatedAt: new Date().toISOString()
  };
}

export function StoryWorkspace() {
  const { locale, t } = useI18n();
  const [state, setState] = useState<StoryWorkspaceState>(() => fresh(locale));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoryWorkspaceState;
        setState({ ...parsed, locale });
      } else {
        setState(fresh(locale));
      }
    } catch {
      setState(fresh(locale));
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setState((current) => ({ ...current, locale }));
  }, [locale, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, updatedAt: new Date().toISOString() })
    );
  }, [state, hydrated]);

  const words = useMemo(() => {
    const normalized = state.idea.trim();
    return normalized ? normalized.split(/\s+/).length : 0;
  }, [state.idea]);

  function forge() {
    const idea = state.idea.trim();
    if (!idea) return;
    setState((current) => ({
      ...current,
      storyDNA: forgeStoryDNA(idea, locale),
      universe: null,
      mediaPlan: null
    }));
  }

  function approveStoryDNA() {
    if (!state.storyDNA) return;
    const approved = { ...state.storyDNA, status: "APPROVED_LOCAL" as const };
    const universe = createUniverseDraft(approved, locale);
    setState((current) => ({
      ...current,
      storyDNA: approved,
      universe,
      mediaPlan: null
    }));
  }

  function approveUniverse() {
    if (!state.universe) return;
    setState((current) => ({
      ...current,
      universe: current.universe
        ? { ...current.universe, status: "APPROVED_LOCAL" as const }
        : null
    }));
  }

  function compile() {
    if (!state.universe) return;
    setState((current) => ({
      ...current,
      mediaPlan: current.universe
        ? compileMediaPlan(current.universe, current.targetMedia, locale)
        : null
    }));
  }

  function reset() {
    setState(fresh(locale));
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `storyforge-workspace-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="workspace-card" aria-labelledby="workspace-title">
      <div className="workspace-heading">
        <div>
          <div className="eyebrow">{t("workspace.eyebrow")}</div>
          <h2 id="workspace-title">{t("workspace.title")}</h2>
          <p className="muted">{t("workspace.body")}</p>
        </div>
        <span className="status candidate">LOCAL-FIRST</span>
      </div>

      <div className="workspace-step">
        <div className="workspace-step-label">01 · {t("workspace.idea")}</div>
        <textarea
          value={state.idea}
          onChange={(event) =>
            setState((current) => ({ ...current, idea: event.target.value }))
          }
          placeholder={t("idea.placeholder")}
          rows={6}
        />
        <div className="intake-footer">
          <span>{words} {t("idea.words")}</span>
          <button type="button" disabled={!state.idea.trim()} onClick={forge}>
            {t("workspace.forge")}
          </button>
        </div>
      </div>

      {state.storyDNA ? (
        <div className="workspace-step">
          <div className="workspace-step-label">02 · STORY DNA</div>
          <div className="story-dna-grid">
            <article><small>{t("workspace.premise")}</small><p>{state.storyDNA.premise}</p></article>
            <article><small>{t("workspace.genre")}</small><strong>{state.storyDNA.genre}</strong></article>
            <article><small>{t("workspace.tone")}</small><strong>{state.storyDNA.tone}</strong></article>
            <article><small>{t("workspace.themes")}</small><strong>{state.storyDNA.themes.join(" · ")}</strong></article>
            <article className="wide"><small>{t("workspace.conflict")}</small><p>{state.storyDNA.centralConflict}</p></article>
            <article className="wide"><small>{t("workspace.promise")}</small><p>{state.storyDNA.narrativePromise}</p></article>
          </div>
          <div className="authority-note">
            <span className="status candidate">{state.storyDNA.status}</span>
            <span>{t("workspace.localApprovalNotice")}</span>
          </div>
          {state.storyDNA.status === "CANDIDATE" ? (
            <button type="button" onClick={approveStoryDNA}>
              {t("workspace.approveDna")}
            </button>
          ) : null}
        </div>
      ) : null}

      {state.universe ? (
        <div className="workspace-step">
          <div className="workspace-step-label">03 · {t("workspace.universe")}</div>
          <h3>{state.universe.title}</h3>
          <p>{state.universe.premise}</p>

          <div className="story-dna-grid">
            <article className="wide">
              <small>{t("workspace.worldRules")}</small>
              <ul>{state.universe.worldRules.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
            <article className="wide">
              <small>{t("workspace.openQuestions")}</small>
              <ul>{state.universe.coreQuestions.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          </div>

          <div className="authority-note">
            <span className="status candidate">{state.universe.status}</span>
            <span>{t("workspace.notCanon")}</span>
          </div>

          {state.universe.status === "CANDIDATE" ? (
            <button type="button" onClick={approveUniverse}>
              {t("workspace.approveUniverse")}
            </button>
          ) : null}
        </div>
      ) : null}

      {state.universe?.status === "APPROVED_LOCAL" ? (
        <div className="workspace-step">
          <div className="workspace-step-label">04 · {t("workspace.mediaPlan")}</div>
          <div className="media-picker">
            {targets.map((target) => (
              <button
                className={state.targetMedia === target.id ? "" : "secondary"}
                type="button"
                key={target.id}
                onClick={() =>
                  setState((current) => ({
                    ...current,
                    targetMedia: target.id,
                    mediaPlan: null
                  }))
                }
              >
                {target.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={compile}>
            {t("workspace.compile")}
          </button>
        </div>
      ) : null}

      {state.mediaPlan ? (
        <div className="workspace-step">
          <div className="workspace-step-label">05 · MEDIA PLAN</div>
          <div className="media-plan-list">
            {state.mediaPlan.units.map((unit) => (
              <article key={unit.index}>
                <span className="step">{String(unit.index).padStart(2, "0")}</span>
                <h3>{unit.role}</h3>
                <p>{unit.objective}</p>
              </article>
            ))}
          </div>
          <div className="workspace-actions">
            <button type="button" onClick={exportJson}>{t("workspace.export")}</button>
            <button className="secondary" type="button" onClick={reset}>{t("workspace.reset")}</button>
          </div>
        </div>
      ) : (
        state.idea ? (
          <div className="workspace-secondary-actions">
            <button className="secondary" type="button" onClick={reset}>
              {t("workspace.reset")}
            </button>
          </div>
        ) : null
      )}
    </section>
  );
}
