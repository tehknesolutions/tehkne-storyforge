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

**T-NIR V0.3 — Executable Narrative Semantics + Deterministic Media Plans**

Implemented:

- character cognition and agency: Belief, Knowledge, Goal, Intention, Plan, Secret and CharacterState;
- explicit Choice / ChoiceOption;
- StateTransition;
- WorldRule;
- NarrativeBranch;
- JSON Schema V0.1–V0.3;
- semantic integrity validation;
- first-class Manga, Webtoon, Manhwa, Manhua, Light Novel and Anime profiles;
- deterministic Media Plan compiler;
- traceability from media units back to source Events;
- compiled fixtures for Prose, Manga, Webtoon, Anime Episode and Visual Novel.

Reference result: **10/10 story events mapped in every current compiler target, 0 unmapped events.**

Next research/engineering milestone: T-NIR V0.4 — rule execution, belief revision, replanning, branch-state reduction, canon/timeline validation and the first generative layer above deterministic Media Plans.

## License

License decision pending.
