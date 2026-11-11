import React from 'react';
import { Play, RotateCcw, Hammer, Home, Volume2, VolumeX, Music } from 'lucide-react';
import { sounds } from '../audio/soundManager';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRespawn: () => void;
  onOpenStudio: () => void;
  onReturnTitle: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRespawn,
  onOpenStudio,
  onReturnTitle,
  isMuted,
  onToggleMute,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center">
        <h2 className="font-fredoka font-bold text-2xl text-white tracking-wide mb-1">
          GAME PAUSED
        </h2>
        <p className="text-zinc-400 text-xs mb-6">Take a breather or jump into Roblox Studio!</p>

        <div className="flex flex-col gap-2.5 mb-6">
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-fredoka font-bold rounded-xl shadow-lg transition active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>RESUME</span>
          </button>

          <button
            onClick={onRespawn}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Respawn at Checkpoint [R]</span>
          </button>

          <button
            onClick={onOpenStudio}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-sky-950 hover:bg-sky-900 border border-sky-500/60 text-sky-200 font-semibold text-xs rounded-xl transition"
          >
            <Hammer className="w-4 h-4 text-sky-400" />
            <span>Open in Roblox Studio [F4]</span>
          </button>

          <button
            onClick={onReturnTitle}
            className="w-full flex items-center justify-center gap-2 py-2 text-zinc-400 hover:text-white text-xs font-medium transition"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>

        {/* Audio controls */}
        <div className="flex items-center justify-center gap-3 pt-3 border-t border-zinc-800">
          <button
            onClick={onToggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300 hover:text-white transition"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isMuted ? 'Muted' : 'Sound ON'}</span>
          </button>

          <button
            onClick={() => sounds.toggleBgm()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300 hover:text-white transition"
          >
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span>Theme Music</span>
          </button>
        </div>
      </div>
    </div>
  );
};
