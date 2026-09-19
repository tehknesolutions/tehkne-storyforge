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

**T-NIR V0.5 — Decision, Narrative Resolution & Governed Media Realization**

Implemented:

- evidence-driven character cognition and deterministic replanning;
- composable WorldRule expressions: `ATOM / ALL / ANY / NOT`;
- ActionProposal + deterministic DecisionScore;
- EventProposal simulation without canon mutation;
- creator-gated CanonProposal workflow;
- linear vs interactive Narrative Resolution;
- model-agnostic ModelAdapter contract;
- deterministic Media Plans with traceability;
- first realized Prose, Manga, Webtoon and Anime outputs;
- output assertion classification: CANON_RESTATEMENT / UNSUPPORTED_NEW_FACT / CANON_CONTRADICTION;
- comprehensive `validate-v0.5.mjs` gate.

Reference audits: **PASS / 0 errors** in two independent repository audits.

Current compiler preservation:

- Prose: 10/10 source events mapped;
- Manga: 10/10;
- Webtoon: 10/10;
- Anime Episode: 10/10;
- Visual Novel: 10/10;
- unmapped events: **0**.

Current linear realization uses `branch:descend`:

- Prose: readable realized narrative;
- Manga: 9 RTL pages;
- Webtoon: 9 vertical panels with scroll pacing;
- Anime: 9 shots / 90 seconds.

Creator Authority remains enforced:

```text
generated inference
→ CANDIDATE
→ creator review
→ approve / edit / reject
→ CANON
```

Automatic canon promotion is not allowed.

Next research/engineering milestone: **T-NIR V0.6 — provider adapters, structured generation, multimodal assets and Story Lab application foundation.**

## License

License decision pending.
