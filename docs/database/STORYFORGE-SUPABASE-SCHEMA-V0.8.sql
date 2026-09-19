-- TEHKNÉ STORYFORGE V0.8
-- Supabase/Postgres schema candidate.
-- This is intentionally a schema specification, not a migration-history file.
-- When the Storyforge Supabase project is provisioned, create the real migration
-- with the Supabase CLI and apply this reviewed SQL through that migration.

begin;

create schema if not exists storyforge_private;

revoke all on schema storyforge_private from public;
revoke all on schema storyforge_private from anon;
revoke all on schema storyforge_private from authenticated;
grant usage on schema storyforge_private to authenticated;

create table if not exists public.storyforge_production_jobs (
  id text primary key,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  target_media text not null,
  stage text not null default 'PLAN'
    check (stage in ('PLAN','BRIEF','GENERATE','VALIDATE','REVIEW','APPROVE','EXPORT')),
  status text not null default 'QUEUED'
    check (status in ('QUEUED','RUNNING','BLOCKED','REVIEW_REQUIRED','APPROVED','REJECTED','FAILED','COMPLETE')),
  universe_id text not null,
  universe_version text not null,
  story_id text not null,
  realization_profile_id text,
  provider_id text,
  adapter_id text,
  asset_requests jsonb not null default '[]'::jsonb
    check (jsonb_typeof(asset_requests) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.storyforge_review_items (
  id text primary key,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  universe_id text not null,
  universe_version text not null,
  source_artifact_id text not null,
  proposal jsonb not null
    check (jsonb_typeof(proposal) = 'object'),
  status text not null default 'PENDING'
    check (status in ('PENDING','APPROVED','EDIT_REQUIRED','REJECTED','COMMITTED')),
  decision text
    check (decision is null or decision in ('APPROVE','EDIT','REJECT')),
  notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.storyforge_canon_facts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  universe_id text not null,
  subject text not null,
  predicate text not null,
  object jsonb not null,
  authority text not null default 'CANON'
    check (authority = 'CANON'),
  source_proposal_id text not null,
  review_id text not null references public.storyforge_review_items(id),
  committed_by uuid not null references auth.users(id),
  committed_at timestamptz not null default now(),
  unique (owner_id, universe_id, source_proposal_id)
);

create table if not exists public.storyforge_authority_audit (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  actor_user_id uuid not null references auth.users(id),
  actor_session_id text,
  action text not null,
  target_type text not null,
  target_id text not null,
  from_state text,
  to_state text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists storyforge_jobs_owner_created_idx
  on public.storyforge_production_jobs (owner_id, created_at desc);

create index if not exists storyforge_reviews_owner_updated_idx
  on public.storyforge_review_items (owner_id, updated_at desc);

create index if not exists storyforge_canon_owner_universe_idx
  on public.storyforge_canon_facts (owner_id, universe_id, committed_at desc);

create index if not exists storyforge_audit_owner_created_idx
  on public.storyforge_authority_audit (owner_id, created_at desc);

alter table public.storyforge_production_jobs enable row level security;
alter table public.storyforge_review_items enable row level security;
alter table public.storyforge_canon_facts enable row level security;
alter table public.storyforge_authority_audit enable row level security;

drop policy if exists storyforge_jobs_select_own on public.storyforge_production_jobs;
create policy storyforge_jobs_select_own
on public.storyforge_production_jobs
for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists storyforge_jobs_insert_own on public.storyforge_production_jobs;
create policy storyforge_jobs_insert_own
on public.storyforge_production_jobs
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists storyforge_jobs_update_own on public.storyforge_production_jobs;
create policy storyforge_jobs_update_own
on public.storyforge_production_jobs
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists storyforge_jobs_delete_own on public.storyforge_production_jobs;
create policy storyforge_jobs_delete_own
on public.storyforge_production_jobs
for delete
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists storyforge_reviews_select_own on public.storyforge_review_items;
create policy storyforge_reviews_select_own
on public.storyforge_review_items
for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists storyforge_reviews_insert_own on public.storyforge_review_items;
create policy storyforge_reviews_insert_own
on public.storyforge_review_items
for insert
to authenticated
with check (
  (select auth.uid()) = owner_id
  and status in ('PENDING','APPROVED','EDIT_REQUIRED','REJECTED')
);

drop policy if exists storyforge_reviews_update_own on public.storyforge_review_items;
create policy storyforge_reviews_update_own
on public.storyforge_review_items
for update
to authenticated
using (
  (select auth.uid()) = owner_id
  and status <> 'COMMITTED'
)
with check (
  (select auth.uid()) = owner_id
  and status in ('PENDING','APPROVED','EDIT_REQUIRED','REJECTED')
);

drop policy if exists storyforge_canon_select_own on public.storyforge_canon_facts;
create policy storyforge_canon_select_own
on public.storyforge_canon_facts
for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists storyforge_audit_select_own on public.storyforge_authority_audit;
create policy storyforge_audit_select_own
on public.storyforge_authority_audit
for select
to authenticated
using ((select auth.uid()) = owner_id);

revoke all on public.storyforge_production_jobs from anon, authenticated;
revoke all on public.storyforge_review_items from anon, authenticated;
revoke all on public.storyforge_canon_facts from anon, authenticated;
revoke all on public.storyforge_authority_audit from anon, authenticated;

grant select, insert, update, delete
  on public.storyforge_production_jobs to authenticated;

grant select, insert, update
  on public.storyforge_review_items to authenticated;

grant select
  on public.storyforge_canon_facts to authenticated;

grant select
  on public.storyforge_authority_audit to authenticated;

create or replace function storyforge_private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function storyforge_private.set_updated_at() from public, anon, authenticated;

drop trigger if exists storyforge_jobs_set_updated_at
  on public.storyforge_production_jobs;
create trigger storyforge_jobs_set_updated_at
before update on public.storyforge_production_jobs
for each row execute function storyforge_private.set_updated_at();

drop trigger if exists storyforge_reviews_set_updated_at
  on public.storyforge_review_items;
create trigger storyforge_reviews_set_updated_at
before update on public.storyforge_review_items
for each row execute function storyforge_private.set_updated_at();

create or replace function storyforge_private.audit_review_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or v_uid <> new.owner_id then
    raise exception 'STORYFORGE_AUDIT_AUTHORITY_MISMATCH';
  end if;

  if old.status is distinct from new.status
     or old.decision is distinct from new.decision then
    insert into public.storyforge_authority_audit (
      owner_id,
      actor_user_id,
      actor_session_id,
      action,
      target_type,
      target_id,
      from_state,
      to_state,
      payload
    )
    values (
      new.owner_id,
      v_uid,
      auth.jwt() ->> 'session_id',
      'REVIEW_DECISION',
      'CANON_PROPOSAL_REVIEW',
      new.id,
      old.status,
      new.status,
      jsonb_build_object(
        'decision', new.decision,
        'notes', new.notes,
        'sourceArtifactId', new.source_artifact_id
      )
    );
  end if;

  return new;
end;
$$;

revoke all on function storyforge_private.audit_review_transition()
  from public, anon, authenticated;

drop trigger if exists storyforge_reviews_audit_transition
  on public.storyforge_review_items;
create trigger storyforge_reviews_audit_transition
after update on public.storyforge_review_items
for each row execute function storyforge_private.audit_review_transition();

create or replace function storyforge_private.audit_canon_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or v_uid <> new.owner_id then
    raise exception 'STORYFORGE_CANON_AUDIT_AUTHORITY_MISMATCH';
  end if;

  insert into public.storyforge_authority_audit (
    owner_id,
    actor_user_id,
    actor_session_id,
    action,
    target_type,
    target_id,
    from_state,
    to_state,
    payload
  )
  values (
    new.owner_id,
    v_uid,
    auth.jwt() ->> 'session_id',
    'CANON_COMMIT',
    'CANON_FACT',
    new.id::text,
    'CANDIDATE',
    'CANON',
    jsonb_build_object(
      'reviewId', new.review_id,
      'sourceProposalId', new.source_proposal_id,
      'universeId', new.universe_id,
      'subject', new.subject,
      'predicate', new.predicate
    )
  );

  return new;
end;
$$;

revoke all on function storyforge_private.audit_canon_insert()
  from public, anon, authenticated;

drop trigger if exists storyforge_canon_audit_insert
  on public.storyforge_canon_facts;
create trigger storyforge_canon_audit_insert
after insert on public.storyforge_canon_facts
for each row execute function storyforge_private.audit_canon_insert();

create or replace function storyforge_private.commit_canon_proposal(
  p_review_id text,
  p_expected_updated_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_review public.storyforge_review_items%rowtype;
  v_fact_id uuid;
  v_subject text;
  v_predicate text;
  v_source_proposal_id text;
begin
  if v_uid is null then
    raise exception 'AUTHENTICATION_REQUIRED';
  end if;

  select *
    into v_review
  from public.storyforge_review_items
  where id = p_review_id
    and owner_id = v_uid
  for update;

  if not found then
    raise exception 'REVIEW_NOT_FOUND';
  end if;

  if v_review.status <> 'APPROVED'
     or v_review.decision <> 'APPROVE' then
    raise exception 'REVIEW_NOT_APPROVED';
  end if;

  if v_review.updated_at <> p_expected_updated_at then
    raise exception 'REVIEW_VERSION_CONFLICT';
  end if;

  if coalesce(v_review.proposal ->> 'authority', '') <> 'CANDIDATE' then
    raise exception 'PROPOSAL_AUTHORITY_MUST_BE_CANDIDATE';
  end if;

  if not (v_review.proposal ? 'subject')
     or not (v_review.proposal ? 'predicate')
     or not (v_review.proposal ? 'object') then
    raise exception 'INVALID_CANON_PROPOSAL';
  end if;

  v_subject := v_review.proposal ->> 'subject';
  v_predicate := v_review.proposal ->> 'predicate';
  v_source_proposal_id := coalesce(
    v_review.proposal ->> 'id',
    v_review.id
  );

  insert into public.storyforge_canon_facts (
    owner_id,
    universe_id,
    subject,
    predicate,
    object,
    source_proposal_id,
    review_id,
    committed_by
  )
  values (
    v_uid,
    v_review.universe_id,
    v_subject,
    v_predicate,
    v_review.proposal -> 'object',
    v_source_proposal_id,
    v_review.id,
    v_uid
  )
  returning id into v_fact_id;

  update public.storyforge_review_items
  set
    status = 'COMMITTED',
    reviewed_at = coalesce(reviewed_at, now())
  where id = v_review.id
    and owner_id = v_uid;

  return jsonb_build_object(
    'canonFactId', v_fact_id,
    'reviewId', v_review.id,
    'sourceProposalId', v_source_proposal_id,
    'status', 'COMMITTED',
    'authority', 'CANON'
  );
end;
$$;

revoke all on function storyforge_private.commit_canon_proposal(text, timestamptz)
  from public, anon, authenticated;
grant execute on function storyforge_private.commit_canon_proposal(text, timestamptz)
  to authenticated;

create or replace function public.storyforge_commit_canon_proposal(
  p_review_id text,
  p_expected_updated_at timestamptz
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select storyforge_private.commit_canon_proposal(
    p_review_id,
    p_expected_updated_at
  );
$$;

revoke all on function public.storyforge_commit_canon_proposal(text, timestamptz)
  from public, anon;
grant execute on function public.storyforge_commit_canon_proposal(text, timestamptz)
  to authenticated;

commit;
