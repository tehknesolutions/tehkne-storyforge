-- Storyforge durable authoring workspace persistence.
-- This stores creator workspace state only. It does not mutate durable CANON.

create table if not exists public.storyforge_workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  title text not null default 'Untitled Story Workspace',
  workspace_version text not null default '0.4.4',
  locale text not null default 'pt-BR'
    check (locale in ('pt-BR', 'en', 'es')),
  target_media text not null default 'MANGA'
    check (
      target_media in (
        'PROSE_SHORT',
        'NOVEL',
        'MANGA',
        'WEBTOON',
        'ANIME_EPISODE',
        'GAME',
        'VISUAL_NOVEL',
        'AUDIO_DRAMA'
      )
    ),
  payload jsonb not null default '{}'::jsonb
    check (jsonb_typeof(payload) = 'object'),
  revision bigint not null default 1
    check (revision >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists storyforge_workspaces_owner_updated_idx
  on public.storyforge_workspaces (owner_id, updated_at desc);

alter table public.storyforge_workspaces enable row level security;

revoke all on table public.storyforge_workspaces from anon;
revoke all on table public.storyforge_workspaces from public;
grant select, insert, update, delete
  on table public.storyforge_workspaces
  to authenticated;

drop policy if exists storyforge_workspaces_owner_select
  on public.storyforge_workspaces;
create policy storyforge_workspaces_owner_select
  on public.storyforge_workspaces
  for select
  to authenticated
  using (
    auth.uid() is not null
    and auth.uid() = owner_id
  );

drop policy if exists storyforge_workspaces_owner_insert
  on public.storyforge_workspaces;
create policy storyforge_workspaces_owner_insert
  on public.storyforge_workspaces
  for insert
  to authenticated
  with check (
    auth.uid() is not null
    and auth.uid() = owner_id
  );

drop policy if exists storyforge_workspaces_owner_update
  on public.storyforge_workspaces;
create policy storyforge_workspaces_owner_update
  on public.storyforge_workspaces
  for update
  to authenticated
  using (
    auth.uid() is not null
    and auth.uid() = owner_id
  )
  with check (
    auth.uid() is not null
    and auth.uid() = owner_id
  );

drop policy if exists storyforge_workspaces_owner_delete
  on public.storyforge_workspaces;
create policy storyforge_workspaces_owner_delete
  on public.storyforge_workspaces
  for delete
  to authenticated
  using (
    auth.uid() is not null
    and auth.uid() = owner_id
  );

comment on table public.storyforge_workspaces is
  'Durable creator authoring workspace state. Not a CANON authority table.';

comment on column public.storyforge_workspaces.revision is
  'Client-visible optimistic-lock revision. Updates must filter by the expected previous revision and write expected+1.';
