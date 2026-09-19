# TEHKNÉ STORYFORGE

> **Forge an idea into a universe.**

TEHKNÉ STORYFORGE is a narrative creation and transmedia production system by Tehkné Solutions.

Its purpose is not merely to generate stories. Storyforge transforms a creative intention into a structured narrative universe and then derives multiple coherent media manifestations from the same canonical source.

## Core flow

```text
ALEF / INTENTION
→ STORY DNA
→ WORLD + CANON
→ CHARACTER MIND
→ EVENT / FABULA
→ DISCOURSE / SYUZHET
→ EXPERIENCE
→ T-NIR
→ MEDIA COMPILERS
→ MEDIA ARTIFACTS
```

## Product architecture

- **TEHKNÉ STORYFORGE** — complete product.
- **TNE — Tehkné Narrative Engine** — narrative runtime and orchestration layer.
- **T-NIR — Tehkné Narrative Intermediate Representation** — media-independent narrative representation.
- **Story Lab** — creator-facing workspace.
- **Canon Graph** — canonical truth and relationship graph.
- **Narrative Director** — pacing, dramatic and continuity orchestration.
- **Media Compilers** — project the same T-NIR universe into different media.

## First-class media targets

### Literature
- Short Story
- Novel
- Light Novel

### Comics and sequential art
- Comic
- Manga
- Manhwa
- Manhua
- Webtoon
- Vertical Comic
- Motion Comic

### Audiovisual
- Animation
- Anime Short
- Anime Episode
- Anime Series
- Screenplay

### Interactive
- Game
- Visual Novel

### Audio
- Audio Drama

These are **media profiles**, not interchangeable labels. Manga, Webtoon and Anime, for example, may share canonical events while using different pacing, composition, production units and presentation grammars.

## Core principles

1. **Creator Authority** — AI may propose; canon changes require creator approval.
2. **Canon-first** — continuity is part of the architecture, not a final QA patch.
3. **Event-first** — canonical events are more fundamental than scenes or pages.
4. **Mind ≠ Canon** — what a character believes may differ from what is true.
5. **Media-agnostic core** — external text/image/audio/video models are replaceable adapters.
6. **Hybrid Narrative** — supports authored and emergent storytelling.
7. **Provenance** — important facts and generated artifacts must be traceable.
8. **Transmedia by design** — each medium may reinterpret presentation without silently changing canon.

## Product language policy

TEHKNÉ Solutions official product language order:

```text
1. PT-BR — official / default / fallback
2. EN
3. ES
```

Story Lab implements a global persistent language switcher and passes the
selected locale into provider generation. Missing translations always fall
back to PT-BR.

Policy: `docs/TEHKNE-PRODUCT-I18N-STANDARD.md`

## Repository status

**TEHKNÉ STORYFORGE V0.8 RC1 — Durable Creator Authority**

Architecture:

```text
STORYFORGE 0.8.0-rc.1
├─ Story Lab 0.3.0-rc.1
├─ T-NIR 0.5.0
└─ T-PIR 0.1.0
```

Implemented in RC1:

- Supabase SSR/auth integration isolated behind app adapters;
- cookie session refresh via Next.js `proxy.ts`;
- per-request server clients;
- dual EPHEMERAL/DURABLE ProductionStore;
- dual EPHEMERAL/DURABLE ReviewStore;
- generated CanonProposal persistence;
- explicit two-step Review → Canon authority flow;
- transactional Canon RPC contract with optimistic locking;
- RLS-safe database schema candidate;
- append-only database-generated authority audit;
- private-by-default signup;
- no service-role key in Story Lab;
- Creator Authority audit screen.

Independent RC audits: **PASS / 0 errors** in two passes.

Release state:

`BACKEND_LIVE__BUILD_AND_DEPLOY_PENDING`

Supabase durable backend is now live and validated:

- dedicated project `tehkne-storyforge`;
- `ACTIVE_HEALTHY` in `sa-east-1`;
- Security Advisor: **0 findings**;
- unindexed foreign-key findings fixed;
- live RLS / Canon Authority test: **12/12 PASS**;
- all temporary test users/data cleaned: **0 remaining**.

V0.8 remains RC1 at the platform level. The Story Lab V0.3 Narrative Forge layer, however, is now deployed and production-build validated on Vercel.

### Story Workspace V0.3 — Narrative Forge

Current creator workflow:

```text
IDEA
→ CLAIM LEDGER
→ EVENTS
→ SCENES
→ DIALOGUE
→ WEBTOON REALIZATION
→ T-NIR V0.5 EXPORT
```

Implemented:

- literal creator claims preserved with provenance;
- normalized source claims kept as `IDEA`;
- generated expansions kept as `CANDIDATE`;
- scene/beat/dialogue layer separated from fabula;
- Webtoon realization at 40 panels for the eight-scene reference structure;
- panel → scene → event traceability;
- T-NIR V0.5-compatible export;
- PT-BR / EN / ES UI for the new authoring layer;
- production prebuild generality probe using an unrelated story;
- Vercel deployment with the generality gate: **SUCCESS**.

Checkpoint V0.3: `15a428717c1098e2341f2850505e60c4aeffe1da`.

### Story Workspace V0.4 — Scene Authority & Revision

Current source checkpoint on `main`:

`e158104c5ca40dbf14adcf9371bf0730f85ef4f8`

V0.4 adds governed scene authoring above the V0.3 Narrative Forge:

```text
EVENT
→ stable sceneId
→ scene revision r1/r2/r3...
→ select revision
→ approve / edit / reject / regenerate / alternative
→ selected revision set
→ media realization
```

Implemented:

- stable scene IDs with revision ancestry;
- scene lifecycle `CANDIDATE / APPROVED_LOCAL / REJECTED / SUPERSEDED`;
- dialogue authority independent from scene authority;
- editing creates a new revision instead of mutating history;
- isolated scene regeneration and explicit alternatives;
- source claim provenance per scene revision;
- rejected scenes preserve their source events;
- selected revisions compile to Webtoon panels with `sceneRevisionId`;
- selected-revision authority manifest in T-NIR export;
- local V0.4 persistence;
- PT-BR / EN / ES editor coverage;
- static Scene Authority regression gate;
- executable V0.4 prebuild probe stored outside the Next.js TypeScript include set.

Current deployment state:

`MAIN_READY__VERCEL_BUILD_RATE_LIMITED`

The V0.4 source is on `main`, but Vercel is currently rejecting new builds before execution with `build-rate-limit`. Therefore the last **proven green production deployment remains V0.3**. V0.4 must not be reported as deployed until Vercel actually executes both prebuild probes, completes Next.js/TypeScript compilation and returns SUCCESS.

Tracking: Issue #6 — **Story Workspace V0.4 — Scene Authority & Revision**.

## License

License decision pending.
