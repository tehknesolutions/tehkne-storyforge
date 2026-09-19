# Storyforge V0.8 — Supabase Durable Authority Architecture

## Status

Schema candidate prepared. No Supabase project has been provisioned for Storyforge yet.

This document intentionally separates **code readiness** from **database deployment**.

## Why Supabase

Storyforge needs four capabilities that should share one identity boundary:

- durable ProductionJobs;
- authenticated Creator Authority review;
- append-only authority audit;
- transactional Canon commit.

Supabase provides Postgres + Auth + RLS while allowing the application to use a publishable key and user session instead of a privileged service key for normal operations.

## Current dependency pins

```text
@supabase/supabase-js = 2.116.0
@supabase/ssr         = 0.12.7
```

They are isolated behind `apps/story-lab/lib/supabase/*`.

## Auth model

Browser/SSR:

```text
Supabase Auth
→ PKCE/cookie session
→ Next.js proxy.ts refresh
→ per-request server client
→ RLS
```

The server client is never stored in module/global scope.

Sensitive routes require authenticated context when Supabase is configured.

## Database model

Public/RLS tables:

- `storyforge_production_jobs`
- `storyforge_review_items`
- `storyforge_canon_facts`
- `storyforge_authority_audit`

Private schema:

- trigger helpers;
- transactional Canon commit implementation.

## Data API boundary

The schema explicitly uses `GRANT` rather than assuming that new public tables are automatically exposed.

All exposed tables have RLS enabled.

## Direct permissions

### Production Jobs

Authenticated owners may SELECT / INSERT / UPDATE / DELETE only their own rows.

### Review Items

Authenticated owners may SELECT / INSERT / UPDATE only their own rows.

Normal user updates are forbidden from writing:

`status = COMMITTED`

### Canon Facts

Authenticated owners receive SELECT only.

There is **no direct INSERT grant**.

### Authority Audit

Authenticated owners receive SELECT only.

There is **no direct INSERT / UPDATE / DELETE grant**.

## Transactional Canon commit

Public RPC:

`storyforge_commit_canon_proposal(review_id, expected_updated_at)`

The public function is `SECURITY INVOKER`.

It delegates to an implementation in the non-exposed private schema.

The private function:

1. requires `auth.uid()`;
2. locks the review row `FOR UPDATE`;
3. confirms ownership;
4. requires status `APPROVED`;
5. requires decision `APPROVE`;
6. checks `expected_updated_at` for optimistic locking;
7. requires proposal authority `CANDIDATE`;
8. inserts one CANON fact;
9. marks review `COMMITTED`;
10. returns the committed fact identity.

All steps execute in one database transaction.

## Authority audit

Database triggers record:

- Review state transitions;
- Canon commits.

Audit rows include:

- owner;
- actor user;
- JWT session_id when present;
- action;
- target;
- before/after state;
- contextual payload.

The application cannot directly forge audit rows.

## Provisioning boundary

A new Supabase project has not been created because project creation requires explicit organization/cost confirmation.

Existing HNK Supabase projects are deliberately not reused for Storyforge.

When provisioning is approved:

1. create a dedicated Storyforge project;
2. create the real migration with Supabase CLI;
3. apply the reviewed schema;
4. run security + performance advisors;
5. verify RLS with two distinct test users;
6. configure Vercel publishable environment values;
7. generate and commit a real package lock;
8. enable durable mode only after all checks pass.
