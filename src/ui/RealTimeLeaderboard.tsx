import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, PlayerStats } from '../types/game';
import { Trophy, Medal, X, ChevronDown, ChevronUp, User, Flame, Coins, Skull, Flag, Timer } from 'lucide-react';

interface RealTimeLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  playerStats: PlayerStats;
}

const INITIAL_RUNNERS: LeaderboardEntry[] = [
  {
    id: 'runner_1',
    name: 'ProBuilder99',
    avatarColor: '#f59e0b',
    stage: 18,
    timeSeconds: 98.4,
    deaths: 1,
    robux: 1420,
    isPlayer: false,
    badge: '👑 VIP',
  },
  {
    id: 'runner_2',
    name: 'SpeedDemon_RBX',
    avatarColor: '#06b6d4',
    stage: 15,
    timeSeconds: 114.2,
    deaths: 3,
    robux: 980,
    isPlayer: false,
    badge: '⚡ PRO',
  },
  {
    id: 'runner_3',
    name: 'BloxNinja_X',
    avatarColor: '#a855f7',
    stage: 12,
    timeSeconds: 142.8,
    deaths: 4,
    robux: 650,
    isPlayer: false,
    badge: '🔥 SPEEDRUNNER',
  },
  {
    id: 'runner_4',
    name: 'BaconHair_Legend',
    avatarColor: '#f43f5e',
    stage: 8,
    timeSeconds: 185.0,
    deaths: 6,
    robux: 320,
    isPlayer: false,
  },
  {
    id: 'runner_5',
    name: 'NoobMaster_2026',
    avatarColor: '#10b981',
    stage: 4,
    timeSeconds: 210.5,
    deaths: 9,
    robux: 150,
    isPlayer: false,
  },
];

export const RealTimeLeaderboard: React.FC<RealTimeLeaderboardProps> = ({
  isOpen,
  onClose,
  playerStats,
}) => {
  const [runners, setRunners] = useState<LeaderboardEntry[]>(INITIAL_RUNNERS);
  const [activeTab, setActiveTab] = useState<'live' | 'alltime'>('live');

  // Live simulation: Competitor runners dynamically make progress or die every few seconds!
  useEffect(() => {
    const interval = setInterval(() => {
      setRunners((prev) =>
        prev.map((r) => {
          if (r.isPlayer) return r;

          // 25% chance this runner advances a stage
          if (Math.random() < 0.28 && r.stage < 20) {
            const nextStage = r.stage + 1;
            const reward = nextStage > 15 ? 50 : nextStage > 10 ? 25 : 10;
            return {
              ...r,
              stage: nextStage,
              robux: r.robux + reward,
              timeSeconds: r.timeSeconds + 4 + Math.random() * 6,
            };
          }

          // 8% chance they die and increase death count
          if (Math.random() < 0.08) {
            return {
              ...r,
              deaths: r.deaths + 1,
            };
          }

          return {
            ...r,
            timeSeconds: r.timeSeconds + 1,
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  // Build full combined list including the real player
  const playerEntry: LeaderboardEntry = {
    id: 'local_player',
    name: 'You (Bloxian)',
    avatarColor: '#38bdf8',
    stage: playerStats.stage,
    timeSeconds: playerStats.elapsedSeconds,
    deaths: playerStats.deaths,
    robux: playerStats.coins,
    isPlayer: true,
    badge: '⭐ YOU',
  };

  const combinedList = [...runners, playerEntry];

  // Sort by highest stage first, then fastest time
  combinedList.sort((a, b) => {
    if (b.stage !== a.stage) return b.stage - a.stage;
    return a.timeSeconds - b.timeSeconds;
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs * 10) % 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 select-none animate-in fade-in zoom-in duration-200">
      <div className="bg-[#18181b] border-2 border-sky-500/80 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950 via-zinc-900 to-zinc-900 px-4 py-3 border-b border-sky-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-zinc-950 font-black text-sm shadow">
              <Trophy className="w-4 h-4 fill-zinc-950" />
            </div>
            <div>
              <div className="font-fredoka font-bold text-white text-base tracking-wide flex items-center gap-2">
                <span>BLOX LEADERBOARD</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-400/30">
                  LIVE SESSION
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                Real-time competitor tracking · Press [Tab] to toggle
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Column Headers */}
        <div className="bg-zinc-900/90 border-b border-zinc-800 px-4 py-2 grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">Player</div>
          <div className="col-span-2 text-center">Stage</div>
          <div className="col-span-2 text-right">Time</div>
          <div className="col-span-2 text-right">Robux</div>
        </div>

        {/* Runner List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {combinedList.map((entry, idx) => {
            const rank = idx + 1;
            const isTop3 = rank <= 3;
            const rankMedal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`;

            return (
              <div
                key={entry.id}
                className={`grid grid-cols-12 items-center px-3 py-2 rounded-xl text-xs transition border ${
                  entry.isPlayer
                    ? 'bg-sky-950/70 border-sky-400 text-white ring-1 ring-sky-400/50 shadow-md'
                    : isTop3
                    ? 'bg-zinc-900/90 border-amber-500/30 text-zinc-200'
                    : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-300'
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 text-center font-bold font-mono text-sm">
                  {isTop3 ? rankMedal : <span className="text-zinc-500 font-medium">#{rank}</span>}
                </div>

                {/* Player Name & Badge */}
                <div className="col-span-5 flex items-center gap-2 truncate pr-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shadow shrink-0"
                    style={{ backgroundColor: entry.avatarColor }}
                  >
                    {entry.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="font-semibold truncate flex items-center gap-1.5">
                      <span className="truncate">{entry.name}</span>
                      {entry.badge && (
                        <span className="text-[9px] px-1 py-0.2 bg-zinc-800 text-amber-300 rounded font-mono shrink-0">
                          {entry.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stage */}
                <div className="col-span-2 text-center font-mono font-bold">
                  <span className={entry.stage >= 16 ? 'text-purple-400' : entry.stage >= 11 ? 'text-rose-400' : 'text-emerald-400'}>
                    Stage {entry.stage}
                  </span>
                </div>

                {/* Time */}
                <div className="col-span-2 text-right font-mono tabular-nums text-sky-200 font-bold">
                  {formatTime(entry.timeSeconds)}
                </div>

                {/* Robux */}
                <div className="col-span-2 text-right font-mono tabular-nums text-amber-300 font-semibold flex items-center justify-end gap-1">
                  <Coins className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{entry.robux.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="bg-zinc-900 px-4 py-2.5 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>Active Runners Online: {combinedList.length}</span>
          </div>
          <span className="font-mono text-[11px] text-zinc-500">
            Stages reset upon server refresh
          </span>
        </div>
      </div>
    </div>
  );
};
