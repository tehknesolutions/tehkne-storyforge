import type {
  GeneratedAssertion,
  ModelAdapter,
  ModelGenerationRequest,
  ModelGenerationResponse
} from "../model-adapter.js";
import type { CanonProposal, MediaTarget } from "../../tnir/types.js";

interface OpenAIResponsesAdapterOptions {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

interface StructuredGeneration {
  output: {
    kind: string;
    content: unknown;
  };
  assertions: GeneratedAssertion[];
  canonProposals: Array<{
    subject: string;
    predicate: string;
    object: unknown;
    sourceUnitId?: string;
    rationale: string;
  }>;
}

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    output: {
      type: "object",
      additionalProperties: false,
      properties: {
        kind: { type: "string" },
        content: {}
      },
      required: ["kind", "content"]
    },
    assertions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          subject: { type: "string" },
          predicate: { type: "string" },
          object: {},
          sourceUnitId: { type: "string" }
        },
        required: ["subject", "predicate", "object", "sourceUnitId"]
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
          object: {},
          sourceUnitId: { type: "string" },
          rationale: { type: "string" }
        },
        required: ["subject", "predicate", "object", "rationale"]
      }
    }
  },
  required: ["output", "assertions", "canonProposals"]
} as const;

function extractResponseText(response: Record<string, unknown>): string {
  if (typeof response.output_text === "string") return response.output_text;

  const output = Array.isArray(response.output) ? response.output : [];
  const chunks: string[] = [];

  for (const item of output) {
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

  if (!chunks.length) throw new Error("OpenAI response did not contain output text");
  return chunks.join("");
}

export class OpenAIResponsesAdapter implements ModelAdapter {
  readonly id = "openai:responses:v0.1";
  readonly capabilities: MediaTarget[] = [
    "PROSE_SHORT",
    "NOVEL",
    "LIGHT_NOVEL",
    "SCREENPLAY",
    "GAME",
    "VISUAL_NOVEL",
    "COMIC",
    "MANGA",
    "MANHWA",
    "MANHUA",
    "WEBTOON",
    "VERTICAL_COMIC",
    "MOTION_COMIC",
    "ANIMATION",
    "ANIME_SHORT",
    "ANIME_EPISODE",
    "ANIME_SERIES",
    "AUDIO_DRAMA"
  ];

  #apiKey: string;
  #model: string;
  #baseUrl: string;
  #fetch: typeof fetch;

  constructor(options: OpenAIResponsesAdapterOptions = {}) {
    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is required");

    this.#apiKey = apiKey;
    this.#model = options.model ?? process.env.STORYFORGE_OPENAI_MODEL ?? "gpt-5.6";
    this.#baseUrl = options.baseUrl ?? "https://api.openai.com/v1";
    this.#fetch = options.fetchImpl ?? fetch;
  }

  async generate(request: ModelGenerationRequest): Promise<ModelGenerationResponse> {
    if (!this.capabilities.includes(request.targetMedia)) {
      throw new Error(`Unsupported media target: ${request.targetMedia}`);
    }

    const system = [
      "You are a TEHKNE STORYFORGE media realization adapter.",
      "Treat supplied canonical facts as authoritative.",
      "Never silently invent canon.",
      "Any new factual claim not supported by supplied canon must be returned as a canonProposal.",
      "Preserve character knowledge boundaries and event causality.",
      "Every assertion must include a sourceUnitId from the request.",
      "Return only the requested structured output."
    ].join("\n");

    const response = await this.#fetch(`${this.#baseUrl}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.#apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.#model,
        input: [
          { role: "system", content: system },
          {
            role: "user",
            content: JSON.stringify({
              targetMedia: request.targetMedia,
              authorityContract: request.authorityContract,
              canonicalFacts: request.canonicalFacts,
              style: request.style ?? {},
              units: request.units
            })
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "storyforge_generation",
            strict: true,
            schema: RESPONSE_SCHEMA
          }
        }
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI Responses API failed (${response.status}): ${body}`);
    }

    const raw = (await response.json()) as Record<string, unknown>;
    const parsed = JSON.parse(extractResponseText(raw)) as StructuredGeneration;

    const canonProposals: CanonProposal[] = parsed.canonProposals.map(
      (proposal, index) => ({
        id: `canon-proposal:model:${request.requestId}:${index + 1}`,
        subject: proposal.subject,
        predicate: proposal.predicate,
        object: proposal.object as string | number | boolean | Record<string, unknown>,
        authority: "CANDIDATE",
        proposedFromArtifactId: `artifact:model:${request.requestId}`,
        conflictsWithFactIds: [],
        rationale: proposal.rationale
      })
    );

    return {
      requestId: request.requestId,
      adapterId: this.id,
      artifactId: `artifact:model:${request.requestId}`,
      targetMedia: request.targetMedia,
      output: parsed.output,
      assertions: parsed.assertions,
      canonProposals,
      traceability: request.units.map((unit) => unit.source)
    };
  }
}
