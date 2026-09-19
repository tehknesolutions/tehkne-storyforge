"use client";

import { useEffect, useMemo, useState } from "react";
import {
  compileMediaPlan,
  createNarrativeDraft,
  createUniverseDraft,
  forgeStoryDNA,
  type MediaTarget,
  type StoryWorkspaceState
} from "@/lib/storyforge-local";
import {
  forgeNarrativeV03,
  type NarrativeForgeV03
} from "@/lib/storyforge-v03";
import { NarrativeForgeView } from "./narrative-forge-view";
import { useI18n } from "./i18n";

const STORAGE_KEY = "tehkne:storyforge:workspace:v0.2";
const LEGACY_STORAGE_KEY = "tehkne:storyforge:workspace:v0.1";
const FORGE_STORAGE_KEY = "tehkne:storyforge:narrative-forge:v0.3";

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
    version: "0.2.0",
    locale,
    idea: "",
    storyDNA: null,
    universe: null,
    narrativeDraft: null,
    mediaPlan: null,
    targetMedia: "MANGA",
    updatedAt: new Date().toISOString()
  };
}

function migrate(
  raw: string,
  locale: "pt-BR" | "en" | "es"
): StoryWorkspaceState {
  const parsed = JSON.parse(raw) as Partial<StoryWorkspaceState> & {
    storyDNA?: (StoryWorkspaceState["storyDNA"] & { sourceIdea?: string }) | null;
  };

  const storyDNA = parsed.storyDNA
    ? {
        ...parsed.storyDNA,
        sourceFacts:
          parsed.storyDNA.sourceFacts?.length
            ? parsed.storyDNA.sourceFacts
            : [
                parsed.storyDNA.sourceIdea ??
                  parsed.idea ??
                  parsed.storyDNA.premise
              ].filter(Boolean) as string[]
      }
    : null;

  return {
    version: "0.2.0",
    locale,
    idea: parsed.idea ?? storyDNA?.sourceIdea ?? "",
    storyDNA,
    universe: parsed.universe ?? null,
    narrativeDraft: parsed.narrativeDraft ?? null,
    mediaPlan:
      parsed.version === "0.2.0"
        ? parsed.mediaPlan ?? null
        : null,
    targetMedia: parsed.targetMedia ?? "MANGA",
    updatedAt: new Date().toISOString()
  };
}

export function StoryWorkspace() {
  const { locale, t } = useI18n();
  const [state, setState] = useState<StoryWorkspaceState>(() => fresh(locale));
  const [forgeV03, setForgeV03] = useState<NarrativeForgeV03 | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw =
        window.localStorage.getItem(STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_STORAGE_KEY);

      if (raw) {
        const migrated = migrate(raw, locale);
        setState(migrated);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      } else {
        setState(fresh(locale));
      }

      const advanced = window.localStorage.getItem(FORGE_STORAGE_KEY);
      if (advanced) {
        setForgeV03(JSON.parse(advanced) as NarrativeForgeV03);
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

  useEffect(() => {
    if (!hydrated) return;

    if (forgeV03) {
      window.localStorage.setItem(
        FORGE_STORAGE_KEY,
        JSON.stringify(forgeV03)
      );
    } else {
      window.localStorage.removeItem(FORGE_STORAGE_KEY);
    }
  }, [forgeV03, hydrated]);

  const words = useMemo(() => {
    const normalized = state.idea.trim();
    return normalized ? normalized.split(/\s+/).length : 0;
  }, [state.idea]);

  function forge() {
    const idea = state.idea.trim();
    if (!idea) return;

    setForgeV03(null);
    setState((current) => ({
      ...current,
      storyDNA: forgeStoryDNA(idea, locale),
      universe: null,
      narrativeDraft: null,
      mediaPlan: null
    }));
  }

  function approveStoryDNA() {
    if (!state.storyDNA) return;
    const approved = { ...state.storyDNA, status: "APPROVED_LOCAL" as const };
    const universe = createUniverseDraft(approved, locale);

    setForgeV03(null);
    setState((current) => ({
      ...current,
      storyDNA: approved,
      universe,
      narrativeDraft: null,
      mediaPlan: null
    }));
  }

  function approveUniverse() {
    if (!state.universe || !state.storyDNA) return;

    const universe = {
      ...state.universe,
      status: "APPROVED_LOCAL" as const
    };
    const narrativeDraft = createNarrativeDraft(
      state.storyDNA,
      universe,
      locale
    );

    setForgeV03(null);
    setState((current) => ({
      ...current,
      universe,
      narrativeDraft,
      mediaPlan: null
    }));
  }

  function approveNarrative() {
    if (!state.narrativeDraft) return;

    setForgeV03(null);
    setState((current) => ({
      ...current,
      narrativeDraft: current.narrativeDraft
        ? {
            ...current.narrativeDraft,
            status: "APPROVED_LOCAL" as const
          }
        : null,
      mediaPlan: null
    }));
  }

  function compile() {
    if (!state.storyDNA || !state.universe || !state.narrativeDraft) return;

    const advanced = forgeNarrativeV03({
      storyDNA: state.storyDNA,
      universe: state.universe,
      narrative: state.narrativeDraft,
      targetMedia: state.targetMedia,
      locale
    });

    setForgeV03(advanced);
    setState((current) => ({
      ...current,
      mediaPlan:
        current.universe && current.narrativeDraft
          ? compileMediaPlan(
              current.universe,
              current.narrativeDraft,
              current.targetMedia,
              locale
            )
          : null
    }));
  }

  function reset() {
    setForgeV03(null);
    setState(fresh(locale));
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    window.localStorage.removeItem(FORGE_STORAGE_KEY);
  }

  function downloadJson(value: unknown, prefix: string) {
    const blob = new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${prefix}-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function exportJson() {
    downloadJson(
      {
        workspace: {
          ...state,
          updatedAt: new Date().toISOString()
        },
        narrativeForgeV03: forgeV03
      },
      "storyforge-workspace"
    );
  }

  function exportForge() {
    if (!forgeV03) return;
    downloadJson(forgeV03, "storyforge-narrative-forge-v0.3");
  }

  function exportTnir() {
    if (!forgeV03) return;
    downloadJson(forgeV03.tnir, "storyforge-tnir-v0.5");
  }

  function exportWebtoon() {
    if (!forgeV03?.webtoon) return;
    downloadJson(forgeV03.webtoon, "storyforge-webtoon-episode-001");
  }

  return (
    <section className="workspace-card" aria-labelledby="workspace-title">
      <div className="workspace-heading">
        <div>
          <div className="eyebrow">{t("workspace.eyebrow")}</div>
          <h2 id="workspace-title">{t("workspace.title")}</h2>
          <p className="muted">{t("workspace.body")}</p>
        </div>
        <span className="status candidate">NARRATIVE FORGE V0.3</span>
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
            <article className="wide">
              <small>{t("workspace.sourceFacts")}</small>
              <ul>
                {state.storyDNA.sourceFacts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </article>
            <article className="wide">
              <small>{t("workspace.premise")}</small>
              <p>{state.storyDNA.premise}</p>
            </article>
            <article>
              <small>{t("workspace.genre")}</small>
              <strong>{state.storyDNA.genre}</strong>
            </article>
            <article>
              <small>{t("workspace.tone")}</small>
              <strong>{state.storyDNA.tone}</strong>
            </article>
            <article className="wide">
              <small>{t("workspace.themes")}</small>
              <strong>{state.storyDNA.themes.join(" · ")}</strong>
            </article>
            <article className="wide">
              <small>{t("workspace.conflict")}</small>
              <p>{state.storyDNA.centralConflict}</p>
            </article>
            <article className="wide">
              <small>{t("workspace.promise")}</small>
              <p>{state.storyDNA.narrativePromise}</p>
            </article>
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
              <ul>
                {state.universe.worldRules.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="wide">
              <small>{t("workspace.openQuestions")}</small>
              <ul>
                {state.universe.coreQuestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
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

      {state.narrativeDraft ? (
        <div className="workspace-step">
          <div className="workspace-step-label">
            04 · {t("workspace.narrativeDraft")}
          </div>

          <div className="narrative-summary">
            <small>{t("workspace.logline")}</small>
            <p>{state.narrativeDraft.logline}</p>
          </div>

          <h3>{t("workspace.characters")}</h3>
          <div className="character-grid">
            {state.narrativeDraft.characters.map((character) => (
              <article key={character.id}>
                <div className="review-head">
                  <strong>{character.name}</strong>
                  <span
                    className={`status ${
                      character.authority === "SOURCE"
                        ? "canon"
                        : "candidate"
                    }`}
                  >
                    {character.authority}
                  </span>
                </div>
                <small>{character.role}</small>
                <p>{character.description}</p>
              </article>
            ))}
          </div>

          <h3>{t("workspace.eventGraph")}</h3>
          <div className="event-chain">
            {state.narrativeDraft.events.map((event) => (
              <article key={event.id}>
                <div className="event-index">
                  {String(event.index).padStart(2, "0")}
                </div>
                <div className="event-content">
                  <div className="review-head">
                    <div>
                      <small>{event.function}</small>
                      <h3>{event.title}</h3>
                    </div>
                    <span
                      className={`status ${
                        event.authority === "SOURCE"
                          ? "canon"
                          : "candidate"
                      }`}
                    >
                      {event.authority}
                    </span>
                  </div>
                  <p>{event.summary}</p>
                  <div className="tension-meter">
                    <span>{t("workspace.tension")}</span>
                    <div>
                      <i style={{ width: `${event.tension * 10}%` }} />
                    </div>
                    <strong>{event.tension}/10</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <details className="candidate-expansions">
            <summary>{t("workspace.candidateExpansions")}</summary>
            <ul>
              {state.narrativeDraft.candidateExpansions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </details>

          <div className="authority-note">
            <span className="status candidate">
              {state.narrativeDraft.status}
            </span>
            <span>{t("workspace.narrativeNotice")}</span>
          </div>

          {state.narrativeDraft.status === "CANDIDATE" ? (
            <button type="button" onClick={approveNarrative}>
              {t("workspace.approveNarrative")}
            </button>
          ) : null}
        </div>
      ) : null}

      {state.narrativeDraft?.status === "APPROVED_LOCAL" ? (
        <div className="workspace-step">
          <div className="workspace-step-label">
            05 · {t("workspace.mediaPlan")}
          </div>
          <div className="media-picker">
            {targets.map((target) => (
              <button
                className={state.targetMedia === target.id ? "" : "secondary"}
                type="button"
                key={target.id}
                onClick={() => {
                  setState((current) => ({
                    ...current,
                    targetMedia: target.id,
                    mediaPlan: null
                  }));
                  setForgeV03(null);
                }}
              >
                {target.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={compile}>
            {t("forge.compile")}
          </button>
        </div>
      ) : null}

      {state.mediaPlan ? (
        <div className="workspace-step">
          <div className="workspace-step-label">06 · MEDIA PLAN</div>
          <div className="media-plan-list">
            {state.mediaPlan.units.map((unit) => (
              <article key={unit.index}>
                <div className="review-head">
                  <span className="step">
                    {String(unit.index).padStart(2, "0")}
                  </span>
                  <span
                    className={`status ${
                      unit.authority === "SOURCE"
                        ? "canon"
                        : "candidate"
                    }`}
                  >
                    {unit.authority}
                  </span>
                </div>
                <h3>{unit.role}</h3>
                <p>{unit.objective}</p>
                <small>{t("workspace.productionHint")}</small>
                <p>{unit.productionHint}</p>
                {unit.dialogueCue ? (
                  <>
                    <small>{t("workspace.dialogueCue")}</small>
                    <p>{unit.dialogueCue}</p>
                  </>
                ) : null}
              </article>
            ))}
          </div>

          <div className="workspace-actions">
            <button type="button" onClick={exportJson}>
              {t("workspace.export")}
            </button>
            <button className="secondary" type="button" onClick={reset}>
              {t("workspace.reset")}
            </button>
          </div>
        </div>
      ) : null}

      {forgeV03 ? (
        <NarrativeForgeView
          forge={forgeV03}
          onExportForge={exportForge}
          onExportTnir={exportTnir}
          onExportWebtoon={exportWebtoon}
        />
      ) : null}

      {!state.mediaPlan && state.idea ? (
          <div className="workspace-secondary-actions">
            <button className="secondary" type="button" onClick={reset}>
              {t("workspace.reset")}
            </button>
          </div>
      ) : null}
    </section>
  );
}
