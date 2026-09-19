# Story Workspace V0.4.4 — Durable Persistence Live Validation

Status: **LIVE_BACKEND_VALIDATED**

Supabase project:

`tehkne-storyforge / zbqhxlmalzijnmkljcbt`

## Schema

Table:

`public.storyforge_workspaces`

Properties:

- owner-scoped RLS;
- authenticated CRUD only;
- anon/public grants revoked;
- JSON object payload;
- PT-BR / EN / ES locale constraint;
- Story Lab media target constraint;
- client-visible optimistic-lock `revision`;
- owner/updated_at index;
- no CANON mutation semantics.

## Advisors

After schema + RLS optimization:

- Security Advisor: **0 findings**
- Performance Advisor WARN: **0**
- Performance Advisor INFO: one unused-index notice on the newly-created
  workspace index, expected before normal traffic exists.

## Controlled RLS / locking test

Two temporary Auth identities were created inside the controlled test and
removed before completion.

Result:

**11 / 11 PASS**

Validated:

1. A insert defaults owner_id from auth.uid().
2. A reads own workspace.
3. B cannot read A workspace.
4. B cannot update A workspace.
5. A cannot read B workspace.
6. stale expected revision is blocked.
7. expected revision update succeeds.
8. successful update advances revision 1 → 2.
9. old revision cannot overwrite revision 2.
10. temporary workspaces remaining: 0.
11. temporary users remaining: 0.

The test did not promote or write any CANON fact.
