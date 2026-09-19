export type StoryLocale = "pt-BR" | "en" | "es";

export type StoryDNA = {
  id: string;
  status: "CANDIDATE" | "APPROVED_LOCAL";
  sourceIdea: string;
  locale: StoryLocale;
  premise: string;
  themes: string[];
  genre: string;
  tone: string;
  audience: string;
  centralConflict: string;
  narrativePromise: string;
  invariants: string[];
  createdAt: string;
};

export type UniverseDraft = {
  id: string;
  status: "CANDIDATE" | "APPROVED_LOCAL";
  storyDnaId: string;
  title: string;
  premise: string;
  worldRules: string[];
  coreQuestions: string[];
  createdAt: string;
};

export type MediaTarget =
  | "PROSE_SHORT"
  | "NOVEL"
  | "MANGA"
  | "WEBTOON"
  | "ANIME_EPISODE"
  | "GAME"
  | "VISUAL_NOVEL"
  | "AUDIO_DRAMA";

export type MediaPlan = {
  id: string;
  status: "CANDIDATE";
  universeId: string;
  target: MediaTarget;
  units: Array<{
    index: number;
    role: string;
    objective: string;
  }>;
  createdAt: string;
};

export type StoryWorkspaceState = {
  version: "0.1.0";
  locale: StoryLocale;
  idea: string;
  storyDNA: StoryDNA | null;
  universe: UniverseDraft | null;
  mediaPlan: MediaPlan | null;
  targetMedia: MediaTarget;
  updatedAt: string;
};

const localeText = {
  "pt-BR": {
    unknownAudience: "A definir pelo criador",
    defaultGenre: "Drama / Aventura",
    mysteryGenre: "Mistério",
    horrorGenre: "Horror / Suspense",
    fantasyGenre: "Fantasia",
    scifiGenre: "Ficção científica",
    romanceGenre: "Romance",
    adventureGenre: "Aventura",
    darkTone: "Sombrio e tenso",
    hopefulTone: "Esperançoso",
    mysteriousTone: "Misterioso",
    adventurousTone: "Aventureiro",
    neutralTone: "Dramático",
    conflict: (idea: string) =>
      `O protagonista precisa agir diante da situação apresentada — ${idea} — enquanto enfrenta consequências que tornam a decisão cada vez mais difícil.`,
    promise: (genre: string, tone: string) =>
      `Entregar uma experiência de ${genre.toLowerCase()} com tom ${tone.toLowerCase()}, preservando a ideia original como fonte de verdade criativa.`,
    invariant1: "A premissa original do criador não pode ser alterada silenciosamente.",
    invariant2: "Novos fatos permanecem CANDIDATE até aprovação explícita.",
    title: "Universo sem título",
    worldRule1: "A premissa original é uma invariante criativa.",
    worldRule2: "Toda expansão nova precisa declarar proveniência e autoridade.",
    q1: "Quem é o protagonista e o que ele deseja?",
    q2: "Qual é a principal força de oposição?",
    q3: "Que regra torna este universo diferente do mundo comum?"
  },
  en: {
    unknownAudience: "To be defined by the creator",
    defaultGenre: "Drama / Adventure",
    mysteryGenre: "Mystery",
    horrorGenre: "Horror / Suspense",
    fantasyGenre: "Fantasy",
    scifiGenre: "Science fiction",
    romanceGenre: "Romance",
    adventureGenre: "Adventure",
    darkTone: "Dark and tense",
    hopefulTone: "Hopeful",
    mysteriousTone: "Mysterious",
    adventurousTone: "Adventurous",
    neutralTone: "Dramatic",
    conflict: (idea: string) =>
      `The protagonist must act within the situation presented — ${idea} — while facing consequences that make the decision increasingly difficult.`,
    promise: (genre: string, tone: string) =>
      `Deliver a ${genre.toLowerCase()} experience with a ${tone.toLowerCase()} tone while preserving the creator's original idea as the creative source of truth.`,
    invariant1: "The creator's original premise cannot be silently changed.",
    invariant2: "New facts remain CANDIDATE until explicit approval.",
    title: "Untitled universe",
    worldRule1: "The original premise is a creative invariant.",
    worldRule2: "Every new expansion must declare provenance and authority.",
    q1: "Who is the protagonist and what do they want?",
    q2: "What is the main opposing force?",
    q3: "What rule makes this universe different from the ordinary world?"
  },
  es: {
    unknownAudience: "A definir por el creador",
    defaultGenre: "Drama / Aventura",
    mysteryGenre: "Misterio",
    horrorGenre: "Horror / Suspenso",
    fantasyGenre: "Fantasía",
    scifiGenre: "Ciencia ficción",
    romanceGenre: "Romance",
    adventureGenre: "Aventura",
    darkTone: "Oscuro y tenso",
    hopefulTone: "Esperanzador",
    mysteriousTone: "Misterioso",
    adventurousTone: "Aventurero",
    neutralTone: "Dramático",
    conflict: (idea: string) =>
      `El protagonista debe actuar ante la situación presentada — ${idea} — mientras enfrenta consecuencias que vuelven la decisión cada vez más difícil.`,
    promise: (genre: string, tone: string) =>
      `Entregar una experiencia de ${genre.toLowerCase()} con tono ${tone.toLowerCase()}, preservando la idea original del creador como fuente de verdad creativa.`,
    invariant1: "La premisa original del creador no puede cambiarse silenciosamente.",
    invariant2: "Los nuevos hechos permanecen CANDIDATE hasta aprobación explícita.",
    title: "Universo sin título",
    worldRule1: "La premisa original es una invariante creativa.",
    worldRule2: "Toda expansión nueva debe declarar procedencia y autoridad.",
    q1: "¿Quién es el protagonista y qué desea?",
    q2: "¿Cuál es la principal fuerza de oposición?",
    q3: "¿Qué regla hace diferente este universo del mundo común?"
  }
} as const;

function normalize(value: string) {
  return value.toLocaleLowerCase("pt-BR");
}

function includesAny(text: string, values: string[]) {
  return values.some((value) => text.includes(value));
}

function inferGenre(idea: string, locale: StoryLocale) {
  const t = localeText[locale];
  const text = normalize(idea);

  if (includesAny(text, ["terror", "horror", "medo", "assomb", "fear", "haunt", "miedo"])) {
    return t.horrorGenre;
  }
  if (includesAny(text, ["mistério", "misterio", "mystery", "segredo", "secret", "passagem", "passage", "pasadizo"])) {
    return t.mysteryGenre;
  }
  if (includesAny(text, ["magia", "magic", "mágic", "dragão", "dragon", "feitiç", "spell"])) {
    return t.fantasyGenre;
  }
  if (includesAny(text, ["ia", "inteligência artificial", "ai ", "robô", "robot", "espaço", "space", "futuro", "future"])) {
    return t.scifiGenre;
  }
  if (includesAny(text, ["amor", "love", "romance", "paix", "beso", "kiss"])) {
    return t.romanceGenre;
  }
  if (includesAny(text, ["aventura", "adventure", "jornada", "journey", "viagem", "quest"])) {
    return t.adventureGenre;
  }
  return t.defaultGenre;
}

function inferTone(idea: string, locale: StoryLocale) {
  const t = localeText[locale];
  const text = normalize(idea);

  if (includesAny(text, ["terror", "horror", "morte", "death", "sangue", "blood", "sombrio", "dark"])) {
    return t.darkTone;
  }
  if (includesAny(text, ["esperança", "hope", "salvar", "save", "cura", "heal"])) {
    return t.hopefulTone;
  }
  if (includesAny(text, ["mistério", "misterio", "mystery", "segredo", "secret", "oculto", "hidden"])) {
    return t.mysteriousTone;
  }
  if (includesAny(text, ["aventura", "adventure", "jornada", "journey", "explorar", "explore"])) {
    return t.adventurousTone;
  }
  return t.neutralTone;
}

function inferThemes(idea: string, locale: StoryLocale) {
  const text = normalize(idea);
  const labels: Record<StoryLocale, Record<string, string>> = {
    "pt-BR": {
      family: "Família",
      identity: "Identidade",
      discovery: "Descoberta",
      survival: "Sobrevivência",
      technology: "Tecnologia",
      magic: "Magia",
      friendship: "Amizade",
      power: "Poder"
    },
    en: {
      family: "Family",
      identity: "Identity",
      discovery: "Discovery",
      survival: "Survival",
      technology: "Technology",
      magic: "Magic",
      friendship: "Friendship",
      power: "Power"
    },
    es: {
      family: "Familia",
      identity: "Identidad",
      discovery: "Descubrimiento",
      survival: "Supervivencia",
      technology: "Tecnología",
      magic: "Magia",
      friendship: "Amistad",
      power: "Poder"
    }
  };

  const out: string[] = [];
  const add = (key: string) => {
    const value = labels[locale][key];
    if (value && !out.includes(value)) out.push(value);
  };

  if (includesAny(text, ["irmão", "irmao", "sibling", "brother", "sister", "família", "family", "familia", "mãe", "pai", "mother", "father"])) add("family");
  if (includesAny(text, ["quem sou", "identity", "identidade", "identidad", "memória", "memory", "memoria"])) add("identity");
  if (includesAny(text, ["descobre", "discover", "descubr", "passagem", "hidden", "oculto", "secret", "segredo"])) add("discovery");
  if (includesAny(text, ["sobreviv", "surviv", "fugir", "escape"])) add("survival");
  if (includesAny(text, ["tecnologia", "technology", "tecnología", "ia", "robot", "robô"])) add("technology");
  if (includesAny(text, ["magia", "magic", "mágic", "feitiç"])) add("magic");
  if (includesAny(text, ["amigo", "friend", "amistad"])) add("friendship");
  if (includesAny(text, ["poder", "power", "controle", "control"])) add("power");

  if (!out.length) add("discovery");
  return out.slice(0, 4);
}

export function forgeStoryDNA(
  idea: string,
  locale: StoryLocale
): StoryDNA {
  const sourceIdea = idea.trim();
  const t = localeText[locale];
  const genre = inferGenre(sourceIdea, locale);
  const tone = inferTone(sourceIdea, locale);

  return {
    id: `story-dna:${crypto.randomUUID()}`,
    status: "CANDIDATE",
    sourceIdea,
    locale,
    premise: sourceIdea,
    themes: inferThemes(sourceIdea, locale),
    genre,
    tone,
    audience: t.unknownAudience,
    centralConflict: t.conflict(sourceIdea),
    narrativePromise: t.promise(genre, tone),
    invariants: [t.invariant1, t.invariant2],
    createdAt: new Date().toISOString()
  };
}

export function createUniverseDraft(
  storyDNA: StoryDNA,
  locale: StoryLocale
): UniverseDraft {
  const t = localeText[locale];

  return {
    id: `universe:${crypto.randomUUID()}`,
    status: "CANDIDATE",
    storyDnaId: storyDNA.id,
    title: t.title,
    premise: storyDNA.premise,
    worldRules: [t.worldRule1, t.worldRule2],
    coreQuestions: [t.q1, t.q2, t.q3],
    createdAt: new Date().toISOString()
  };
}

const planRoles: Record<MediaTarget, Record<StoryLocale, string[]>> = {
  PROSE_SHORT: {
    "pt-BR": ["Abertura", "Incidente", "Escalada", "Virada", "Crise", "Clímax", "Consequência", "Fecho"],
    en: ["Opening", "Incident", "Escalation", "Turn", "Crisis", "Climax", "Consequence", "Closure"],
    es: ["Apertura", "Incidente", "Escalada", "Giro", "Crisis", "Clímax", "Consecuencia", "Cierre"]
  },
  NOVEL: {
    "pt-BR": ["Gancho", "Mundo", "Desejo", "Conflito", "Revelação", "Ruptura", "Clímax", "Novo equilíbrio"],
    en: ["Hook", "World", "Desire", "Conflict", "Reveal", "Break", "Climax", "New equilibrium"],
    es: ["Gancho", "Mundo", "Deseo", "Conflicto", "Revelación", "Ruptura", "Clímax", "Nuevo equilibrio"]
  },
  MANGA: {
    "pt-BR": ["Página de impacto", "Setup visual", "Descoberta", "Reação", "Escalada", "Virada de página", "Clímax visual", "Gancho final"],
    en: ["Impact page", "Visual setup", "Discovery", "Reaction", "Escalation", "Page turn", "Visual climax", "Final hook"],
    es: ["Página de impacto", "Setup visual", "Descubrimiento", "Reacción", "Escalada", "Giro de página", "Clímax visual", "Gancho final"]
  },
  WEBTOON: {
    "pt-BR": ["Gancho mobile", "Setup", "Scroll reveal", "Respiro", "Escalada", "Long gap reveal", "Impacto", "Cliffhanger"],
    en: ["Mobile hook", "Setup", "Scroll reveal", "Breath", "Escalation", "Long-gap reveal", "Impact", "Cliffhanger"],
    es: ["Gancho móvil", "Setup", "Scroll reveal", "Respiro", "Escalada", "Long-gap reveal", "Impacto", "Cliffhanger"]
  },
  ANIME_EPISODE: {
    "pt-BR": ["Cold open", "Setup", "Incitante", "Sequência A", "Midpoint", "Sequência B", "Clímax", "Tag final"],
    en: ["Cold open", "Setup", "Inciting beat", "Sequence A", "Midpoint", "Sequence B", "Climax", "End tag"],
    es: ["Cold open", "Setup", "Incitante", "Secuencia A", "Midpoint", "Secuencia B", "Clímax", "Tag final"]
  },
  GAME: {
    "pt-BR": ["Objetivo", "Exploração", "Descoberta", "Escolha", "Consequência", "Obstáculo", "Confronto", "Novo estado"],
    en: ["Goal", "Exploration", "Discovery", "Choice", "Consequence", "Obstacle", "Confrontation", "New state"],
    es: ["Objetivo", "Exploración", "Descubrimiento", "Elección", "Consecuencia", "Obstáculo", "Confrontación", "Nuevo estado"]
  },
  VISUAL_NOVEL: {
    "pt-BR": ["Cena", "Diálogo", "Pista", "Escolha", "Branch A", "Branch B", "Convergência", "Gancho"],
    en: ["Scene", "Dialogue", "Clue", "Choice", "Branch A", "Branch B", "Convergence", "Hook"],
    es: ["Escena", "Diálogo", "Pista", "Elección", "Branch A", "Branch B", "Convergencia", "Gancho"]
  },
  AUDIO_DRAMA: {
    "pt-BR": ["Abertura sonora", "Cena", "Diálogo", "SFX reveal", "Escalada", "Silêncio/virada", "Clímax sonoro", "Fecho"],
    en: ["Sound opening", "Scene", "Dialogue", "SFX reveal", "Escalation", "Silence/turn", "Audio climax", "Closure"],
    es: ["Apertura sonora", "Escena", "Diálogo", "SFX reveal", "Escalada", "Silencio/giro", "Clímax sonoro", "Cierre"]
  }
};

export function compileMediaPlan(
  universe: UniverseDraft,
  target: MediaTarget,
  locale: StoryLocale
): MediaPlan {
  const roles = planRoles[target][locale];

  return {
    id: `media-plan:${crypto.randomUUID()}`,
    status: "CANDIDATE",
    universeId: universe.id,
    target,
    units: roles.map((role, index) => ({
      index: index + 1,
      role,
      objective: universe.premise
    })),
    createdAt: new Date().toISOString()
  };
}
