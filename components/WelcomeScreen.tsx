
import React from 'react';
import { BrainCircuitIcon, CalculatorIcon, AtomIcon, LanguagesIcon, FlaskConicalIcon, BookOpenIcon, SpellCheckIcon } from './icons';

interface WelcomeScreenProps {
    onSuggestionClick: (suggestion: string) => void;
}

const subjects = [
    { text: "Solve a math problem", icon: <CalculatorIcon className="h-8 w-8 mb-2 text-rose-400" /> },
    { text: "Explain a physics concept", icon: <AtomIcon className="h-8 w-8 mb-2 text-amber-400" /> },
    { text: "Translate a sentence", icon: <LanguagesIcon className="h-8 w-8 mb-2 text-emerald-400" /> },
    { text: "Help with chemistry", icon: <FlaskConicalIcon className="h-8 w-8 mb-2 text-violet-400" /> },
    { text: "Summarize a topic", icon: <BookOpenIcon className="h-8 w-8 mb-2 text-cyan-400" /> },
    { text: "Correct my grammar", icon: <SpellCheckIcon className="h-8 w-8 mb-2 text-pink-400" /> },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = React.memo(({ onSuggestionClick }) => {
  return (
    <div className="flex flex-col items-center text-center p-4 pt-8 md:pt-12">
      <BrainCircuitIcon className="h-16 w-16 md:h-20 md:w-20 text-amber-500 mb-4 md:mb-6" />
      <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-2">Welcome to StudySphere AI</h2>
      <p className="text-base md:text-lg text-zinc-400 mb-6 md:mb-8 max-w-2xl">
        Your personal AI tutor. Ask questions, upload homework images, and get instant help on any subject.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full max-w-3xl">
        {subjects.map((subject) => (
          <button
            key={subject.text}
            onClick={() => onSuggestionClick(subject.text)}
            className="flex flex-col items-center justify-center text-center p-3 md:p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700/80 transition-all duration-200 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 aspect-square"
          >
            {subject.icon}
            <span className="text-sm">{subject.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
});
