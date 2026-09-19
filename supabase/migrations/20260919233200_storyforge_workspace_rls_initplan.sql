-- Optimize workspace RLS auth checks so auth.uid() is initialized once per statement.

drop policy if exists storyforge_workspaces_owner_select
  on public.storyforge_workspaces;
create policy storyforge_workspaces_owner_select
  on public.storyforge_workspaces
  for select
  to authenticated
  using (
    (select auth.uid()) is not null
    and (select auth.uid()) = owner_id
  );

drop policy if exists storyforge_workspaces_owner_insert
  on public.storyforge_workspaces;
create policy storyforge_workspaces_owner_insert
  on public.storyforge_workspaces
  for insert
  to authenticated
  with check (
    (select auth.uid()) is not null
    and (select auth.uid()) = owner_id
  );

drop policy if exists storyforge_workspaces_owner_update
  on public.storyforge_workspaces;
create policy storyforge_workspaces_owner_update
  on public.storyforge_workspaces
  for update
  to authenticated
  using (
    (select auth.uid()) is not null
    and (select auth.uid()) = owner_id
  )
  with check (
    (select auth.uid()) is not null
    and (select auth.uid()) = owner_id
  );

drop policy if exists storyforge_workspaces_owner_delete
  on public.storyforge_workspaces;
create policy storyforge_workspaces_owner_delete
  on public.storyforge_workspaces
  for delete
  to authenticated
  using (
    (select auth.uid()) is not null
    and (select auth.uid()) = owner_id
  );
