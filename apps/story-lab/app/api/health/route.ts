export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    product: "TEHKNÉ STORYFORGE / Story Lab",
    status: "foundation",
    version: "0.1.0",
    tnir: "0.6-foundation",
    creatorAuthority: true
  });
}
