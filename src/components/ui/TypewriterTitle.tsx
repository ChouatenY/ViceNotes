"use client";
import React from "react";
import { Rocket, Brain, FileText, Lightbulb } from "lucide-react";

// Custom component to render text with an icon
const TextWithIcon = ({
  text,
  icon
}: {
  text: string;
  icon: React.ReactNode
}) => (
  <div className="flex items-center">
    <span className="mr-2">{icon}</span>
    <span>{text}</span>
  </div>
);

const TypewriterTitle = () => {
  // Define phrases with their corresponding icons
  const phrases = [
    { text: "Supercharged Productivity", icon: <Rocket className="w-5 h-5 text-[#47423e]" /> },
    { text: "AI-Powered Insights", icon: <Brain className="w-5 h-5 text-[#47423e]" /> },
    { text: "Organize Your Thoughts", icon: <FileText className="w-5 h-5 text-[#47423e]" /> },
    { text: "Capture Ideas Instantly", icon: <Lightbulb className="w-5 h-5 text-[#47423e]" /> }
  ];

  // Use state to track the current phrase
  const [currentPhraseIndex, setCurrentPhraseIndex] = React.useState(0);

  // Set up an interval to change the phrase
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentPhrase = phrases[currentPhraseIndex];

  return (
    <div className="flex items-center justify-center">
      <TextWithIcon
        text={currentPhrase.text}
        icon={currentPhrase.icon}
      />
    </div>
  );
};

export default TypewriterTitle;
