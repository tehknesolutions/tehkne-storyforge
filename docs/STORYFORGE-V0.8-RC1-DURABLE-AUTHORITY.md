# TEHKNÉ STORYFORGE V0.8 RC1 — Durable Creator Authority

## Status

**Code/Application Audit: PASS / 0 errors**

**Database/RLS Contract Audit: PASS / 0 errors**

Release state:

`BACKEND_LIVE__BUILD_AND_DEPLOY_PENDING`

The dedicated Supabase backend is now provisioned and live. This is still an RC because executable build evidence and Vercel preview QA remain pending.

## Version architecture

```text
STORYFORGE 0.8.0-rc.1
├─ Story Lab 0.3.0-rc.1
├─ T-NIR 0.5.0
└─ T-PIR 0.1.0
```

## Durable backend design

Story Lab now supports two runtime modes.

### Preview

```text
Supabase not configured
→ MemoryProductionStore
→ MemoryReviewStore
→ EPHEMERAL
→ Canon commit disabled
```

### Durable

```text
Supabase configured
→ authenticated cookie session
→ RLS
→ SupabaseProductionStore
→ SupabaseReviewStore
→ explicit transactional Canon commit
```

## Supabase SSR

Pinned dependencies:

```text
@supabase/ssr         0.12.7
@supabase/supabase-js 2.116.0
```

Story Lab contains isolated client utilities:

- browser client;
- per-request server client;
- Next.js `proxy.ts` session refresh;
- authenticated server context.

No service-role key is part of the Story Lab environment contract.

## Authentication

Added:

- `/login`
- `/api/auth/sign-in`
- `/api/auth/sign-up`
- `/api/auth/sign-out`
- `/api/auth/status`

Signup defaults to:

`STORYFORGE_SIGNUP_ENABLED=false`

Sign-out is local-session scoped.

## Durable ProductionJobs

`ProductionStore` now auto-selects:

- Memory → EPHEMERAL
- Supabase → DURABLE

The durable implementation operates through the authenticated user and RLS.

No service/admin client is used.

## Durable CanonProposal review

`ReviewStore` now has:

- MemoryReviewStore
- SupabaseReviewStore

Generated CanonProposals are persisted into the durable review queue when Supabase is configured.

If durable proposal persistence fails, provider generation returns:

`CANON_PROPOSAL_PERSISTENCE_FAILED`

instead of silently discarding the review obligation.

## Review versus Canon

Storyforge V0.8 RC1 makes two distinct authority operations visible.

### 1. Approve review

```text
CANDIDATE
→ APPROVED
```

This is editorial review only.

### 2. Commit to Canon

Requires the creator to type:

`COMMIT TO CANON`

Request includes:

- review ID;
- expected updated_at;
- explicit confirmation.

The API then invokes:

`storyforge_commit_canon_proposal`

## Transactional Canon commit

The database contract:

1. authenticates with `auth.uid()`;
2. locks the review row `FOR UPDATE`;
3. checks ownership;
4. requires `APPROVED + APPROVE`;
5. checks optimistic lock `expected_updated_at`;
6. requires proposal authority `CANDIDATE`;
7. inserts one `CANON` fact;
8. marks review `COMMITTED`;
9. writes audit history through triggers.

The exposed RPC is `SECURITY INVOKER`.

The privileged implementation lives in the non-exposed `storyforge_private` schema.

## RLS model

RLS is enabled on:

- storyforge_production_jobs;
- storyforge_review_items;
- storyforge_canon_facts;
- storyforge_authority_audit.

Authenticated users may directly mutate only:

- their own ProductionJobs;
- their own non-COMMITTED ReviewItems.

Direct INSERT is **not granted** for:

- Canon facts;
- authority audit.

## Audit log

New route:

`/authority-audit`

API:

`/api/authority-audit`

Database triggers append:

- REVIEW_DECISION;
- CANON_COMMIT.

Audit entries include the authenticated user and JWT session_id when present.

The application has SELECT-only access to this log.

## Provider → review durability

Authenticated durable generation now follows:

```text
Provider
→ assertions
→ assertion gate
→ deduplicated CANDIDATE proposals
→ durable review queue
```

Authentication occurs before the paid provider request when Supabase durable mode is enabled.

## Database schema candidate

Reviewed SQL:

`docs/database/STORYFORGE-SUPABASE-SCHEMA-V0.8.sql`

It is intentionally **not yet a Supabase migration-history file**.

The real migration must be created after the dedicated Storyforge Supabase project exists.

## Audits

### Audit A — Application / Authority

**PASS / 0 errors**

Evidence:

- Storyforge 0.8.0-rc.1
- Story Lab 0.3.0-rc.1
- per-request Supabase server client
- getClaims proxy validation
- getUser sensitive-route validation
- durable ProductionStore
- durable ReviewStore
- explicit Canon commit
- audit log
- signup disabled by default
- no service-role key

### Audit B — Database / RLS

**PASS / 0 errors**

Evidence:

- 4 RLS-enabled tables
- no direct Canon INSERT grant
- no direct audit INSERT grant
- review lifecycle consistency checks
- COMMITTED review immutability
- private SECURITY DEFINER commit implementation
- public SECURITY INVOKER wrapper
- row lock
- optimistic locking
- review + Canon audit triggers

## Live Supabase validation

Dedicated project:

`tehkne-storyforge` / `zbqhxlmalzijnmkljcbt`

Region:

`sa-east-1`

Applied migrations:

- `20260919180048_storyforge_v0_8_durable_authority`
- `20260919180123_storyforge_v0_8_fk_indexes`

Security Advisor: **0 findings**.

Live RLS / Canon Authority test: **12/12 PASS**.

Cleanup after tests: **0 test users/jobs/reviews/canon/audit remaining**.

Detailed evidence:

`docs/STORYFORGE-V0.8-SUPABASE-LIVE-VALIDATION.md`

## External blockers before V0.8 final

1. package lock not generated;
2. real `npm install / typecheck / build` not executed;
3. Vercel preview still not created;
4. desktop/mobile browser QA still pending.

## Finalization criteria

V0.8 final requires all eight blockers above to be resolved.

After that the next product milestone is:

**V0.9 — Real Multimodal Production**
