import React from 'react';
import { PlayerStats, StageDifficulty } from '../types/game';
import { 
  Heart, 
  Coins, 
  Flag, 
  Timer, 
  RotateCcw, 
  Hammer, 
  Pause, 
  Volume2, 
  VolumeX, 
  Zap, 
  ArrowUpCircle,
  Lock,
  Unlock,
  ShieldAlert,
  Sparkles,
  Skull,
  Trophy
} from 'lucide-react';
import { WeatherEvent } from '../types/game';

interface StageClearToast {
  stage: number;
  rewardRobux: number;
  difficulty: StageDifficulty;
}

interface GameHUDProps {
  stats: PlayerStats;
  weatherEvent: WeatherEvent;
  isShiftLock: boolean;
  onToggleShiftLock: () => void;
  onOpenStudio: () => void;
  onOpenAdmin: () => void;
  onOpenLeaderboard: () => void;
  onPause: () => void;
  onRespawn: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  stageClearToast: StageClearToast | null;
  onVirtualMove: (x: number, z: number) => void;
  onVirtualJump: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  weatherEvent,
  isShiftLock,
  onToggleShiftLock,
  onOpenStudio,
  onOpenAdmin,
  onOpenLeaderboard,
  onPause,
  onRespawn,
  isMuted,
  onToggleMute,
  stageClearToast,
}) => {
  const mins = Math.floor(stats.elapsedSeconds / 60);
  const secs = Math.floor(stats.elapsedSeconds % 60);
  const millis = Math.floor((stats.elapsedSeconds * 10) % 10);
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis}`;

  const isDead = stats.health <= 0;

  const difficultyColors = {
    Easy: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    Medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    Hard: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    Insane: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden">
      {/* Weather Atmospheric Screen Overlays */}
      {weatherEvent === 'snow_cold' && (
        <div className="absolute inset-0 pointer-events-none z-0 border-[16px] border-cyan-200/10 shadow-[inset_0_0_100px_rgba(186,230,253,0.35)]" />
      )}
      {weatherEvent === 'rising_lava' && (
        <div className="absolute inset-0 pointer-events-none z-0 border-b-[24px] border-b-rose-600/30 shadow-[inset_0_0_120px_rgba(239,68,68,0.35)]" />
      )}
      {weatherEvent === 'rain_slippery' && (
        <div className="absolute inset-0 pointer-events-none z-0 shadow-[inset_0_0_90px_rgba(30,41,59,0.5)]" />
      )}

      {/* 1. SHIFT LOCK CROSSHAIR (Center of Screen when Shift Lock is ON) */}
      {isShiftLock && !isDead && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center">
          <div className="relative w-7 h-7 flex items-center justify-center">
            {/* Classic Roblox Shift Lock Crosshair circle & lines */}
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_rgba(0,0,0,0.8)]" />
            <div className="absolute w-5 h-[1.5px] bg-white/90 shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
            <div className="absolute h-5 w-[1.5px] bg-white/90 shadow-[0_0_4px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
      )}

      {/* 2. DEATH SCREEN / LOGO OVERLAY ("OOF! YOU DIED") */}
      {isDead && (
        <div className="absolute inset-0 pointer-events-none z-30 flex flex-col items-center justify-center bg-red-950/45 animate-in fade-in duration-150">
          <div className="relative flex flex-col items-center drop-shadow-2xl text-center px-6 py-4 rounded-3xl bg-zinc-950/85 border-2 border-rose-500/80 shadow-2xl">
            {/* Roblox Death Emblem / Skull Logo */}
            <div className="w-16 h-16 bg-gradient-to-tr from-rose-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/40 mb-3 border border-rose-300/40">
              <Skull className="w-9 h-9 text-white fill-white" />
            </div>

            <h1 className="font-fredoka font-black text-4xl text-white tracking-wider mb-1 drop-shadow-lg text-rose-50">
              OOF!
            </h1>
            <p className="text-rose-300 font-bold uppercase tracking-widest text-xs mb-3 font-mono">
              YOU DIED
            </p>
            <div className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
              Respawning at Checkpoint...
            </div>
          </div>
        </div>
      )}

      {/* 3. STAGE COMPLETION CONGRATULATIONS SPLASH BANNER */}
      {stageClearToast && !isDead && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in slide-in-from-top zoom-in duration-300">
          <div className="bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 border-2 border-emerald-300 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3.5 text-center">
            <Sparkles className="w-6 h-6 text-amber-300 animate-spin" />
            <div>
              <div className="font-fredoka font-bold text-xl tracking-wide uppercase drop-shadow">
                CONGRATULATIONS!
              </div>
              <div className="text-xs font-semibold text-emerald-100 flex items-center justify-center gap-2">
                <span>Stage {stageClearToast.stage} Cleared!</span>
                <span className="font-bold text-amber-300 bg-black/25 px-2 py-0.5 rounded-full font-mono">
                  +{stageClearToast.rewardRobux} ROBUX!
                </span>
              </div>
            </div>
            <Sparkles className="w-6 h-6 text-amber-300 animate-spin" />
          </div>
        </div>
      )}

      {/* Top Header Cluster */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Stage, Difficulty & Time Cluster */}
        <div className="flex flex-col gap-2">
          {/* Stage & Difficulty Badge */}
          <div className="pointer-events-auto flex items-center gap-2 bg-zinc-900/90 border border-zinc-700/80 px-3.5 py-1.5 rounded-xl shadow-lg">
            <Flag className="w-4 h-4 text-emerald-400" />
            <div className="text-xs font-semibold uppercase text-zinc-300">
              Stage <span className="text-white font-bold font-mono text-sm tabular-nums">{stats.stage}</span>
              <span className="text-zinc-500"> / {stats.maxStages}</span>
            </div>

            {/* Difficulty Pill */}
            <span
              className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded border ${
                difficultyColors[stats.difficulty]
              }`}
            >
              {stats.difficulty}
            </span>
          </div>

          {/* Speedrun Timer */}
          <div className="pointer-events-auto flex items-center gap-2 bg-zinc-900/90 border border-zinc-700/80 px-3 py-1 rounded-lg shadow text-xs font-mono text-zinc-300 w-fit">
            <Timer className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-bold text-sky-200 tabular-nums">{timeFormatted}</span>
          </div>

          {/* Robux Count */}
          <div className="pointer-events-auto flex items-center gap-2 bg-zinc-900/90 border border-zinc-700/80 px-3 py-1 rounded-lg shadow text-xs font-semibold text-amber-300 w-fit">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold font-mono tabular-nums">{stats.coins.toLocaleString()}</span>
            <span className="text-[10px] text-amber-500 font-mono">ROBUX</span>
          </div>
        </div>

        {/* Right: Health Bar & Quick Action Controls */}
        <div className="flex flex-col items-end gap-2.5">
          {/* Health Bar */}
          <div className="pointer-events-auto flex items-center gap-2 bg-zinc-900/90 border border-zinc-700/80 px-3 py-2 rounded-xl shadow-lg">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <div className="flex flex-col gap-0.5">
              <div className="w-28 sm:w-36 h-3 bg-zinc-800 rounded-sm overflow-hidden border border-zinc-700">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-150"
                  style={{ width: `${Math.max(0, Math.min(100, stats.health))}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-bold font-mono text-zinc-200 tabular-nums w-8 text-right">
              {stats.health}
            </span>
          </div>

          {/* Action Button Row */}
          <div className="pointer-events-auto flex items-center gap-2">
            {/* Shift Lock Toggle Button */}
            <button
              onClick={onToggleShiftLock}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition shadow ${
                isShiftLock
                  ? 'bg-sky-600 border-sky-400 text-white ring-1 ring-sky-300'
                  : 'bg-zinc-900/90 border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white'
              }`}
              title="Toggle Shift Lock [Left Shift]"
            >
              {isShiftLock ? <Lock className="w-3.5 h-3.5 text-white" /> : <Unlock className="w-3.5 h-3.5 text-zinc-400" />}
              <span className="hidden sm:inline">Shift Lock</span>
            </button>

            {/* Real-Time Leaderboard Button */}
            <button
              onClick={onOpenLeaderboard}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-950/90 border border-sky-400/80 hover:border-sky-300 text-xs font-semibold text-sky-200 hover:text-white transition shadow"
              title="Open Live Leaderboard [Tab]"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>

            {/* Admin Panel Button */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-950/90 border border-amber-500/70 hover:border-amber-400 text-xs font-semibold text-amber-200 hover:text-white transition shadow"
              title="Open Adonis Admin Dashboard"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </button>

            {/* Reset Character */}
            <button
              onClick={onRespawn}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-700 hover:border-zinc-500 text-xs font-semibold text-zinc-300 hover:text-white transition shadow"
              title="Reset Character [R]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Studio Mode */}
            <button
              onClick={onOpenStudio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/90 border border-sky-500/80 hover:border-sky-400 text-xs font-semibold text-sky-200 hover:text-white transition shadow"
              title="Open Roblox Studio Mode [F4]"
            >
              <Hammer className="w-3.5 h-3.5 text-sky-400" />
              <span>Studio</span>
            </button>

            {/* Audio Mute */}
            <button
              onClick={onToggleMute}
              className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition shadow"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Pause */}
            <button
              onClick={onPause}
              className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition shadow"
              title="Pause [Esc]"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Center: Roblox Inventory Hotbar (Coils & Items) */}
      <div className="flex flex-col items-center gap-2 mb-2">
        <div className="pointer-events-auto flex items-center gap-2 bg-zinc-900/90 border border-zinc-700/80 p-1.5 rounded-2xl shadow-xl">
          {/* Slot 1: Speed Coil */}
          <div
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border relative transition ${
              stats.hasSpeedCoil
                ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-600 opacity-60'
            }`}
            title={stats.hasSpeedCoil ? 'Speed Coil (Equipped: +80% Speed)' : 'Speed Coil (Stage 10)'}
          >
            <Zap className={`w-5 h-5 ${stats.hasSpeedCoil ? 'text-cyan-400' : 'text-zinc-600'}`} />
            <span className="text-[9px] font-mono font-bold mt-0.5">1</span>
            {stats.hasSpeedCoil && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full" />
            )}
          </div>

          {/* Slot 2: Gravity Coil */}
          <div
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border relative transition ${
              stats.hasGravityCoil
                ? 'bg-purple-950/60 border-purple-400 text-purple-300 shadow-md shadow-purple-500/20'
                : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-600 opacity-60'
            }`}
            title={stats.hasGravityCoil ? 'Gravity Coil (Equipped: High Jumps)' : 'Gravity Coil (Stage 14)'}
          >
            <ArrowUpCircle className={`w-5 h-5 ${stats.hasGravityCoil ? 'text-purple-400' : 'text-zinc-600'}`} />
            <span className="text-[9px] font-mono font-bold mt-0.5">2</span>
            {stats.hasGravityCoil && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-400 rounded-full" />
            )}
          </div>
        </div>

        {/* Minimal control hint */}
        <div className="text-[11px] font-mono text-zinc-400/90 bg-zinc-950/80 px-3 py-0.5 rounded-full border border-zinc-800">
          WASD Move · Space Jump · Shift Lock [Shift] · Reset [R] · Admin Panel
        </div>
      </div>
    </div>
  );
};
