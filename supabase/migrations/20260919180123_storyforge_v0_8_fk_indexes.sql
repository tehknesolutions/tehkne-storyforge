create index if not exists storyforge_audit_actor_user_idx
  on public.storyforge_authority_audit (actor_user_id);

create index if not exists storyforge_canon_committed_by_idx
  on public.storyforge_canon_facts (committed_by);

create index if not exists storyforge_canon_review_id_idx
  on public.storyforge_canon_facts (review_id);
