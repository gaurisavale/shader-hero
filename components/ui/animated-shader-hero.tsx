"use client";
import ParticleBackground from "@/components/ui/particles";


export default function Hero() {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center text-white text-center px-4 overflow-hidden pt-20">
        {/* Particles */}
<div className="absolute inset-0 z-0">
  <ParticleBackground />
</div>

{/* Gradient Background */}
<div className="absolute inset-0 z-0 bg-gradient-to-r from-orange-500 via-black to-yellow-500 animate-gradient"></div>

{/* Overlay (lighter so particles visible) */}
<div className="absolute inset-0 z-10 bg-black/40"></div>

{/* Content */}
<div className="relative z-20 max-w-4xl">

        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          Launch Your
        </h1>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-yellow-400 to-red-500 bg-clip-text text-transparent">
          Workflow Into Orbit 🚀
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-8">
          AI-powered automation for modern teams
        </p>

        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-orange-500 text-black rounded-full font-semibold hover:scale-110 hover:bg-orange-400 transition duration-300 shadow-lg">
            Get Started
          </button>

          <button className="px-8 py-3 border border-white/30 rounded-full hover:scale-110 hover:bg-white/10 transition duration-300">
            Explore
          </button>
        </div>

      </div>
    </div>
  );
}