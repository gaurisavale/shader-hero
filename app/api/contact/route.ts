export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const prompt = encodeURIComponent(
      `cinematic, ultra detailed, ${text}`
    );

    const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?seed=${Math.random()}`;

    return Response.json({ image: imageUrl });

  } catch {
    return Response.json({
      image: "https://picsum.photos/500",
    });
  }
}