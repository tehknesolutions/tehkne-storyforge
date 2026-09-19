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

### Story Workspace V0.4 → V0.4.3 — Governed, Interactive Authoring

Current integration checkpoint on `main`:

`781b2dc1cf96989f513a7e41e2853ac11eeb7cdd`

Development no longer depends on Vercel availability. External deployment is a
separate release concern; `main` advances through repository contracts,
structural audits and executable probes prepared in the Story Lab prebuild.

Current integrated flow:

```text
EVENT
→ SCENE AUTHORITY / REVISION
→ SCENE EXPANSION
→ FIELD-LEVEL SEMANTIC AUTHORITY
→ NATIVE VISUAL NOVEL
→ PLAYABLE RUNTIME
→ T-NIR V0.5 EXPORT
```

Integrated capabilities:

- stable scene IDs and revision ancestry;
- scene lifecycle `CANDIDATE / APPROVED_LOCAL / REJECTED / SUPERSEDED`;
- dialogue authority independent from scene authority;
- isolated edit/regeneration/alternative flows;
- source claim provenance per scene revision;
- 8-beat dramatized Scene Expansion grammar;
- Goal / Conflict / Entry / Exit state per expanded scene;
- native Visual Novel Choice / ChoiceOption / StateTransition / Branch data;
- `RealizationProfile.mode = INTERACTIVE` for Visual Novel;
- explicit convergence and branch traversal;
- playable in-browser Visual Novel runtime state machine;
- field-level `IDEA / CANDIDATE / GOVERNANCE` Semantic Assertion Ledger;
- unresolved entity-type review instead of false certainty;
- PT-BR / EN / ES coverage for the integrated authoring layers;
- V0.3, V0.4, V0.4.1, V0.4.2 and V0.4.3 probe chain prepared;
- root static validation gates for Scene Authority, Scene Expansion,
  Semantic Authority and Visual Novel Runtime.

Current engineering state:

`MAIN_INTEGRATED__STATIC_GATES_PASS__INDEPENDENT_EXECUTION_QA_PENDING`

The connected desktop runner is currently offline and no Storyforge Replit app
exists, so independent npm/Next execution remains pending. This is **not** a
blocker for repository development and is not equivalent to a production
deployment claim.

Tracking:

- Issue #6 — Scene Authority & Revision
- Issue #7 — Scene Expansion & Native Visual Novel
- Issue #8 — Semantic Assertion Authority
- Issue #9 — Playable Visual Novel Runtime

## License

License decision pending.
