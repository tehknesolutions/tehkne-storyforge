# T-NIR V0.3 — Choice, State Transition, Branching & Deterministic Media Plans

## Purpose

V0.3 formalizes narrative branching and introduces the first deterministic media compiler.

The goal is to stop treating branches as naming conventions such as `event:009a` and `event:009b`. Branching is now represented explicitly.

## New first-class objects

### Choice

A Choice declares:

- where the choice occurs;
- who makes it;
- the prompt;
- available options;
- optional selected option;
- visibility metadata.

### ChoiceOption

Each option can reference:

- an outcome Event;
- a StateTransition;
- a NarrativeBranch;
- conditions.

### StateTransition

A transition declares:

- what triggers it;
- what target state it modifies;
- deterministic patches.

Supported patch operations:

- SET
- UNSET
- INCREMENT
- DECREMENT
- ADD
- REMOVE

### WorldRule

WorldRule makes universe logic explicit instead of leaving it inside prose.

A rule contains:

- domain;
- description;
- conditions;
- consequences;
- canonical authority;
- provenance.

### NarrativeBranch

A branch declares:

- parent branch;
- fork event;
- source choice option;
- branch-specific events;
- branch status.

Statuses:

- CANON
- POSSIBLE
- ACTIVE
- ABANDONED

## Reference branching model

The Lantern Below now has:

```text
branch:root
  event:001
  ...
  event:008
       |
       v
choice:after-grandmother-mark
       |
       +-- choice-option:descend
       |      -> transition:descend-trust
       |      -> branch:descend
       |      -> event:009a
       |
       +-- choice-option:return
              -> transition:return-defer
              -> branch:return
              -> event:009b
```

## First deterministic compiler

`scripts/compile-reference.mjs` is the first compiler implementation.

It converts the same Story/T-NIR source into deterministic structural media plans for:

- PROSE_SHORT
- MANGA
- WEBTOON
- ANIME_EPISODE
- VISUAL_NOVEL

It does not yet generate polished prose, final artwork or animation.

It produces a **Media Plan** with:

- source universe/version;
- target media;
- media-native units;
- event mapping;
- Traceability Map;
- unmapped-event validation.

## Traceability

Each generated unit preserves its source Event IDs.

Examples:

```text
event:006
→ manga page/panel

event:006
→ webtoon panel

event:006
→ anime shot

event:006
→ visual novel node
```

This creates the first executable form of the Storyforge compiler contract:

```text
T-NIR
+ MediaManifest
→ MediaPlan
+ Traceability Map
+ Validation
```

## Compiled fixtures

Expected deterministic fixtures are versioned under:

`examples/compiled/`

- prose-plan.json
- manga-plan.json
- webtoon-plan.json
- anime-plan.json
- visual-novel-plan.json

Current mapping result:

| Target | Trace Units | Story Events Mapped | Unmapped |
| --- | ---: | ---: | ---: |
| Prose | 4 | 10 | 0 |
| Manga | 10 | 10 | 0 |
| Webtoon | 10 | 10 | 0 |
| Anime | 10 | 10 | 0 |
| Visual Novel | 10 | 10 | 0 |

## Validation evidence

V0.3 audit:

- JSON syntax parse: PASS
- branch semantic audit: PASS
- broken branching references: 0
- Choice objects: 1
- StateTransitions: 2
- WorldRules: 1
- Branches: 3
- story events assigned to branches: 10/10
- deterministic compiler fixtures with unmapped events: 0

### Infrastructure limitation

Full `npm run validate` is not currently confirmed by GitHub Actions.

GitHub-hosted jobs continue to fail before step execution with:

- `runner_id: 0`
- empty runner name
- `steps: []`

An independent container attempt also could not reach GitHub due DNS/network isolation, so it could not clone/install the project.

This does **not** count as a green full CI run.

## Next checkpoint — V0.4

1. evidence-driven Belief revision;
2. automatic Plan replanning;
3. executable Rule evaluation;
4. branch-state reducer;
5. Canon/Timeline validator;
6. formal Traceability Map schema;
7. media-specific validators;
8. first generative compiler layer above deterministic Media Plans.
