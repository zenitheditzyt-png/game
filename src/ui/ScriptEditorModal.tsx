import React, { useState } from 'react';
import { PartData } from '../types/game';
import { Code, Play, Check, X, Sparkles, BookOpen } from 'lucide-react';
import { sounds } from '../audio/soundManager';

interface ScriptEditorModalProps {
  part: PartData | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveScript: (partId: string, scriptCode: string) => void;
}

const LUA_PRESETS = [
  {
    name: 'Kill Player on Touch (Lava)',
    code: `-- Classic Roblox Kill Brick Script
local part = script.Parent

local function onTouch(hit)
    local humanoid = hit.Parent:FindFirstChild("Humanoid")
    if humanoid then
        humanoid.Health = 0
        print("Oof! Player touched lava.")
    end
end

part.Touched:Connect(onTouch)`,
  },
  {
    name: 'Super Jump Trampoline',
    code: `-- Super Spring Bounce
local part = script.Parent

part.Touched:Connect(function(hit)
    local root = hit.Parent:FindFirstChild("HumanoidRootPart")
    if root then
        root.Velocity = Vector3.new(0, 75, 0)
        part.Sound:Play()
    end
end)`,
  },
  {
    name: 'Disappearing Block with Respawn',
    code: `-- Fade away after touched, then return
local part = script.Parent
local isFading = false

part.Touched:Connect(function(hit)
    if not isFading then
        isFading = true
        wait(0.5)
        part.Transparency = 1
        part.CanCollide = false
        wait(3)
        part.Transparency = 0
        part.CanCollide = true
        isFading = false
    end
end)`,
  },
  {
    name: 'Continuous Spinner',
    code: `-- Spin Part around Y-axis
local part = script.Parent
local RunService = game:GetService("RunService")

RunService.Heartbeat:Connect(function(dt)
    part.CFrame = part.CFrame * CFrame.Angles(0, math.rad(90 * dt), 0)
end)`,
  },
];

export const ScriptEditorModal: React.FC<ScriptEditorModalProps> = ({
  part,
  isOpen,
  onClose,
  onSaveScript,
}) => {
  if (!isOpen || !part) return null;

  const [code, setCode] = useState(
    part.scriptCode ||
      `-- Script attached to ${part.name}
local part = script.Parent

print("${part.name} initialized!")

part.Touched:Connect(function(hit)
    print("Touched by: " .. hit.Name)
end)`
  );

  const [savedAlert, setSavedAlert] = useState(false);

  const handleApplyPreset = (presetCode: string) => {
    setCode(presetCode);
    sounds.playStudioSnap();
  };

  const handleSave = () => {
    onSaveScript(part.id, code);
    setSavedAlert(true);
    sounds.playStudioSnap();
    setTimeout(() => {
      setSavedAlert(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 select-none">
      <div className="bg-[#1e1e1e] border border-zinc-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
        {/* Editor Title Bar */}
        <div className="bg-[#252526] px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white text-sm">
              Script Editor - <span className="text-sky-400 font-mono">{part.name}.lua</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Snippets bar */}
        <div className="bg-[#18181b] border-b border-zinc-800 px-3 py-1.5 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-zinc-500 font-bold uppercase text-[10px] flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            Presets:
          </span>
          {LUA_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p.code)}
              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white whitespace-nowrap text-[11px] border border-zinc-700 transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              {p.name}
            </button>
          ))}
        </div>

        {/* Code Textarea with line numbers */}
        <div className="flex-1 flex bg-[#141414] font-mono text-xs overflow-hidden">
          {/* Fake line numbers */}
          <div className="bg-[#18181b] text-zinc-600 px-3 py-3 select-none text-right font-mono text-[11px] border-r border-zinc-800">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 p-3 bg-transparent text-emerald-300 focus:outline-none resize-none leading-relaxed selection:bg-sky-700"
          />
        </div>

        {/* Bottom bar */}
        <div className="bg-[#252526] px-4 py-2.5 border-t border-zinc-800 flex items-center justify-between text-xs">
          <div className="text-zinc-400 text-[11px]">
            Roblox Lua syntax · Embedded runtime simulator
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition"
            >
              {savedAlert ? <Check className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{savedAlert ? 'Applied & Saved!' : 'Apply Script'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
