# T-NIR V0.2 — Character Cognition & Agency

## Checkpoint

T-NIR V0.2 makes character cognition and agency explicit, structured and machine-validatable.

A character is no longer only an entity with descriptive traits. It can now carry:

- beliefs;
- knowledge;
- goals;
- intentions;
- plans;
- secrets;
- current state.

Events can modify knowledge and goals directly.

## Core rule

> Canon describes what is true. Character cognition describes what an agent believes or knows.

These layers must remain separate.

A false belief is valid character state without becoming canonical truth.

## Character model

```text
CHARACTER
├─ Identity
├─ Traits / Values
├─ Beliefs
├─ Knowledge
├─ Goals
├─ Intentions
├─ Plans
│  └─ Plan Steps
├─ Secrets
└─ Current State
```

## Belief

Belief stores an agent-held proposition plus:

- confidence;
- relation to canonical truth;
- acquisition / revision events;
- lifecycle status.

Truth relations:

- TRUE
- FALSE
- UNKNOWN
- PARTIAL

## Knowledge

Knowledge is distinct from belief.

A KnowledgeItem includes:

- holder;
- proposition;
- certainty;
- state: KNOWN / SUSPECTED / FORGOTTEN;
- acquisition event;
- optional source entity.

This enables the engine to answer:

> Does this character know this at this point in the event graph?

## Goal

A Goal describes a desired world or character state.

It includes priority and lifecycle:

- ACTIVE
- BLOCKED
- ACHIEVED
- ABANDONED
- FAILED

## Intention

An intention is an action commitment connected, when appropriate, to a goal.

This separates:

```text
DESIRE
→ GOAL
→ INTENTION
→ PLAN
→ ACTION
→ EVENT
→ CONSEQUENCE
```

## Plan

A Plan belongs to a character and a Goal.

Plans contain explicit ordered or prerequisite-linked PlanSteps.

A plan can therefore fail, block, change or complete without changing the underlying goal automatically.

## Secret

Secrets explicitly model information asymmetry:

- what the proposition is;
- what entities it concerns;
- who knows it;
- who it is hidden from;
- reveal state;
- reveal event when applicable.

## Character State

Current character state can track:

- current event;
- location;
- physical state;
- emotional state;
- social state;
- resources;
- flags.

It is a snapshot. Long-term truth should remain derivable from canon and events whenever possible.

## Event cognition effects

Events now support:

### Knowledge effects

- LEARN
- SUSPECT
- FORGET
- REVISE_BELIEF

### Goal effects

- CREATE
- BLOCK
- ACHIEVE
- FAIL
- ABANDON
- REACTIVATE

This establishes the first executable bridge between Event Graph and Character Mind.

## Semantic validation

JSON Schema validates structure.

`scripts/validate-semantics.mjs` validates cross-object integrity, including:

- dangling entity references;
- dangling event references;
- invalid causal links;
- story → event integrity;
- media manifest → story integrity;
- belief / knowledge holder ownership;
- plan → goal ownership;
- plan current step validity;
- intention → goal validity;
- secret visibility references;
- event knowledge / goal effects.

## Reference universe V0.2

`examples/micro-universe.json` now contains:

- 3 characters;
- 2 locations;
- 1 key object;
- 2 explicitly false beliefs;
- 1 hidden canonical secret;
- 3 character goals;
- executable plans;
- 10 events;
- 10 causal links;
- 2 alternate outcomes;
- 5 media manifests.

Media targets:

- Short Prose
- Manga
- Webtoon
- Anime Episode
- Visual Novel

## Validation evidence

Current checkpoint:

- TypeScript strict compile: PASS
- JSON parse: PASS
- semantic reference audit: PASS
- semantic reference errors: 0
- GitHub Actions runner: BLOCKED BEFORE STEPS

The GitHub Actions failure is tracked separately because the jobs return `runner_id: 0` and `steps: []`, meaning repository code is not being executed by the runner.

## Next

T-NIR V0.3 should add:

1. Choice as a first-class object;
2. StateTransition;
3. executable WorldRule;
4. branch / timeline identity;
5. belief revision driven by evidence;
6. plan replanning;
7. canonical traceability map;
8. first deterministic media compiler.
