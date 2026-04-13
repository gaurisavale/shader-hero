"use client";

import { useState, useEffect } from "react";
import ParticleBackground from "@/components/ui/particles";

export default function Hero() {
  const [input, setInput] = useState("");
  const [scenes, setScenes] = useState<any[]>([]);
  const [activeScene, setActiveScene] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);

  useEffect(() => {
    window.speechSynthesis.cancel();
  }, []);

  // 🧠 SMART DETECTOR
  const isFictional = (text: string) => {
    const lower = text.toLowerCase();

    const nonFictionPatterns = [
      "define", "explain", "what is", "difference between",
      "list", "advantages", "disadvantages",
      "short note", "long answer", "question",
      "answer", "write about"
    ];

    const isStructured =
      /\d+\./.test(text) ||
      text.includes(":") ||
      text.length < 40;

    const isNonFiction = nonFictionPatterns.some(p =>
      lower.includes(p)
    );

    if (isNonFiction || isStructured) return false;

    const storytellingPatterns = [
      "suddenly", "then", "after that",
      "a man", "a woman", "a boy", "a girl",
      "walks", "enters", "sees", "appears",
      "dark", "mysterious", "magical",
      "dragon", "king", "forest", "battle"
    ];

    return storytellingPatterns.some(p => lower.includes(p));
  };

  // 🎭 GENRE DETECTOR
  const detectGenre = (text: string) => {
    const lower = text.toLowerCase();

    if (lower.includes("dragon") || lower.includes("king") || lower.includes("magic")) {
      return "epic fantasy, cinematic lighting, ultra detailed, 4k, dramatic scene";
    }
    if (lower.includes("spaceship") || lower.includes("robot") || lower.includes("future")) {
      return "futuristic sci-fi, neon lights, cyberpunk, ultra realistic, 4k";
    }
    if (lower.includes("dark") || lower.includes("ghost") || lower.includes("haunted")) {
      return "dark horror, eerie shadows, cinematic horror lighting, ultra detailed";
    }
    if (lower.includes("love") || lower.includes("heart") || lower.includes("romantic")) {
      return "romantic, soft lighting, dreamy atmosphere, cinematic, warm tones";
    }

    return "cinematic, ultra realistic, dramatic lighting, 4k";
  };

  // 🎬 SCENE SPLITTING
  const splitScenes = (text: string) => {
    const parts = text.split(/\.|and|then/);
    return parts.filter((s) => s.trim().length > 20);
  };

  const generate = async () => {
    if (!input.trim()) return;

    const parts = splitScenes(input);
    const result = [];

    for (let part of parts) {
      const fictional = isFictional(part);
      const genre = detectGenre(part);

      if (!fictional && part.length < 50) {
        result.push({ text: part, image: null });
        continue;
      }

      try {
        const styledPrompt = `${genre}, ultra realistic, cinematic lighting, detailed scene of ${part}`;

        const res = await fetch("/api/contact", {
          method: "POST",
          body: JSON.stringify({ text: styledPrompt }),
        });

        const data = await res.json();

        result.push({
          text: part,
          image: data.image,
        });

      } catch {
        result.push({
          text: part,
          image: "https://picsum.photos/500",
        });
      }
    }

    setScenes(result);
  };

  // 🎧 PLAY WITH WORD HIGHLIGHT
  const playAll = async () => {
    if (scenes.length === 0) return;

    window.speechSynthesis.cancel();
    setIsPlaying(true);

    for (let i = 0; i < scenes.length; i++) {
      setActiveScene(i);

      const words = scenes[i].text.split(" ");

      await new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(scenes[i].text);
        utterance.rate = speed;

        let index = 0;

        const interval = setInterval(() => {
          setCurrentWordIndex(index);
          index++;

          if (index >= words.length) {
            clearInterval(interval);
          }
        }, 250 / speed);

        utterance.onend = () => {
          clearInterval(interval);
          setCurrentWordIndex(null);
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      });
    }

    setIsPlaying(false);
    setActiveScene(null);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center text-white overflow-y-auto px-4 py-10">

      <ParticleBackground />

      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-700 to-pink-500 opacity-80 pointer-events-none"></div>

      <div className="relative z-20 w-full max-w-4xl">

        {/* 🆕 NEW CHAT */}
        {scenes.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setScenes([]);
                setInput("");
                setActiveScene(null);
                window.speechSynthesis.cancel();
                setIsPlaying(false);
              }}
              className="px-4 py-2 rounded border border-pink-400 text-pink-300 hover:bg-pink-500/20"
            >
              🆕 New Chat
            </button>
          </div>
        )}

        {/* INPUT */}
        {scenes.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">

            <h1 className="text-4xl mb-6 font-bold">
              Cinematic AI 🎬
            </h1>

            <div className="flex w-full gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your story..."
                className="flex-1 h-12 px-4 rounded-full bg-black border border-purple-400 text-pink-400"
              />

              <button
                onClick={generate}
                className="px-6 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-pink-500/30"
              >
                Generate
              </button>
            </div>

          </div>
        )}

        {/* CONTROLS */}
        {scenes.length > 0 && (
          <div className="flex justify-center gap-4 mb-6 mt-6">

            <button
              onClick={() => {
                if (!isPlaying) playAll();
                else {
                  window.speechSynthesis.pause();
                  setIsPlaying(false);
                }
              }}
              className="px-6 py-2 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-pink-500/30"
            >
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>

            <button
              onClick={() => {
                window.speechSynthesis.cancel();
                setIsPlaying(false);
                playAll();
              }}
              className="px-4 py-2 border border-purple-400 text-purple-300 rounded"
            >
              🔁 Restart
            </button>

            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-black border border-purple-400 text-purple-300 px-2"
            >
              <option value={0.8}>0.8x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>

          </div>
        )}

        {/* SCENES */}
        <div className="space-y-10 pb-20">
          {scenes.map((scene, i) => (
            <div
              key={i}
              className={`p-6 rounded-lg border ${
                activeScene === i
                  ? "border-pink-500 bg-black/80"
                  : "border-gray-700 bg-black/60"
              }`}
            >
              <p className="mb-4 text-lg leading-relaxed">
                {scene.text.split(" ").map((word, index) => (
                  <span
                    key={index}
                    className={`mr-1 ${
                      activeScene === i && currentWordIndex === index
                        ? "text-pink-400 font-bold"
                        : "text-white"
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </p>

              {scene.image && (
                <img
                  src={scene.image}
                  className="w-full rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://picsum.photos/500";
                  }}
                />
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}