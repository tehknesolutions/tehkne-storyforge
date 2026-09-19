# Story Workspace Integration Checkpoint — V0.4 to V0.4.3

Status: **MAIN_INTEGRATED__STATIC_GATES_PASS__INDEPENDENT_EXECUTION_QA_PENDING**

Main checkpoint:

`781b2dc1cf96989f513a7e41e2853ac11eeb7cdd`

## Integration policy

Vercel is no longer a development gate.

Storyforge distinguishes:

```text
SOURCE INTEGRATION
≠
INDEPENDENT EXECUTION QA
≠
EXTERNAL DEPLOYMENT
≠
PRODUCTION RELEASE
```

A source checkpoint may be integrated into `main` after a clean fast-forward
and cross-file contract audit. It is not called deployed or production-ready
until the corresponding execution and release evidence exists.

## Integrated layers

### V0.4 — Scene Authority & Revision

- stable scene IDs;
- revision history;
- approve / reject / edit / regenerate / alternative;
- dialogue-line authority independent from scene authority;
- selected revision media projection;
- T-NIR scene revision authority manifest.

### V0.4.1 — Scene Expansion & Native Visual Novel

- 8-beat expanded scene grammar;
- Goal / Conflict / Entry / Exit;
- observable action sequence;
- expanded dialogue exchange;
- native Visual Novel Choice;
- two ChoiceOptions;
- StateTransitions;
- root + possible branches;
- convergence;
- INTERACTIVE realization profile.

### V0.4.2 — Semantic Assertion Authority

- authority evaluated per assertion/field;
- IDEA / CANDIDATE / GOVERNANCE;
- object-level approval does not promote nested fields;
- centralConflict / narrativePromise / genre / tone remain CANDIDATE when
  inferred by the system;
- workflow invariants remain GOVERNANCE;
- ambiguous entity types surface as UNRESOLVED review items.

### V0.4.3 — Playable Visual Novel Runtime

- pure runtime state machine;
- PLAYING / WAITING_CHOICE / FINISHED;
- actual choice stop;
- StateTransition application;
- selected branch traversal;
- convergence;
- final route completion;
- restartable Story Lab player.

## Prepared execution chain

```text
V0.3 generality probe
→ V0.4 Scene Authority probe
→ V0.4.1 Scene Expansion / Visual Novel probe
→ V0.4.2 Semantic Assertion Authority probe
→ V0.4.3 playable Visual Novel runtime probe
→ Next.js build
```

The runtime probes are intentionally excluded from the Next application
TypeScript include set but remain part of Story Lab `prebuild`.

## Current validation evidence

Cross-file integration audit at `781b2dc1`:

**PASS / 0 errors**

Verified structurally:

- all V0.4.1/2/3 contracts are present;
- workspace wiring is complete;
- stale media realizations are invalidated;
- Visual Novel is interactive rather than cosmetic;
- runtime applies transition patches and appends branches;
- Semantic Assertion Ledger protects nested authority;
- PT-BR / EN / ES keys are complete for new surfaces;
- all five prebuild probes are wired;
- all new runtime probes are excluded from app typecheck;
- root validation chain includes every new static validator.

## Execution environment state

- Vercel: explicitly removed as development blocker.
- Remote Desktop runner: currently offline.
- Replit: connected, but no Storyforge app exists.
- Container: outbound GitHub DNS unavailable.

Independent npm / Next execution will be recorded when a runner is available,
without pausing architecture and product development.
