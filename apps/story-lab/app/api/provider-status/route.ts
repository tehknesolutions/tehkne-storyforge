export const runtime = "nodejs";

export async function GET() {
  const configured = Boolean(process.env.OPENAI_API_KEY);

  return Response.json({
    provider: "provider:openai:text",
    adapter: "openai:responses:v0.2",
    model: process.env.STORYFORGE_OPENAI_MODEL ?? "gpt-5.6",
    configured,
    enabled: configured,
    authority: "CANDIDATE_ONLY",
    storeResponses: false,
    missingEnvironment: configured ? [] : ["OPENAI_API_KEY"]
  });
}
