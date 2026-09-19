# Story Workspace V0.4 — Scene Authority & Revision

Status: **MAIN_READY__VERCEL_BUILD_RATE_LIMITED**

Product versions remain:

```text
STORYFORGE 0.8.0-rc.1
├─ Story Lab 0.3.0-rc.1
├─ T-NIR 0.5.0
└─ T-PIR 0.1.0
```

V0.4 is the Scene Authority workspace checkpoint layered over Narrative Forge V0.3.

## Objective

Turn generated scenes into governed editorial objects without allowing scene editing to mutate the underlying narrative event or silently change canon.

## Authority model

```text
EVENT
→ SCENE ID
→ REVISION HISTORY
   ├─ r1
   ├─ r2
   └─ r3
→ SELECTED REVISION
→ MEDIA REALIZATION
```

A scene revision may be:

- `CANDIDATE`
- `APPROVED_LOCAL`
- `REJECTED`
- `SUPERSEDED`

Dialogue lines are governed independently:

- `CANDIDATE`
- `APPROVED_LOCAL`
- `REJECTED`

Approving or rejecting a scene does **not** automatically approve or reject its dialogue lines.

## Revision invariants

Every revision preserves:

- stable `sceneId`;
- immutable source `eventId`;
- numeric revision;
- `basedOnRevisionId` ancestry;
- source claim IDs;
- creator/system provenance;
- timestamp and rationale;
- prior revisions.

Creating a new revision supersedes the previously selected revision without deleting it.

## Creator operations

The editor supports:

- select any stored revision;
- approve selected scene revision;
- reject selected scene revision;
- manually edit a scene into a new revision;
- regenerate only one scene;
- create an explicit alternative for one scene;
- approve or reject individual dialogue lines;
- recompile media from selected non-rejected revisions.

No operation mutates the source event.

## Webtoon realization

The V0.4 high-resolution realization path currently targets Webtoon first.

Every generated panel contains:

- `sceneId`;
- `sceneRevisionId`;
- revision number;
- revision status;
- `eventId`;
- panel authority `CANDIDATE`.

A selected rejected scene is excluded from the Webtoon realization, but its source event remains present in T-NIR.

## T-NIR integration

The V0.4 export retains T-NIR version `0.5.0` because the narrative representation itself was not bumped.

The export adds provenance for the selected revision set and a `sceneRevisionAuthority` manifest containing:

- scene ID;
- revision ID;
- revision number;
- status;
- parent revision;
- source claim IDs;
- creator/system author;
- timestamp;
- rationale.

This is an authoring/provenance layer, not a silent change to T-NIR canon semantics.

## Persistence

V0.4 currently persists the local authoring workspace in browser `localStorage`.

This is **not durable multi-device storage** and is not equivalent to the Supabase-backed Creator Authority layer.

Durable Scene Authority persistence remains a later integration step.

## Validation

Static validation checks:

- lifecycle types;
- revision ancestry;
- source claims;
- preservation of superseded revisions;
- scene/dialogue authority independence;
- UI operations;
- V0.4 persistence wiring;
- T-NIR selected-revision export;
- Webtoon revision traceability;
- PT-BR / EN / ES keys.

Production prebuild is configured to run:

```text
tsx scripts/probe-narrative-generality.ts
tsx scripts/probe-scene-authority-v04.ts
```

The Scene Authority probe lives at `apps/story-lab/scripts/probe-scene-authority-v04.ts`, inside the Vercel Root Directory. It is explicitly excluded from the Next.js TypeScript project while still executed by `tsx` during prebuild.

Runtime invariants include:

- eight stable scene IDs;
- scene approval does not auto-approve dialogue;
- scene 2 edit creates r2 while preserving r1/eventId;
- scene 3 regeneration does not touch scene 1 history;
- explicit alternative revision;
- rejection preserves source event;
- dialogue-line action creates a new scene revision;
- rejected scene excluded from media realization;
- every panel traces `sceneRevisionId`;
- seven selected scenes produce 35 Webtoon panels in the reference probe;
- T-NIR keeps eight events while its Story uses seven selected non-rejected scenes.

## Deployment evidence

Last proven green production checkpoint:

**Story Workspace V0.3 — Narrative Forge**

Current V0.4 source checkpoint:

`e158104c5ca40dbf14adcf9371bf0730f85ef4f8`

Current Vercel condition:

`build-rate-limit`

The rate-limit response occurs before the candidate build executes. It must not be interpreted as a compile failure or as a successful V0.4 deployment.

## Completion gate

V0.4 becomes deployed only after all of the following are evidenced:

- V0.3 generality prebuild PASS;
- V0.4 Scene Authority prebuild PASS;
- Next.js compile PASS;
- TypeScript PASS;
- Vercel deployment SUCCESS;
- editor smoke test PASS;
- Issue #6 closed with final checkpoint evidence.
