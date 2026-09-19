export type StoryLocale = "pt-BR" | "en" | "es";
export type LocalAuthority = "SOURCE" | "CANDIDATE";

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
  sourceFacts: string[];
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

export type NarrativeCharacter = {
  id: string;
  name: string;
  role: string;
  description: string;
  authority: LocalAuthority;
};

export type NarrativeEvent = {
  id: string;
  index: number;
  function: string;
  title: string;
  summary: string;
  authority: LocalAuthority;
  sourceBasis: string[];
  tension: number;
};

export type NarrativeDraft = {
  id: string;
  status: "CANDIDATE" | "APPROVED_LOCAL";
  universeId: string;
  logline: string;
  characters: NarrativeCharacter[];
  sourceFacts: string[];
  candidateExpansions: string[];
  events: NarrativeEvent[];
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

export type MediaUnit = {
  index: number;
  role: string;
  eventId: string;
  objective: string;
  authority: LocalAuthority;
  productionHint: string;
  dialogueCue?: string;
};

export type MediaPlan = {
  id: string;
  status: "CANDIDATE";
  universeId: string;
  narrativeDraftId: string;
  target: MediaTarget;
  units: MediaUnit[];
  createdAt: string;
};

export type StoryWorkspaceState = {
  version: "0.2.0";
  locale: StoryLocale;
  idea: string;
  storyDNA: StoryDNA | null;
  universe: UniverseDraft | null;
  narrativeDraft: NarrativeDraft | null;
  mediaPlan: MediaPlan | null;
  targetMedia: MediaTarget;
  updatedAt: string;
};

const L = {
  "pt-BR": {
    audience: "A definir pelo criador",
    genreDefault: "Drama / Aventura",
    genreMystery: "Mistério",
    genreHorror: "Horror / Suspense",
    genreFantasy: "Fantasia",
    genreScifi: "Ficção científica / Suspense",
    genreRomance: "Romance",
    genreAdventure: "Aventura",
    toneDark: "Sombrio e tenso",
    toneHope: "Esperançoso",
    toneMystery: "Misterioso",
    toneAdventure: "Aventureiro",
    toneNeutral: "Dramático",
    invariant1: "A premissa original do criador não pode ser alterada silenciosamente.",
    invariant2: "Expansões novas permanecem CANDIDATE até aprovação explícita.",
    universeTitle: "Universo sem título",
    worldRule1: "A premissa original é uma invariante criativa.",
    worldRule2: "Toda expansão precisa declarar proveniência e autoridade.",
    question1: "Qual identidade o protagonista tenta preservar ou recuperar?",
    question2: "Quem se beneficia ou é ameaçado pela verdade central?",
    question3: "Que regra do mundo limita a solução mais óbvia?",
    protagonist: "Protagonista",
    humanInterpreter: "Humano intérprete",
    experimentForce: "Força por trás do experimento",
    cockroach: "A Barata",
    human: "O Humano",
    creatorFact: "Fato fornecido pelo criador"
  },
  en: {
    audience: "To be defined by the creator",
    genreDefault: "Drama / Adventure",
    genreMystery: "Mystery",
    genreHorror: "Horror / Suspense",
    genreFantasy: "Fantasy",
    genreScifi: "Science fiction / Suspense",
    genreRomance: "Romance",
    genreAdventure: "Adventure",
    toneDark: "Dark and tense",
    toneHope: "Hopeful",
    toneMystery: "Mysterious",
    toneAdventure: "Adventurous",
    toneNeutral: "Dramatic",
    invariant1: "The creator's original premise cannot be silently changed.",
    invariant2: "New expansions remain CANDIDATE until explicit approval.",
    universeTitle: "Untitled universe",
    worldRule1: "The original premise is a creative invariant.",
    worldRule2: "Every expansion must declare provenance and authority.",
    question1: "What identity is the protagonist trying to preserve or recover?",
    question2: "Who benefits from or is threatened by the central truth?",
    question3: "What world rule limits the obvious solution?",
    protagonist: "Protagonist",
    humanInterpreter: "Human interpreter",
    experimentForce: "Force behind the experiment",
    cockroach: "The Cockroach",
    human: "The Human",
    creatorFact: "Creator-provided fact"
  },
  es: {
    audience: "A definir por el creador",
    genreDefault: "Drama / Aventura",
    genreMystery: "Misterio",
    genreHorror: "Horror / Suspenso",
    genreFantasy: "Fantasía",
    genreScifi: "Ciencia ficción / Suspenso",
    genreRomance: "Romance",
    genreAdventure: "Aventura",
    toneDark: "Oscuro y tenso",
    toneHope: "Esperanzador",
    toneMystery: "Misterioso",
    toneAdventure: "Aventurero",
    toneNeutral: "Dramático",
    invariant1: "La premisa original del creador no puede cambiarse silenciosamente.",
    invariant2: "Las nuevas expansiones permanecen CANDIDATE hasta aprobación explícita.",
    universeTitle: "Universo sin título",
    worldRule1: "La premisa original es una invariante creativa.",
    worldRule2: "Toda expansión debe declarar procedencia y autoridad.",
    question1: "¿Qué identidad intenta preservar o recuperar el protagonista?",
    question2: "¿Quién se beneficia o se siente amenazado por la verdad central?",
    question3: "¿Qué regla del mundo limita la solución más obvia?",
    protagonist: "Protagonista",
    humanInterpreter: "Humano intérprete",
    experimentForce: "Fuerza detrás del experimento",
    cockroach: "La Cucaracha",
    human: "El Humano",
    creatorFact: "Hecho aportado por el creador"
  }
} as const;

function normalize(value: string) {
  return value.toLocaleLowerCase("pt-BR");
}

function includesAny(text: string, values: string[]) {
  return values.some((value) => text.includes(value));
}

function signals(idea: string) {
  const text = normalize(idea);
  return {
    cockroach: includesAny(text, ["barata", "cockroach", "cucaracha"]),
    human: includesAny(text, ["ser humano", "humano", "human"]),
    understanding: includesAny(text, [
      "consegue entende",
      "consegue entendê",
      "pode entender",
      "can understand",
      "understands",
      "puede entender",
      "entiende"
    ]),
    experiment: includesAny(text, [
      "experimento",
      "experiment",
      "científico",
      "cientifico",
      "scientific",
      "científico"
    ]),
    mindTransfer: includesAny(text, [
      "mente",
      "mind",
      "conciencia",
      "consciência",
      "transferida",
      "transferido",
      "transferred",
      "transfer"
    ]),
    hiddenIdentity: includesAny(text, [
      "na verdade",
      "actually",
      "en realidad",
      "identidade",
      "identity"
    ]),
    mystery: includesAny(text, [
      "mistério",
      "misterio",
      "mystery",
      "segredo",
      "secret",
      "oculto",
      "hidden"
    ])
  };
}

function inferGenre(idea: string, locale: StoryLocale) {
  const t = L[locale];
  const s = signals(idea);
  const text = normalize(idea);

  if (s.experiment || s.mindTransfer) return t.genreScifi;
  if (includesAny(text, ["terror", "horror", "medo", "fear", "miedo"])) return t.genreHorror;
  if (s.mystery || s.hiddenIdentity) return t.genreMystery;
  if (includesAny(text, ["magia", "magic", "mágic", "dragão", "dragon"])) return t.genreFantasy;
  if (includesAny(text, ["amor", "love", "romance", "paix", "beso"])) return t.genreRomance;
  if (includesAny(text, ["aventura", "adventure", "jornada", "journey"])) return t.genreAdventure;
  return t.genreDefault;
}

function inferTone(idea: string, locale: StoryLocale) {
  const t = L[locale];
  const text = normalize(idea);
  const s = signals(idea);

  if (includesAny(text, ["terror", "horror", "morte", "death", "sangue", "blood"])) return t.toneDark;
  if (s.experiment || s.mindTransfer || s.hiddenIdentity || s.mystery) return t.toneMystery;
  if (includesAny(text, ["esperança", "hope", "salvar", "save"])) return t.toneHope;
  if (includesAny(text, ["aventura", "adventure", "jornada", "journey"])) return t.toneAdventure;
  return t.toneNeutral;
}

function inferThemes(idea: string, locale: StoryLocale) {
  const s = signals(idea);
  const text = normalize(idea);
  const labels = {
    "pt-BR": {
      identity: "Identidade",
      humanity: "Condição humana",
      science: "Experimentação científica",
      communication: "Comunicação entre mundos",
      discovery: "Descoberta",
      survival: "Sobrevivência",
      family: "Família",
      power: "Poder"
    },
    en: {
      identity: "Identity",
      humanity: "Human condition",
      science: "Scientific experimentation",
      communication: "Communication across worlds",
      discovery: "Discovery",
      survival: "Survival",
      family: "Family",
      power: "Power"
    },
    es: {
      identity: "Identidad",
      humanity: "Condición humana",
      science: "Experimentación científica",
      communication: "Comunicación entre mundos",
      discovery: "Descubrimiento",
      survival: "Supervivencia",
      family: "Familia",
      power: "Poder"
    }
  }[locale];

  const out: string[] = [];
  const add = (value: string) => {
    if (!out.includes(value)) out.push(value);
  };

  if (s.mindTransfer || s.hiddenIdentity) add(labels.identity);
  if (s.human && (s.cockroach || s.mindTransfer)) add(labels.humanity);
  if (s.experiment) add(labels.science);
  if (s.understanding) add(labels.communication);
  if (includesAny(text, ["descobre", "discover", "descubr", "segredo", "secret"])) add(labels.discovery);
  if (includesAny(text, ["sobreviv", "surviv", "fugir", "escape"])) add(labels.survival);
  if (includesAny(text, ["irmão", "irmao", "sibling", "family", "familia", "mãe", "pai"])) add(labels.family);
  if (includesAny(text, ["poder", "power", "controle", "control"])) add(labels.power);
  if (!out.length) add(labels.discovery);

  return out.slice(0, 5);
}

function extractSourceFacts(idea: string, locale: StoryLocale) {
  const s = signals(idea);
  const facts: string[] = [];
  const pt = locale === "pt-BR";
  const en = locale === "en";

  if (s.cockroach) {
    facts.push(
      pt ? "Existe uma barata central para a premissa."
      : en ? "A cockroach is central to the premise."
      : "Una cucaracha es central en la premisa."
    );
  }
  if (s.understanding && s.human) {
    facts.push(
      pt ? "Existe um ser humano capaz de entender a barata."
      : en ? "There is a human capable of understanding the cockroach."
      : "Existe un ser humano capaz de entender a la cucaracha."
    );
  }
  if (s.experiment) {
    facts.push(
      pt ? "A situação resulta de um experimento científico."
      : en ? "The situation results from a scientific experiment."
      : "La situación resulta de un experimento científico."
    );
  }
  if (s.mindTransfer && s.cockroach && s.human) {
    facts.push(
      pt ? "A mente de um ser humano foi transferida para a barata."
      : en ? "A human mind was transferred into the cockroach."
      : "La mente de un ser humano fue transferida a la cucaracha."
    );
  }

  if (!facts.length) facts.push(idea.trim());
  return facts;
}

export function forgeStoryDNA(idea: string, locale: StoryLocale): StoryDNA {
  const sourceIdea = idea.trim();
  const t = L[locale];
  const s = signals(sourceIdea);
  const genre = inferGenre(sourceIdea, locale);
  const tone = inferTone(sourceIdea, locale);

  const centralConflict =
    s.mindTransfer && s.cockroach
      ? locale === "pt-BR"
        ? "Uma consciência humana presa no corpo de uma barata precisa compreender sua nova existência e a origem do experimento, enquanto depende de um raro humano capaz de entendê-la."
        : locale === "en"
          ? "A human consciousness trapped in a cockroach body must understand its new existence and the experiment behind it while depending on a rare human who can understand it."
          : "Una conciencia humana atrapada en el cuerpo de una cucaracha debe comprender su nueva existencia y el experimento que la originó mientras depende de un raro humano capaz de entenderla."
      : locale === "pt-BR"
        ? `O protagonista precisa transformar a situação inicial em um objetivo claro sem perder a premissa original: ${sourceIdea}`
        : locale === "en"
          ? `The protagonist must turn the initial situation into a clear goal without losing the original premise: ${sourceIdea}`
          : `El protagonista debe transformar la situación inicial en un objetivo claro sin perder la premisa original: ${sourceIdea}`;

  const narrativePromise =
    locale === "pt-BR"
      ? `Explorar ${inferThemes(sourceIdea, locale).join(", ").toLowerCase()} através de uma progressão causal em ${genre.toLowerCase()}, com tom ${tone.toLowerCase()}.`
      : locale === "en"
        ? `Explore ${inferThemes(sourceIdea, locale).join(", ").toLowerCase()} through a causal ${genre.toLowerCase()} progression with a ${tone.toLowerCase()} tone.`
        : `Explorar ${inferThemes(sourceIdea, locale).join(", ").toLowerCase()} mediante una progresión causal de ${genre.toLowerCase()} con tono ${tone.toLowerCase()}.`;

  return {
    id: `story-dna:${crypto.randomUUID()}`,
    status: "CANDIDATE",
    sourceIdea,
    locale,
    premise: sourceIdea,
    themes: inferThemes(sourceIdea, locale),
    genre,
    tone,
    audience: t.audience,
    centralConflict,
    narrativePromise,
    invariants: [t.invariant1, t.invariant2],
    sourceFacts: extractSourceFacts(sourceIdea, locale),
    createdAt: new Date().toISOString()
  };
}

export function createUniverseDraft(storyDNA: StoryDNA, locale: StoryLocale): UniverseDraft {
  const t = L[locale];
  const s = signals(storyDNA.sourceIdea);

  const worldRules: string[] = [t.worldRule1, t.worldRule2];
  if (s.mindTransfer && s.cockroach) {
    worldRules.push(
      locale === "pt-BR"
        ? "A consciência humana pode existir em um corpo não humano como consequência do experimento — mecanismo exato ainda não definido."
        : locale === "en"
          ? "Human consciousness can exist in a non-human body as a consequence of the experiment — exact mechanism remains undefined."
          : "La conciencia humana puede existir en un cuerpo no humano como consecuencia del experimento — el mecanismo exacto aún no está definido."
    );
  }
  if (s.understanding) {
    worldRules.push(
      locale === "pt-BR"
        ? "A comunicação entre a barata e pelo menos um humano é possível; a causa dessa compreensão ainda é uma lacuna."
        : locale === "en"
          ? "Communication between the cockroach and at least one human is possible; the cause of that understanding remains unresolved."
          : "La comunicación entre la cucaracha y al menos un humano es posible; la causa de esa comprensión sigue sin resolverse."
    );
  }

  return {
    id: `universe:${crypto.randomUUID()}`,
    status: "CANDIDATE",
    storyDnaId: storyDNA.id,
    title: t.universeTitle,
    premise: storyDNA.premise,
    worldRules,
    coreQuestions: [t.question1, t.question2, t.question3],
    createdAt: new Date().toISOString()
  };
}

function genericEventText(
  premise: string,
  locale: StoryLocale
): Array<[string, string, string, LocalAuthority, number]> {
  if (locale === "en") {
    return [
      ["Hook", "The impossible situation", `Open on the most unusual image or consequence implied by the premise: ${premise}`, "SOURCE", 2],
      ["Contact", "First undeniable contact", "Make another character recognize that the central phenomenon is real, not coincidence.", "CANDIDATE", 3],
      ["Proof", "Evidence changes the reading", "Reveal a piece of evidence that forces the characters to reinterpret what is happening.", "CANDIDATE", 4],
      ["Goal", "A temporary alliance", "The protagonist forms a concrete short-term goal and chooses who to trust.", "CANDIDATE", 4],
      ["Complication", "The cost appears", "Introduce a consequence that makes the goal harder and raises personal stakes.", "CANDIDATE", 6],
      ["Reveal", "The hidden cause surfaces", "Connect a previously unexplained element to the premise's central secret.", "CANDIDATE", 7],
      ["Crisis", "Identity under pressure", "Force the protagonist to choose between safety and learning the truth.", "CANDIDATE", 9],
      ["Cliffhanger", "A new fact changes everything", "End on a specific clue that opens the next causal question.", "CANDIDATE", 10]
    ];
  }
  if (locale === "es") {
    return [
      ["Gancho", "La situación imposible", `Abrir con la imagen o consecuencia más inusual de la premisa: ${premise}`, "SOURCE", 2],
      ["Contacto", "Primer contacto innegable", "Hacer que otro personaje reconozca que el fenómeno central es real y no una coincidencia.", "CANDIDATE", 3],
      ["Prueba", "La evidencia cambia la lectura", "Revelar una evidencia que obligue a reinterpretar lo que ocurre.", "CANDIDATE", 4],
      ["Objetivo", "Una alianza temporal", "El protagonista forma un objetivo concreto y decide en quién confiar.", "CANDIDATE", 4],
      ["Complicación", "Aparece el costo", "Introducir una consecuencia que dificulte el objetivo y eleve las apuestas personales.", "CANDIDATE", 6],
      ["Revelación", "La causa oculta emerge", "Conectar un elemento inexplicado con el secreto central de la premisa.", "CANDIDATE", 7],
      ["Crisis", "Identidad bajo presión", "Obligar al protagonista a elegir entre seguridad y conocer la verdad.", "CANDIDATE", 9],
      ["Cliffhanger", "Un nuevo hecho lo cambia todo", "Cerrar con una pista específica que abra la siguiente pregunta causal.", "CANDIDATE", 10]
    ];
  }
  return [
    ["Gancho", "A situação impossível", `Abrir com a imagem ou consequência mais incomum contida na premissa: ${premise}`, "SOURCE", 2],
    ["Contato", "Primeiro contato inegável", "Fazer outro personagem reconhecer que o fenômeno central é real, não coincidência.", "CANDIDATE", 3],
    ["Prova", "A evidência muda a leitura", "Revelar uma evidência que obrigue os personagens a reinterpretar o que está acontecendo.", "CANDIDATE", 4],
    ["Objetivo", "Uma aliança temporária", "O protagonista forma um objetivo concreto de curto prazo e decide em quem confiar.", "CANDIDATE", 4],
    ["Complicação", "O custo aparece", "Introduzir uma consequência que dificulte o objetivo e aumente os riscos pessoais.", "CANDIDATE", 6],
    ["Revelação", "A causa oculta emerge", "Conectar um elemento antes inexplicado ao segredo central da premissa.", "CANDIDATE", 7],
    ["Crise", "Identidade sob pressão", "Forçar o protagonista a escolher entre segurança e descobrir a verdade.", "CANDIDATE", 9],
    ["Cliffhanger", "Um novo fato muda tudo", "Fechar com uma pista específica que abra a próxima pergunta causal.", "CANDIDATE", 10]
  ];
}

function cockroachExperimentEvents(
  locale: StoryLocale
): Array<[string, string, string, LocalAuthority, number]> {
  if (locale === "en") {
    return [
      ["Hook", "A human thought inside an insect body", "Open at floor level: the cockroach reacts with unmistakably human intention while a nearby human notices something impossible.", "SOURCE", 2],
      ["Contact", "He understands it", "The human realizes the cockroach is not behaving randomly and can be understood as if it were trying to speak.", "SOURCE", 3],
      ["Proof", "No ordinary insect knows this", "The cockroach demonstrates memory, reasoning or knowledge that an ordinary insect could not possess.", "CANDIDATE", 5],
      ["Goal", "Find out who it was", "The pair form a fragile alliance: identify the human consciousness inside the cockroach and reconstruct what happened.", "CANDIDATE", 5],
      ["Complication", "The body is a prison", "The cockroach's physical limits turn ordinary human environments into lethal obstacles and make communication fragile.", "CANDIDATE", 6],
      ["Reveal", "The experiment is real", "Evidence ties the transferred mind directly to a scientific experiment rather than mutation, magic or coincidence.", "SOURCE", 8],
      ["Crisis", "The experiment may not be over", "A clue suggests the transfer was part of something larger, putting both the cockroach and the human who understands it at risk.", "CANDIDATE", 9],
      ["Cliffhanger", "A fragment of the old identity returns", "The cockroach remembers one concrete detail from its former human life — enough to identify a person, place or project in the next episode.", "CANDIDATE", 10]
    ];
  }
  if (locale === "es") {
    return [
      ["Gancho", "Un pensamiento humano dentro de un insecto", "Abrir a ras del suelo: la cucaracha actúa con una intención inequívocamente humana mientras un humano cercano percibe algo imposible.", "SOURCE", 2],
      ["Contacto", "Él puede entenderla", "El humano comprende que la cucaracha no actúa al azar y que puede entenderla como si intentara hablar.", "SOURCE", 3],
      ["Prueba", "Ningún insecto normal sabe esto", "La cucaracha demuestra memoria, razonamiento o conocimiento imposible para un insecto común.", "CANDIDATE", 5],
      ["Objetivo", "Descubrir quién era", "Ambos forman una alianza frágil: identificar la conciencia humana dentro de la cucaracha y reconstruir lo ocurrido.", "CANDIDATE", 5],
      ["Complicación", "El cuerpo es una prisión", "Las limitaciones físicas de la cucaracha convierten espacios humanos normales en obstáculos letales y vuelven frágil la comunicación.", "CANDIDATE", 6],
      ["Revelación", "El experimento es real", "Una evidencia conecta directamente la mente transferida con un experimento científico, no con mutación, magia o coincidencia.", "SOURCE", 8],
      ["Crisis", "El experimento puede continuar", "Una pista sugiere que la transferencia era parte de algo mayor, poniendo en riesgo a la cucaracha y al humano que puede entenderla.", "CANDIDATE", 9],
      ["Cliffhanger", "Regresa un fragmento de la antigua identidad", "La cucaracha recuerda un detalle concreto de su vida humana anterior, suficiente para identificar a una persona, lugar o proyecto en el próximo episodio.", "CANDIDATE", 10]
    ];
  }
  return [
    ["Gancho", "Um pensamento humano dentro de um inseto", "Abrir no nível do chão: a barata reage com intenção inequivocamente humana enquanto um ser humano próximo percebe algo impossível.", "SOURCE", 2],
    ["Contato", "Ele consegue entendê-la", "O humano percebe que a barata não age ao acaso e consegue entendê-la como se ela estivesse tentando falar.", "SOURCE", 3],
    ["Prova", "Nenhum inseto comum sabe disso", "A barata demonstra memória, raciocínio ou conhecimento que um inseto comum jamais poderia possuir.", "CANDIDATE", 5],
    ["Objetivo", "Descobrir quem ela era", "Os dois formam uma aliança frágil: identificar a consciência humana dentro da barata e reconstruir o que aconteceu.", "CANDIDATE", 5],
    ["Complicação", "O corpo é uma prisão", "As limitações físicas da barata transformam ambientes humanos comuns em obstáculos letais e tornam a comunicação frágil.", "CANDIDATE", 6],
    ["Revelação", "O experimento é real", "Uma evidência liga diretamente a mente transferida a um experimento científico, e não a mutação, magia ou coincidência.", "SOURCE", 8],
    ["Crise", "O experimento pode não ter terminado", "Uma pista sugere que a transferência fazia parte de algo maior, colocando a barata e o humano que a entende em risco.", "CANDIDATE", 9],
    ["Cliffhanger", "Um fragmento da identidade antiga retorna", "A barata se lembra de um detalhe concreto da vida humana anterior — suficiente para identificar uma pessoa, lugar ou projeto no próximo episódio.", "CANDIDATE", 10]
  ];
}

export function createNarrativeDraft(
  storyDNA: StoryDNA,
  universe: UniverseDraft,
  locale: StoryLocale
): NarrativeDraft {
  const s = signals(storyDNA.sourceIdea);
  const t = L[locale];
  const characters: NarrativeCharacter[] = [];

  if (s.cockroach) {
    characters.push({
      id: "character:cockroach",
      name: t.cockroach,
      role: t.protagonist,
      description:
        s.mindTransfer
          ? locale === "pt-BR"
            ? "Barata que carrega uma mente originalmente humana como resultado de um experimento científico."
            : locale === "en"
              ? "A cockroach carrying an originally human mind as the result of a scientific experiment."
              : "Una cucaracha que porta una mente originalmente humana como resultado de un experimento científico."
          : storyDNA.premise,
      authority: "SOURCE"
    });
  }

  if (s.human && s.understanding) {
    characters.push({
      id: "character:interpreter-human",
      name: t.human,
      role: t.humanInterpreter,
      description:
        locale === "pt-BR"
          ? "Ser humano capaz de compreender a barata; identidade, motivo e origem dessa capacidade ainda não foram definidos pelo criador."
          : locale === "en"
            ? "A human capable of understanding the cockroach; identity, motive and source of that ability have not yet been defined by the creator."
            : "Un humano capaz de comprender a la cucaracha; su identidad, motivo y origen de esa capacidad aún no fueron definidos por el creador.",
      authority: "SOURCE"
    });
  }

  if (s.experiment) {
    characters.push({
      id: "character:experiment-force",
      name: t.experimentForce,
      role:
        locale === "pt-BR"
          ? "Oposição potencial"
          : locale === "en"
            ? "Potential opposition"
            : "Oposición potencial",
      description:
        locale === "pt-BR"
          ? "Pessoa, equipe ou instituição ainda não definida que realizou ou controlou o experimento."
          : locale === "en"
            ? "An as-yet undefined person, team or institution that performed or controlled the experiment."
            : "Persona, equipo o institución aún no definida que realizó o controló el experimento.",
      authority: "CANDIDATE"
    });
  }

  if (!characters.length) {
    characters.push({
      id: "character:protagonist",
      name: t.protagonist,
      role: t.protagonist,
      description: storyDNA.premise,
      authority: "CANDIDATE"
    });
  }

  const specific = s.cockroach && s.human && s.understanding && s.experiment && s.mindTransfer;
  const templates = specific
    ? cockroachExperimentEvents(locale)
    : genericEventText(storyDNA.premise, locale);

  const events = templates.map(([fn, title, summary, authority, tension], index) => ({
    id: `event:local:${index + 1}`,
    index: index + 1,
    function: fn,
    title,
    summary,
    authority,
    sourceBasis:
      authority === "SOURCE"
        ? storyDNA.sourceFacts
        : [storyDNA.centralConflict],
    tension
  }));

  const candidateExpansions = events
    .filter((event) => event.authority === "CANDIDATE")
    .map((event) => event.summary);

  return {
    id: `narrative-draft:${crypto.randomUUID()}`,
    status: "CANDIDATE",
    universeId: universe.id,
    logline: storyDNA.centralConflict,
    characters,
    sourceFacts: storyDNA.sourceFacts,
    candidateExpansions,
    events,
    createdAt: new Date().toISOString()
  };
}

const mediaRoles: Record<MediaTarget, Record<StoryLocale, string[]>> = {
  PROSE_SHORT: {
    "pt-BR": ["Abertura", "Incidente", "Descoberta", "Decisão", "Escalada", "Revelação", "Clímax", "Fecho"],
    en: ["Opening", "Incident", "Discovery", "Decision", "Escalation", "Reveal", "Climax", "Closure"],
    es: ["Apertura", "Incidente", "Descubrimiento", "Decisión", "Escalada", "Revelación", "Clímax", "Cierre"]
  },
  NOVEL: {
    "pt-BR": ["Gancho", "Mundo", "Pergunta", "Meta", "Pressão", "Verdade parcial", "Crise", "Novo horizonte"],
    en: ["Hook", "World", "Question", "Goal", "Pressure", "Partial truth", "Crisis", "New horizon"],
    es: ["Gancho", "Mundo", "Pregunta", "Meta", "Presión", "Verdad parcial", "Crisis", "Nuevo horizonte"]
  },
  MANGA: {
    "pt-BR": ["Página de impacto", "Setup visual", "Prova", "Reação", "Escalada", "Virada de página", "Impacto máximo", "Gancho final"],
    en: ["Impact page", "Visual setup", "Proof", "Reaction", "Escalation", "Page turn", "Maximum impact", "Final hook"],
    es: ["Página de impacto", "Setup visual", "Prueba", "Reacción", "Escalada", "Giro de página", "Impacto máximo", "Gancho final"]
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
    "pt-BR": ["Abertura sonora", "Cena", "Voz", "Pista sonora", "Escalada", "Silêncio/virada", "Clímax sonoro", "Fecho"],
    en: ["Sound opening", "Scene", "Voice", "Audio clue", "Escalation", "Silence/turn", "Audio climax", "Closure"],
    es: ["Apertura sonora", "Escena", "Voz", "Pista sonora", "Escalada", "Silencio/giro", "Clímax sonoro", "Cierre"]
  }
};

function productionHint(target: MediaTarget, role: string, locale: StoryLocale) {
  if (target === "WEBTOON") {
    return locale === "pt-BR"
      ? `${role}: composição vertical mobile; usar espaço/scroll como parte do timing e evitar repetir a mesma informação em painéis consecutivos.`
      : locale === "en"
        ? `${role}: mobile vertical composition; use spacing/scroll as timing and avoid repeating the same information in consecutive panels.`
        : `${role}: composición vertical móvil; usar el espacio/scroll como timing y evitar repetir la misma información en paneles consecutivos.`;
  }
  if (target === "MANGA") {
    return locale === "pt-BR"
      ? `${role}: organizar a revelação para leitura de página e virada; cada página precisa avançar informação ou emoção.`
      : locale === "en"
        ? `${role}: stage the reveal for page reading and page turns; every page must advance information or emotion.`
        : `${role}: organizar la revelación para lectura y giro de página; cada página debe avanzar información o emoción.`;
  }
  if (target === "ANIME_EPISODE") {
    return locale === "pt-BR"
      ? `${role}: pensar em ação visível, atuação, montagem, som e duração — não apenas texto explicativo.`
      : locale === "en"
        ? `${role}: think in visible action, performance, editing, sound and duration — not only explanatory text.`
        : `${role}: pensar en acción visible, actuación, montaje, sonido y duración — no solo texto explicativo.`;
  }
  if (target === "GAME" || target === "VISUAL_NOVEL") {
    return locale === "pt-BR"
      ? `${role}: converter o beat em estado, decisão, consequência ou informação jogável.`
      : locale === "en"
        ? `${role}: convert the beat into state, decision, consequence or playable information.`
        : `${role}: convertir el beat en estado, decisión, consecuencia o información jugable.`;
  }
  return locale === "pt-BR"
    ? `${role}: desenvolver o beat sem perder causalidade com o evento anterior.`
    : locale === "en"
      ? `${role}: develop the beat while preserving causality with the previous event.`
      : `${role}: desarrollar el beat preservando la causalidad con el evento anterior.`;
}

export function compileMediaPlan(
  universe: UniverseDraft,
  narrativeDraft: NarrativeDraft,
  target: MediaTarget,
  locale: StoryLocale
): MediaPlan {
  const roles = mediaRoles[target][locale];

  return {
    id: `media-plan:${crypto.randomUUID()}`,
    status: "CANDIDATE",
    universeId: universe.id,
    narrativeDraftId: narrativeDraft.id,
    target,
    units: narrativeDraft.events.map((event, index) => ({
      index: index + 1,
      role: roles[index] ?? event.function,
      eventId: event.id,
      objective: event.summary,
      authority: event.authority,
      productionHint: productionHint(target, roles[index] ?? event.function, locale),
      dialogueCue:
        event.authority === "SOURCE"
          ? locale === "pt-BR"
            ? "Diálogo deve revelar somente informação já sustentada pela premissa."
            : locale === "en"
              ? "Dialogue should reveal only information already supported by the premise."
              : "El diálogo debe revelar solo información ya sustentada por la premisa."
          : locale === "pt-BR"
            ? "Expansão candidata: diálogo editável pelo criador antes de qualquer promoção."
            : locale === "en"
              ? "Candidate expansion: dialogue remains editable before any promotion."
              : "Expansión candidata: el diálogo sigue editable antes de cualquier promoción."
    })),
    createdAt: new Date().toISOString()
  };
}
