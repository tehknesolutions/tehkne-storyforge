# Storyforge Architecture V0.1

## Product

**TEHKNÉ STORYFORGE** transforms a creative intention into a structured narrative universe and compiles that universe into multiple media.

The core architectural rule is:

> Media output is derived. Canon is authoritative. Events connect both.

## Layers

1. **Alef / Intention** — raw creative input.
2. **Story DNA** — premise, themes, genre, tone, audience, creator intent and constraints.
3. **World / Canon** — entities, rules, relationships, chronology and canonical facts.
4. **Character Mind** — beliefs, knowledge, desires, goals, intentions, fears and secrets.
5. **Fabula / Event Graph** — what actually happens, causally and temporally.
6. **Discourse / Syuzhet** — how events are presented.
7. **Experience** — agency, choices, pacing and state.
8. **Media** — concrete media artifact.

## T-NIR

T-NIR is the media-independent intermediate representation.

Core objects in V0.1:

- `Universe`
- `StoryDNA`
- `CanonFact`
- `Entity`
- `Character`
- `Belief`
- `Goal`
- `Relationship`
- `NarrativeEvent`
- `CausalLink`
- `Story`
- `Scene`
- `Beat`
- `MediaManifest`
- `Provenance`

## Canon authority

```text
IDEA
→ CANDIDATE
→ APPROVED
→ CANON
```

Auxiliary states:

- `DEPRECATED`
- `CONTRADICTED`
- `RETCON`
- `ALTERNATE_TIMELINE`
- `NON_CANON`

AI output must not silently become canon.

## Event-first model

A canonical event is more fundamental than a scene, page, panel, quest or shot.

A single event may be realized as:

- prose paragraph;
- manga panel sequence;
- webtoon vertical reveal;
- game objective;
- anime shot sequence;
- audio scene.

This makes transmedia traceability possible.

## First-class media profiles

Storyforge does not treat specialized narrative formats as cosmetic aliases.

### Manga

Typical hierarchy:

```text
VOLUME
→ CHAPTER
→ PAGE
→ PANEL
```

Native concerns include right-to-left reading, page-turn reveals, double-page spreads, panel rhythm, silent panels, impact panels, screentone and serialized chapter pacing.

### Webtoon

Typical hierarchy:

```text
SEASON
→ EPISODE
→ SCROLL_SEQUENCE
→ PANEL
```

Native concerns include mobile-first composition, vertical-scroll rhythm, scroll distance, long gaps, staged reveals and episode hooks.

### Manhwa / Manhua

Separate profiles are preserved because publishing conventions, reading direction, color usage, page-vs-scroll structure and serial production may differ.

### Light Novel

Typical hierarchy:

```text
VOLUME
→ CHAPTER
→ SECTION
→ PROSE / DIALOGUE / ILLUSTRATION_SLOT
```

The compiler must coordinate prose realization with planned illustration points.

### Anime

Anime is modeled as a specialized audiovisual profile rather than an alias for generic animation.

Typical hierarchy:

```text
SERIES
→ SEASON / COUR
→ EPISODE
→ SEQUENCE
→ SCENE
→ SHOT / CUT
```

Production-aware metadata may include:

- series composition;
- episode script;
- storyboard;
- layout;
- key animation;
- inbetween;
- backgrounds;
- color;
- voice;
- music;
- SFX;
- compositing;
- edit.

Storyforge does not require every production stage to be automated. The representation exists so automated and human stages can share the same canonical source.

## Compiler contract

Each media compiler receives:

```text
T-NIR subset
+ MediaManifest
+ Style Profile
+ Available Assets
```

and returns:

```text
Media Artifact
+ Traceability Map
+ Validation Report
```

The traceability map must be able to answer:

> Which canonical facts, events, choices and assets produced this paragraph, panel, quest or shot?

## V0.1 reference universe

`examples/micro-universe.json` is the first cross-media fixture.

Its first manifests target:

- Manga;
- Webtoon;
- Anime Episode.

Further manifests will add prose and interactive compilation.

## Next milestone

T-NIR V0.2 should deepen executable semantics for:

- Character beliefs and knowledge;
- Goals and plans;
- Scene / beat representation;
- choices and state transitions;
- world rules;
- alternate timelines;
- asset versioning;
- compiler traceability;
- media-specific validators.
