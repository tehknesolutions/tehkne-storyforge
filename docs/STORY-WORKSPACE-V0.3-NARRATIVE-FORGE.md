# Story Workspace V0.3 — Narrative Forge

Status: **DEPLOYED / GENERALITY-GATED**

TEHKNÉ Storyforge now has a creator-facing authoring layer between raw narrative
planning and media compilation.

The V0.3 purpose is to turn an approved narrative draft into governed,
traceable story material without collapsing canon, scene staging and
media-specific presentation into the same object.

## Pipeline

```text
CREATOR IDEA
→ STORY DNA
→ UNIVERSE DRAFT
→ NARRATIVE EVENTS
→ CLAIM LEDGER
→ SCENES
→ DIALOGUE
→ MEDIA REALIZATION
→ T-NIR V0.5 EXPORT
```

## Claim Ledger

The workspace preserves three distinct things:

1. literal creator wording;
2. normalized structural claims extracted from the creator idea;
3. system-authored candidate expansions.

Authority remains explicit:

```text
creator literal wording         → IDEA
normalized creator source claim → IDEA
Storyforge expansion            → CANDIDATE
```

No generated expansion is silently promoted to canon.

## Scene Forge

Scenes are derived from narrative events rather than replacing them.

Each scene carries:

- source `eventId`;
- event authority;
- dramatic purpose;
- action;
- information revealed;
- information withheld;
- beats;
- candidate dialogue.

This preserves the distinction:

```text
FABULA / EVENT
≠
SCENE / DISCOURSE
≠
MEDIA REALIZATION
```

## Webtoon realization

The first high-resolution realization profile is Webtoon.

For the current eight-scene reference structure, V0.3 generates:

```text
8 scenes
× 5 panel functions per scene
= 40 panels
```

Panel grammar:

```text
ESTABLISHING
DETAIL
REACTION
DIALOGUE
TURN
```

Every panel traces back to both `sceneId` and `eventId`.

Media presentation remains `CANDIDATE`.

## T-NIR bridge

Narrative Forge exports a T-NIR V0.5-compatible representation containing:

- StoryDNA;
- CanonFact-compatible source claims;
- Character entities;
- NarrativeEvents;
- CausalLinks;
- Scenes and Beats;
- CanonProposals for candidate expansions;
- Story;
- RealizationProfile;
- MediaManifest;
- branch context;
- provenance.

The bridge exists to prevent Story Lab from becoming a parallel narrative
model disconnected from T-NIR.

## Generality gate

A deliberately unrelated story is executed as a production prebuild probe:

> Uma menina encontra uma cidade onde ninguém consegue mentir, mas descobre
> que sua mãe vive escondida ali há vinte anos.

The build is blocked unless the probe satisfies all invariants:

- no cockroach / mind-transfer / scientific-experiment leakage;
- literal creator claim preserved;
- candidate expansions present;
- eight narrative scenes;
- dialogue in every scene;
- Webtoon realization present;
- exactly 40 Webtoon panels;
- all eight events trace into the panel plan;
- dialogue panels present;
- turn panels present;
- T-NIR version 0.5.0;
- eight mapped T-NIR events;
- Story present;
- candidate expansions mapped to CanonProposal.

The Vercel deployment containing this prebuild gate completed successfully.

Reference deployment commit:

`15a428717c1098e2341f2850505e60c4aeffe1da`

## Authority correction introduced in V0.3

V0.3 also separates source fabula from invented staging.

Example:

- “mind transfer happened through an experiment” may be a creator-source fact;
- “the characters discover a specific piece of evidence in this scene” is a
  candidate staging choice unless the creator explicitly supplied it.

This prevents scene direction from inheriting SOURCE authority merely because
it dramatizes a true source fact.

## Persistence and exports

Narrative Forge V0.3 persists locally in the Story Lab workspace and can export:

- complete Storyforge workspace JSON;
- Narrative Forge V0.3 JSON;
- T-NIR V0.5-compatible JSON;
- Webtoon Episode 1 realization JSON.

## V0.4 next checkpoint

The next step is **Scene Authority & Revision**.

V0.4 should make scene-level authoring governed rather than regenerated as a
single opaque batch.

Target loop:

```text
EVENT
→ SCENE CANDIDATE
→ CREATOR REVIEW
→ APPROVE / REVISE / REJECT
→ APPROVED SCENE
→ MEDIA REALIZATION
```

Planned capabilities:

- stable scene IDs across revision;
- per-scene approval status;
- dialogue-line authority;
- scene revision history;
- explicit source-claim traceability;
- candidate rejection without changing source facts;
- regenerate one scene without regenerating the story;
- compile media only from the selected approved/candidate scene set;
- preserve the same event across alternative scene realizations.
