# TEHKNÉ STORYFORGE

> **Forge an idea into a universe.**

TEHKNÉ STORYFORGE is a narrative creation and transmedia production system by Tehkné Solutions.

Its purpose is not merely to generate stories. Storyforge transforms a creative intention into a structured narrative universe and then derives multiple coherent media manifestations from the same canonical source.

## Core flow

```text
ALEF / INTENTION
→ STORY DNA
→ WORLD + CANON
→ CHARACTER MIND
→ EVENT / FABULA
→ DISCOURSE / SYUZHET
→ EXPERIENCE
→ T-NIR
→ MEDIA COMPILERS
→ MEDIA ARTIFACTS
```

## Product architecture

- **TEHKNÉ STORYFORGE** — complete product.
- **TNE — Tehkné Narrative Engine** — narrative runtime and orchestration layer.
- **T-NIR — Tehkné Narrative Intermediate Representation** — media-independent narrative representation.
- **Story Lab** — creator-facing workspace.
- **Canon Graph** — canonical truth and relationship graph.
- **Narrative Director** — pacing, dramatic and continuity orchestration.
- **Media Compilers** — project the same T-NIR universe into different media.

## First-class media targets

### Literature
- Short Story
- Novel
- Light Novel

### Comics and sequential art
- Comic
- Manga
- Manhwa
- Manhua
- Webtoon
- Vertical Comic
- Motion Comic

### Audiovisual
- Animation
- Anime Short
- Anime Episode
- Anime Series
- Screenplay

### Interactive
- Game
- Visual Novel

### Audio
- Audio Drama

These are **media profiles**, not interchangeable labels. Manga, Webtoon and Anime, for example, may share canonical events while using different pacing, composition, production units and presentation grammars.

## Core principles

1. **Creator Authority** — AI may propose; canon changes require creator approval.
2. **Canon-first** — continuity is part of the architecture, not a final QA patch.
3. **Event-first** — canonical events are more fundamental than scenes or pages.
4. **Mind ≠ Canon** — what a character believes may differ from what is true.
5. **Media-agnostic core** — external text/image/audio/video models are replaceable adapters.
6. **Hybrid Narrative** — supports authored and emergent storytelling.
7. **Provenance** — important facts and generated artifacts must be traceable.
8. **Transmedia by design** — each medium may reinterpret presentation without silently changing canon.

## Repository status

**TEHKNÉ STORYFORGE V0.8 RC1 — Durable Creator Authority**

Architecture:

```text
STORYFORGE 0.8.0-rc.1
├─ Story Lab 0.3.0-rc.1
├─ T-NIR 0.5.0
└─ T-PIR 0.1.0
```

Implemented in RC1:

- Supabase SSR/auth integration isolated behind app adapters;
- cookie session refresh via Next.js `proxy.ts`;
- per-request server clients;
- dual EPHEMERAL/DURABLE ProductionStore;
- dual EPHEMERAL/DURABLE ReviewStore;
- generated CanonProposal persistence;
- explicit two-step Review → Canon authority flow;
- transactional Canon RPC contract with optimistic locking;
- RLS-safe database schema candidate;
- append-only database-generated authority audit;
- private-by-default signup;
- no service-role key in Story Lab;
- Creator Authority audit screen.

Independent RC audits: **PASS / 0 errors** in two passes.

Release state:

`READY_FOR_PROVISIONING`

Not yet claimed as V0.8 final because the dedicated Supabase project, real migration/advisors/RLS tests, package lock, real build and Vercel deployment are still pending.

Next finalization step: **provision dedicated Storyforge Supabase backend and validate the schema live.**

## License

License decision pending.
