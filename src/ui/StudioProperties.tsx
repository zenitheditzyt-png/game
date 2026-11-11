import React from 'react';
import { PartData, PartMaterial, PartBehavior } from '../types/game';

interface StudioPropertiesProps {
  part: PartData | null;
  onUpdatePart: (partId: string, updates: Partial<PartData>) => void;
}

const MATERIAL_OPTIONS: PartMaterial[] = [
  'Plastic',
  'SmoothPlastic',
  'Neon',
  'Slate',
  'Wood',
  'Glass',
  'Forcefield',
];

const BEHAVIOR_OPTIONS: { label: string; value: PartBehavior }[] = [
  { label: 'None (Solid Part)', value: 'none' },
  { label: 'Lava Kill-Brick (Instant Oof)', value: 'kill' },
  { label: 'Checkpoint Pad', value: 'checkpoint' },
  { label: 'Trampoline (Super Bounce)', value: 'trampoline' },
  { label: 'Speed Booster Runway', value: 'speed_boost' },
  { label: 'Conveyor Belt (Pushes Player)', value: 'conveyor' },
  { label: 'Disappearing Tile (Fades on Touch)', value: 'disappearing' },
  { label: 'Spinner (Rotating Hazard)', value: 'spinner' },
  { label: 'Robux Coin Pickup', value: 'coin' },
  { label: 'Win Door / Golden Trophy', value: 'win_door' },
];

const COLOR_PRESETS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
  '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', 
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#ffffff', '#94a3b8', '#475569', '#18181b',
];

export const StudioProperties: React.FC<StudioPropertiesProps> = ({ part, onUpdatePart }) => {
  if (!part) {
    return (
      <div className="w-72 bg-[#1e1e1e] border-l border-zinc-800 p-4 text-xs text-zinc-500 flex flex-col items-center justify-center text-center select-none">
        <p>Select a part in the viewport or Explorer to edit its properties.</p>
      </div>
    );
  }

  const handlePosChange = (axis: 0 | 1 | 2, val: number) => {
    const newPos = [...part.position] as [number, number, number];
    newPos[axis] = val;
    onUpdatePart(part.id, { position: newPos });
  };

  const handleSizeChange = (axis: 0 | 1 | 2, val: number) => {
    const newSize = [...part.size] as [number, number, number];
    newSize[axis] = Math.max(0.1, val);
    onUpdatePart(part.id, { size: newSize });
  };

  const handleRotChange = (axis: 0 | 1 | 2, val: number) => {
    const newRot = [...part.rotation] as [number, number, number];
    newRot[axis] = val;
    onUpdatePart(part.id, { rotation: newRot });
  };

  return (
    <div className="w-72 bg-[#1e1e1e] border-l border-zinc-800 flex flex-col h-full text-xs text-zinc-300 select-none overflow-y-auto">
      {/* Header */}
      <div className="px-3 py-2 border-b border-zinc-800 bg-[#252526] font-semibold text-zinc-200 flex items-center justify-between">
        <span>Properties</span>
        <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-mono">
          {part.shape.toUpperCase()}
        </span>
      </div>

      <div className="p-3 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Name</label>
          <input
            type="text"
            value={part.name}
            onChange={(e) => onUpdatePart(part.id, { name: e.target.value })}
            className="w-full bg-[#141414] border border-zinc-700/80 rounded px-2 py-1 text-zinc-100 text-xs focus:border-sky-500 focus:outline-none"
          />
        </div>

        {/* Appearance Section */}
        <div className="border-t border-zinc-800 pt-3 space-y-3">
          <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">Appearance</div>

          {/* Color & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] text-zinc-400">Color</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={part.color}
                  onChange={(e) => onUpdatePart(part.id, { color: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer border border-zinc-700 bg-transparent"
                />
                <span className="font-mono text-[10px] text-zinc-400">{part.color}</span>
              </div>
            </div>
            {/* Quick Color Swatches */}
            <div className="grid grid-cols-8 gap-1">
              {COLOR_PRESETS.map((hex) => (
                <button
                  key={hex}
                  onClick={() => onUpdatePart(part.id, { color: hex })}
                  className={`w-6 h-6 rounded border transition ${
                    part.color.toLowerCase() === hex.toLowerCase() ? 'border-white scale-110' : 'border-zinc-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          {/* Material */}
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Material</label>
            <select
              value={part.material}
              onChange={(e) => onUpdatePart(part.id, { material: e.target.value as PartMaterial })}
              className="w-full bg-[#141414] border border-zinc-700/80 rounded px-2 py-1 text-zinc-200 text-xs focus:border-sky-500 focus:outline-none"
            >
              {MATERIAL_OPTIONS.map((mat) => (
                <option key={mat} value={mat}>
                  {mat}
                </option>
              ))}
            </select>
          </div>

          {/* Transparency Slider */}
          <div>
            <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
              <span>Transparency</span>
              <span className="font-mono">{part.transparency.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={part.transparency}
              onChange={(e) => onUpdatePart(part.id, { transparency: parseFloat(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Transform (Data) Section */}
        <div className="border-t border-zinc-800 pt-3 space-y-3">
          <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">Transform</div>

          {/* Position */}
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Position (X, Y, Z)</label>
            <div className="grid grid-cols-3 gap-1">
              {[0, 1, 2].map((axis) => (
                <div key={axis} className="flex items-center bg-[#141414] border border-zinc-700/80 rounded px-1.5 py-0.5">
                  <span className="text-[10px] text-zinc-500 font-bold mr-1">
                    {axis === 0 ? 'X' : axis === 1 ? 'Y' : 'Z'}
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    value={part.position[axis as 0 | 1 | 2]}
                    onChange={(e) => handlePosChange(axis as 0 | 1 | 2, parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-zinc-200 text-xs font-mono focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Size (Width, Height, Depth)</label>
            <div className="grid grid-cols-3 gap-1">
              {[0, 1, 2].map((axis) => (
                <div key={axis} className="flex items-center bg-[#141414] border border-zinc-700/80 rounded px-1.5 py-0.5">
                  <span className="text-[10px] text-zinc-500 font-bold mr-1">
                    {axis === 0 ? 'W' : axis === 1 ? 'H' : 'D'}
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={part.size[axis as 0 | 1 | 2]}
                    onChange={(e) => handleSizeChange(axis as 0 | 1 | 2, parseFloat(e.target.value) || 1)}
                    className="w-full bg-transparent text-zinc-200 text-xs font-mono focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Rotation */}
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Rotation (Degrees)</label>
            <div className="grid grid-cols-3 gap-1">
              {[0, 1, 2].map((axis) => (
                <div key={axis} className="flex items-center bg-[#141414] border border-zinc-700/80 rounded px-1.5 py-0.5">
                  <span className="text-[10px] text-zinc-500 font-bold mr-1">
                    {axis === 0 ? 'X' : axis === 1 ? 'Y' : 'Z'}
                  </span>
                  <input
                    type="number"
                    step="15"
                    value={part.rotation[axis as 0 | 1 | 2]}
                    onChange={(e) => handleRotChange(axis as 0 | 1 | 2, parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-zinc-200 text-xs font-mono focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Physics & Collision */}
        <div className="border-t border-zinc-800 pt-3 space-y-2">
          <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">Collision</div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={part.canCollide}
                onChange={(e) => onUpdatePart(part.id, { canCollide: e.target.checked })}
                className="rounded accent-sky-500"
              />
              <span className="text-zinc-300">CanCollide</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={part.anchored}
                onChange={(e) => onUpdatePart(part.id, { anchored: e.target.checked })}
                className="rounded accent-sky-500"
              />
              <span className="text-zinc-300">Anchored</span>
            </label>
          </div>
        </div>

        {/* Gameplay Behaviors */}
        <div className="border-t border-zinc-800 pt-3 space-y-3">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Gameplay Trigger</div>
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Behavior Mode</label>
            <select
              value={part.behavior}
              onChange={(e) => onUpdatePart(part.id, { behavior: e.target.value as PartBehavior })}
              className="w-full bg-[#141414] border border-zinc-700/80 rounded px-2 py-1 text-zinc-200 text-xs focus:border-sky-500 focus:outline-none font-medium"
            >
              {BEHAVIOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Behavior Parameter based on selection */}
          {(part.behavior === 'trampoline' || part.behavior === 'speed_boost' || part.behavior === 'conveyor' || part.behavior === 'spinner' || part.behavior === 'checkpoint') && (
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                {part.behavior === 'trampoline' ? 'Bounce Velocity (Default 22)' :
                 part.behavior === 'speed_boost' ? 'Speed Multiplier (Default 2.2)' :
                 part.behavior === 'conveyor' ? 'Conveyor Push Force (Default 8)' :
                 part.behavior === 'spinner' ? 'Rotation Rad/s (Default 1.8)' :
                 'Stage Number (e.g. 1, 2, 3)'}
              </label>
              <input
                type="number"
                step="0.5"
                value={part.behaviorParam ?? (part.behavior === 'trampoline' ? 22 : part.behavior === 'checkpoint' ? 1 : 2)}
                onChange={(e) => onUpdatePart(part.id, { behaviorParam: parseFloat(e.target.value) })}
                className="w-full bg-[#141414] border border-zinc-700/80 rounded px-2 py-1 text-zinc-200 text-xs font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
