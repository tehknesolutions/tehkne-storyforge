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
import {
  createSceneAuthorityWorkspace,
  realizeWebtoonFromSelectedRevisions,
  type SceneAuthorityWorkspace,
  type V04WebtoonRealization
} from "@/lib/storyforge-v04";
import {
  realizeNativeVisualNovel,
  type NativeVisualNovelRealization
} from "@/lib/storyforge-v041";
import {
  buildSemanticAssertionLedger,
  buildV042TnirExport,
  type SemanticAssertionLedger
} from "@/lib/storyforge-v042";
import { NarrativeForgeView } from "./narrative-forge-view";
import { SceneAuthorityEditor } from "./scene-authority-editor";
import { VisualNovelView } from "./visual-novel-view";
import { MangaView } from "./manga-view";
import { AnimeEpisodeView } from "./anime-episode-view";
import { realizeNativeManga, type NativeMangaChapter } from "@/lib/storyforge-v045";
import { realizeNativeAnimeEpisode, type NativeAnimeEpisode } from "@/lib/storyforge-v046";
import { SemanticAuthorityView } from "./semantic-authority-view";
import { DurableWorkspacePanel } from "./durable-workspace-panel";
import {
  DURABLE_WORKSPACE_REF_STORAGE_KEY,
  type DurableStoryWorkspacePayload,
  type DurableWorkspaceRef
} from "@/lib/workspace-persistence";
import { useI18n } from "./i18n";

const STORAGE_KEY = "tehkne:storyforge:workspace:v0.2";
const LEGACY_STORAGE_KEY = "tehkne:storyforge:workspace:v0.1";
const FORGE_STORAGE_KEY = "tehkne:storyforge:narrative-forge:v0.3";
const SCENE_AUTHORITY_STORAGE_KEY =
  "tehkne:storyforge:scene-authority:v0.4";
const V04_WEBTOON_STORAGE_KEY =
  "tehkne:storyforge:webtoon-realization:v0.4";
const V041_VISUAL_NOVEL_STORAGE_KEY =
  "tehkne:storyforge:visual-novel-realization:v0.4.1";
const V045_MANGA_STORAGE_KEY =
  "tehkne:storyforge:manga-realization:v0.4.5";
const V046_ANIME_STORAGE_KEY = "tehkne:storyforge:anime-realization:v0.4.6";

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
  const { locale, setLocale, t } = useI18n();
  const [state, setState] = useState<StoryWorkspaceState>(() => fresh(locale));
  const [forgeV03, setForgeV03] = useState<NarrativeForgeV03 | null>(null);
  const [sceneAuthority, setSceneAuthority] =
    useState<SceneAuthorityWorkspace | null>(null);
  const [webtoonV04, setWebtoonV04] =
    useState<V04WebtoonRealization | null>(null);
  const [visualNovelV041, setVisualNovelV041] =
    useState<NativeVisualNovelRealization | null>(null);
  const [mangaV045, setMangaV045] =
    useState<NativeMangaChapter | null>(null);
  const [animeV046, setAnimeV046] = useState<NativeAnimeEpisode | null>(null);
  const [durableRef, setDurableRef] =
    useState<DurableWorkspaceRef | null>(null);
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
        const parsedForge = JSON.parse(advanced) as NarrativeForgeV03;
        setForgeV03(parsedForge);

        const storedAuthority = window.localStorage.getItem(
          SCENE_AUTHORITY_STORAGE_KEY
        );
        setSceneAuthority(
          storedAuthority
            ? (JSON.parse(storedAuthority) as SceneAuthorityWorkspace)
            : createSceneAuthorityWorkspace(parsedForge)
        );

        const storedWebtoon = window.localStorage.getItem(
          V04_WEBTOON_STORAGE_KEY
        );
        if (storedWebtoon) {
          setWebtoonV04(
            JSON.parse(storedWebtoon) as V04WebtoonRealization
          );
        }

        const storedVisualNovel = window.localStorage.getItem(
          V041_VISUAL_NOVEL_STORAGE_KEY
        );
        if (storedVisualNovel) {
          setVisualNovelV041(
            JSON.parse(storedVisualNovel) as NativeVisualNovelRealization
          );
        }

        const storedManga = window.localStorage.getItem(V045_MANGA_STORAGE_KEY);
        if (storedManga) {
          setMangaV045(JSON.parse(storedManga) as NativeMangaChapter);
        }
        const storedAnime = window.localStorage.getItem(V046_ANIME_STORAGE_KEY);
        if (storedAnime) setAnimeV046(JSON.parse(storedAnime) as NativeAnimeEpisode);
      }

      const storedDurableRef = window.localStorage.getItem(
        DURABLE_WORKSPACE_REF_STORAGE_KEY
      );
      if (storedDurableRef) {
        setDurableRef(
          JSON.parse(storedDurableRef) as DurableWorkspaceRef
        );
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

  useEffect(() => {
    if (!hydrated) return;

    if (sceneAuthority) {
      window.localStorage.setItem(
        SCENE_AUTHORITY_STORAGE_KEY,
        JSON.stringify(sceneAuthority)
      );
    } else {
      window.localStorage.removeItem(SCENE_AUTHORITY_STORAGE_KEY);
    }
  }, [sceneAuthority, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    if (webtoonV04) {
      window.localStorage.setItem(
        V04_WEBTOON_STORAGE_KEY,
        JSON.stringify(webtoonV04)
      );
    } else {
      window.localStorage.removeItem(V04_WEBTOON_STORAGE_KEY);
    }
  }, [webtoonV04, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    if (visualNovelV041) {
      window.localStorage.setItem(
        V041_VISUAL_NOVEL_STORAGE_KEY,
        JSON.stringify(visualNovelV041)
      );
    } else {
      window.localStorage.removeItem(V041_VISUAL_NOVEL_STORAGE_KEY);
    window.localStorage.removeItem(V045_MANGA_STORAGE_KEY);
    window.localStorage.removeItem(V046_ANIME_STORAGE_KEY);
    window.localStorage.removeItem(V045_MANGA_STORAGE_KEY);
    }
  }, [visualNovelV041, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (mangaV045) {
      window.localStorage.setItem(V045_MANGA_STORAGE_KEY, JSON.stringify(mangaV045));
    } else {
      window.localStorage.removeItem(V045_MANGA_STORAGE_KEY);
    }
  }, [mangaV045, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    if (durableRef) {
      window.localStorage.setItem(
        DURABLE_WORKSPACE_REF_STORAGE_KEY,
        JSON.stringify(durableRef)
      );
    } else {
      window.localStorage.removeItem(
        DURABLE_WORKSPACE_REF_STORAGE_KEY
      );
    }
  }, [durableRef, hydrated]);

  const words = useMemo(() => {
    const normalized = state.idea.trim();
    return normalized ? normalized.split(/\s+/).length : 0;
  }, [state.idea]);

  const semanticLedgerV042 = useMemo<SemanticAssertionLedger | null>(() => {
    if (
      !state.storyDNA ||
      !state.universe ||
      !state.narrativeDraft ||
      !forgeV03
    ) {
      return null;
    }

    return buildSemanticAssertionLedger({
      storyDNA: state.storyDNA,
      universe: state.universe,
      narrative: state.narrativeDraft,
      forgeV03
    });
  }, [
    state.storyDNA,
    state.universe,
    state.narrativeDraft,
    forgeV03
  ]);

  useEffect(() => {
    if (!hydrated) return;
    if (animeV046) window.localStorage.setItem(V046_ANIME_STORAGE_KEY, JSON.stringify(animeV046));
    else window.localStorage.removeItem(V046_ANIME_STORAGE_KEY);
  }, [animeV046, hydrated]);

  const durablePayload = useMemo<DurableStoryWorkspacePayload>(
    () => ({
      workspace: {
        ...state,
        updatedAt: new Date().toISOString()
      },
      narrativeForgeV03: forgeV03,
      sceneAuthorityV04: sceneAuthority,
      webtoonRealizationV04: webtoonV04,
      visualNovelRealizationV041: visualNovelV041,
      mangaRealizationV045: mangaV045,
      animeRealizationV046: animeV046,
      semanticAssertionLedgerV042: semanticLedgerV042
    }),
    [
      state,
      forgeV03,
      sceneAuthority,
      webtoonV04,
      visualNovelV041,
      mangaV045,
      animeV046,
      semanticLedgerV042
    ]
  );

  function clearAdvancedAuthoring() {
    setForgeV03(null);
    setSceneAuthority(null);
    setWebtoonV04(null);
    setVisualNovelV041(null);
    setMangaV045(null);
    setAnimeV046(null);
  }

  function forge() {
    const idea = state.idea.trim();
    if (!idea) return;

    clearAdvancedAuthoring();
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

    clearAdvancedAuthoring();
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

    clearAdvancedAuthoring();
    setState((current) => ({
      ...current,
      universe,
      narrativeDraft,
      mediaPlan: null
    }));
  }

  function approveNarrative() {
    if (!state.narrativeDraft) return;

    clearAdvancedAuthoring();
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

    const advanced =
      forgeV03 ??
      forgeNarrativeV03({
        storyDNA: state.storyDNA,
        universe: state.universe,
        narrative: state.narrativeDraft,
        targetMedia: state.targetMedia,
        locale
      });

    setForgeV03(advanced);
    setSceneAuthority(
      (current) => current ?? createSceneAuthorityWorkspace(advanced)
    );
    setWebtoonV04(null);
    setVisualNovelV041(null);
    setMangaV045(null);
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

  function compileSelectedSceneRevisions() {
    if (!sceneAuthority) return;

    if (state.targetMedia === "ANIME_EPISODE") {
      setAnimeV046(realizeNativeAnimeEpisode(sceneAuthority, locale));
      setMangaV045(null); setWebtoonV04(null); setVisualNovelV041(null); return;
    }

    if (state.targetMedia === "MANGA") {
      setMangaV045(realizeNativeManga(sceneAuthority, locale));
      setWebtoonV04(null);
      setVisualNovelV041(null);
      setAnimeV046(null);
      return;
    }

    if (state.targetMedia === "WEBTOON") {
      setWebtoonV04(
        realizeWebtoonFromSelectedRevisions(sceneAuthority, locale)
      );
      setVisualNovelV041(null);
      setMangaV045(null);
      return;
    }

    if (
      state.targetMedia === "VISUAL_NOVEL" &&
      state.narrativeDraft
    ) {
      setVisualNovelV041(
        realizeNativeVisualNovel(
          sceneAuthority,
          state.narrativeDraft,
          locale
        )
      );
      setWebtoonV04(null);
      setMangaV045(null);
      return;
    }

    setWebtoonV04(null);
    setVisualNovelV041(null);
    setMangaV045(null);
    setAnimeV046(null);
  }

  function reset() {
    clearAdvancedAuthoring();
    setDurableRef(null);
    setState(fresh(locale));
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    window.localStorage.removeItem(FORGE_STORAGE_KEY);
    window.localStorage.removeItem(SCENE_AUTHORITY_STORAGE_KEY);
    window.localStorage.removeItem(V04_WEBTOON_STORAGE_KEY);
    window.localStorage.removeItem(V041_VISUAL_NOVEL_STORAGE_KEY);
    window.localStorage.removeItem(
      DURABLE_WORKSPACE_REF_STORAGE_KEY
    );
  }

  function loadDurableWorkspace(
    payload: DurableStoryWorkspacePayload
  ) {
    setLocale(payload.workspace.locale);
    setState(payload.workspace);
    setForgeV03(payload.narrativeForgeV03);
    setSceneAuthority(payload.sceneAuthorityV04);
    setWebtoonV04(payload.webtoonRealizationV04);
    setVisualNovelV041(payload.visualNovelRealizationV041);
    setMangaV045(payload.mangaRealizationV045 ?? null);
    setAnimeV046(payload.animeRealizationV046 ?? null);
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
        narrativeForgeV03: forgeV03,
        sceneAuthorityV04: sceneAuthority,
        webtoonRealizationV04: webtoonV04,
        visualNovelRealizationV041: visualNovelV041,
        mangaRealizationV045: mangaV045,
        animeRealizationV046: animeV046,
        semanticAssertionLedgerV042: semanticLedgerV042
      },
      "storyforge-workspace"
    );
  }

  function exportSceneAuthority() {
    if (!sceneAuthority) return;
    downloadJson(
      sceneAuthority,
      "storyforge-scene-authority-v0.4"
    );
  }

  function exportTnirV04() {
    if (
      !forgeV03 ||
      !sceneAuthority ||
      !state.storyDNA ||
      !state.universe ||
      !state.narrativeDraft
    ) {
      return;
    }

    downloadJson(
      buildV042TnirExport({
        storyDNA: state.storyDNA,
        universe: state.universe,
        narrative: state.narrativeDraft,
        forgeV03,
        sceneAuthority,
        targetMedia: state.targetMedia,
        locale
      }),
      "storyforge-tnir-v0.5-semantic-authority"
    );
  }

  function exportWebtoonV04() {
    if (!webtoonV04) return;
    downloadJson(
      webtoonV04,
      "storyforge-webtoon-v0.4-episode-001"
    );
  }

  function exportSemanticLedgerV042() {
    if (!semanticLedgerV042) return;
    downloadJson(
      semanticLedgerV042,
      "storyforge-semantic-assertions-v0.4.2"
    );
  }

  function exportAnimeV046() {
    if (!animeV046) return;
    downloadJson(animeV046, "storyforge-anime-v0.4.6-episode-001");
  }

  function exportMangaV045() {
    if (!mangaV045) return;
    downloadJson(mangaV045, "storyforge-manga-v0.4.5-chapter-001");
  }

  function exportVisualNovelV041() {
    if (!visualNovelV041) return;
    downloadJson(
      visualNovelV041,
      "storyforge-visual-novel-v0.4.1"
    );
  }

  return (
    <section className="workspace-card" aria-labelledby="workspace-title">
      <div className="workspace-heading">
        <div>
          <div className="eyebrow">{t("workspace.eyebrow")}</div>
          <h2 id="workspace-title">{t("workspace.title")}</h2>
          <p className="muted">{t("workspace.body")}</p>
        </div>
        <span className="status candidate">SEMANTIC AUTHORITY V0.4.2</span>
      </div>

      <DurableWorkspacePanel
        payload={durablePayload}
        suggestedTitle={
          state.universe?.title ??
          state.storyDNA?.premise ??
          t("cloud.untitled")
        }
        canSave={Boolean(state.idea.trim())}
        activeRef={durableRef}
        onActiveRefChange={setDurableRef}
        onLoad={loadDurableWorkspace}
      />

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
                  setWebtoonV04(null);
                  setVisualNovelV041(null);
                  setMangaV045(null);
                  setAnimeV046(null);
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
        <NarrativeForgeView forge={forgeV03} />
      ) : null}

      {semanticLedgerV042 ? (
        <SemanticAuthorityView
          ledger={semanticLedgerV042}
          onExport={exportSemanticLedgerV042}
        />
      ) : null}

      {forgeV03 && sceneAuthority ? (
        <SceneAuthorityEditor
          authority={sceneAuthority}
          locale={locale}
          webtoon={webtoonV04}
          targetMedia={state.targetMedia}
          onChange={(next) => {
            setSceneAuthority(next);
            setWebtoonV04(null);
            setVisualNovelV041(null);
            setMangaV045(null);
            setAnimeV046(null);
          }}
          onCompile={compileSelectedSceneRevisions}
          onExportAuthority={exportSceneAuthority}
          onExportTnir={exportTnirV04}
          onExportWebtoon={exportWebtoonV04}
        />
      ) : null}

      {animeV046 ? (
        <AnimeEpisodeView realization={animeV046} onExport={exportAnimeV046} />
      ) : null}

      {mangaV045 ? (
        <MangaView realization={mangaV045} onExport={exportMangaV045} />
      ) : null}

      {visualNovelV041 ? (
        <VisualNovelView
          realization={visualNovelV041}
          onExport={exportVisualNovelV041}
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
