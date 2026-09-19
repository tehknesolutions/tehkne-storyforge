export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    product: "TEHKNÉ STORYFORGE / Story Lab",
    status: "production-foundation",
    storyforge: "0.6.0",
    tnir: "0.5.0",
    tpir: "0.1.0",
    creatorAuthority: true,
    automaticCanonPromotion: false
  });
}
