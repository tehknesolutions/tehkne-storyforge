# TEHKNÉ STORYFORGE V0.6 — Production Foundation

## Status

**Independent audit A: PASS / 0 errors**

**Independent audit B: PASS / 0 errors**

Storyforge V0.6 establishes the production layer above the stable narrative core.

## Version architecture

```text
TEHKNÉ STORYFORGE V0.6
├─ T-NIR V0.5
│  └─ Narrative truth, cognition, causality, branches and realization intent
└─ T-PIR V0.1
   └─ Providers, jobs, assets, runs, review and exports
```

The separation is intentional.

Provider configuration, generated files, API metadata and production status do not belong in narrative canon.

## Provider Registry

Implemented:

`src/generation/provider-registry.ts`

Reference config:

`config/providers.example.json`

The first provider descriptor is:

`provider:openai:text`

Default state:

```text
enabled = false
requires OPENAI_API_KEY
authority = CANDIDATE_ONLY
```

A provider must be configured explicitly before use.

## First real text provider adapter

Implemented:

`src/generation/adapters/openai-responses.ts`

It uses the OpenAI Responses API and requests strict Structured Outputs via JSON Schema.

The provider receives:

- target media;
- authority contract;
- canonical facts;
- style data;
- generation units.

It returns:

- structured media output;
- generated assertions;
- CanonProposals;
- traceability.

New facts are emitted as:

`authority = CANDIDATE`

The adapter has no path that directly emits `CANON`.

## Assertion Gate

Reusable library:

`src/generation/assertion-gate.ts`

Classifications:

- `CANON_RESTATEMENT`
- `UNSUPPORTED_NEW_FACT`
- `CANON_CONTRADICTION`

Unsupported assertions can be transformed into CanonProposals.

## Canon Review contract

Implemented:

`src/review/canon-review.ts`

A CanonReviewBatch hard-codes:

`automaticPromotionAllowed = false`

New review items begin in:

`PENDING`

Supported creator decisions:

- APPROVE
- EDIT
- REJECT

The actual mutation path is intentionally not wired into the Story Lab yet.

## Multimodal Asset contracts

Implemented:

`src/production/assets.ts`

Asset kinds include:

- Image
- Character Sheet
- Manga Panel
- Webtoon Panel
- Storyboard Frame
- Environment
- Sprite
- Voice
- Music
- SFX
- Video Clip
- Animation Clip

Generated AssetArtifact uses:

`canonStatus = NON_CANON_ASSET`

Visual continuity can be constrained through:

- entity/Event/Scene trace;
- continuity keys;
- approved asset IDs;
- immutable traits;
- explicit forbidden changes.

Reference fixture:

`examples/assets/lia-character-sheet-request.json`

The fixture explicitly prohibits adding unapproved powers, scars, uniforms or lineage symbols.

## Voice & audio

Implemented:

`src/production/audio.ts`

Includes:

- VoiceProfile
- SpeechRequest
- AudioCue

Reference VoiceProfile:

`examples/audio/lia-voice-profile.json`

It includes knowledge-boundary rules such as not making Lia sound omniscient before the relevant evidence exists.

## Multimodal provider contracts

Implemented:

`src/production/media-adapter.ts`

Interfaces:

- AssetProviderAdapter
- SpeechProviderAdapter

Text, image and speech providers therefore remain replaceable adapters.

## T-PIR V0.1

Implemented:

`src/production/tpir.ts`

Core objects:

- ProductionSource
- ProductionJob
- ProductionRun
- ProductionManifest

Authority invariants:

```text
narrativeCanonSource = T-NIR
providersCanPromoteCanon = false
generatedAssetsAreCanonByDefault = false
creatorReviewRequiredForCanonProposal = true
```

## Game export

Executable exporter:

`scripts/export-game-reference.mjs`

Reference artifact:

`examples/game/first-light.game.json`

Contains:

- 10 Event nodes;
- 1 Choice;
- 2 StateTransitions;
- WorldRules.

Authority boundary:

```text
eventProposalsIncluded = false
canonProposalsIncluded = false
```

Candidate narrative ideas do not leak into the playable graph.

## Story Lab foundation

Application:

`apps/story-lab`

Stack:

- Next.js 16.3.3
- React 19.2
- TypeScript strict
- App Router

Current routes:

### /

Story Lab dashboard with:

- TEHKNÉ STORYFORGE identity;
- ALEF / Intention;
- “What do you imagine?” input;
- Candidate preview;
- 8-stage pipeline;
- media compiler targets;
- Creator Authority state.

### /review

Canon Proposal review foundation.

It shows:

- CANDIDATE status;
- subject / predicate / object;
- rationale;
- existing CANON;
- Reject / Edit / Approve candidate controls.

Controls are intentionally not wired to mutate canon yet.

### /api/health

Returns:

```text
storyforge = 0.6.0
tnir = 0.5.0
tpir = 0.1.0
automaticCanonPromotion = false
```

## Provider structured-output fixture

`examples/providers/openai-structured-output.json`

Reference output contains:

- 1 CANON_RESTATEMENT;
- 1 UNSUPPORTED_NEW_FACT;
- 1 CanonProposal.

## Creator review fixture

`examples/review/canon-review-batch.json`

Guarantees:

- current universe version;
- PENDING review;
- CANDIDATE authority;
- automatic promotion disabled.

## V0.6 validation

Gate:

`scripts/validate-v0.6.mjs`

Validates:

- T-NIR stays free of provider/production metadata;
- providers disabled by default;
- environment-key requirements;
- OpenAI adapter uses Responses + strict JSON schema;
- adapter never emits CANON directly;
- asset anti-invention constraints;
- voice knowledge-boundary continuity;
- game export excludes candidates;
- review batch is creator-gated;
- Story Lab versions and routes;
- T-PIR authority invariants.

## Independent audit results

### Audit A — Production authority

```text
PASS / 0 errors
```

Evidence:

- T-NIR narrative core: 0.5.0
- providers: 1
- OpenAI enabled by default: false
- provider authority: CANDIDATE_ONLY
- game nodes: 10
- game choices: 1
- automatic canon promotion: false
- Story Lab Next.js: 16.3.3

### Audit B — Multimodal + Story Lab

Initial audit found one test-location mismatch: the ALEF phrase lives in the IdeaIntake component, not page.tsx.

The audit was corrected to inspect the real component.

Final result:

```text
PASS / 0 errors
```

Evidence:

- Character Sheet continuity key: entity:lia
- VoiceProfile: voice-profile:lia
- Story Lab routes: /, /review, /api/health
- Storyforge: 0.6.0
- T-NIR: 0.5.0
- T-PIR: 0.1.0
- provider canon promotion: false
- generated assets canonical by default: false

## Next — Storyforge V0.7

Recommended scope:

1. execute provider adapter with authenticated environment;
2. provider capability negotiation and fallback;
3. automatic assertion extraction from actual model output;
4. connect Canon Review UI to a safe proposal-state store;
5. production job queue;
6. richer Manga page composition;
7. richer Webtoon scroll pacing;
8. richer Anime shot/sequence grammar;
9. image provider adapter;
10. TTS/audio provider adapter;
11. runnable game prototype from game export;
12. deploy Story Lab preview.
