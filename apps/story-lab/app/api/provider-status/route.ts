export const runtime = "nodejs";

export async function GET() {
  const configured = Boolean(process.env.OPENAI_API_KEY);
  const generationEnabled =
    process.env.STORYFORGE_GENERATION_ENABLED === "true";
  const accessTokenConfigured = Boolean(
    process.env.STORYFORGE_GENERATION_ACCESS_TOKEN
  );

  return Response.json({
    provider: "provider:openai:text",
    adapter: "openai:responses:v0.2",
    model: process.env.STORYFORGE_OPENAI_MODEL ?? "gpt-5.6",
    configured,
    generationEnabled,
    accessTokenConfigured,
    accessTokenRequired: true,
    enabled: configured && generationEnabled && accessTokenConfigured,
    authority: "CANDIDATE_ONLY",
    storeResponses: false,
    missingEnvironment: [
      ...(configured ? [] : ["OPENAI_API_KEY"]),
      ...(generationEnabled ? [] : ["STORYFORGE_GENERATION_ENABLED=true"]),
      ...(accessTokenConfigured ? [] : ["STORYFORGE_GENERATION_ACCESS_TOKEN"])
    ]
  });
}
