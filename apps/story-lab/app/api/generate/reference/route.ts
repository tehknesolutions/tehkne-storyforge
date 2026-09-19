export const runtime = "nodejs";

const CANON = [
  {
    id: "fact:lantern-hidden",
    subject: "entity:lantern",
    predicate: "wasHiddenBy",
    object: "entity:grandmother"
  },
  {
    id: "fact:tunnel-protected",
    subject: "entity:tunnel",
    predicate: "wasProtectedBy",
    object: "entity:grandmother"
  }
] as const;

const UNIT = {
  unitId: "reference:event:008",
  source: {
    eventIds: ["event:008"],
    sceneId: "scene:mark",
    evidenceIds: ["evidence:grandmother-mark"],
    choiceIds: ["choice:after-grandmother-mark"]
  },
  payload: {
    eventType: "CLUE_DISCOVERY",
    location: "Hidden Tunnel",
    participants: ["Lia", "Leo"],
    canonicalAction:
      "Lia and Leo discover Grandmother's mark inside the tunnel.",
    characterKnowledgeBoundary:
      "The mark links Grandmother to the passage but does not prove that she created the lantern."
  }
};

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    output: {
      type: "object",
      additionalProperties: false,
      properties: {
        kind: { type: "string" },
        contentJson: { type: "string" }
      },
      required: ["kind", "contentJson"]
    },
    assertions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          subject: { type: "string" },
          predicate: { type: "string" },
          objectJson: { type: "string" },
          sourceUnitId: { type: "string" }
        },
        required: ["subject", "predicate", "objectJson", "sourceUnitId"]
      }
    },
    canonProposals: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          subject: { type: "string" },
          predicate: { type: "string" },
          objectJson: { type: "string" },
          sourceUnitId: { type: "string" },
          rationale: { type: "string" }
        },
        required: [
          "subject",
          "predicate",
          "objectJson",
          "sourceUnitId",
          "rationale"
        ]
      }
    }
  },
  required: ["output", "assertions", "canonProposals"]
} as const;

type ProviderAssertion = {
  subject: string;
  predicate: string;
  objectJson: string;
  sourceUnitId: string;
};

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function outputText(response: Record<string, unknown>): string {
  if (typeof response.output_text === "string") return response.output_text;
  const items = Array.isArray(response.output) ? response.output : [];
  const chunks: string[] = [];

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as { content?: unknown }).content)
      ? (item as { content: unknown[] }).content
      : [];

    for (const part of content) {
      if (
        part &&
        typeof part === "object" &&
        (part as { type?: unknown }).type === "output_text" &&
        typeof (part as { text?: unknown }).text === "string"
      ) {
        chunks.push((part as { text: string }).text);
      }
    }
  }

  if (!chunks.length) throw new Error("Provider response contains no output text");
  return chunks.join("");
}

function classify(assertion: ProviderAssertion) {
  const object = parseJson(assertion.objectJson);
  const matching = CANON.filter(
    (fact) =>
      fact.subject === assertion.subject &&
      fact.predicate === assertion.predicate
  );

  if (!matching.length) {
    return {
      classification: "UNSUPPORTED_NEW_FACT" as const,
      assertion: { ...assertion, object }
    };
  }

  const exact = matching.find(
    (fact) => JSON.stringify(fact.object) === JSON.stringify(object)
  );

  if (exact) {
    return {
      classification: "CANON_RESTATEMENT" as const,
      assertion: { ...assertion, object },
      canonFactId: exact.id
    };
  }

  return {
    classification: "CANON_CONTRADICTION" as const,
    assertion: { ...assertion, object },
    conflictsWithFactIds: matching.map((fact) => fact.id)
  };
}

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  const generationEnabled =
    process.env.STORYFORGE_GENERATION_ENABLED === "true";

  if (!apiKey || !generationEnabled) {
    return Response.json(
      {
        error: "PROVIDER_NOT_ENABLED",
        provider: "provider:openai:text",
        missingEnvironment: [
          ...(apiKey ? [] : ["OPENAI_API_KEY"]),
          ...(generationEnabled ? [] : ["STORYFORGE_GENERATION_ENABLED=true"])
        ],
        canonMutationEnabled: false
      },
      { status: 503 }
    );
  }

  const model = process.env.STORYFORGE_OPENAI_MODEL ?? "gpt-5.6";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      store: false,
      input: [
        {
          role: "system",
          content: [
            "You are a TEHKNE STORYFORGE reference media adapter.",
            "CANON facts supplied by the server are authoritative.",
            "Do not silently invent canon.",
            "Any new factual claim must also be returned as a canonProposal.",
            "The mark links Grandmother to the passage but does not prove lantern authorship.",
            "Use the provided sourceUnitId for every assertion.",
            "Encode contentJson and objectJson fields as valid JSON strings."
          ].join("\n")
        },
        {
          role: "user",
          content: JSON.stringify({
            targetMedia: "MANGA",
            task: "Create one concise manga panel realization for the reference unit.",
            authorityContract: {
              mayInventCanon: false,
              newUnapprovedFactsBecome: "CANDIDATE",
              preserveEventCausality: true,
              preserveCharacterKnowledgeBoundaries: true,
              preserveTraceability: true
            },
            canonicalFacts: CANON,
            unit: UNIT
          })
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "storyforge_reference_generation",
          strict: true,
          schema: RESPONSE_SCHEMA
        }
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    return Response.json(
      {
        error: "PROVIDER_REQUEST_FAILED",
        status: response.status,
        detail: errorBody.slice(0, 2000),
        canonMutationEnabled: false
      },
      { status: 502 }
    );
  }

  const raw = (await response.json()) as Record<string, unknown>;
  const parsed = JSON.parse(outputText(raw)) as {
    output: { kind: string; contentJson: string };
    assertions: ProviderAssertion[];
    canonProposals: Array<{
      subject: string;
      predicate: string;
      objectJson: string;
      sourceUnitId: string;
      rationale: string;
    }>;
  };

  const findings = parsed.assertions.map(classify);
  const contradictions = findings.filter(
    (finding) => finding.classification === "CANON_CONTRADICTION"
  );

  const serverProposals = findings
    .filter(
      (finding) => finding.classification === "UNSUPPORTED_NEW_FACT"
    )
    .map((finding, index) => ({
      id: `canon-proposal:server:reference:${index + 1}`,
      subject: finding.assertion.subject,
      predicate: finding.assertion.predicate,
      object: finding.assertion.object,
      sourceUnitId: finding.assertion.sourceUnitId,
      rationale:
        "Server assertion gate classified this generated claim as unsupported by current CANON.",
      authority: "CANDIDATE"
    }));

  const providerProposals = parsed.canonProposals.map((proposal, index) => ({
    id: `canon-proposal:provider:reference:${index + 1}`,
    subject: proposal.subject,
    predicate: proposal.predicate,
    object: parseJson(proposal.objectJson),
    sourceUnitId: proposal.sourceUnitId,
    rationale: proposal.rationale,
    authority: "CANDIDATE"
  }));

  return Response.json({
    provider: "provider:openai:text",
    adapter: "openai:responses:v0.2",
    model,
    storeResponses: false,
    output: {
      kind: parsed.output.kind,
      content: parseJson(parsed.output.contentJson)
    },
    findings,
    canonProposals: [...serverProposals, ...providerProposals],
    reviewRequired:
      contradictions.length > 0 ||
      serverProposals.length > 0 ||
      providerProposals.length > 0,
    canonMutationEnabled: false
  });
}
