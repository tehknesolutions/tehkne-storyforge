# T-NIR V0.4 — Narrative Runtime, Evidence & Canon-Safe Generation

## Status

**Checkpoint: PASSED by independent repository audit**

T-NIR V0.4 advances Storyforge from a structural transmedia model into a deterministic narrative runtime.

The runtime can now process:

```text
EVENT
→ EVIDENCE
→ BELIEF REVISION
→ REPLANNING
→ RULE EVALUATION
→ CHOICE
→ STATE TRANSITION
→ BRANCH STATE
→ MEDIA PLAN
→ GENERATION BRIEF
```

## Evidence-driven cognition

New objects:

- `Evidence`
- `BeliefRevision`

Evidence explicitly declares:

- discovery Event;
- proposition;
- source entities;
- strength;
- affected beliefs.

A BeliefRevision records:

- previous confidence;
- new confidence;
- truth relation;
- status;
- rationale.

Reference result:

- Lia belief: `0.78 → 0.20`
- Leo belief: `0.67 → 0.25`
- both become `REVISED`

## Deterministic replanning

Plans now have:

- revision number;
- belief dependencies;
- optional superseded plan.

`ReplanRule` connects changed beliefs to a plan transition.

Reference runtime:

```text
plan:lia-investigate
→ ABANDONED

plan:lia-follow-grandmother-clue
→ ACTIVE
```

and:

```text
plan:leo-control-risk
→ ABANDONED

plan:leo-protect-and-verify
→ ACTIVE
```

## Executable World Rules

WorldRule is no longer just prose.

Conditions currently support:

- `EVENT_OCCURRED`
- `FACT_EQUALS`
- `STATE_EQUALS`

Effects currently support:

- `ALLOW_EVENT`
- `DENY_EVENT`
- `SET_STATE`

Reference rule:

```text
event:002 occurred
AND
event:004 occurred
→ ALLOW event:006
```

## Branch-state reducer

`scripts/run-reference-runtime.mjs` executes a selected choice option and produces a deterministic runtime snapshot.

### Descend branch

- occurred events: 9
- belief revisions: 2
- replans: 2
- sibling relationship intensity: `0.9 → 1.0`

### Return branch

- occurred events: 9
- belief revisions: 2
- replans: 2
- `worldState.mysteryDeferred = true`

Snapshots are versioned under:

- `examples/runtime/descend.json`
- `examples/runtime/return.json`

## Canon / Timeline validation

Every reference Event now has:

- numeric `time.sequence`;
- explicit `branchId`.

The validator checks:

- required temporal sequence;
- branch existence;
- causal direction;
- branch ordering;
- timeless CANON contradictions;
- knowledge acquisition vs character snapshot.

Current audit: **PASS**.

## Formal traceability

`schemas/media-artifact-v0.1.schema.json` formalizes the compiler artifact contract.

A media unit can trace back to:

- Event IDs;
- Scene ID;
- CanonFact IDs;
- Choice IDs;
- Rule IDs;
- Evidence IDs.

Reference Manga trace proves:

- `event:008` carries Choice + Evidence trace;
- `event:006` carries WorldRule trace.

## Media-specific validators

Current validators cover:

### Prose
- sections exist;
- event trace preserved.

### Manga
- right-to-left;
- pages/panels present;
- event trace preserved.

### Webtoon
- vertical-scroll mode;
- panels present;
- event trace preserved.

### Anime
- storyboard-plan kind;
- shot durations sum to target duration.

### Visual Novel
- choice exists;
- choice outcomes point to existing event nodes.

## Generation Brief Compiler

`scripts/build-generation-brief.mjs` creates a model-agnostic generation package above the deterministic Media Plan.

It includes:

- Story DNA;
- creator intent;
- authoritative CANON facts;
- media units;
- source Events;
- Choice / Rule / Evidence trace;
- authority contract.

The authority contract explicitly states:

```text
mayInventCanon = false
newUnapprovedFactsBecome = CANDIDATE
preserveEventCausality = true
preserveCharacterKnowledgeBoundaries = true
preserveTraceability = true
```

Reference fixture:

`examples/generation/manga-brief.json`

Current fixture:

- 10 generation units;
- 2 authoritative CANON facts;
- 1 Choice-traced unit;
- 1 Evidence-traced unit;
- 3 Rule-traced units.

## Independent V0.4 audit

Result:

```text
PASS
errors = 0
```

Evidence:

- Universe version: 0.4.0
- Events: 10
- CausalLinks: 10
- Evidence: 1
- BeliefRevisions: 2
- ReplanRules: 2
- Branches: 3
- Prose: 10/10 events mapped
- Manga: 10/10
- Webtoon: 10/10
- Anime Episode: 10/10
- Visual Novel: 10/10
- Unmapped events: 0
- Generation Brief mayInventCanon: false

## CI limitation

GitHub Actions remains an external infrastructure blocker.

Observed job state:

- `runner_id: 0`
- `runner_name: ""`
- `steps: []`

Job log retrieval returns `BlobNotFound`, consistent with no executable runner/log being created.

Automatic triggers remain paused and the issue is tracked separately in Issue #2.

## Next — V0.5

Recommended scope:

1. Rule engine expression language;
2. character decision scoring;
3. plan generation / repair;
4. runtime event execution from actions;
5. Canon proposal workflow;
6. model adapter interface;
7. first actual prose realization from Generation Brief;
8. Manga panel-script realization;
9. Anime shot-direction realization;
10. media output → Canon conflict detector.
