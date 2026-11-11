import React from 'react';
import { PlayerStats } from '../types/game';
import { Trophy, RotateCcw, Hammer, Home, Sparkles, Timer, Skull, Coins } from 'lucide-react';

interface VictoryModalProps {
  stats: PlayerStats;
  onPlayAgain: () => void;
  onOpenStudio: () => void;
  onReturnTitle: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  onPlayAgain,
  onOpenStudio,
  onReturnTitle,
}) => {
  const mins = Math.floor(stats.elapsedSeconds / 60);
  const secs = Math.floor(stats.elapsedSeconds % 60);
  const millis = Math.floor((stats.elapsedSeconds * 10) % 10);
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 select-none animate-in fade-in zoom-in duration-300">
      <div className="bg-zinc-900 border-2 border-amber-500/80 w-full max-w-md rounded-3xl shadow-2xl p-6 text-center relative overflow-hidden">
        {/* Top Glow Ribbon */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 blur-3xl rounded-full" />

        {/* Golden Trophy Icon */}
        <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-amber-500/30 mb-4 border border-amber-300/40">
          <Trophy className="w-10 h-10 text-zinc-950 fill-zinc-950" />
        </div>

        <h2 className="font-fredoka font-bold text-3xl text-white tracking-wide mb-1">
          OBBY CONQUERED!
        </h2>
        <p className="text-zinc-400 text-sm mb-6 flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          You reached the Golden Blox Castle!
        </p>

        {/* Stats Grid with tabular-nums */}
        <div className="grid grid-cols-3 gap-2.5 bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl mb-6">
          <div className="flex flex-col items-center">
            <Timer className="w-4 h-4 text-sky-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-zinc-500">Time</span>
            <span className="font-mono font-bold text-sm text-sky-200 tabular-nums">
              {timeFormatted}
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-zinc-800">
            <Skull className="w-4 h-4 text-rose-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-zinc-500">Deaths</span>
            <span className="font-mono font-bold text-sm text-rose-300 tabular-nums">
              {stats.deaths}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <Coins className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-zinc-500">Robux</span>
            <span className="font-mono font-bold text-sm text-amber-300 tabular-nums">
              {stats.coins}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onPlayAgain}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-fredoka font-bold rounded-xl shadow-lg transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={onOpenStudio}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-sky-500/50 text-sky-300 font-semibold text-xs rounded-xl transition"
          >
            <Hammer className="w-4 h-4 text-sky-400" />
            <span>EDIT THIS GAME IN STUDIO</span>
          </button>

          <button
            onClick={onReturnTitle}
            className="w-full flex items-center justify-center gap-2 py-2 text-zinc-400 hover:text-white text-xs font-medium transition"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
