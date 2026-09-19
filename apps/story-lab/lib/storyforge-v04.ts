import type {
  MediaTarget,
  NarrativeDraft,
  StoryDNA,
  StoryLocale,
  UniverseDraft
} from "./storyforge-local";
import {
  buildTnirV05Export,
  type DialogueLine,
  type NarrativeForgeV03,
  type SceneBeatDraft,
  type SceneDraft,
  type WebtoonPanel
} from "./storyforge-v03";

export type SceneRevisionStatus =
  | "CANDIDATE"
  | "APPROVED_LOCAL"
  | "REJECTED"
  | "SUPERSEDED";

export type DialogueRevisionStatus =
  | "CANDIDATE"
  | "APPROVED_LOCAL"
  | "REJECTED";

export type SceneDialogueRevision = DialogueLine & {
  status: DialogueRevisionStatus;
};

export type SceneRevision = Omit<SceneDraft, "dialogue"> & {
  id: string;
  sceneId: string;
  revision: number;
  basedOnRevisionId?: string;
  status: SceneRevisionStatus;
  dialogue: SceneDialogueRevision[];
  sourceClaimIds: string[];
  createdBy: "SYSTEM" | "CREATOR";
  createdAt: string;
  rationale?: string;
  alternative: boolean;
};

export type SceneRevisionIndex = {
  sceneId: string;
  eventId: string;
  selectedRevisionId: string;
  revisionIds: string[];
};

export type SceneAuthorityWorkspace = {
  version: "0.4.0";
  sceneIndex: Record<string, SceneRevisionIndex>;
  revisions: Record<string, SceneRevision>;
  updatedAt: string;
};

export type SceneRevisionPatch = Partial<
  Pick<
    SceneRevision,
    | "title"
    | "dramaticPurpose"
    | "action"
    | "informationRevealed"
    | "informationWithheld"
    | "beats"
    | "dialogue"
  >
>;

export type V04WebtoonPanel = WebtoonPanel & {
  sceneRevisionId: string;
  sceneRevision: number;
  sceneRevisionStatus: SceneRevisionStatus;
};

export type V04WebtoonRealization = {
  id: string;
  version: "0.4.0";
  target: "WEBTOON";
  episodeNumber: 1;
  title: string;
  selectedSceneRevisionIds: string[];
  panelCount: number;
  panels: V04WebtoonPanel[];
  authority: "CANDIDATE";
  createdAt: string;
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

function revisionId(sceneId: string, revision: number) {
  return `${sceneId}:rev:${revision}`;
}

function sourceClaimIdsForScene(
  forge: NarrativeForgeV03,
  scene: SceneDraft
) {
  const authority = scene.eventAuthority === "SOURCE" ? "IDEA" : "CANDIDATE";
  return forge.claims
    .filter((claim) => claim.authority === authority)
    .slice(0, 3)
    .map((claim) => claim.id);
}

function toInitialRevision(
  scene: SceneDraft,
  forge: NarrativeForgeV03
): SceneRevision {
  const id = revisionId(scene.id, 1);
  return {
    ...clone(scene),
    id,
    sceneId: scene.id,
    revision: 1,
    status: "CANDIDATE",
    dialogue: scene.dialogue.map((line) => ({
      ...clone(line),
      status: "CANDIDATE"
    })),
    sourceClaimIds: sourceClaimIdsForScene(forge, scene),
    createdBy: "SYSTEM",
    createdAt: new Date().toISOString(),
    rationale: "Revisão inicial criada pelo Narrative Forge V0.3.",
    alternative: false
  };
}

export function createSceneAuthorityWorkspace(
  forge: NarrativeForgeV03
): SceneAuthorityWorkspace {
  const sceneIndex: Record<string, SceneRevisionIndex> = {};
  const revisions: Record<string, SceneRevision> = {};

  for (const scene of forge.scenes) {
    const revision = toInitialRevision(scene, forge);
    revisions[revision.id] = revision;
    sceneIndex[scene.id] = {
      sceneId: scene.id,
      eventId: scene.eventId,
      selectedRevisionId: revision.id,
      revisionIds: [revision.id]
    };
  }

  return {
    version: "0.4.0",
    sceneIndex,
    revisions,
    updatedAt: new Date().toISOString()
  };
}

export function selectedSceneRevision(
  workspace: SceneAuthorityWorkspace,
  sceneId: string
): SceneRevision | null {
  const entry = workspace.sceneIndex[sceneId];
  if (!entry) return null;
  return workspace.revisions[entry.selectedRevisionId] ?? null;
}

export function selectedSceneRevisions(
  workspace: SceneAuthorityWorkspace
): SceneRevision[] {
  return Object.values(workspace.sceneIndex)
    .map((entry) => workspace.revisions[entry.selectedRevisionId])
    .filter((revision): revision is SceneRevision => Boolean(revision))
    .sort((a, b) => a.index - b.index);
}

function nextRevisionNumber(
  workspace: SceneAuthorityWorkspace,
  sceneId: string
) {
  const entry = workspace.sceneIndex[sceneId];
  if (!entry) return 1;

  return (
    Math.max(
      0,
      ...entry.revisionIds
        .map((id) => workspace.revisions[id]?.revision ?? 0)
    ) + 1
  );
}

function addRevision(
  workspace: SceneAuthorityWorkspace,
  sceneId: string,
  revision: SceneRevision
) {
  const next = clone(workspace);
  const entry = next.sceneIndex[sceneId];
  if (!entry) {
    throw new Error(`SCENE_NOT_FOUND:${sceneId}`);
  }

  const previousSelected = next.revisions[entry.selectedRevisionId];
  if (
    previousSelected &&
    previousSelected.status !== "REJECTED" &&
    previousSelected.status !== "SUPERSEDED"
  ) {
    previousSelected.status = "SUPERSEDED";
  }

  next.revisions[revision.id] = revision;
  entry.revisionIds.push(revision.id);
  entry.selectedRevisionId = revision.id;
  next.updatedAt = new Date().toISOString();
  return next;
}

export function approveSceneRevision(
  workspace: SceneAuthorityWorkspace,
  sceneId: string
): SceneAuthorityWorkspace {
  const next = clone(workspace);
  const selected = selectedSceneRevision(next, sceneId);
  if (!selected) throw new Error(`SCENE_NOT_FOUND:${sceneId}`);
  if (selected.status === "REJECTED") {
    throw new Error("REJECTED_REVISION_CANNOT_BE_APPROVED");
  }

  selected.status = "APPROVED_LOCAL";
  selected.dialogue = selected.dialogue.map((line) => ({
    ...line,
    status:
      line.status === "REJECTED"
        ? "REJECTED"
        : "APPROVED_LOCAL"
  }));
  next.updatedAt = new Date().toISOString();
  return next;
}

export function rejectSceneRevision(
  workspace: SceneAuthorityWorkspace,
  sceneId: string
): SceneAuthorityWorkspace {
  const next = clone(workspace);
  const selected = selectedSceneRevision(next, sceneId);
  if (!selected) throw new Error(`SCENE_NOT_FOUND:${sceneId}`);

  selected.status = "REJECTED";
  selected.dialogue = selected.dialogue.map((line) => ({
    ...line,
    status: "REJECTED"
  }));
  next.updatedAt = new Date().toISOString();
  return next;
}

export function selectSceneRevision(
  workspace: SceneAuthorityWorkspace,
  sceneId: string,
  selectedRevisionId: string
): SceneAuthorityWorkspace {
  const next = clone(workspace);
  const entry = next.sceneIndex[sceneId];
  const revision = next.revisions[selectedRevisionId];

  if (!entry || !revision || revision.sceneId !== sceneId) {
    throw new Error("INVALID_SCENE_REVISION_SELECTION");
  }

  entry.selectedRevisionId = selectedRevisionId;
  next.updatedAt = new Date().toISOString();
  return next;
}

export function reviseScene(
  workspace: SceneAuthorityWorkspace,
  sceneId: string,
  patch: SceneRevisionPatch,
  rationale = "Edição manual do criador."
): SceneAuthorityWorkspace {
  const current = selectedSceneRevision(workspace, sceneId);
  if (!current) throw new Error(`SCENE_NOT_FOUND:${sceneId}`);

  const revision = nextRevisionNumber(workspace, sceneId);
  const id = revisionId(sceneId, revision);

  const nextRevision: SceneRevision = {
    ...clone(current),
    ...clone(patch),
    id,
    sceneId,
    revision,
    basedOnRevisionId: current.id,
    status: "CANDIDATE",
    createdBy: "CREATOR",
    createdAt: new Date().toISOString(),
    rationale,
    alternative: false,
    dialogue: (patch.dialogue ?? current.dialogue).map((line) => ({
      ...clone(line),
      status:
        line.status === "REJECTED"
          ? "REJECTED"
          : "CANDIDATE"
    }))
  };

  return addRevision(workspace, sceneId, nextRevision);
}

function regeneratedAction(
  current: SceneRevision,
  locale: StoryLocale,
  variant: number
) {
  const prefix =
    locale === "en"
      ? "Alternative staging"
      : locale === "es"
        ? "Puesta en escena alternativa"
        : "Encenação alternativa";

  return `${prefix} r${variant}: ${current.dramaticPurpose}`;
}

function regeneratedDialogue(
  current: SceneRevision,
  locale: StoryLocale,
  variant: number
): SceneDialogueRevision[] {
  const original = current.dialogue[0];
  if (!original) return [];

  const suffix =
    locale === "en"
      ? `Alternative ${variant}: say less, imply more.`
      : locale === "es"
        ? `Alternativa ${variant}: decir menos y sugerir más.`
        : `Alternativa ${variant}: dizer menos e sugerir mais.`;

  return [
    {
      ...clone(original),
      id: `${original.id}:alt:${variant}`,
      text: `${original.text} ${suffix}`,
      authority: "CANDIDATE",
      status: "CANDIDATE"
    }
  ];
}

export function regenerateScene(
  workspace: SceneAuthorityWorkspace,
  sceneId: string,
  locale: StoryLocale,
  options?: { alternative?: boolean }
): SceneAuthorityWorkspace {
  const current = selectedSceneRevision(workspace, sceneId);
  if (!current) throw new Error(`SCENE_NOT_FOUND:${sceneId}`);

  const revision = nextRevisionNumber(workspace, sceneId);
  const id = revisionId(sceneId, revision);

  const nextRevision: SceneRevision = {
    ...clone(current),
    id,
    sceneId,
    revision,
    basedOnRevisionId: current.id,
    status: "CANDIDATE",
    action: regeneratedAction(current, locale, revision),
    dialogue: regeneratedDialogue(current, locale, revision),
    createdBy: "SYSTEM",
    createdAt: new Date().toISOString(),
    rationale: options?.alternative
      ? "Alternativa isolada gerada para o mesmo evento."
      : "Cena regenerada isoladamente sem alterar o evento-fonte.",
    alternative: Boolean(options?.alternative)
  };

  return addRevision(workspace, sceneId, nextRevision);
}

export function updateDialogueLine(
  workspace: SceneAuthorityWorkspace,
  sceneId: string,
  lineId: string,
  patch: Partial<Pick<SceneDialogueRevision, "text" | "speakerName" | "status">>
): SceneAuthorityWorkspace {
  const current = selectedSceneRevision(workspace, sceneId);
  if (!current) throw new Error(`SCENE_NOT_FOUND:${sceneId}`);

  return reviseScene(
    workspace,
    sceneId,
    {
      dialogue: current.dialogue.map((line) =>
        line.id === lineId ? { ...line, ...patch } : line
      )
    },
    "Linha de diálogo revisada pelo criador."
  );
}

function revisionToScene(revision: SceneRevision): SceneDraft {
  return {
    id: revision.sceneId,
    index: revision.index,
    title: revision.title,
    eventId: revision.eventId,
    eventAuthority: revision.eventAuthority,
    dramaticPurpose: revision.dramaticPurpose,
    action: revision.action,
    informationRevealed: clone(revision.informationRevealed),
    informationWithheld: clone(revision.informationWithheld),
    beats: clone(revision.beats),
    dialogue: revision.dialogue
      .filter((line) => line.status !== "REJECTED")
      .map(({ status: _status, ...line }) => line)
  };
}

function visualIntent(
  scene: SceneRevision,
  kind: WebtoonPanel["kind"],
  locale: StoryLocale
) {
  const name = scene.title;
  const copy = {
    "pt-BR": {
      ESTABLISHING: `Estabelecer visualmente a revisão r${scene.revision} de “${name}” por ação observável.`,
      DETAIL: "Isolar um detalhe visual que sustente o beat sem adicionar nova verdade narrativa.",
      REACTION: "Mostrar a consequência emocional ou corporal da ação anterior.",
      DIALOGUE: "Composição limpa para priorizar a fala selecionada desta revisão.",
      TURN: "Fechar a sequência com mudança de estado ou pergunta causal."
    },
    en: {
      ESTABLISHING: `Visually establish revision r${scene.revision} of “${name}” through observable action.`,
      DETAIL: "Isolate one visual detail that supports the beat without adding narrative truth.",
      REACTION: "Show the emotional or physical consequence of the previous action.",
      DIALOGUE: "Keep composition clean to prioritize the selected dialogue for this revision.",
      TURN: "Close the sequence on a state change or causal question."
    },
    es: {
      ESTABLISHING: `Establecer visualmente la revisión r${scene.revision} de “${name}” mediante acción observable.`,
      DETAIL: "Aislar un detalle visual que sostenga el beat sin añadir nueva verdad narrativa.",
      REACTION: "Mostrar la consecuencia emocional o corporal de la acción anterior.",
      DIALOGUE: "Mantener una composición limpia para priorizar el diálogo seleccionado de esta revisión.",
      TURN: "Cerrar la secuencia con un cambio de estado o pregunta causal."
    }
  }[locale];

  return copy[kind];
}

export function realizeWebtoonFromSelectedRevisions(
  workspace: SceneAuthorityWorkspace,
  locale: StoryLocale
): V04WebtoonRealization {
  const selected = selectedSceneRevisions(workspace).filter(
    (revision) => revision.status !== "REJECTED"
  );
  const panels: V04WebtoonPanel[] = [];
  let index = 1;

  for (const scene of selected) {
    const dialogue = scene.dialogue.find(
      (line) => line.status !== "REJECTED"
    );
    const kinds: WebtoonPanel["kind"][] = [
      "ESTABLISHING",
      "DETAIL",
      "REACTION",
      "DIALOGUE",
      "TURN"
    ];

    for (const [localIndex, kind] of kinds.entries()) {
      const text =
        kind === "DIALOGUE"
          ? dialogue?.text
          : kind === "TURN"
            ? scene.informationWithheld[0]
            : undefined;

      panels.push({
        id: `panel:v0.4:${index}`,
        index,
        sequence: scene.index,
        sceneId: scene.sceneId,
        sceneRevisionId: scene.id,
        sceneRevision: scene.revision,
        sceneRevisionStatus: scene.status,
        eventId: scene.eventId,
        kind,
        visualIntent: visualIntent(scene, kind, locale),
        ...(text ? { text } : {}),
        ...(kind === "DIALOGUE" && dialogue
          ? { speakerName: dialogue.speakerName }
          : {}),
        authority: "CANDIDATE",
        scrollGapAfter:
          localIndex === 4
            ? 58
            : [16, 24, 12, 28, 58][localIndex] ?? 20
      });
      index += 1;
    }
  }

  return {
    id: `realization:webtoon:v0.4:${crypto.randomUUID()}`,
    version: "0.4.0",
    target: "WEBTOON",
    episodeNumber: 1,
    title:
      locale === "en"
        ? "Episode 1 — Selected Scene Revisions"
        : locale === "es"
          ? "Episodio 1 — Revisiones seleccionadas"
          : "Episódio 1 — Revisões de cena selecionadas",
    selectedSceneRevisionIds: selected.map((scene) => scene.id),
    panelCount: panels.length,
    panels,
    authority: "CANDIDATE",
    createdAt: new Date().toISOString()
  };
}

export function buildV04TnirExport(input: {
  storyDNA: StoryDNA;
  universe: UniverseDraft;
  narrative: NarrativeDraft;
  forgeV03: NarrativeForgeV03;
  sceneAuthority: SceneAuthorityWorkspace;
  targetMedia: MediaTarget;
}) {
  const selected = selectedSceneRevisions(input.sceneAuthority)
    .filter((revision) => revision.status !== "REJECTED");

  const base = buildTnirV05Export({
    storyDNA: input.storyDNA,
    universe: input.universe,
    narrative: input.narrative,
    scenes: selected.map(revisionToScene),
    claims: input.forgeV03.claims,
    targetMedia: input.targetMedia
  });

  return {
    ...base,
    provenance: {
      ...(base.provenance as Record<string, unknown>),
      source: "story-lab-workspace-v0.4",
      sourceVersion: "0.4.0",
      sceneRevisionIds: selected.map((scene) => scene.id)
    },
    sceneRevisionAuthority: selected.map((scene) => ({
      sceneId: scene.sceneId,
      revisionId: scene.id,
      revision: scene.revision,
      status: scene.status,
      basedOnRevisionId: scene.basedOnRevisionId ?? null,
      sourceClaimIds: scene.sourceClaimIds,
      createdBy: scene.createdBy,
      createdAt: scene.createdAt,
      rationale: scene.rationale ?? null
    }))
  };
}
