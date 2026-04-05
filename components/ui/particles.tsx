"use client";

import { useEffect, useState } from "react";

export default function ParticleBackground() {
  const [particles, setParticles] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const generated = Array.from({ length: 40 }).map(() => ({
      left: Math.random() * 100,
      duration: 5 + Math.random() * 10,
      delay: Math.random() * 5,
    }));

    setParticles(generated);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}