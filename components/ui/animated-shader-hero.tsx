"use client";

import { useState, useEffect } from "react";
import ParticleBackground from "@/components/ui/particles";

export default function Hero() {
  const [input, setInput] = useState("");
  const [scenes, setScenes] = useState<any[]>([]);
  const [activeScene, setActiveScene] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    window.speechSynthesis.cancel();
  }, []);

  const splitScenes = (text: string) => {
    return text.split(/\.|and|then/).filter((s) => s.trim() !== "");
  };

  const generate = async () => {
    if (!input.trim()) return;

    const parts = splitScenes(input);
    const result = [];

    for (let part of parts) {
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          body: JSON.stringify({ text: part }),
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

  const playAll = async () => {
    if (scenes.length === 0) return;

    window.speechSynthesis.cancel();
    setIsPlaying(true);

    for (let i = 0; i < scenes.length; i++) {
      setActiveScene(i);

      await new Promise<void>((resolve) => {
        const u = new SpeechSynthesisUtterance(scenes[i].text);
        u.rate = speed;
        u.onend = () => resolve();

        window.speechSynthesis.speak(u);
      });
    }

    setIsPlaying(false);
    setActiveScene(null);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center text-white overflow-y-auto px-4 py-10">

      <ParticleBackground />

      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-black to-yellow-500 opacity-80 pointer-events-none"></div>

      <div className="relative z-20 w-full max-w-4xl">

        {/* INPUT CENTER */}
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
                className="flex-1 h-12 px-4 rounded-full bg-black border border-orange-500 text-orange-400"
              />

              <button
                onClick={generate}
                className="px-6 bg-orange-500 text-black rounded-full"
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
              className="px-6 py-2 bg-orange-500 text-black rounded"
            >
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>

            <button
              onClick={() => {
                window.speechSynthesis.cancel();
                setIsPlaying(false);
                playAll();
              }}
              className="px-4 py-2 border border-orange-500 rounded"
            >
              🔁 Restart
            </button>

            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-black border border-orange-500 px-2"
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
                  ? "border-orange-500 bg-black/80"
                  : "border-gray-700 bg-black/60"
              }`}
            >
              <p className="mb-4 text-lg">{scene.text}</p>

              <img
                src={scene.image}
                key={scene.image}
                className="w-full rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://picsum.photos/500";
                }}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}