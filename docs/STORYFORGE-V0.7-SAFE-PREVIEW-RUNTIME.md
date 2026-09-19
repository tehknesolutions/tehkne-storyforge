# TEHKNÉ STORYFORGE V0.7 — Safe Preview Runtime

## Status

**Audit A — Authority & Provider Safety: PASS / 0 errors**

**Audit B — App Isolation & Deploy Readiness: PASS / 0 errors**

Storyforge V0.7 turns the V0.6 production foundation into a preview runtime that can be opened and interacted with safely before durable persistence and final canon mutation are enabled.

## Version architecture

```text
STORYFORGE V0.7
├─ Story Lab V0.2
├─ T-NIR V0.5
└─ T-PIR V0.1
```

## Provider execution safety

The OpenAI text adapter is now:

`openai:responses:v0.2`

It uses:

- Responses API;
- strict JSON Schema Structured Outputs;
- schema-safe `contentJson` / `objectJson` fields;
- `store: false`;
- CANDIDATE-only CanonProposals.

Provider execution requires **all three** gates:

```text
OPENAI_API_KEY
+
STORYFORGE_GENERATION_ENABLED=true
+
STORYFORGE_GENERATION_ACCESS_TOKEN
```

An API key alone does not enable generation.

## Server-authorized reference generation

Route:

`POST /api/generate/reference`

The server owns the reference CANON and generation unit.

The browser does not decide which facts are authoritative.

Generated assertions are classified server-side.

If the model emits an unsupported assertion but fails to emit a CanonProposal, Storyforge creates the missing CANDIDATE proposal itself.

Canon mutation remains:

`false`

## Provider console

Route:

`/generate`

The UI exposes:

- configured / locked provider state;
- model;
- authority;
- response-storage policy;
- creator execution token input;
- structured output from the reference run.

The execution token is not persisted by Story Lab.

## ProductionJob preview runtime

Routes:

- `GET /api/production/jobs`
- `POST /api/production/jobs`
- `GET /api/production/jobs/[id]`
- `PATCH /api/production/jobs/[id]`

Current storage adapter:

`MemoryProductionStore`

Durability:

`EPHEMERAL`

Every jobs response reports whether the store is production-safe.

Current preview returns:

```text
productionSafe = false
```

The app therefore never pretends that serverless memory is a durable database.

## Production dashboard

Route:

`/production`

Supports:

- reading current preview jobs;
- queueing a Manga reference job;
- displaying durability warnings.

## Safe Canon Review

Route:

`/review`

API:

`/api/review/[id]`

Allowed review-state decisions:

- APPROVE
- EDIT
- REJECT

Mutation scope:

`REVIEW_STATE_ONLY`

Even APPROVE returns:

`EXPLICIT_CANON_COMMIT_NOT_IMPLEMENTED`

Therefore:

```text
APPROVED REVIEW
≠
CANON COMMIT
```

## Playable game probe

Route:

`/game`

The reference Choice is executable in the browser:

- Descend together
- Seal the passage and return

The UI exposes the corresponding StateTransition result.

Candidate Events and CanonProposals are not part of the playable graph.

## Provider selection

Core module:

`src/generation/provider-selection.ts`

Reasons for rejection are explicit:

- PROVIDER_DISABLED
- MEDIA_NOT_SUPPORTED
- MISSING_ENV

This establishes provider capability negotiation and fallback without binding T-NIR to any vendor.

## Vercel deploy readiness

Story Lab is self-contained inside:

`apps/story-lab`

It no longer imports TypeScript source from outside its intended Vercel Root Directory.

Files:

- `apps/story-lab/vercel.json`
- `apps/story-lab/.env.example`
- `docs/STORY-LAB-VERCEL-IMPORT.md`

Recommended Vercel setting:

```text
Root Directory = apps/story-lab
```

## Deployment limitation in this session

The connected Vercel account was successfully inspected.

No Storyforge project currently exists.

The connector advertised a deploy action, but the server returned:

```text
Tool deploy_to_vercel not found
```

Therefore no deployment URL is claimed.

A separate issue tracks project import / preview creation.

## Validation

Gate:

`scripts/validate-v0.7.mjs`

It checks:

- version separation;
- provider disabled-by-default;
- explicit generation enable gate;
- creator execution token gate;
- Responses API no-store policy;
- strict Structured Outputs;
- server CanonProposal fallback;
- no direct CANON authority from provider;
- review-state-only mutation;
- no Canon commit on review approval;
- EPHEMERAL storage disclosure;
- ProductionJob state validation;
- Story Lab Root Directory isolation;
- game branch probe;
- Vercel configuration and env defaults.

## Independent audit A

```text
PASS / 0 errors
```

Evidence:

- Storyforge 0.7.0
- Story Lab 0.2.0
- T-NIR 0.5.0
- adapter openai:responses:v0.2
- provider enabled by default: false
- authority: CANDIDATE_ONLY
- ProductionStore: EPHEMERAL
- canonMutationEnabled: false

## Independent audit B

```text
PASS / 0 errors
```

Evidence:

- app Root Directory: apps/story-lab
- validator present
- app self-contained
- generation / production / game / review routes present
- Vercel config present

## Next — V0.8

Recommended scope:

1. durable ProductionStore adapter;
2. user/session authentication;
3. audit log for Creator Authority decisions;
4. explicit transactional Canon commit workflow;
5. execute first authenticated provider run;
6. image provider adapter;
7. TTS/audio provider adapter;
8. richer media production jobs;
9. import/deploy Story Lab on Vercel;
10. browser QA on preview URL.
