
import React from 'react';
import { BrainCircuitIcon, MenuIcon } from './icons';

interface HeaderProps {
    onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ onToggleSidebar }) => {
  return (
    <header className="relative flex items-center justify-center p-3 md:p-4 bg-zinc-800/50 backdrop-blur-sm border-b border-zinc-700 z-10 md:justify-start">
        {/* Sidebar Toggle - Absolutely positioned on mobile */}
        <button 
            onClick={onToggleSidebar} 
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-zinc-700 md:hidden"
            aria-label="Open sidebar"
        >
            <MenuIcon className="h-6 w-6 text-zinc-300" />
        </button>

        {/* Title */}
        <div className="flex items-center">
            <BrainCircuitIcon className="h-8 w-8 text-amber-400 mr-3" />
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                StudySphere AI
            </h1>
        </div>
    </header>
  );
});
