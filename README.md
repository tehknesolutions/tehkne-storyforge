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

**TEHKNÉ STORYFORGE V0.6 — Production Foundation**

Architecture:

```text
STORYFORGE V0.6
├─ T-NIR V0.5 — narrative core
└─ T-PIR V0.1 — production core
```

Implemented:

- provider/adapter registry with environment gates;
- first OpenAI Responses structured-output adapter;
- generated assertion gate;
- creator-gated CanonReviewBatch;
- multimodal asset and continuity contracts;
- VoiceProfile / Speech / Audio contracts;
- provider-agnostic image and speech adapter interfaces;
- T-PIR ProductionJob / ProductionRun / ProductionManifest;
- game JSON export;
- Story Lab Next.js foundation;
- Canon Review screen;
- V0.6 production authority validation gate.

Independent V0.6 audits: **PASS / 0 errors**.

Provider authority:

```text
provider output
→ assertions
→ assertion gate
→ CANDIDATE CanonProposal
→ creator review
→ CANON only after explicit approval
```

Generated assets are **not canon by default**.

Story Lab foundation routes:

- `/`
- `/review`
- `/api/health`

Next milestone: **Storyforge V0.7 — authenticated providers, production jobs, real generation and deployable preview.**

## License

License decision pending.
