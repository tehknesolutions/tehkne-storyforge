# T-NIR V0.5 — Decision, Resolution & Media Realization

## Status

**Checkpoint: PASS / 0 errors in two independent repository audits**

V0.5 moves Storyforge from deterministic narrative runtime into governed media realization.

The full reference flow is now:

```text
CANON
→ CHARACTER STATE
→ ACTION PROPOSALS
→ DECISION SCORING
→ EVENT PROPOSAL
→ CREATOR-GATED CANON PROPOSAL
→ NARRATIVE RESOLUTION
→ MEDIA PLAN
→ GENERATION BRIEF
→ REALIZED MEDIA
→ CANON CONFLICT CHECK
```

## Decision scoring

Storyforge now separates an available action from a selected narrative direction.

Reference policy:

- goal alignment: +0.30
- belief support: +0.15
- value alignment: +0.15
- feasibility: +0.15
- risk: -0.15
- relationship impact: +0.05
- dramatic pressure: +0.05

Reference ranking:

### Lia

1. `action-proposal:lia-trace-mark` — **0.6595**
2. `action-proposal:lia-return` — **0.4145**

### Leo

1. `action-proposal:leo-follow` — **0.6530**
2. `action-proposal:leo-return` — **0.5875**

Decision scoring is descriptive/runtime logic. It does not promote anything to CANON.

## Action → Event Proposal

The highest-level action can become an `EventProposal`.

Reference:

```text
action-proposal:lia-trace-mark
→ event-proposal:trace-grandmother-mark
→ proposed event:candidate:010a
```

The event remains:

```text
authority = CANDIDATE
canonStatus = CANDIDATE
```

It is not inserted into the canonical Event Graph.

## Event simulation

`scripts/simulate-event-proposal.mjs` can simulate a candidate Event against a Branch.

Reference fixture:

`examples/proposals/event-simulation.json`

Guarantees:

- `persisted = false`
- `canonChanged = false`
- `creatorDecisionRequired = true`

This allows exploratory narrative simulation without contaminating canon.

## Canon Proposal workflow

A generated or inferred fact must travel through `CanonProposal`.

Reference candidate:

```text
Memory Lantern
→ wasCreatedBy
→ Grandmother
```

Existing CANON only proves:

```text
Memory Lantern
→ wasHiddenBy
→ Grandmother
```

Therefore authorship remains a new unsupported proposition.

Reference review:

```text
status = READY_FOR_CREATOR_REVIEW
automaticPromotionAllowed = false
creatorDecisionRequired = true
```

## Rule Expression Language

WorldRule now supports recursive expressions:

- `ATOM`
- `ALL`
- `ANY`
- `NOT`

Reference rule:

```text
ALL(
  EVENT_OCCURRED(event:002),
  EVENT_OCCURRED(event:004)
)
→ ALLOW_EVENT(event:006)
```

This creates composable narrative/world logic without arbitrary executable code inside canon.

## Narrative Resolution

V0.5 distinguishes possibility space from realized work.

### Interactive media

Can preserve multiple branches.

Example:

`VISUAL_NOVEL`

### Linear media

Must resolve to a selected branch before realization.

Reference linear branch:

`branch:descend`

Used by:

- Prose
- Manga
- Webtoon
- Anime Episode

The alternative `event:009b` is excluded from those realized artifacts.

## Model Adapter contract

`src/generation/model-adapter.ts` defines a provider-independent interface.

A model request receives:

- target media;
- authorized canonical facts;
- generation units;
- style metadata;
- authority contract;
- traceability sources.

A response can return:

- media output;
- generated assertions;
- CanonProposals;
- traceability.

This allows future OpenAI, local/open-source, image, video or other provider adapters without changing the core T-NIR authority model.

## First realized media outputs

### Prose

Files:

- `examples/realized/prose-descend.json`
- `examples/realized/prose-descend.md`

The prose is no longer only a plan: it is readable realized narrative text.

### Manga

File:

`examples/realized/manga-descend.json`

Native properties:

- RIGHT_TO_LEFT
- 9 pages
- panel script
- framing
- dialogue
- SFX
- source Event trace

### Webtoon

File:

`examples/realized/webtoon-descend.json`

Native properties:

- VERTICAL_SCROLL
- 9 panels
- scroll roles
- long reveal gaps
- episode hook
- source Event trace

Webtoon is not generated as a rotated Manga layout.

### Anime

File:

`examples/realized/anime-descend.json`

Native properties:

- 9 shots
- 90 seconds total
- framing
- camera movement
- action
- dialogue
- audio cues
- source Event trace

## Output → Canon Conflict Detector

`scripts/check-canon-conflicts.mjs` compares generated assertions against authoritative CANON.

Possible classifications:

- `CANON_RESTATEMENT`
- `UNSUPPORTED_NEW_FACT`
- `CANON_CONTRADICTION`

Reference tests:

```text
lantern.wasHiddenBy = grandmother
→ CANON_RESTATEMENT

lantern.wasCreatedBy = grandmother
→ UNSUPPORTED_NEW_FACT

lantern.wasHiddenBy = father
→ CANON_CONTRADICTION
```

This is the first explicit gate between generative output and canonical truth.

## V0.5 validation gate

`scripts/validate-v0.5.mjs` checks:

- universe version;
- deterministic decision scores;
- action ranking;
- EventProposal authority;
- CanonProposal authority;
- linear vs interactive RealizationProfile;
- branch leakage;
- stale artifacts;
- Manga grammar;
- Webtoon vertical grammar;
- Anime duration;
- Prose core clue;
- runtime snapshots;
- RuleExpression;
- Generation Brief authority contract;
- unsupported fact detection;
- direct contradiction detection.

## Independent audits

### Audit A — Runtime / Realization

**PASS / 0 errors**

Evidence:

- Universe 0.5.0
- 4 ActionProposals
- 4 DecisionScores
- 1 EventProposal
- 1 CanonProposal
- 5 RealizationProfiles
- realized Prose / Manga / Webtoon / Anime
- both runtime branches coherent

### Audit B — Compiler / Canon

**PASS / 0 errors**

Media Plans:

- Prose: 10/10 source Events
- Manga: 10/10
- Webtoon: 10/10
- Anime: 10/10
- Visual Novel: 10/10
- unmapped: 0

Assertion test:

- 2 CANON_RESTATEMENT
- 1 UNSUPPORTED_NEW_FACT
- explicit CANON_CONTRADICTION detected

## GitHub Actions

Issue #2 remains external infrastructure.

The V0.5 gate exists locally/in-repo, but a full hosted `npm run validate` still cannot be truthfully marked green until GitHub provisions an executable runner.

## Next — V0.6

Recommended scope:

1. real provider adapters;
2. adapter capability registry;
3. structured-output generation;
4. automatic assertion extraction from model output;
5. Canon Proposal review UI contract;
6. Webtoon/Manga/Anime richer layout grammars;
7. image-generation asset contract;
8. voice/audio adapter contract;
9. game compiler runtime export;
10. Story Lab web application foundation.
