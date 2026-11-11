import React, { useEffect } from 'react';
import { GamePlace } from '../types/game';
import { DEFAULT_TEMPLATES } from '../game/templates';
import { Play, Hammer, Sparkles, User, Volume2, VolumeX, Music } from 'lucide-react';
import { sounds } from '../audio/soundManager';

interface TitleScreenProps {
  onStartPlay: () => void;
  onOpenStudio: () => void;
  onSelectTemplate: (template: GamePlace) => void;
  onOpenAvatarCustomizer: () => void;
  selectedTemplateId: string;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartPlay,
  onOpenStudio,
  onSelectTemplate,
  onOpenAvatarCustomizer,
  selectedTemplateId,
  isMuted,
  onToggleMute,
}) => {
  // Listen for Enter or Space to immediately start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        const tag = (document.activeElement?.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          onStartPlay();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartPlay]);

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-6 md:p-10 select-none">
      {/* Top Bar with Brand & Sound toggles */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5 bg-zinc-900/90 border border-zinc-700/80 px-4 py-2 rounded-xl shadow-xl backdrop-blur-none">
          <div className="w-5 h-5 bg-red-600 rounded-sm transform rotate-12 flex items-center justify-center font-black text-white text-xs">
            R
          </div>
          <span className="font-fredoka font-semibold text-white tracking-wide text-sm">
            ROBLOX <span className="text-sky-400">STUDIO</span>
          </span>
          <span className="text-[10px] bg-sky-500/20 text-sky-300 font-mono px-2 py-0.5 rounded border border-sky-400/30">
            v2026.3D
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => sounds.toggleBgm()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-300 hover:text-white transition shadow-lg"
            title="Toggle Blox Adventure Theme Music [M]"
          >
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-medium">BGM</span>
          </button>
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition shadow-lg"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={onOpenAvatarCustomizer}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-700 hover:border-sky-500 text-xs font-semibold text-zinc-200 hover:text-white transition shadow-lg"
          >
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span>Avatar</span>
          </button>
        </div>
      </div>

      {/* Hero Centerpiece Lockup: bespoke inline SVG title with 30-40% negative space */}
      <div className="my-auto flex flex-col items-center text-center max-w-2xl mx-auto">
        {/* Bespoke inline SVG Blox Title Lockup */}
        <div className="relative mb-6 drop-shadow-2xl">
          <svg className="w-72 sm:w-96 h-28 mx-auto" viewBox="0 0 380 120" fill="none">
            <defs>
              <linearGradient id="bloxTitleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#f3f4f6" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <linearGradient id="studioGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <filter id="blockShadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="8" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
              </filter>
            </defs>
            {/* Tilted Blox Icon */}
            <g transform="translate(38, 12) rotate(-10)">
              <rect x="0" y="0" width="34" height="34" rx="4" fill="#ef4444" filter="url(#blockShadow)" />
              <rect x="9" y="9" width="16" height="16" rx="2" fill="#18181b" />
            </g>
            {/* ROBLOX text */}
            <text
              x="92"
              y="44"
              fill="url(#bloxTitleGrad)"
              fontFamily="Fredoka, sans-serif"
              fontWeight="700"
              fontSize="44"
              letterSpacing="2"
              filter="url(#blockShadow)"
            >
              ROBLOX
            </text>
            {/* STUDIO ribbon banner */}
            <rect x="90" y="58" width="220" height="30" rx="6" fill="url(#studioGrad)" filter="url(#blockShadow)" />
            <text
              x="200"
              y="79"
              fill="#ffffff"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="700"
              fontSize="18"
              letterSpacing="6"
              textAnchor="middle"
            >
              STUDIO 3D
            </text>
          </svg>
          <div className="text-zinc-300 font-medium text-sm sm:text-base mt-1 drop-shadow-md">
            Create, script, and play authentic 3D blocky parkour obbys & worlds
          </div>
        </div>

        {/* Template Selectors */}
        <div className="pointer-events-auto flex flex-wrap justify-center gap-2.5 mb-6 max-w-xl">
          {DEFAULT_TEMPLATES.map((tmpl) => {
            const isSelected = tmpl.id === selectedTemplateId;
            return (
              <button
                key={tmpl.id}
                onClick={() => onSelectTemplate(tmpl)}
                className={`px-3.5 py-2 rounded-xl text-left transition border text-xs sm:text-sm font-medium ${
                  isSelected
                    ? 'bg-zinc-900 border-sky-400 text-white ring-2 ring-sky-400/40 shadow-xl'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {tmpl.name}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1 max-w-[160px]">
                  {tmpl.parts.length} parts · {tmpl.author}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="pointer-events-auto flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md">
          {/* Main Start CTA */}
          <button
            onClick={onStartPlay}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-fredoka font-bold text-lg rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition cursor-pointer border border-emerald-400/30"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>PLAY GAME</span>
            <span className="text-xs bg-black/25 font-mono px-2 py-0.5 rounded font-normal text-emerald-100">
              SPACE
            </span>
          </button>

          {/* Enter Studio CTA */}
          <button
            onClick={onOpenStudio}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-sky-500/60 hover:border-sky-400 text-sky-300 hover:text-white font-fredoka font-semibold text-base rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            <Hammer className="w-4 h-4 text-sky-400" />
            <span>BUILD IN STUDIO</span>
            <span className="text-[10px] bg-sky-950 font-mono px-1.5 py-0.5 rounded text-sky-300">
              F4
            </span>
          </button>
        </div>
      </div>

      {/* Flat Control-Hint Line as required by feature prompt */}
      <div className="text-center pointer-events-auto">
        <div className="inline-block bg-zinc-950/85 border border-zinc-800 px-4 py-1.5 rounded-full text-[11px] sm:text-xs text-zinc-400 font-mono shadow-lg">
          WASD Move · Space Jump · Right-Click Camera Look · Shift Sprint · R Respawn · M Music
        </div>
      </div>
    </div>
  );
};
