# Story Lab — Vercel Import

The Story Lab app is intentionally isolated under:

`apps/story-lab`

## Vercel project settings

Import the GitHub repository:

`tehknesolutions/tehkne-storyforge`

Set:

```text
Root Directory = apps/story-lab
Framework = Next.js
```

The app contains its own `vercel.json`.

## Provider environment

The preview does not require an AI key.

Without `OPENAI_API_KEY`:

```text
/api/provider-status
configured = false
enabled = false
authority = CANDIDATE_ONLY
```

To enable authenticated text generation later, configure the secret in Vercel rather than committing it.

## Current preview-safe routes

- `/`
- `/review`
- `/game`
- `/api/health`
- `/api/provider-status`
- `/api/production/jobs`
- `/api/review/[id]`

## Storage warning

The current ProductionJob and review-state stores are EPHEMERAL memory adapters.

They are useful for preview/testing and are not durable across serverless lifecycle events.

Do not treat review approval in preview as a CANON commit.

Canon mutation remains disabled.
