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

**T-NIR V0.4 — Deterministic Narrative Runtime + Canon-Safe Generation**

Implemented:

- character cognition and agency: Belief, Knowledge, Goal, Intention, Plan, Secret and CharacterState;
- evidence-driven BeliefRevision;
- belief-dependent Plan revisions and deterministic ReplanRules;
- explicit Choice / ChoiceOption;
- StateTransition and branch-state reduction;
- executable WorldRule conditions/effects;
- NarrativeBranch with temporal sequencing;
- JSON Schema V0.1–V0.4;
- semantic, runtime-contract, canon/timeline and media validation;
- first-class Manga, Webtoon, Manhwa, Manhua, Light Novel and Anime profiles;
- deterministic Media Plan compiler;
- formal traceability contract back to Events, Choices, Rules and Evidence;
- runtime snapshots for both reference branches;
- Generation Brief compiler with Creator Authority guardrails.

Reference audit: **PASS / 0 errors**.

Current transmedia preservation:

- Prose: 10/10 story events mapped;
- Manga: 10/10;
- Webtoon: 10/10;
- Anime Episode: 10/10;
- Visual Novel: 10/10;
- unmapped events: **0**.

Generation contract: `mayInventCanon = false`; new unapproved facts become `CANDIDATE`.

Next research/engineering milestone: **T-NIR V0.5 — decision scoring, rule expression engine, plan repair, model adapters and first realized media outputs.**

## License

License decision pending.
