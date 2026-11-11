import React, { useState } from 'react';
import { PartData } from '../types/game';
import { Folder, Box, Flame, Flag, Zap, ArrowUp, Disc, Search, Trash2, Copy } from 'lucide-react';

interface StudioExplorerProps {
  parts: PartData[];
  selectedPartId: string | null;
  onSelectPart: (id: string) => void;
  onDeletePart: (id: string) => void;
  onDuplicatePart: () => void;
}

export const StudioExplorer: React.FC<StudioExplorerProps> = ({
  parts,
  selectedPartId,
  onSelectPart,
  onDeletePart,
  onDuplicatePart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParts = parts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.behavior.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPartIcon = (part: PartData) => {
    if (part.behavior === 'kill') return <Flame className="w-3.5 h-3.5 text-rose-500" />;
    if (part.behavior === 'checkpoint') return <Flag className="w-3.5 h-3.5 text-emerald-400" />;
    if (part.behavior === 'trampoline') return <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />;
    if (part.behavior === 'speed_boost') return <Zap className="w-3.5 h-3.5 text-amber-400" />;
    if (part.behavior === 'disappearing') return <Disc className="w-3.5 h-3.5 text-lime-400" />;
    return <Box className="w-3.5 h-3.5 text-sky-400" />;
  };

  return (
    <div className="w-64 bg-[#1e1e1e] border-r border-zinc-800 flex flex-col h-full text-xs text-zinc-300 select-none">
      {/* Explorer Header */}
      <div className="px-3 py-2 border-b border-zinc-800 bg-[#252526] font-semibold text-zinc-200 flex items-center justify-between">
        <span>Explorer</span>
        <span className="text-[10px] font-mono text-zinc-500">{parts.length} items</span>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-zinc-800">
        <div className="flex items-center gap-1.5 bg-[#141414] px-2 py-1 rounded border border-zinc-700/80">
          <Search className="w-3 h-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search Workspace..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-zinc-200 focus:outline-none placeholder-zinc-600"
          />
        </div>
      </div>

      {/* Hierarchy Tree */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {/* Workspace root node */}
        <div className="flex items-center gap-1.5 px-2 py-1 text-zinc-400 font-semibold">
          <Folder className="w-3.5 h-3.5 text-amber-400" />
          <span>Workspace</span>
        </div>

        {/* Child parts */}
        <div className="pl-4 space-y-0.5">
          {filteredParts.map((part) => {
            const isSelected = part.id === selectedPartId;
            return (
              <div
                key={part.id}
                onClick={() => onSelectPart(part.id)}
                className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer group transition ${
                  isSelected
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {getPartIcon(part)}
                  <span className="truncate">{part.name}</span>
                </div>

                {isSelected && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicatePart();
                      }}
                      className="p-0.5 hover:text-sky-200"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePart(part.id);
                      }}
                      className="p-0.5 hover:text-rose-300"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
