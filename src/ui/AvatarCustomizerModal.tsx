import React from 'react';
import { AvatarConfig, DEFAULT_AVATAR } from '../types/game';
import { User, Check, X, Sparkles } from 'lucide-react';
import { sounds } from '../audio/soundManager';

interface AvatarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AvatarConfig;
  onUpdateConfig: (newConfig: Partial<AvatarConfig>) => void;
}

const SKIN_COLORS = ['#F5CD2F', '#fde047', '#fed7aa', '#f87171', '#38bdf8', '#4ade80'];
const TORSO_COLORS = ['#0D69AC', '#dc2626', '#16a34a', '#9333ea', '#18181b', '#f8fafc'];
const LEG_COLORS = ['#A4BD47', '#1e293b', '#2563eb', '#991b1b', '#475569'];

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  if (!isOpen) return null;

  const applyPreset = (preset: Partial<AvatarConfig>) => {
    onUpdateConfig(preset);
    sounds.playStudioSnap();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 select-none">
      <div className="bg-[#1e1e1e] border border-zinc-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#252526] px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-sky-400" />
            <span className="font-fredoka font-semibold text-white text-base">
              Blox Avatar Wardrobe
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-zinc-500 font-bold uppercase text-[10px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Preset:
          </span>
          <button
            onClick={() => applyPreset(DEFAULT_AVATAR)}
            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 whitespace-nowrap text-xs"
          >
            Classic Noob
          </button>
          <button
            onClick={() =>
              applyPreset({
                headColor: '#fbbf24',
                torsoColor: '#d97706',
                leftArmColor: '#fbbf24',
                rightArmColor: '#fbbf24',
                leftLegColor: '#92400e',
                rightLegColor: '#92400e',
                hatType: 'golden_crown',
                faceType: 'epic',
              })
            }
            className="px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-600/50 whitespace-nowrap text-xs"
          >
            Golden King
          </button>
          <button
            onClick={() =>
              applyPreset({
                headColor: '#fed7aa',
                torsoColor: '#18181b',
                leftArmColor: '#18181b',
                rightArmColor: '#18181b',
                leftLegColor: '#18181b',
                rightLegColor: '#18181b',
                hatType: 'ninja_headband',
                faceType: 'cool',
              })
            }
            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 whitespace-nowrap text-xs"
          >
            Shadow Ninja
          </button>
        </div>

        {/* Customization Options */}
        <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto text-xs">
          {/* Hat / Head Accessory */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">
              Hats & Accessories
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'None (Bald)' },
                { id: 'baseball_cap', label: 'Red Blox Cap' },
                { id: 'golden_crown', label: 'Golden Crown' },
                { id: 'ninja_headband', label: 'Ninja Headband' },
                { id: 'blox_visor', label: 'Neon Cyber Visor' },
              ].map((hat) => (
                <button
                  key={hat.id}
                  onClick={() => {
                    onUpdateConfig({ hatType: hat.id as AvatarConfig['hatType'] });
                    sounds.playStudioSnap();
                  }}
                  className={`p-2 rounded-xl border text-left transition ${
                    config.hatType === hat.id
                      ? 'bg-sky-950 border-sky-400 text-sky-200 ring-1 ring-sky-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-semibold">{hat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Face Decal */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">
              Face Decal
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'smile', label: 'Classic Smile' },
                { id: 'chill', label: 'Chill Face' },
                { id: 'cool', label: 'Cool Sunglasses' },
                { id: 'epic', label: 'Epic Face' },
              ].map((face) => (
                <button
                  key={face.id}
                  onClick={() => {
                    onUpdateConfig({ faceType: face.id as AvatarConfig['faceType'] });
                    sounds.playStudioSnap();
                  }}
                  className={`p-2 rounded-xl border text-center transition ${
                    config.faceType === face.id
                      ? 'bg-sky-950 border-sky-400 text-sky-200 ring-1 ring-sky-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-semibold">{face.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Skin & Head Color */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">
              Head & Arms (Skin)
            </label>
            <div className="flex items-center gap-2">
              {SKIN_COLORS.map((hex) => (
                <button
                  key={hex}
                  onClick={() => {
                    onUpdateConfig({
                      headColor: hex,
                      leftArmColor: hex,
                      rightArmColor: hex,
                    });
                    sounds.playStudioSnap();
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition ${
                    config.headColor.toLowerCase() === hex.toLowerCase()
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-zinc-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          {/* Torso Shirt Color */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">
              Torso (Shirt)
            </label>
            <div className="flex items-center gap-2">
              {TORSO_COLORS.map((hex) => (
                <button
                  key={hex}
                  onClick={() => {
                    onUpdateConfig({ torsoColor: hex });
                    sounds.playStudioSnap();
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition ${
                    config.torsoColor.toLowerCase() === hex.toLowerCase()
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-zinc-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          {/* Legs Pants Color */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">
              Legs (Pants)
            </label>
            <div className="flex items-center gap-2">
              {LEG_COLORS.map((hex) => (
                <button
                  key={hex}
                  onClick={() => {
                    onUpdateConfig({
                      leftLegColor: hex,
                      rightLegColor: hex,
                    });
                    sounds.playStudioSnap();
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition ${
                    config.leftLegColor.toLowerCase() === hex.toLowerCase()
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-zinc-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#252526] px-4 py-3 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-fredoka font-semibold rounded-xl shadow transition"
          >
            <Check className="w-4 h-4" />
            <span>Equip & Return</span>
          </button>
        </div>
      </div>
    </div>
  );
};
