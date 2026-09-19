# T-PIR V0.1 — Tehkné Production Intermediate Representation

## Why T-PIR exists

Storyforge now separates two fundamentally different kinds of truth.

### T-NIR

**Narrative truth**

Represents:

- canon;
- entities;
- character minds;
- events;
- causality;
- choices;
- branches;
- stories;
- realization intent.

T-NIR remains provider-agnostic and production-tool-agnostic.

### T-PIR

**Production state**

Represents:

- provider selection;
- production jobs;
- generation runs;
- assets;
- voice/audio work;
- image/video work;
- validation;
- creator review;
- exports.

A provider or generated file must never become narrative truth merely because it exists.

## Layered architecture

```text
CREATOR
  ↓
T-NIR V0.5
Narrative Truth
  ↓
RealizationProfile
  ↓
Media Plan
  ↓
Generation Brief
  ↓
T-PIR V0.1
Production Jobs
  ↓
Provider Registry
  ↓
Text / Image / Video / Audio / Game Adapters
  ↓
Generated Artifacts
  ↓
Assertion Gate
  ↓
Canon Proposal Review
  ↓
Approved production output
```

## Authority invariant

```text
T-NIR CANON
≠
T-PIR GENERATED ASSET
```

T-PIR therefore hard-codes:

- providers cannot promote canon;
- generated assets are not canon by default;
- CanonProposal requires creator review;
- narrative canon source remains T-NIR.

## Provider Registry

Reference registry:

`config/providers.example.json`

The first provider descriptor is:

`provider:openai:text`

It is disabled by default and requires:

`OPENAI_API_KEY`

Adapter:

`openai:responses:v0.1`

The adapter uses Responses API Structured Outputs with strict JSON schema and converts model-proposed new facts into CANDIDATE CanonProposals.

## Multimodal production

Contracts now exist for:

- image / character sheet / manga panel / webtoon panel;
- storyboard frames;
- video / animation clips;
- voice;
- music;
- SFX;
- game export.

Character visual requests can include continuity keys and explicit anti-invention constraints.

VoiceProfile can preserve character knowledge boundaries and delivery changes across Events.

## Game export

Reference:

`examples/game/first-light.game.json`

Contains:

- 10 Event nodes;
- 1 Choice;
- StateTransitions;
- WorldRules.

Explicit authority flags:

```text
eventProposalsIncluded = false
canonProposalsIncluded = false
```

Candidate ideas do not leak into the playable canonical graph.

## Story Lab

Application foundation:

`apps/story-lab`

Stack:

- Next.js 16.3.3
- React 19.2
- App Router
- TypeScript strict

Initial routes:

- `/` — ALEF / idea intake + pipeline dashboard;
- `/review` — Creator Authority / Canon Proposal review;
- `/api/health` — product health endpoint.

The review controls are intentionally not connected to canon mutation yet.

## Provider-independent future

T-PIR is intended to support interchangeable:

- text providers;
- image providers;
- video providers;
- TTS / voice providers;
- local/open-source models;
- production software adapters.

Provider metadata must not leak into T-NIR canon.

## Version relationship

Current architecture:

```text
TEHKNÉ STORYFORGE V0.6
├─ T-NIR V0.5  Narrative Core
└─ T-PIR V0.1  Production Core
```

This separation is intentional.
