import { NextResponse } from "next/server";

type CinematicScene = {
  id: string;
  title: string;
  narration: string;
  mood: string;
  image: string;
  isFactual?: boolean;
};

const beats = [
  {
    title: "Opening Frame",
    mood: "wide establishing shot, silver rain, amber practical lights",
  },
  {
    title: "Rising Motion",
    mood: "tracking shot, kinetic camera movement, teal reflections",
  },
  {
    title: "Revelation",
    mood: "dramatic close up, crimson rim light, deep shadows",
  },
  {
    title: "Final Echo",
    mood: "epic final frame, gold dawn, atmospheric haze",
  },
];

function cleanText(value: unknown) {
  if (typeof value !== "string") return "";

  return value
    .replace(/\s+/g, " ")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 900);
}

function splitIntoStoryBeats(text: string) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length >= 3) {
    return sentences.slice(0, 4);
  }

  const words = text.split(" ").filter(Boolean);
  const chunkSize = Math.max(8, Math.ceil(words.length / 3));
  const chunks = [];

  for (let index = 0; index < words.length; index += chunkSize) {
    chunks.push(words.slice(index, index + chunkSize).join(" "));
  }

  return chunks.length > 1 ? chunks.slice(0, 4) : [text];
}

function buildImageUrl(text: string, mood: string) {
  const prompt = [
    "cinematic still frame",
    "high detail",
    "film grain",
    "volumetric light",
    "anamorphic lens",
    mood,
    text,
  ].join(", ");

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(
    prompt,
  )}?width=1280&height=720&nologo=true&seed=${encodeURIComponent(text)}`;
}

async function fetchImageAsBase64(url: string, fallbackTitle: string): Promise<string> {
  const safeFallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(fallbackTitle).replace(/'/g, "%27").replace(/"/g, "%22")}/1280/720`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return safeFallbackUrl;
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${response.headers.get("content-type") || "image/jpeg"};base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.error("Failed to fetch image securely from backend:", err);
    return safeFallbackUrl;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: unknown };
    const text = cleanText(body.text);

    if (!text) {
      return NextResponse.json(
        { error: "Add a few words to turn into a scene." },
        { status: 400 },
      );
    }

    // Smart detection for factual queries
    const lowerText = text.toLowerCase();

    // Broad factual keyword list covering academic, scientific, and encyclopedic language
    const factualKeywords = [
      // Questions
      'what is', 'what are', 'what was', 'what were',
      'who is', 'who was', 'who were', 'who invented', 'who discovered',
      'where is', 'where was', 'where are', 'where did',
      'when did', 'when was', 'when were', 'when is',
      'how does', 'how do', 'how did', 'how is', 'how many', 'how much',
      'why is', 'why did', 'why does', 'why was',
      'which is', 'which was', 'which country',
      // Academic / encyclopedic language
      'history', 'biography', 'science', 'geography', 'mathematics',
      'discovered', 'invented', 'founded', 'established', 'created by',
      'born in', 'died in', 'born on', 'died on',
      'capital of', 'located in', 'population of',
      'definition', 'define', 'meaning of', 'refers to', 'known as',
      'also known', 'according to', 'research shows', 'studies show',
      'is true', 'in fact', 'historically', 'scientifically',
      'the theory', 'the law of', 'the process of', 'the study of',
      'revolution', 'civilization', 'ancient', 'medieval', 'century',
      'orbit', 'atmosphere', 'gravity', 'element', 'molecule', 'atom',
      'economic', 'political', 'geographic', 'biological', 'chemical',
      'president', 'prime minister', 'monarch', 'emperor', 'kingdom',
      'Nobel', 'Nobel Prize', 'discovered that', 'proved that',
      'published', 'journal', 'university', 'institute', 'laboratory',
    ];

    // Also detect direct questions (starts with interrogative word)
    const startsWithQuestion = /^(who|what|where|when|why|how|which|is|are|was|were|did|does|do|can|could|would|should)\b/i.test(text.trim());

    // Detect factual sentence patterns: "X is/was/are Y" with real-world subjects
    const factualPatterns = [
      /\b(is|are|was|were)\s+(a|an|the)\s+\w+/i,   // "X is a planet"
      /\b\d{4}\b/,                                    // Contains a year (e.g. 1879, 2003)
      /\b(BCE|CE|AD|BC)\b/,                           // Historical dates
      /\b(km|miles|kg|lbs|meters|feet|mph|kph)\b/i,  // Measurements/units
      /\b(percent|%)\b/i,                             // Statistics
      /\b(planet|star|galaxy|species|element|compound|equation|theorem|law|dynasty|empire|republic|nation|continent|ocean|river|mountain)\b/i,
    ];

    const matchesKeyword = factualKeywords.some(kw => lowerText.includes(kw));
    const matchesPattern = factualPatterns.some(pattern => pattern.test(text));
    const isTextFactual = matchesKeyword || startsWithQuestion || matchesPattern;

    const storyBeats = splitIntoStoryBeats(text);
    
    // Process all scenes in parallel on the server
    const scenes: CinematicScene[] = await Promise.all(
      storyBeats.map(async (beatText, index) => {
        const beat = beats[index] ?? beats[beats.length - 1];

        let securedBase64Image = "";
        if (!isTextFactual) {
           const rawImageUrl = buildImageUrl(beatText, beat.mood);
           securedBase64Image = await fetchImageAsBase64(rawImageUrl, beatText);
        }

        return {
          id: `scene-${index + 1}`,
          title: isTextFactual ? "Fact Engine" : beat.title,
          narration:
            storyBeats.length === 1 && !isTextFactual
              ? `In a cinematic vision, ${beatText}`
              : beatText,
          mood: isTextFactual ? "factual mode" : beat.mood,
          image: securedBase64Image,
          isFactual: isTextFactual,
        };
      })
    );

    return NextResponse.json({
      scenes,
      source: text,
    });
  } catch (error) {
    console.error("Error generating cinematic scenes:", error);

    return NextResponse.json(
      { error: "The cinematic engine could not shape that prompt." },
      { status: 500 },
    );
  }
}
