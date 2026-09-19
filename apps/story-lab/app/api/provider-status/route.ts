export const runtime = "nodejs";

export async function GET() {
  const configured = Boolean(process.env.OPENAI_API_KEY);

  return Response.json({
    provider: "provider:openai:text",
    adapter: "openai:responses:v0.1",
    configured,
    enabled: configured,
    authority: "CANDIDATE_ONLY",
    missingEnvironment: configured ? [] : ["OPENAI_API_KEY"]
  });
}
