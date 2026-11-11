import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  GameState, 
  GamePlace, 
  PartData, 
  StudioTool, 
  PlayerStats, 
  AvatarConfig, 
  DEFAULT_AVATAR,
  PartShape,
  PartBehavior,
  StageDifficulty,
  WeatherEvent,
  SkyTheme
} from './types/game';
import { TEMPLATE_RAINBOW_OBBY, DEFAULT_TEMPLATES } from './game/templates';
import { RobloxGameEngine } from './game/engine';
import { TitleScreen } from './ui/TitleScreen';
import { GameHUD } from './ui/GameHUD';
import { StudioRibbon } from './ui/StudioRibbon';
import { StudioExplorer } from './ui/StudioExplorer';
import { StudioProperties } from './ui/StudioProperties';
import { ScriptEditorModal } from './ui/ScriptEditorModal';
import { AvatarCustomizerModal } from './ui/AvatarCustomizerModal';
import { AdminModal } from './ui/AdminModal';
import { PauseModal } from './ui/PauseModal';
import { VictoryModal } from './ui/VictoryModal';
import { RealTimeLeaderboard } from './ui/RealTimeLeaderboard';
import { sounds } from './audio/soundManager';

interface StageClearToast {
  stage: number;
  rewardRobux: number;
  difficulty: StageDifficulty;
}

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<RobloxGameEngine | null>(null);

  // Application State
  const [gameState, setGameState] = useState<GameState>('title');
  const [currentPlace, setCurrentPlace] = useState<GamePlace>(TEMPLATE_RAINBOW_OBBY);
  const [activeTool, setActiveTool] = useState<StudioTool>('select');
  const [selectedPart, setSelectedPart] = useState<PartData | null>(null);
  const [partsList, setPartsList] = useState<PartData[]>(TEMPLATE_RAINBOW_OBBY.parts);

  // Undo/Redo state
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Shift Lock state
  const [isShiftLock, setIsShiftLock] = useState(false);

  // Stage clear celebration toast
  const [stageClearToast, setStageClearToast] = useState<StageClearToast | null>(null);

  const [stats, setStats] = useState<PlayerStats>(() => {
    let savedCoins = 50;
    try {
      const raw = localStorage.getItem('blox_player_robux');
      if (raw !== null) {
        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed)) savedCoins = Math.max(0, parsed);
      }
    } catch {}
    return {
      health: 100,
      maxHealth: 100,
      coins: savedCoins,
      stage: 1,
      maxStages: 20,
      deaths: 0,
      elapsedSeconds: 0,
      hasGravityCoil: false,
      hasSpeedCoil: false,
      difficulty: 'Easy',
      godMode: false,
      flyMode: false,
      infiniteJump: false,
      speedMultiplier: 1.0,
    };
  });

  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => {
    try {
      const saved = localStorage.getItem('blox_avatar_config');
      return saved ? JSON.parse(saved) : DEFAULT_AVATAR;
    } catch {
      return DEFAULT_AVATAR;
    }
  });

  const [isMuted, setIsMuted] = useState(false);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [isScriptEditorOpen, setIsScriptEditorOpen] = useState(false);
  const [isAvatarCustomizerOpen, setIsAvatarCustomizerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<WeatherEvent>('normal');

  // Initialize ThreeJS Engine once on mount
  useEffect(() => {
    if (!mountRef.current) return;

    let initialPlace = TEMPLATE_RAINBOW_OBBY;
    try {
      const savedPlaceJson = localStorage.getItem('blox_studio_place');
      if (savedPlaceJson) {
        initialPlace = JSON.parse(savedPlaceJson);
      }
    } catch {}

    setCurrentPlace(initialPlace);
    setPartsList(initialPlace.parts);

    const engine = new RobloxGameEngine(
      mountRef.current,
      initialPlace,
      avatarConfig,
      {
        onStatsUpdate: (newStats) => {
          setStats(newStats);
          try {
            localStorage.setItem('blox_player_robux', String(newStats.coins));
          } catch {}
        },
        onSelectPart: (part) => setSelectedPart(part),
        onStateChange: (state) => setGameState(state),
        onPartsModified: (newParts) => {
          setPartsList([...newParts]);
          setCurrentPlace((prev) => ({ ...prev, parts: [...newParts] }));
        },
        onHistoryChange: (undoAvailable, redoAvailable) => {
          setCanUndo(undoAvailable);
          setCanRedo(redoAvailable);
        },
        onStageCleared: (stage, rewardRobux, difficulty) => {
          setStageClearToast({ stage, rewardRobux, difficulty });
          setTimeout(() => {
            setStageClearToast(null);
          }, 3500);
        },
      }
    );

    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleUpdateAvatarConfig = (newConfig: Partial<AvatarConfig>) => {
    const updated = { ...avatarConfig, ...newConfig };
    setAvatarConfig(updated);
    try {
      localStorage.setItem('blox_avatar_config', JSON.stringify(updated));
    } catch {}

    if (engineRef.current) {
      engineRef.current.character.updateConfig(updated);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const targetTag = (document.activeElement?.tagName || '').toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      if (e.code === 'F5') {
        e.preventDefault();
        if (gameState === 'playing') {
          handleOpenStudio();
        } else {
          handleStartPlay();
        }
      } else if (e.code === 'F4') {
        e.preventDefault();
        handleOpenStudio();
      } else if (e.code === 'Tab' && gameState === 'playing') {
        e.preventDefault();
        setIsLeaderboardOpen((prev) => !prev);
      } else if (e.code === 'Escape') {
        e.preventDefault();
        if (isLeaderboardOpen) {
          setIsLeaderboardOpen(false);
        } else if (isAdminOpen) {
          setIsAdminOpen(false);
        } else if (gameState === 'playing') {
          setGameState('paused');
          engineRef.current?.setGameState('paused');
        } else if (gameState === 'paused') {
          setGameState('playing');
          engineRef.current?.setGameState('playing');
        }
      } else if (e.code === 'KeyH' && gameState === 'studio') {
        e.preventDefault();
        setCinemaMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameState, isAdminOpen, isLeaderboardOpen]);

  const handleStartPlay = () => {
    setGameState('playing');
    engineRef.current?.setGameState('playing');
    sounds.playStudioSnap();
  };

  const handleOpenStudio = () => {
    setGameState('studio');
    engineRef.current?.setGameState('studio');
    sounds.playStudioSnap();
  };

  const handleSelectTemplate = (template: GamePlace) => {
    setCurrentPlace(template);
    setPartsList(template.parts);
    setSelectedPart(null);
    if (engineRef.current) {
      engineRef.current.loadPlace(template);
    }
    sounds.playStudioSnap();
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMuted(nextMuted);
  };

  const handleToggleShiftLock = () => {
    if (!engineRef.current) return;
    const active = engineRef.current.toggleShiftLock();
    setIsShiftLock(active);
  };

  // Studio tool operations
  const handleSelectTool = (tool: StudioTool) => {
    setActiveTool(tool);
    if (engineRef.current) {
      engineRef.current.activeTool = tool;
    }
    sounds.playStudioSnap();
  };

  const handleAddPart = (shape: PartShape, behavior?: PartBehavior) => {
    if (!engineRef.current) return;
    const added = engineRef.current.addPart(shape, behavior || 'none');
    setSelectedPart(added);
  };

  const handleUpdatePart = (partId: string, updates: Partial<PartData>) => {
    if (!engineRef.current) return;
    engineRef.current.updatePart(partId, updates);
    const updated = engineRef.current.currentPlace.parts.find((p) => p.id === partId);
    if (updated) setSelectedPart({ ...updated });
  };

  const handleDeleteSelected = () => {
    if (!engineRef.current || !selectedPart) return;
    engineRef.current.deletePart(selectedPart.id);
    setSelectedPart(null);
  };

  const handleDuplicateSelected = () => {
    if (!engineRef.current) return;
    engineRef.current.duplicateSelectedPart();
  };

  const handleUndo = () => {
    engineRef.current?.undo();
  };

  const handleRedo = () => {
    engineRef.current?.redo();
  };

  const handleSavePlace = () => {
    if (!engineRef.current) return;
    try {
      localStorage.setItem('blox_studio_place', JSON.stringify(engineRef.current.currentPlace));
      alert('Game Place saved successfully to browser storage!');
      sounds.playCheckpoint();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportJson = () => {
    if (!engineRef.current) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(engineRef.current.currentPlace, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${engineRef.current.currentPlace.name.replace(/\s+/g, '_')}.blox.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    sounds.playStudioSnap();
  };

  const handleImportJson = (jsonString: string) => {
    try {
      const parsed: GamePlace = JSON.parse(jsonString);
      if (parsed.parts && Array.isArray(parsed.parts)) {
        setCurrentPlace(parsed);
        setPartsList(parsed.parts);
        setSelectedPart(null);
        engineRef.current?.loadPlace(parsed);
        sounds.playCheckpoint();
      }
    } catch {
      alert('Invalid Roblox place JSON format.');
    }
  };

  const handleSaveScript = (partId: string, scriptCode: string) => {
    handleUpdatePart(partId, { scriptCode });
  };

  const handleRespawn = () => {
    engineRef.current?.triggerDeath();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#1e1e1e] font-sans">
      {/* Isolated ThreeJS Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Screen 1: Title Screen */}
      {gameState === 'title' && (
        <TitleScreen
          onStartPlay={handleStartPlay}
          onOpenStudio={handleOpenStudio}
          onSelectTemplate={handleSelectTemplate}
          onOpenAvatarCustomizer={() => setIsAvatarCustomizerOpen(true)}
          selectedTemplateId={currentPlace.id}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Screen 2: Playing In-Game HUD */}
      {gameState === 'playing' && (
        <GameHUD
          stats={stats}
          weatherEvent={currentWeather}
          isShiftLock={isShiftLock}
          onToggleShiftLock={handleToggleShiftLock}
          onOpenStudio={handleOpenStudio}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onPause={() => {
            setGameState('paused');
            engineRef.current?.setGameState('paused');
          }}
          onRespawn={handleRespawn}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          stageClearToast={stageClearToast}
          onVirtualMove={(x, z) => engineRef.current?.setVirtualMovement(x, z)}
          onVirtualJump={() => engineRef.current?.triggerJump()}
        />
      )}

      {/* Screen 3: Roblox Studio Mode */}
      {gameState === 'studio' && (
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between">
          <StudioRibbon
            onPlay={handleStartPlay}
            activeTool={activeTool}
            onSelectTool={handleSelectTool}
            onAddPart={handleAddPart}
            onDeleteSelected={handleDeleteSelected}
            onDuplicateSelected={handleDuplicateSelected}
            onOpenScriptEditor={() => setIsScriptEditorOpen(true)}
            onOpenAvatarCustomizer={() => setIsAvatarCustomizerOpen(true)}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onSavePlace={handleSavePlace}
            onExportJson={handleExportJson}
            onImportJson={handleImportJson}
            selectedPartId={selectedPart?.id || null}
            cinemaMode={cinemaMode}
            onToggleCinemaMode={() => setCinemaMode(!cinemaMode)}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />

          {!cinemaMode && (
            <div className="flex-1 flex justify-between pointer-events-none pt-[84px] pb-8 overflow-hidden">
              <div className="pointer-events-auto h-full shadow-2xl">
                <StudioExplorer
                  parts={partsList}
                  selectedPartId={selectedPart?.id || null}
                  onSelectPart={(id) => engineRef.current?.selectPart(id)}
                  onDeletePart={(id) => engineRef.current?.deletePart(id)}
                  onDuplicatePart={() => engineRef.current?.duplicateSelectedPart()}
                />
              </div>

              <div className="pointer-events-auto h-full shadow-2xl">
                <StudioProperties
                  part={selectedPart}
                  onUpdatePart={handleUpdatePart}
                />
              </div>
            </div>
          )}

          <div className="pointer-events-auto pb-3 flex justify-center">
            <div className="bg-zinc-950/90 border border-zinc-800 px-4 py-1.5 rounded-full text-xs text-zinc-400 font-mono shadow-xl flex items-center gap-3">
              <span>Undo: Ctrl+Z</span>
              <span>·</span>
              <span>Redo: Ctrl+Y</span>
              <span>·</span>
              <span>F5 Test Play</span>
              <span>·</span>
              <span>H Cinema Mode</span>
            </div>
          </div>
        </div>
      )}

      {/* Screen 4: Pause Modal */}
      <PauseModal
        isOpen={gameState === 'paused'}
        onResume={() => {
          setGameState('playing');
          engineRef.current?.setGameState('playing');
        }}
        onRespawn={() => {
          setGameState('playing');
          engineRef.current?.setGameState('playing');
          engineRef.current?.triggerDeath();
        }}
        onOpenStudio={handleOpenStudio}
        onReturnTitle={() => {
          setGameState('title');
          engineRef.current?.setGameState('title');
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Screen 5: Victory Modal */}
      {gameState === 'victory' && (
        <VictoryModal
          stats={stats}
          onPlayAgain={() => {
            if (engineRef.current) {
              engineRef.current.loadPlace(currentPlace);
              engineRef.current.setGameState('playing');
            }
            setGameState('playing');
          }}
          onOpenStudio={handleOpenStudio}
          onReturnTitle={() => {
            setGameState('title');
            engineRef.current?.setGameState('title');
          }}
        />
      )}

      {/* Screen 6: Adonis Admin Panel Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        stats={stats}
        onToggleGodMode={() => engineRef.current?.setGodMode(!stats.godMode)}
        onToggleFlyMode={() => engineRef.current?.setFlyMode(!stats.flyMode)}
        onToggleInfiniteJump={() => engineRef.current?.setInfiniteJump(!stats.infiniteJump)}
        onSetSpeedMultiplier={(mult) => engineRef.current?.setSpeedMultiplier(mult)}
        onAddRobux={(amount) => engineRef.current?.addRobux(amount)}
        onTeleportToStage={(stageNum) => engineRef.current?.teleportToStage(stageNum)}
        onSetWeather={(evt: WeatherEvent) => {
          setCurrentWeather(evt);
          engineRef.current?.setWeatherEvent(evt);
        }}
        onSetSkyTheme={(theme: SkyTheme) => engineRef.current?.setSkyTheme(theme)}
      />

      {/* Screen 7: Real-Time Leaderboard */}
      <RealTimeLeaderboard
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        playerStats={stats}
      />

      {/* Modals */}
      <ScriptEditorModal
        isOpen={isScriptEditorOpen}
        part={selectedPart}
        onClose={() => setIsScriptEditorOpen(false)}
        onSaveScript={handleSaveScript}
      />

      <AvatarCustomizerModal
        isOpen={isAvatarCustomizerOpen}
        config={avatarConfig}
        onClose={() => setIsAvatarCustomizerOpen(false)}
        onUpdateConfig={handleUpdateAvatarConfig}
      />
    </div>
  );
}
