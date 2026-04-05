"use client";

export default function ParticleBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {[...Array(40)].map((_, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${5 + Math.random() * 10}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}