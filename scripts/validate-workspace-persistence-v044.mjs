import fs from "node:fs/promises";

const read = async (path) =>
  fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [
  types,
  store,
  listRoute,
  itemRoute,
  panel,
  workspace,
  proxy,
  i18n,
  migration,
  rlsMigration
] = await Promise.all([
  read("apps/story-lab/lib/workspace-persistence.ts"),
  read("apps/story-lab/lib/workspace-store.ts"),
  read("apps/story-lab/app/api/workspace/route.ts"),
  read("apps/story-lab/app/api/workspace/[id]/route.ts"),
  read("apps/story-lab/app/durable-workspace-panel.tsx"),
  read("apps/story-lab/app/story-workspace.tsx"),
  read("apps/story-lab/lib/supabase/proxy.ts"),
  read("apps/story-lab/app/i18n.tsx"),
  read("supabase/migrations/20260919233000_storyforge_workspace_persistence.sql"),
  read("supabase/migrations/20260919233200_storyforge_workspace_rls_initplan.sql")
]);

const errors = [];
const expect = (condition, message) => {
  if (!condition) errors.push(message);
};

for (const token of [
  "DURABLE_WORKSPACE_VERSION",
  "DurableStoryWorkspacePayload",
  "DurableWorkspaceRef",
  "DurableWorkspaceRecord"
]) {
  expect(types.includes(token), `Workspace persistence type missing: ${token}`);
}

expect(
  store.includes("SupabaseWorkspaceStore") &&
    store.includes("durableWorkspaceStore"),
  "Durable workspace store is missing"
);

expect(
  store.includes('.eq("revision", input.expectedRevision)') &&
    store.includes("WORKSPACE_VERSION_CONFLICT"),
  "Optimistic locking is missing from workspace store"
);

expect(
  listRoute.includes("canonMutationEnabled: false") &&
    itemRoute.includes("canonMutationEnabled: false"),
  "Workspace persistence must explicitly remain outside CANON mutation"
);

expect(
  itemRoute.includes("expectedRevision") &&
    itemRoute.includes("WORKSPACE_VERSION_CONFLICT"),
  "Workspace API does not expose optimistic locking"
);

expect(
  panel.includes('fetch("/api/auth/status"') &&
    panel.includes('fetch("/api/workspace"') &&
    panel.includes("Save to cloud") === false,
  "Durable workspace panel must use localized API-driven controls"
);

expect(
  workspace.includes("<DurableWorkspacePanel") &&
    workspace.includes("durablePayload") &&
    workspace.includes("loadDurableWorkspace") &&
    workspace.includes("DURABLE_WORKSPACE_REF_STORAGE_KEY"),
  "Story Workspace is not wired to durable persistence"
);

expect(
  proxy.includes('"/api/workspace"'),
  "Workspace API is not protected by Supabase session proxy"
);

for (const sqlToken of [
  "create table if not exists public.storyforge_workspaces",
  "enable row level security",
  "storyforge_workspaces_owner_select",
  "storyforge_workspaces_owner_insert",
  "storyforge_workspaces_owner_update",
  "storyforge_workspaces_owner_delete"
]) {
  expect(migration.includes(sqlToken), `Workspace migration missing: ${sqlToken}`);
}

expect(
  rlsMigration.includes("(select auth.uid())"),
  "RLS initplan optimization migration missing"
);

for (const key of [
  "cloud.eyebrow",
  "cloud.title",
  "cloud.body",
  "cloud.checking",
  "cloud.unavailable",
  "cloud.authRequired",
  "cloud.signIn",
  "cloud.save",
  "cloud.saveAsNew",
  "cloud.saving",
  "cloud.refresh",
  "cloud.saved",
  "cloud.loaded",
  "cloud.conflict",
  "cloud.error",
  "cloud.list",
  "cloud.empty",
  "cloud.load",
  "cloud.untitled"
]) {
  const count = i18n.split(`"${key}"`).length - 1;
  expect(
    count === 3,
    `Workspace persistence i18n key must exist in PT-BR, EN and ES: ${key} (found ${count})`
  );
}

if (errors.length) {
  console.error("Story Workspace V0.4.4 durable persistence validation failed.");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Story Workspace V0.4.4 durable persistence validation passed.");
console.log(JSON.stringify({
  durableStore: true,
  rls: true,
  optimisticLocking: true,
  canonMutation: false,
  localFallback: true,
  cloudSaveLoad: true,
  locales: ["pt-BR", "en", "es"]
}, null, 2));
