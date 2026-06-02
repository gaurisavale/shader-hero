"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import ParticleBackground from "@/components/ui/particles";

type CinematicScene = {
  id: string;
  title: string;
  narration: string;
  mood: string;
  image: string;
  isFactual?: boolean;
};

type GenerationState = "idle" | "generating" | "ready" | "error";

const samplePrompts = [
  "A lighthouse keeper discovers a signal from beneath the frozen sea.",
  "A botanist walks through a city where every memory blooms as light.",
  "An astronaut returns home to find the moon following her through town.",
];

const posterImage =
  "https://image.pollinations.ai/prompt/cinematic%20film%20still%2C%20wide%20shot%2C%20rain%20on%20glass%2C%20warm%20spotlight%2C%20teal%20reflections%2C%20anamorphic%20lens%2C%20volumetric%20light%2C%20high%20detail?width=1280&height=720&nologo=true&seed=shader-hero-poster";

export default function Hero() {
  const [input, setInput] = useState(samplePrompts[0]);
  const [scenes, setScenes] = useState<CinematicScene[]>([]);
  const [activeScene, setActiveScene] = useState(0);
  const [state, setState] = useState<GenerationState>("idle");
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(0.95);
  const [voiceName, setVoiceName] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [spokenWord, setSpokenWord] = useState(-1);
  const [imageFailed, setImageFailed] = useState(false);
  const cancelPlaybackRef = useRef(false);

  const active = scenes[activeScene];
  const words = useMemo(() => active?.narration.split(/\s+/) ?? [], [active]);
  const frameImage = imageFailed ? posterImage : active?.image ?? posterImage;
  const frameAlt = active?.title ?? "Cinematic poster frame";
  const storyboardSlots = useMemo<(CinematicScene | null)[]>(
    () => (scenes.length ? scenes : Array.from({ length: 4 }, () => null)),
    [scenes],
  );

  useEffect(() => {
    setImageFailed(false);
  }, [active?.image]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      if (!voiceName && availableVoices.length > 0) {
        const preferredVoice =
          availableVoices.find((voice) => voice.lang.startsWith("en")) ??
          availableVoices[0];
        setVoiceName(preferredVoice.name);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [voiceName]);

  async function generateScenes(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || state === "generating") return;

    window.speechSynthesis.cancel();
    cancelPlaybackRef.current = true;
    setIsPlaying(false);
    setSpokenWord(-1);
    setActiveScene(0);
    setState("generating");
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmedInput }),
      });

      const payload = (await response.json()) as {
        scenes?: CinematicScene[];
        error?: string;
      };

      if (!response.ok || !payload.scenes?.length) {
        throw new Error(payload.error ?? "No scenes were generated.");
      }

      setScenes(payload.scenes);
      setState("ready");
    } catch (sceneError) {
      setState("error");
      setScenes([]);
      setError(
        sceneError instanceof Error
          ? sceneError.message
          : "The cinematic engine lost the thread.",
      );
    }
  }

  function stopPlayback() {
    cancelPlaybackRef.current = true;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setSpokenWord(-1);
  }

  async function playScene(scene: CinematicScene, index: number) {
    setActiveScene(index);
    setSpokenWord(-1);

    await new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(scene.narration);
      const selectedVoice = voices.find((voice) => voice.name === voiceName);
      const sceneWords = scene.narration.split(/\s+/);

      utterance.rate = rate;
      utterance.pitch = 0.82;
      utterance.volume = 1;

      if (selectedVoice) utterance.voice = selectedVoice;

      utterance.onboundary = (event) => {
        if (event.name !== "word") return;

        const spoken = scene.narration.slice(0, event.charIndex);
        setSpokenWord(Math.max(0, spoken.trim().split(/\s+/).length - 1));
      };

      const fallbackInterval = window.setInterval(() => {
        setSpokenWord((currentWord) => {
          if (currentWord >= sceneWords.length - 1) {
            window.clearInterval(fallbackInterval);
            return currentWord;
          }

          return currentWord + 1;
        });
      }, Math.max(180, 360 / rate));

      utterance.onend = () => {
        window.clearInterval(fallbackInterval);
        setSpokenWord(-1);
        resolve();
      };

      utterance.onerror = () => {
        window.clearInterval(fallbackInterval);
        setSpokenWord(-1);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  async function playFilm() {
    if (!scenes.length || isPlaying) return;

    cancelPlaybackRef.current = false;
    window.speechSynthesis.cancel();
    setIsPlaying(true);

    for (let index = activeScene; index < scenes.length; index += 1) {
      if (cancelPlaybackRef.current) break;
      await playScene(scenes[index], index);
    }

    setIsPlaying(false);
  }

  function resetExperience() {
    stopPlayback();
    setScenes([]);
    setState("idle");
    setError("");
    setActiveScene(0);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060606] text-[#f6f1e8]">
      <ParticleBackground />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(224,56,45,0.2)_0%,rgba(6,6,6,0)_34%),linear-gradient(245deg,rgba(52,189,186,0.18)_0%,rgba(6,6,6,0)_38%),linear-gradient(135deg,#060606_0%,#111111_48%,#17100f_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />

      <section className="relative z-10 grid min-h-screen gap-8 px-5 py-6 md:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.35fr)] md:px-8 lg:px-12">
        <div className="flex min-h-[calc(100vh-3rem)] flex-col justify-between gap-8">
          <div>
            <p className="mb-4 inline-flex border border-[#d8b35e]/45 bg-[#201d18]/80 px-3 py-2 text-xs font-semibold uppercase text-[#f2d58a]">
              AI image generation and spoken cinema
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-none text-[#f8f4ea] sm:text-6xl lg:text-7xl">
              Turn text into a narrated film board.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#c9c1b4] sm:text-lg">
              Write a moment, a dream, or a whole tiny plot. The app shapes it
              into visual beats, generates cinematic frames, and reads the
              story aloud in your browser.
            </p>
          </div>

          <form onSubmit={generateScenes} className="space-y-4">
            <label className="block text-sm font-semibold text-[#f6f1e8]" htmlFor="prompt">
              Scene text
            </label>
            <textarea
              id="prompt"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-h-36 w-full resize-none rounded-md border border-[#6c6156] bg-[#111]/85 p-4 text-base leading-7 text-[#f6f1e8] outline-none transition focus:border-[#34bdba] focus:ring-2 focus:ring-[#34bdba]/30"
              maxLength={900}
              placeholder="Describe the world, the character, or the feeling..."
            />

            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="rounded border border-[#6c6156] bg-[#161616]/80 px-3 py-2 text-left text-xs text-[#d9d1c5] transition hover:border-[#d8b35e] hover:text-[#f6f1e8]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={state === "generating"}
                className="rounded-md bg-[#e0382d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#f04c40] disabled:cursor-not-allowed disabled:bg-[#7a302c]"
              >
                {state === "generating" ? "Generating scenes..." : "Generate film"}
              </button>

              {scenes.length > 0 && (
                <button
                  type="button"
                  onClick={resetExperience}
                  className="rounded-md border border-[#6c6156] px-5 py-3 text-sm font-bold text-[#f6f1e8] transition hover:border-[#d8b35e]"
                >
                  New draft
                </button>
              )}
            </div>

            {error && (
              <p className="border-l-4 border-[#e0382d] bg-[#1d1110] px-4 py-3 text-sm text-[#ffd8d4]">
                {error}
              </p>
            )}
          </form>
        </div>

        <div className="flex min-h-[calc(100vh-3rem)] flex-col">
          <div className="relative flex min-h-[48vh] flex-1 items-end overflow-hidden border border-[#35302b] bg-[#0d0d0d] md:min-h-0">
            {active?.isFactual ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#060606] bg-[radial-gradient(ellipse_70%_70%_at_50%_0%,rgba(135,130,220,0.15),rgba(255,255,255,0))]">
                <div className="flex animate-pulse flex-col items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7877c6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                    <path d="m3 16 5-5c.5-.5 1.3-.4 1.7.1l1.5 2 3-3c.5-.5 1.4-.4 1.8.2L21 20" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                  <p className="text-sm font-semibold tracking-widest text-[#7877c6] opacity-60 uppercase">
                    Image Not Generable
                  </p>
                  <p className="text-xs text-[#7877c6] opacity-40">
                    Factual Context Detected
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* We use a background div for aesthetic sizing without ever showing a broken image icon */}
                <div
                  className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${imageFailed ? 'grayscale opacity-60 blend-luminosity' : ''}`}
                  style={{
                    backgroundImage: `url("${
                      imageFailed
                        ? `https://picsum.photos/seed/${encodeURIComponent(active?.narration || frameAlt).replace(/'/g, "%27")}/1280/720`
                        : frameImage
                    }")`,
                  }}
                />
                {/* Hidden image block just to detect if Pollinations is blocked by ad-blocker/network */}
                <img
                  src={frameImage}
                  className="hidden"
                  alt="preloader"
                  onError={() => setImageFailed(true)}
                />
              </>
            )}
            <div className={`absolute inset-0 ${active?.isFactual ? 'opacity-0' : 'bg-gradient-to-t from-black via-black/35 to-transparent'}`} />
            {active ? (
              <div className="relative z-10 w-full p-5 sm:p-7">
                  <p className="mb-2 text-xs font-semibold uppercase text-[#34bdba]">
                    {active.title}
                  </p>
                  <p className="max-w-3xl text-2xl font-black leading-tight text-white sm:text-4xl">
                    {words.map((word, index) => (
                      <span
                        key={`${word}-${index}`}
                        className={
                          spokenWord === index
                            ? "mr-2 text-[#f2d58a]"
                            : "mr-2 text-white"
                        }
                      >
                        {word}
                      </span>
                    ))}
                  </p>
                </div>
            ) : (
              <div className="relative z-10 max-w-xl p-6">
                <p className="text-sm font-semibold uppercase text-[#34bdba]">
                  Waiting for a prompt
                </p>
                <p className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">
                  Your first generated frame lands here.
                </p>
              </div>
            )}
          </div>

          <div className="border-x border-b border-[#35302b] bg-[#0b0b0b]/95 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={isPlaying ? stopPlayback : playFilm}
                disabled={!scenes.length}
                className="h-11 rounded-md bg-[#34bdba] px-5 text-sm font-bold text-[#041111] transition hover:bg-[#5fd4d1] disabled:cursor-not-allowed disabled:bg-[#354745] disabled:text-[#879694]"
              >
                {isPlaying ? "Stop narration" : "Play narration"}
              </button>

              <label className="flex h-11 items-center gap-2 rounded border border-[#35302b] px-3 text-sm text-[#c9c1b4]">
                Pace
                <select
                  value={rate}
                  onChange={(event) => setRate(Number(event.target.value))}
                  className="bg-transparent font-semibold text-[#f6f1e8] outline-none"
                >
                  <option className="bg-[#111]" value={0.8}>
                    Slow
                  </option>
                  <option className="bg-[#111]" value={0.95}>
                    Cinematic
                  </option>
                  <option className="bg-[#111]" value={1.15}>
                    Brisk
                  </option>
                </select>
              </label>

              {voices.length > 0 && (
                <label className="flex h-11 min-w-0 items-center gap-2 rounded border border-[#35302b] px-3 text-sm text-[#c9c1b4]">
                  Voice
                  <select
                    value={voiceName}
                    onChange={(event) => setVoiceName(event.target.value)}
                    className="max-w-[190px] bg-transparent font-semibold text-[#f6f1e8] outline-none"
                  >
                    {voices.map((voice) => (
                      <option className="bg-[#111]" key={voice.name} value={voice.name}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {storyboardSlots.map((scene, index) => (
                <button
                  key={scene?.id ?? `empty-${index}`}
                  type="button"
                  onClick={() => {
                    if (!scene) return;
                    stopPlayback();
                    setActiveScene(index);
                  }}
                  className={`min-h-24 rounded-md border p-3 text-left transition ${
                    activeScene === index && scenes.length
                      ? "border-[#f2d58a] bg-[#221c11]"
                      : "border-[#35302b] bg-[#111]"
                  }`}
                >
                  <span className="text-xs font-semibold uppercase text-[#d8b35e]">
                    Scene {index + 1}
                  </span>
                  <span className="mt-2 block text-sm font-bold text-[#f6f1e8]">
                    {scene?.title ?? "Generated beat"}
                  </span>
                  <span className="mt-2 line-clamp-2 block text-xs leading-5 text-[#a8a096]">
                    {scene?.narration ?? "A frame will appear after generation."}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
