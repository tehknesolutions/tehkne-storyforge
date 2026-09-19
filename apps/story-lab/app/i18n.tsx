"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

export type Locale = "pt-BR" | "en" | "es";

export const DEFAULT_LOCALE: Locale = "pt-BR";
export const SUPPORTED_LOCALES: Locale[] = ["pt-BR", "en", "es"];

const STORAGE_KEY = "tehkne:storyforge:locale";

const ptBR = {
  "language.label": "Idioma",
  "language.pt-BR": "PT-BR",
  "language.en": "EN",
  "language.es": "ES",

  "brand.tagline": "Forje uma ideia em um universo.",
  "nav.signIn": "Entrar",
  "nav.audit": "Auditoria",
  "nav.generate": "Gerar",
  "nav.production": "Produção",
  "nav.playProbe": "Teste jogável",
  "nav.review": "Revisar candidatos",
  "nav.canonFirst": "CÂNONE PRIMEIRO",

  "common.back": "← Story Lab",
  "common.loading": "Carregando…",
  "common.unknown": "DESCONHECIDO",
  "common.configured": "CONFIGURADO",
  "common.locked": "BLOQUEADO",
  "common.off": "DESLIGADO",
  "common.no": "Não",
  "common.yes": "Sim",

  "home.eyebrow": "TEHKNÉ NARRATIVE ENGINE",
  "home.heroTitle": "Um universo. Muitas mídias.",
  "home.heroBody":
    "Construa o mundo canônico uma vez e realize-o como prosa, mangá, webtoon, anime, jogo ou outra mídia sem abrir mão da autoridade do criador.",
  "home.autoCanonOff": "Promoção automática ao cânone: DESLIGADA",
  "home.pipelineEyebrow": "PIPELINE",
  "home.pipelineTitle": "Do pensamento à mídia realizada",
  "home.traceable": "Rastreável em cada etapa",
  "home.mediaEyebrow": "COMPILADORES DE MÍDIA",
  "home.mediaTitle": "Destinos nativos, não aliases cosméticos",
  "home.mediaBody":
    "Mangá preserva o ritmo de virada de página. Webtoon preserva o ritmo de rolagem vertical. Anime preserva o tempo dos planos. Formatos interativos preservam escolhas.",
  "home.footer": "Agnóstico de provider · Seguro para o cânone · Transmídia por design",

  "pipeline.01.title": "Intenção",
  "pipeline.01.desc": "Entrada bruta do criador",
  "pipeline.02.title": "Story DNA",
  "pipeline.02.desc": "Tema, tom, promessa",
  "pipeline.03.title": "Canon Graph",
  "pipeline.03.desc": "Verdade do mundo + proveniência",
  "pipeline.04.title": "Character Mind",
  "pipeline.04.desc": "Crenças, objetivos, planos",
  "pipeline.05.title": "Event Graph",
  "pipeline.05.desc": "Causalidade + linhas do tempo",
  "pipeline.06.title": "Resolução",
  "pipeline.06.desc": "Linear ou interativa",
  "pipeline.07.title": "Plano de Mídia",
  "pipeline.07.desc": "Gramática nativa da mídia",
  "pipeline.08.title": "Realização",
  "pipeline.08.desc": "Artefato gerado + afirmações",

  "target.shortStory": "Conto",
  "target.novel": "Romance",
  "target.lightNovel": "Light Novel",
  "target.manga": "Mangá",
  "target.webtoon": "Webtoon",
  "target.manhwa": "Manhwa",
  "target.manhua": "Manhua",
  "target.anime": "Anime",
  "target.game": "Jogo",
  "target.visualNovel": "Visual Novel",
  "target.audioDrama": "Audiodrama",

  "idea.eyebrow": "ALEF / INTENÇÃO",
  "idea.title": "O que você imagina?",
  "idea.body":
    "Comece com um fragmento, premissa, sonho, personagem, cena ou regra de mundo. Nada se torna cânone até você aprovar.",
  "idea.placeholder":
    "Dois irmãos descobrem um objeto que revela uma passagem escondida sob sua casa.",
  "idea.aria": "Ideia criativa",
  "idea.words": "palavras",
  "idea.forge": "Forjar Story DNA",
  "idea.candidate": "CANDIDATO",

  "login.eyebrow": "IDENTIDADE DO CRIADOR",
  "login.title": "Entrar",
  "login.body":
    "A Autoridade do Criador durável exige uma sessão Supabase autenticada.",
  "login.email": "E-mail",
  "login.password": "Senha",
  "login.create": "Criar conta",
  "login.signIn": "Entrar",
  "login.checking": "Verificando backend…",
  "login.sessionActive": "Já existe uma sessão ativa.",
  "login.durableAvailable": "A autenticação durável está disponível.",
  "login.previewMode":
    "Supabase não está configurado. O Story Lab está em modo de prévia.",
  "login.statusError": "Não foi possível ler o status de autenticação.",
  "login.signingIn": "Entrando…",
  "login.creating": "Criando conta…",
  "login.failed": "Falha na autenticação.",
  "login.createdSession": "Conta criada e sessão iniciada.",
  "login.createdConfirm":
    "Conta criada. Verifique seu e-mail caso a confirmação seja obrigatória.",

  "generate.eyebrow": "EXECUÇÃO DE PROVIDER",
  "generate.title": "Geração de Referência",
  "generate.body":
    "Executa uma unidade de referência de Mangá autorizada pelo servidor. A saída do provider permanece fora do cânone e passa pela classificação de afirmações.",
  "generate.loading": "Carregando status do provider…",
  "generate.ready":
    "Provider configurado e explicitamente habilitado. A geração de referência está disponível.",
  "generate.enableLocked":
    "Provider configurado, mas a execução está bloqueada até STORYFORGE_GENERATION_ENABLED=true.",
  "generate.keyMissing":
    "Provider bloqueado: OPENAI_API_KEY não está configurada.",
  "generate.statusError": "Não foi possível ler o status do provider.",
  "generate.generating": "Gerando painel de referência…",
  "generate.authority": "Autoridade",
  "generate.storage": "Armazenamento da resposta do provider",
  "generate.token": "Token de acesso à geração",
  "generate.tokenPlaceholder": "Digite o token de execução do criador",
  "generate.button": "Gerar painel de referência de Mangá",
  "generate.buttonBusy": "Gerando…",

  "production.eyebrow": "T-PIR / PRODUÇÃO",
  "production.title": "Jobs de Produção",
  "production.body":
    "Orquestração da produção de mídia. A persistência durável é obrigatória para release de produção.",
  "production.loading": "Carregando store de produção…",
  "production.durable": "Store de produção durável conectado.",
  "production.preview":
    "Apenas armazenamento de prévia — jobs podem desaparecer quando a instância serverless for reciclada.",
  "production.queue": "Enfileirar job de referência de Mangá",
  "production.createError": "Não foi possível criar o job de produção.",
  "production.empty": "Nenhum job de produção enfileirado.",
  "production.store": "STORE",

  "game.eyebrow": "GAME EXPORT / TESTE DE RUNTIME",
  "game.title": "First Light — branch jogável",
  "game.body":
    "Este protótipo usa a mesma Choice e a mesma semântica de branch de STORYFORGE_GAME_JSON. Candidate Events e CanonProposals ficam excluídos.",
  "game.event1": "Lia e Leo descobrem a Lanterna da Memória.",
  "game.event2": "A lanterna é ativada e reage à parede do porão.",
  "game.event3": "Uma passagem escondida se abre.",
  "game.event4": "Dentro do túnel, eles descobrem a marca da Avó.",
  "game.choiceEyebrow": "ESCOLHA",
  "game.choiceTitle": "O que Lia e Leo devem fazer?",
  "game.descend": "Descer juntos",
  "game.return": "Selar a passagem e voltar",
  "game.descendResult": "Eles seguem juntos para as profundezas.",
  "game.returnResult": "Eles voltam para casa e adiam o mistério.",
  "game.descendState": "StateTransition: intensidade da relação entre irmãos +0,1.",
  "game.returnState": "StateTransition: worldState.mysteryDeferred = true.",
  "game.replay": "Refazer escolha",

  "review.eyebrow": "AUTORIDADE DO CRIADOR",
  "review.title": "Revisão de Cânone",
  "review.body":
    "Afirmações geradas nunca entram automaticamente no cânone. Revise, edite, aprove ou rejeite cada candidato.",
  "review.footnote":
    "Aprovar uma revisão não equivale a fazer commit no CÂNONE. O commit é uma segunda ação explícita e transacional.",
  "review.loading": "Carregando fila de revisão…",
  "review.unavailable": "Fila de revisão indisponível.",
  "review.loaded": "Fila da Autoridade do Criador carregada.",
  "review.empty": "Nenhum CanonProposal aguardando revisão.",
  "review.updateFailed": "Falha ao atualizar a revisão.",
  "review.approvedCommit":
    "Revisão aprovada. Um commit explícito separado ao CÂNONE está disponível.",
  "review.approvedPreview":
    "Revisão aprovada apenas na prévia. Backend durável é obrigatório para commit no CÂNONE.",
  "review.updated": "Estado da revisão atualizado. O CÂNONE permanece inalterado.",
  "review.commitFailed": "Falha no commit ao CÂNONE.",
  "review.committed": "CÂNONE commitado transacionalmente",
  "review.store": "REVIEW STORE",
  "review.subject": "SUJEITO",
  "review.predicate": "PREDICADO",
  "review.object": "OBJETO",
  "review.noRationale": "Nenhuma justificativa fornecida.",
  "review.reject": "Rejeitar",
  "review.edit": "Editar",
  "review.approve": "Aprovar revisão",
  "review.commitEyebrow": "COMMIT EXPLÍCITO AO CÂNONE",
  "review.commitBody":
    "Digite COMMIT TO CANON. Esta é uma ação de autoridade separada e transacional.",
  "review.commitButton": "Commitar proposta aprovada no CÂNONE",
  "review.noItems": "Nenhum item de revisão disponível no momento.",

  "audit.eyebrow": "AUTORIDADE DO CRIADOR / AUDITORIA",
  "audit.title": "Auditoria de Autoridade",
  "audit.body":
    "Decisões de revisão e commits ao CÂNONE são anexados por triggers do banco. A aplicação não possui permissão direta de INSERT neste log.",
  "audit.loading": "Carregando auditoria de autoridade…",
  "audit.unavailable": "Auditoria indisponível.",
  "audit.loaded": "Histórico de autoridade gerado pelo banco.",
  "audit.empty": "Nenhuma transição de autoridade registrada.",
  "audit.error": "Não foi possível carregar a auditoria de autoridade."
} as const;

type TranslationKey = keyof typeof ptBR;

const en: Record<TranslationKey, string> = {
  ...ptBR,
  "language.label": "Language",
  "brand.tagline": "Forge an idea into a universe.",
  "nav.signIn": "Sign in",
  "nav.audit": "Audit",
  "nav.generate": "Generate",
  "nav.production": "Production",
  "nav.playProbe": "Play probe",
  "nav.review": "Review candidates",
  "nav.canonFirst": "CANON FIRST",
  "common.unknown": "UNKNOWN",
  "common.configured": "CONFIGURED",
  "common.locked": "LOCKED",
  "common.off": "OFF",
  "home.heroTitle": "One universe. Many media.",
  "home.heroBody":
    "Build the canonical world once, then realize it as prose, manga, webtoon, anime, game or another medium without surrendering creator authority.",
  "home.autoCanonOff": "Automatic canon promotion: OFF",
  "home.pipelineTitle": "From thought to realized media",
  "home.traceable": "Traceable at every stage",
  "home.mediaEyebrow": "MEDIA COMPILERS",
  "home.mediaTitle": "Native targets, not cosmetic aliases",
  "home.mediaBody":
    "Manga keeps page-turn rhythm. Webtoon keeps vertical-scroll pacing. Anime keeps shot timing. Interactive formats preserve choices.",
  "home.footer": "Provider-agnostic · Canon-safe · Transmedia by design",
  "pipeline.01.title": "Intention",
  "pipeline.01.desc": "Raw creator input",
  "pipeline.02.desc": "Theme, tone, promise",
  "pipeline.03.desc": "World truth + provenance",
  "pipeline.04.desc": "Beliefs, goals, plans",
  "pipeline.05.desc": "Causality + timelines",
  "pipeline.06.title": "Resolution",
  "pipeline.06.desc": "Linear or interactive",
  "pipeline.07.title": "Media Plan",
  "pipeline.07.desc": "Native media grammar",
  "pipeline.08.title": "Realization",
  "pipeline.08.desc": "Generated artifact + assertions",
  "target.shortStory": "Short Story",
  "target.novel": "Novel",
  "target.manga": "Manga",
  "target.game": "Game",
  "target.audioDrama": "Audio Drama",
  "idea.eyebrow": "ALEF / INTENTION",
  "idea.title": "What do you imagine?",
  "idea.body":
    "Start with a fragment, premise, dream, character, scene or world rule. Nothing becomes canon until you approve it.",
  "idea.placeholder":
    "Two siblings discover an object that reveals a hidden passage beneath their home.",
  "idea.aria": "Creative idea",
  "idea.words": "words",
  "idea.forge": "Forge Story DNA",
  "idea.candidate": "CANDIDATE",
  "login.eyebrow": "CREATOR IDENTITY",
  "login.title": "Sign in",
  "login.body":
    "Durable Creator Authority requires an authenticated Supabase session.",
  "login.password": "Password",
  "login.create": "Create account",
  "login.signIn": "Sign in",
  "login.checking": "Checking backend…",
  "login.sessionActive": "A session is already active.",
  "login.durableAvailable": "Durable authentication is available.",
  "login.previewMode":
    "Supabase is not configured. Story Lab is running in preview mode.",
  "login.statusError": "Could not read authentication status.",
  "login.signingIn": "Signing in…",
  "login.creating": "Creating account…",
  "login.failed": "Authentication failed.",
  "login.createdSession": "Account created and session started.",
  "login.createdConfirm":
    "Account created. Check your email if confirmation is required.",
  "generate.eyebrow": "PROVIDER EXECUTION",
  "generate.title": "Reference Generation",
  "generate.body":
    "Executes one server-authorized Manga reference unit. Provider output remains outside canon and passes through assertion classification.",
  "generate.loading": "Provider status is loading…",
  "generate.ready":
    "Provider configured and explicitly enabled. Reference generation is available.",
  "generate.enableLocked":
    "Provider configured but execution is locked until STORYFORGE_GENERATION_ENABLED=true.",
  "generate.keyMissing":
    "Provider locked: OPENAI_API_KEY is not configured.",
  "generate.statusError": "Could not read provider status.",
  "generate.generating": "Generating reference panel…",
  "generate.authority": "Authority",
  "generate.storage": "Provider response storage",
  "generate.token": "Generation access token",
  "generate.tokenPlaceholder": "Enter creator execution token",
  "generate.button": "Generate reference Manga panel",
  "generate.buttonBusy": "Generating…",
  "production.eyebrow": "T-PIR / PRODUCTION",
  "production.title": "Production Jobs",
  "production.body":
    "Media production orchestration. Durable persistence is required before production release.",
  "production.loading": "Loading production store…",
  "production.durable": "Durable production store connected.",
  "production.preview":
    "Preview storage only — jobs may disappear when the serverless instance is recycled.",
  "production.queue": "Queue Manga reference job",
  "production.createError": "Could not create production job.",
  "production.empty": "No production jobs queued.",
  "game.eyebrow": "GAME EXPORT / RUNTIME PROBE",
  "game.title": "First Light — playable branch",
  "game.body":
    "This prototype uses the same reference Choice and branch semantics as STORYFORGE_GAME_JSON. Candidate events and CanonProposals are excluded.",
  "game.event1": "Lia and Leo discover the Memory Lantern.",
  "game.event2": "The lantern activates and reacts to the cellar wall.",
  "game.event3": "A hidden passage opens.",
  "game.event4": "Inside the tunnel they discover Grandmother's mark.",
  "game.choiceEyebrow": "CHOICE",
  "game.choiceTitle": "What should Lia and Leo do?",
  "game.descend": "Descend together",
  "game.return": "Seal the passage and return",
  "game.descendResult": "They continue deeper together.",
  "game.returnResult": "They return to the house and defer the mystery.",
  "game.descendState": "StateTransition: sibling relationship intensity +0.1.",
  "game.returnState": "StateTransition: worldState.mysteryDeferred = true.",
  "game.replay": "Replay choice",
  "review.eyebrow": "CREATOR AUTHORITY",
  "review.title": "Canon Review",
  "review.body":
    "Generated assertions never cross into canon automatically. Review, edit, approve or reject each candidate.",
  "review.footnote":
    "Approving a review is not a CANON commit. Commit is a second explicit transactional action.",
  "review.loading": "Loading review queue…",
  "review.unavailable": "Review queue unavailable.",
  "review.loaded": "Creator Authority queue loaded.",
  "review.empty": "No CanonProposals are waiting for review.",
  "review.updateFailed": "Review update failed.",
  "review.approvedCommit":
    "Review approved. A separate explicit CANON commit is now available.",
  "review.approvedPreview":
    "Review approved in preview only. Durable backend is required for CANON commit.",
  "review.updated": "Review state updated. CANON remains unchanged.",
  "review.commitFailed": "CANON commit failed.",
  "review.committed": "CANON committed transactionally",
  "review.store": "REVIEW STORE",
  "review.subject": "SUBJECT",
  "review.predicate": "PREDICATE",
  "review.object": "OBJECT",
  "review.noRationale": "No rationale supplied.",
  "review.reject": "Reject",
  "review.edit": "Edit",
  "review.approve": "Approve review",
  "review.commitEyebrow": "EXPLICIT CANON COMMIT",
  "review.commitBody":
    "Type COMMIT TO CANON. This is a separate transactional authority action.",
  "review.commitButton": "Commit approved proposal to CANON",
  "review.noItems": "No review items are currently available.",
  "audit.eyebrow": "CREATOR AUTHORITY / AUDIT",
  "audit.title": "Authority Audit",
  "audit.body":
    "Review decisions and CANON commits are appended by database triggers. The application has no direct INSERT permission on this log.",
  "audit.loading": "Loading authority audit…",
  "audit.unavailable": "Audit unavailable.",
  "audit.loaded": "Database-generated authority history.",
  "audit.empty": "No authority transitions recorded yet.",
  "audit.error": "Could not load authority audit."
};

const es: Record<TranslationKey, string> = {
  ...ptBR,
  "language.label": "Idioma",
  "brand.tagline": "Forja una idea en un universo.",
  "nav.signIn": "Entrar",
  "nav.audit": "Auditoría",
  "nav.generate": "Generar",
  "nav.production": "Producción",
  "nav.playProbe": "Prueba jugable",
  "nav.review": "Revisar candidatos",
  "nav.canonFirst": "CANON PRIMERO",
  "common.unknown": "DESCONOCIDO",
  "common.configured": "CONFIGURADO",
  "common.locked": "BLOQUEADO",
  "common.off": "APAGADO",
  "home.heroTitle": "Un universo. Muchos medios.",
  "home.heroBody":
    "Construye el mundo canónico una sola vez y realízalo como prosa, manga, webtoon, anime, juego u otro medio sin renunciar a la autoridad del creador.",
  "home.autoCanonOff": "Promoción automática al canon: APAGADA",
  "home.pipelineTitle": "Del pensamiento al medio realizado",
  "home.traceable": "Trazable en cada etapa",
  "home.mediaEyebrow": "COMPILADORES DE MEDIOS",
  "home.mediaTitle": "Destinos nativos, no alias cosméticos",
  "home.mediaBody":
    "El manga conserva el ritmo de cambio de página. El webtoon conserva el ritmo vertical. El anime conserva el tiempo de los planos. Los formatos interactivos preservan elecciones.",
  "home.footer": "Agnóstico de provider · Seguro para el canon · Transmedia por diseño",
  "pipeline.01.title": "Intención",
  "pipeline.01.desc": "Entrada bruta del creador",
  "pipeline.02.desc": "Tema, tono, promesa",
  "pipeline.03.desc": "Verdad del mundo + procedencia",
  "pipeline.04.desc": "Creencias, objetivos, planes",
  "pipeline.05.desc": "Causalidad + líneas temporales",
  "pipeline.06.title": "Resolución",
  "pipeline.06.desc": "Lineal o interactiva",
  "pipeline.07.title": "Plan de Medios",
  "pipeline.07.desc": "Gramática nativa del medio",
  "pipeline.08.title": "Realización",
  "pipeline.08.desc": "Artefacto generado + afirmaciones",
  "target.shortStory": "Cuento",
  "target.novel": "Novela",
  "target.manga": "Manga",
  "target.game": "Juego",
  "target.audioDrama": "Audio drama",
  "idea.eyebrow": "ALEF / INTENCIÓN",
  "idea.title": "¿Qué imaginas?",
  "idea.body":
    "Empieza con un fragmento, premisa, sueño, personaje, escena o regla del mundo. Nada se vuelve canon hasta que lo apruebes.",
  "idea.placeholder":
    "Dos hermanos descubren un objeto que revela un pasadizo oculto bajo su casa.",
  "idea.aria": "Idea creativa",
  "idea.words": "palabras",
  "idea.forge": "Forjar Story DNA",
  "idea.candidate": "CANDIDATO",
  "login.eyebrow": "IDENTIDAD DEL CREADOR",
  "login.title": "Entrar",
  "login.body":
    "La Autoridad del Creador duradera requiere una sesión Supabase autenticada.",
  "login.password": "Contraseña",
  "login.create": "Crear cuenta",
  "login.signIn": "Entrar",
  "login.checking": "Verificando backend…",
  "login.sessionActive": "Ya existe una sesión activa.",
  "login.durableAvailable": "La autenticación duradera está disponible.",
  "login.previewMode":
    "Supabase no está configurado. Story Lab está en modo de vista previa.",
  "login.statusError": "No se pudo leer el estado de autenticación.",
  "login.signingIn": "Entrando…",
  "login.creating": "Creando cuenta…",
  "login.failed": "Falló la autenticación.",
  "login.createdSession": "Cuenta creada y sesión iniciada.",
  "login.createdConfirm":
    "Cuenta creada. Revisa tu correo si se requiere confirmación.",
  "generate.eyebrow": "EJECUCIÓN DE PROVIDER",
  "generate.title": "Generación de Referencia",
  "generate.body":
    "Ejecuta una unidad de referencia de Manga autorizada por el servidor. La salida del provider permanece fuera del canon y pasa por clasificación de afirmaciones.",
  "generate.loading": "Cargando estado del provider…",
  "generate.ready":
    "Provider configurado y habilitado explícitamente. La generación de referencia está disponible.",
  "generate.enableLocked":
    "Provider configurado, pero la ejecución está bloqueada hasta STORYFORGE_GENERATION_ENABLED=true.",
  "generate.keyMissing":
    "Provider bloqueado: OPENAI_API_KEY no está configurada.",
  "generate.statusError": "No se pudo leer el estado del provider.",
  "generate.generating": "Generando panel de referencia…",
  "generate.authority": "Autoridad",
  "generate.storage": "Almacenamiento de respuesta del provider",
  "generate.token": "Token de acceso a generación",
  "generate.tokenPlaceholder": "Introduce el token de ejecución del creador",
  "generate.button": "Generar panel de referencia de Manga",
  "generate.buttonBusy": "Generando…",
  "production.eyebrow": "T-PIR / PRODUCCIÓN",
  "production.title": "Jobs de Producción",
  "production.body":
    "Orquestación de producción de medios. La persistencia duradera es obligatoria antes del lanzamiento.",
  "production.loading": "Cargando store de producción…",
  "production.durable": "Store de producción duradero conectado.",
  "production.preview":
    "Solo almacenamiento de vista previa — los jobs pueden desaparecer cuando se recicle la instancia serverless.",
  "production.queue": "Encolar job de referencia de Manga",
  "production.createError": "No se pudo crear el job de producción.",
  "production.empty": "No hay jobs de producción en cola.",
  "game.eyebrow": "GAME EXPORT / PRUEBA DE RUNTIME",
  "game.title": "First Light — branch jugable",
  "game.body":
    "Este prototipo usa la misma Choice y la misma semántica de branch de STORYFORGE_GAME_JSON. Candidate Events y CanonProposals quedan excluidos.",
  "game.event1": "Lia y Leo descubren la Linterna de la Memoria.",
  "game.event2": "La linterna se activa y reacciona a la pared del sótano.",
  "game.event3": "Se abre un pasadizo oculto.",
  "game.event4": "Dentro del túnel descubren la marca de la Abuela.",
  "game.choiceEyebrow": "ELECCIÓN",
  "game.choiceTitle": "¿Qué deben hacer Lia y Leo?",
  "game.descend": "Descender juntos",
  "game.return": "Sellar el pasadizo y regresar",
  "game.descendResult": "Continúan juntos hacia las profundidades.",
  "game.returnResult": "Regresan a casa y aplazan el misterio.",
  "game.descendState": "StateTransition: intensidad de la relación entre hermanos +0,1.",
  "game.returnState": "StateTransition: worldState.mysteryDeferred = true.",
  "game.replay": "Repetir elección",
  "review.eyebrow": "AUTORIDAD DEL CREADOR",
  "review.title": "Revisión de Canon",
  "review.body":
    "Las afirmaciones generadas nunca entran automáticamente al canon. Revisa, edita, aprueba o rechaza cada candidato.",
  "review.footnote":
    "Aprobar una revisión no equivale a hacer commit al CANON. El commit es una segunda acción explícita y transaccional.",
  "review.loading": "Cargando cola de revisión…",
  "review.unavailable": "Cola de revisión no disponible.",
  "review.loaded": "Cola de Autoridad del Creador cargada.",
  "review.empty": "No hay CanonProposals esperando revisión.",
  "review.updateFailed": "Falló la actualización de la revisión.",
  "review.approvedCommit":
    "Revisión aprobada. Ya está disponible un commit explícito separado al CANON.",
  "review.approvedPreview":
    "Revisión aprobada solo en vista previa. Se requiere backend duradero para commit al CANON.",
  "review.updated": "Estado de revisión actualizado. El CANON no cambió.",
  "review.commitFailed": "Falló el commit al CANON.",
  "review.committed": "CANON commitado transaccionalmente",
  "review.store": "REVIEW STORE",
  "review.subject": "SUJETO",
  "review.predicate": "PREDICADO",
  "review.object": "OBJETO",
  "review.noRationale": "No se proporcionó justificación.",
  "review.reject": "Rechazar",
  "review.edit": "Editar",
  "review.approve": "Aprobar revisión",
  "review.commitEyebrow": "COMMIT EXPLÍCITO AL CANON",
  "review.commitBody":
    "Escribe COMMIT TO CANON. Esta es una acción de autoridad separada y transaccional.",
  "review.commitButton": "Commitar propuesta aprobada al CANON",
  "review.noItems": "No hay elementos de revisión disponibles.",
  "audit.eyebrow": "AUTORIDAD DEL CREADOR / AUDITORÍA",
  "audit.title": "Auditoría de Autoridad",
  "audit.body":
    "Las decisiones de revisión y commits al CANON son anexados por triggers de base de datos. La aplicación no tiene permiso INSERT directo en este log.",
  "audit.loading": "Cargando auditoría de autoridad…",
  "audit.unavailable": "Auditoría no disponible.",
  "audit.loaded": "Historial de autoridad generado por la base de datos.",
  "audit.empty": "No hay transiciones de autoridad registradas.",
  "audit.error": "No se pudo cargar la auditoría de autoridad."
};

const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  "pt-BR": ptBR,
  en,
  es
};

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
      setLocaleState(stored as Locale);
      document.documentElement.lang = stored;
      return;
    }
    document.documentElement.lang = DEFAULT_LOCALE;
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const t = useCallback(
    (key: TranslationKey) =>
      dictionaries[locale][key] ?? dictionaries[DEFAULT_LOCALE][key] ?? key,
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}
