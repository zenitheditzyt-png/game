import React, { useState } from 'react';
import { PartShape, PartBehavior, StudioTool } from '../types/game';
import { 
  Play, 
  RotateCcw, 
  Move, 
  Maximize2, 
  RotateCw, 
  MousePointer, 
  Plus, 
  Download, 
  Upload, 
  Save, 
  Code, 
  Trash2, 
  Copy, 
  Flame, 
  Flag, 
  Zap, 
  ArrowUp, 
  Disc, 
  Eye, 
  EyeOff, 
  User,
  Undo2,
  Redo2,
  ShieldAlert
} from 'lucide-react';

interface StudioRibbonProps {
  onPlay: () => void;
  activeTool: StudioTool;
  onSelectTool: (tool: StudioTool) => void;
  onAddPart: (shape: PartShape, behavior?: PartBehavior) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onOpenScriptEditor: () => void;
  onOpenAvatarCustomizer: () => void;
  onOpenAdmin: () => void;
  onSavePlace: () => void;
  onExportJson: () => void;
  onImportJson: (json: string) => void;
  selectedPartId: string | null;
  cinemaMode: boolean;
  onToggleCinemaMode: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const StudioRibbon: React.FC<StudioRibbonProps> = ({
  onPlay,
  activeTool,
  onSelectTool,
  onAddPart,
  onDeleteSelected,
  onDuplicateSelected,
  onOpenScriptEditor,
  onOpenAvatarCustomizer,
  onOpenAdmin,
  onSavePlace,
  onExportJson,
  onImportJson,
  selectedPartId,
  cinemaMode,
  onToggleCinemaMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const [activeTab, setActiveTab] = useState<'Home' | 'Model' | 'Insert' | 'File'>('Home');
  const [showInsertMenu, setShowInsertMenu] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        onImportJson(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex flex-col select-none pointer-events-auto">
      {/* Top Application Bar */}
      <div className="bg-[#1e1e1e] border-b border-zinc-800 px-3 py-1.5 flex items-center justify-between text-xs text-zinc-300">
        <div className="flex items-center gap-2">
          {/* Roblox Studio Logo Icon */}
          <div className="w-5 h-5 bg-sky-500 rounded-sm transform rotate-12 flex items-center justify-center font-black text-white text-[11px] shadow">
            S
          </div>
          <span className="font-fredoka font-semibold text-white tracking-wide">
            Roblox Studio <span className="text-zinc-500 font-normal">| Place1</span>
          </span>

          {/* Quick Tabs */}
          <div className="flex items-center gap-1 ml-4 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
            {(['Home', 'Model', 'Insert', 'File'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  activeTab === tab
                    ? 'bg-zinc-700 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Right Quick Controls */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo Buttons */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded transition flex items-center gap-1 text-xs ${
                canUndo
                  ? 'text-zinc-200 hover:bg-zinc-700 hover:text-white'
                  : 'text-zinc-600 cursor-not-allowed opacity-40'
              }`}
              title="Undo [Ctrl+Z]"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-mono text-[10px]">Undo</span>
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded transition flex items-center gap-1 text-xs ${
                canRedo
                  ? 'text-zinc-200 hover:bg-zinc-700 hover:text-white'
                  : 'text-zinc-600 cursor-not-allowed opacity-40'
              }`}
              title="Redo [Ctrl+Y / Ctrl+Shift+Z]"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-mono text-[10px]">Redo</span>
            </button>
          </div>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 hover:text-white transition text-xs font-semibold"
            title="Open Admin & Events Panel"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          <button
            onClick={onToggleCinemaMode}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition text-xs"
            title="Toggle Cinema Mode [H] (Hide/Show Panels)"
          >
            {cinemaMode ? <Eye className="w-3.5 h-3.5 text-sky-400" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{cinemaMode ? 'Show Panels' : 'Cinema Mode'}</span>
          </button>

          <button
            onClick={onOpenAvatarCustomizer}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition text-xs"
          >
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Avatar</span>
          </button>

          {/* Big Green Play Button */}
          <button
            onClick={onPlay}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-fredoka font-bold rounded-lg shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
            title="Test / Play Game [F5]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>PLAY</span>
            <span className="text-[10px] bg-black/25 px-1 py-0.5 rounded font-mono font-normal">F5</span>
          </button>
        </div>
      </div>

      {/* Ribbon Bar Tools */}
      {!cinemaMode && (
        <div className="bg-[#252526] border-b border-zinc-800 px-3 py-2 flex items-center justify-between overflow-x-auto text-xs text-zinc-300 gap-4">
          <div className="flex items-center gap-3">
            {/* Transform Tools Group */}
            <div className="flex items-center gap-1 bg-[#1e1e1e] border border-zinc-800 p-1 rounded-lg">
              <button
                onClick={() => onSelectTool('select')}
                className={`p-1.5 rounded flex items-center gap-1 transition ${
                  activeTool === 'select' ? 'bg-sky-600 text-white font-semibold' : 'hover:bg-zinc-700 text-zinc-400'
                }`}
                title="Select Tool"
              >
                <MousePointer className="w-4 h-4" />
                <span className="hidden sm:inline">Select</span>
              </button>

              <button
                onClick={() => onSelectTool('move')}
                className={`p-1.5 rounded flex items-center gap-1 transition ${
                  activeTool === 'move' ? 'bg-sky-600 text-white font-semibold' : 'hover:bg-zinc-700 text-zinc-400'
                }`}
                title="Move Tool"
              >
                <Move className="w-4 h-4" />
                <span className="hidden sm:inline">Move</span>
              </button>

              <button
                onClick={() => onSelectTool('scale')}
                className={`p-1.5 rounded flex items-center gap-1 transition ${
                  activeTool === 'scale' ? 'bg-sky-600 text-white font-semibold' : 'hover:bg-zinc-700 text-zinc-400'
                }`}
                title="Scale Tool"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Scale</span>
              </button>

              <button
                onClick={() => onSelectTool('rotate')}
                className={`p-1.5 rounded flex items-center gap-1 transition ${
                  activeTool === 'rotate' ? 'bg-sky-600 text-white font-semibold' : 'hover:bg-zinc-700 text-zinc-400'
                }`}
                title="Rotate Tool"
              >
                <RotateCw className="w-4 h-4" />
                <span className="hidden sm:inline">Rotate</span>
              </button>
            </div>

            {/* Part Spawner Quick Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowInsertMenu(!showInsertMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Part</span>
              </button>

              {showInsertMenu && (
                <div
                  className="absolute top-full left-0 mt-2 w-56 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 text-xs"
                  onClick={() => setShowInsertMenu(false)}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 py-1">
                    Standard Geometry
                  </div>
                  <button
                    onClick={() => onAddPart('block')}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-left text-zinc-200"
                  >
                    <span className="w-3.5 h-3.5 bg-blue-500 rounded-sm inline-block" />
                    <span>Block (Brick)</span>
                  </button>
                  <button
                    onClick={() => onAddPart('wedge')}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-left text-zinc-200"
                  >
                    <span className="w-3.5 h-3.5 bg-amber-500 rounded-sm inline-block" />
                    <span>Wedge (Ramp)</span>
                  </button>
                  <button
                    onClick={() => onAddPart('cylinder')}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-left text-zinc-200"
                  >
                    <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full inline-block" />
                    <span>Cylinder (Pillar)</span>
                  </button>
                  <button
                    onClick={() => onAddPart('sphere')}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-left text-zinc-200"
                  >
                    <span className="w-3.5 h-3.5 bg-purple-500 rounded-full inline-block" />
                    <span>Sphere (Ball)</span>
                  </button>

                  <div className="border-t border-zinc-800 my-1" />
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 py-1">
                    Gameplay Gizmos
                  </div>

                  <button
                    onClick={() => onAddPart('block', 'kill')}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-left text-rose-300"
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    <span>Lava Kill Brick (Neon)</span>
                  </button>

                  <button
                    onClick={() => onAddPart('block', 'checkpoint')}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-left text-emerald-300"
                  >
                    <Flag className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Checkpoint Pad</span>
                  </button>

                  <button
                    onClick={() => onAddPart('cylinder', 'trampoline')}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-left text-cyan-300"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Trampoline Bounce Pad</span>
                  </button>

                  <button
                    onClick={() => onAddPart('block', 'speed_boost')}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-left text-amber-300"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Speed Booster Pad</span>
                  </button>

                  <button
                    onClick={() => onAddPart('block', 'conveyor')}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-left text-indigo-300"
                  >
                    <Move className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Conveyor Belt</span>
                  </button>

                  <button
                    onClick={() => onAddPart('block', 'disappearing')}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-left text-lime-300"
                  >
                    <Disc className="w-3.5 h-3.5 text-lime-400" />
                    <span>Disappearing Tile</span>
                  </button>

                  <button
                    onClick={() => onAddPart('cylinder', 'coin')}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-left text-yellow-300"
                  >
                    <span className="w-3.5 h-3.5 bg-yellow-400 rounded-full inline-block" />
                    <span>Robux Coin Pickup</span>
                  </button>
                </div>
              )}
            </div>

            {/* Selection Operations (Duplicate / Delete) */}
            {selectedPartId && (
              <div className="flex items-center gap-1 bg-[#1e1e1e] border border-zinc-800 p-1 rounded-lg">
                <button
                  onClick={onDuplicateSelected}
                  className="p-1.5 rounded hover:bg-zinc-700 text-zinc-300 flex items-center gap-1"
                  title="Duplicate Part [Ctrl+D]"
                >
                  <Copy className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Duplicate</span>
                </button>
                <button
                  onClick={onDeleteSelected}
                  className="p-1.5 rounded hover:bg-rose-950/50 hover:text-rose-400 text-zinc-400 flex items-center gap-1"
                  title="Delete Part [Delete]"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            )}

            {/* Lua Script Editor */}
            <button
              onClick={onOpenScriptEditor}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition"
              title="Edit Lua Part Script"
            >
              <Code className="w-4 h-4 text-emerald-400" />
              <span>Script Editor</span>
            </button>
          </div>

          {/* Right Action Group (Save & JSON export) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSavePlace}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
              title="Save to Browser LocalStorage"
            >
              <Save className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Save</span>
            </button>

            <button
              onClick={onExportJson}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
              title="Export Game as .json"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
              title="Import Game .json"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Import</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
};
