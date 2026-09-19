# Storyforge V0.8 — Supabase Live Validation

Project:

`tehkne-storyforge`

Project ref:

`zbqhxlmalzijnmkljcbt`

Region:

`sa-east-1`

Status at validation:

`ACTIVE_HEALTHY`

## Applied migrations

```text
20260919180048 storyforge_v0_8_durable_authority
20260919180123 storyforge_v0_8_fk_indexes
```

## Advisors

### Security

**0 findings**

### Performance

The original FK-without-index notices were resolved by the second migration.

The remaining INFO notices are only `unused_index` findings on a brand-new database. These are expected before workload exists and are not treated as release failures.

## Live RLS / Canon Authority test

Two temporary identities were created inside a controlled database test and removed before completion.

Result:

**12 / 12 PASS**

Validated:

1. user A reads only user A ProductionJob;
2. user A cannot update user B ProductionJob;
3. user A cannot read user B ReviewItem;
4. user A cannot read user B AuthorityAudit;
5. direct Canon INSERT is denied;
6. direct AuthorityAudit INSERT is denied;
7. review PENDING → APPROVED succeeds and is audited;
8. stale expected_updated_at blocks Canon commit;
9. valid commit returns COMMITTED + CANON;
10. Canon fact and CANON_COMMIT audit are materialized;
11. user B cannot read user A Canon fact;
12. user B cannot read user A AuthorityAudit.

## Cleanup proof

After the test:

```text
test_users_remaining   = 0
test_jobs_remaining    = 0
test_reviews_remaining = 0
test_canon_remaining   = 0
test_audit_remaining   = 0
```

No test identity or Storyforge test content remains in the project.

## Authority result

The live database now proves:

```text
CANDIDATE
→ APPROVED review
→ optimistic-lock check
→ transactional commit
→ CANON
→ database-generated audit
```

with cross-user RLS isolation.
