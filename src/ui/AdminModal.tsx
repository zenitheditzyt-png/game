import React, { useState } from 'react';
import { PlayerStats, WeatherEvent, SkyTheme } from '../types/game';
import { 
  ShieldAlert, 
  X, 
  Coins, 
  CloudRain, 
  Snowflake, 
  Sparkles, 
  Zap, 
  Sun, 
  Moon, 
  Compass, 
  Flame, 
  Check,
  ChevronRight,
  Terminal,
  Activity
} from 'lucide-react';
import { sounds } from '../audio/soundManager';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onToggleGodMode: () => void;
  onToggleFlyMode: () => void;
  onToggleInfiniteJump: () => void;
  onSetSpeedMultiplier: (mult: number) => void;
  onAddRobux: (amount: number) => void;
  onTeleportToStage: (stage: number) => void;
  onSetWeather: (event: WeatherEvent) => void;
  onSetSkyTheme: (theme: SkyTheme) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  stats,
  onToggleGodMode,
  onToggleFlyMode,
  onToggleInfiniteJump,
  onSetSpeedMultiplier,
  onAddRobux,
  onTeleportToStage,
  onSetWeather,
  onSetSkyTheme,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'powers' | 'robux' | 'events' | 'teleport'>('powers');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[ADMIN]: Authenticated as superuser: Server Administrator.',
    '[SERVER]: Ready for broadcast commands.',
  ]);

  const addLog = (msg: string) => {
    setConsoleLogs((prev) => [msg, ...prev.slice(0, 5)]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 select-none animate-in fade-in zoom-in duration-200">
      <div className="bg-[#18181b] border-2 border-amber-500/80 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[540px]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-950 via-zinc-900 to-zinc-900 px-4 py-2.5 border-b border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center text-zinc-950 font-black text-xs shadow">
              👑
            </div>
            <div>
              <span className="font-fredoka font-bold text-white text-sm tracking-wide">
                ROBLOX ADONIS ADMIN <span className="text-amber-400 font-mono text-xs">v4.0</span>
              </span>
              <div className="text-[10px] text-zinc-400 font-mono">
                Level 9 Rank: Place Creator
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

        {/* Navigation Tabs */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-1 flex items-center gap-1 text-xs">
          {[
            { id: 'powers', label: '⚡ Player Powers' },
            { id: 'events', label: '🌪️ World Events & Sky' },
            { id: 'robux', label: '💰 Robux Vault' },
            { id: 'teleport', label: '🚀 Stage Warp' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 text-xs text-zinc-300">
          {/* TAB 1: PLAYER POWERS */}
          {activeTab === 'powers' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* God Mode */}
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-500" />
                      God Mode (Immunity)
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Immune to neon lava lasers and void death
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onToggleGodMode();
                      addLog(`[COMMAND]: ;god ${!stats.godMode ? 'enabled' : 'disabled'}`);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                      stats.godMode
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {stats.godMode ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>

                {/* Fly Mode */}
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Fly Mode (Noclip)
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Fly freely across the entire sky with WASD
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onToggleFlyMode();
                      addLog(`[COMMAND]: ;fly ${!stats.flyMode ? 'enabled' : 'disabled'}`);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                      stats.flyMode
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {stats.flyMode ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>

                {/* Infinite Jump */}
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Infinite Moon Jump
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Press space repeatedly to walk on thin air
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onToggleInfiniteJump();
                      addLog(`[COMMAND]: ;infjump ${!stats.infiniteJump ? 'enabled' : 'disabled'}`);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                      stats.infiniteJump
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {stats.infiniteJump ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>

                {/* Speed Multipliers */}
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <div className="font-semibold text-white mb-1.5">Sprint Speed Multiplier</div>
                  <div className="flex items-center gap-1.5">
                    {[
                      { mult: 1.0, label: 'Normal (1x)' },
                      { mult: 2.0, label: 'Sonic (2x)' },
                      { mult: 4.0, label: 'Flash (4x)' },
                    ].map((sp) => (
                      <button
                        key={sp.mult}
                        onClick={() => {
                          onSetSpeedMultiplier(sp.mult);
                          addLog(`[COMMAND]: ;speed ${sp.mult}x`);
                        }}
                        className={`flex-1 py-1.5 rounded-lg font-medium text-[11px] transition ${
                          stats.speedMultiplier === sp.mult
                            ? 'bg-sky-600 text-white font-bold'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORLD EVENTS & SKY */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              {/* Weather Events */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2">
                  Server Weather & Physics Events
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      onSetWeather('low_gravity');
                      addLog('[EVENT]: Zero Gravity Activated! Everyone can jump super high.');
                    }}
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/80 text-left transition flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300">
                      🌌
                    </div>
                    <div>
                      <div className="font-semibold text-white">Zero Gravity Event</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Float through the air with ultra-low gravity leaps!
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSetWeather('rain_slippery');
                      addLog('[EVENT]: Slippery Rain Storm started! Floors have zero friction.');
                    }}
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-sky-500/80 text-left transition flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-500/40 flex items-center justify-center text-sky-300">
                      🌧️
                    </div>
                    <div>
                      <div className="font-semibold text-white">Slippery Rain Storm</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Downpour rain makes all blocks slippery like ice!
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSetWeather('snow_cold');
                      addLog('[EVENT]: Snow Blizzard started!');
                    }}
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-blue-400/80 text-left transition flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-400/40 flex items-center justify-center text-blue-300">
                      ❄️
                    </div>
                    <div>
                      <div className="font-semibold text-white">Blizzard Snow Event</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Swirling snow particles drift across the arena.
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSetWeather('speed_rush');
                      addLog('[EVENT]: Hyper Speed Rush activated! 2.5x speed boost for all.');
                    }}
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/80 text-left transition flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-300">
                      ⚡
                    </div>
                    <div>
                      <div className="font-semibold text-white">Hyper Speed Rush</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Blazing sprint acceleration for high-speed parkour!
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSetWeather('normal');
                      addLog('[EVENT]: Weather restored to standard clear conditions.');
                    }}
                    className="sm:col-span-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-center font-semibold text-zinc-300 transition"
                  >
                    ☀️ Reset to Clear Weather & Standard Physics
                  </button>
                </div>
              </div>

              {/* Sky Atmosphere Presets */}
              <div className="border-t border-zinc-800 pt-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-2">
                  Sky Atmosphere Presets
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      onSetSkyTheme('day');
                      addLog('[SKY]: Atmosphere set to Vibrant Daytime.');
                    }}
                    className="p-2.5 rounded-xl bg-sky-950/70 border border-sky-500/50 hover:border-sky-400 text-left transition"
                  >
                    <div className="font-semibold text-sky-200">☀️ Vibrant Day</div>
                    <div className="text-[10px] text-sky-400 mt-0.5">Sky blue & clouds</div>
                  </button>

                  <button
                    onClick={() => {
                      onSetSkyTheme('sunset');
                      addLog('[SKY]: Atmosphere set to Golden Sunset.');
                    }}
                    className="p-2.5 rounded-xl bg-orange-950/70 border border-orange-500/50 hover:border-orange-400 text-left transition"
                  >
                    <div className="font-semibold text-orange-200">🌅 Sunset Glow</div>
                    <div className="text-[10px] text-orange-400 mt-0.5">Warm amber rays</div>
                  </button>

                  <button
                    onClick={() => {
                      onSetSkyTheme('night');
                      addLog('[SKY]: Atmosphere set to Cyber Starry Night.');
                    }}
                    className="p-2.5 rounded-xl bg-zinc-950 border border-indigo-500/50 hover:border-indigo-400 text-left transition"
                  >
                    <div className="font-semibold text-indigo-200">🌌 Cyber Night</div>
                    <div className="text-[10px] text-indigo-400 mt-0.5">Dark & golden stars</div>
                  </button>

                  <button
                    onClick={() => {
                      onSetSkyTheme('twilight');
                      addLog('[SKY]: Atmosphere set to Indigo Twilight.');
                    }}
                    className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-500/50 hover:border-purple-400 text-left transition"
                  >
                    <div className="font-semibold text-purple-200">🌆 Twilight</div>
                    <div className="text-[10px] text-purple-400 mt-0.5">Dreamy violet dusk</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ROBUX VAULT */}
          {activeTab === 'robux' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-amber-950/70 to-zinc-900 border border-amber-500/40 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-zinc-400 text-xs font-semibold">Your Current Balance</div>
                  <div className="font-mono font-bold text-3xl text-amber-300 flex items-center gap-2 mt-1">
                    <Coins className="w-7 h-7 text-amber-400" />
                    <span>{stats.coins.toLocaleString()}</span>
                    <span className="text-sm font-sans text-amber-500 font-normal">ROBUX</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2">
                  Admin Robux Dispensary
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { amount: 100, label: '+100 Robux', desc: 'Pocket change' },
                    { amount: 1000, label: '+1,000 Robux', desc: 'Outfit upgrade' },
                    { amount: 50000, label: '+50,000 Robux', desc: 'VIP gamepass' },
                    { amount: 1000000, label: '+1,000,000 Robux!', desc: 'Roblox Millionaire' },
                  ].map((pkg) => (
                    <button
                      key={pkg.amount}
                      onClick={() => {
                        onAddRobux(pkg.amount);
                        addLog(`[ROBUX]: Granted +${pkg.amount.toLocaleString()} Robux to admin.`);
                      }}
                      className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500 rounded-xl text-left transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-fredoka font-bold text-base text-amber-300 group-hover:text-amber-200">
                          {pkg.label}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{pkg.desc}</div>
                      </div>
                      <Coins className="w-5 h-5 text-amber-400 group-hover:scale-110 transition" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TELEPORT WARP */}
          {activeTab === 'teleport' && (
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                Warp to Any Stage (1 - 20)
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {Array.from({ length: 20 }).map((_, i) => {
                  const stageNum = i + 1;
                  const isCurrent = stats.stage === stageNum;
                  const isHard = stageNum > 10 && stageNum <= 15;
                  const isInsane = stageNum > 15;

                  return (
                    <button
                      key={stageNum}
                      onClick={() => {
                        onTeleportToStage(stageNum);
                        addLog(`[TELEPORT]: Warped player to Stage ${stageNum}.`);
                      }}
                      className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                        isCurrent
                          ? 'bg-emerald-600 border-emerald-400 text-white font-bold ring-2 ring-emerald-400/50'
                          : isInsane
                          ? 'bg-purple-950/60 border-purple-800/80 text-purple-300 hover:border-purple-400'
                          : isHard
                          ? 'bg-rose-950/60 border-rose-800/80 text-rose-300 hover:border-rose-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-sky-500'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-zinc-500">
                        {stageNum === 20 ? '👑 CASTLE' : `Stage ${stageNum}`}
                      </span>
                      <span className="text-xs font-mono font-bold">
                        {isInsane ? 'INSANE' : isHard ? 'HARD' : stageNum > 5 ? 'MED' : 'EASY'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Live Admin Command Terminal Log */}
        <div className="bg-[#121214] border-t border-zinc-800 px-3 py-2 font-mono text-[11px] text-zinc-400 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <Terminal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate text-zinc-300">{consoleLogs[0] || 'Ready.'}</span>
          </div>
          <span className="text-[10px] text-zinc-600 shrink-0">SERVER: OK</span>
        </div>
      </div>
    </div>
  );
};
