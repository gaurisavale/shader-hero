"use client";

import Hero from "@/components/ui/animated-shader-hero";

export default function Page() {

  const handlePrimaryClick = () => {
    alert("Primary clicked");
  };

  const handleSecondaryClick = () => {
    alert("Secondary clicked");
  };

  return (
    <Hero
      trustBadge={{
        text: "AI Powered Experience",
        icons: ["🎬", "✨", "🚀"]
      }}
      headline={{
        line1: "Turn Stories Into",
        line2: "Cinematic Reality"
      }}
      subtitle="Generate visuals and narration from your imagination."
      buttons={{
        primary: {
          text: "Start Creating",
          onClick: handlePrimaryClick
        },
        secondary: {
          text: "Explore",
          onClick: handleSecondaryClick
        }
      }}
    />
  );
}