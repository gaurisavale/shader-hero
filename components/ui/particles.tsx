"use client";

type Particle = {
  left: number;
  duration: number;
  delay: number;
};

const particles: Particle[] = Array.from({ length: 40 }, (_, index) => ({
  left: (index * 37) % 100,
  duration: 5 + ((index * 17) % 10),
  delay: (index * 11) % 5,
}));

export default function ParticleBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {particles.map((particle, index) => (
        <span
          key={index}
          className="particle"
          style={{
            left: `${particle.left}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
