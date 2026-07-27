import React from 'react';
import { GridParams, GridSystemType } from '../types';
import {
  Palette,
  Eye,
  Layers,
  Sliders,
} from 'lucide-react';

interface GridControlsProps {
  gridParams: GridParams;
  onChangeParams: (newParams: GridParams) => void;
  onApplySystemPreset: (systemType: GridSystemType) => void;
}

const COLOR_PRESETS = [
  { name: '스위스 레드', hex: '#FF3B30' },
  { name: '일렉트릭 시안', hex: '#00F0FF' },
  { name: '에메랄드 라임', hex: '#10B981' },
  { name: '앰버 오렌지', hex: '#F59E0B' },
  { name: '모노 화이트', hex: '#FFFFFF' },
];

export const GridControls: React.FC<GridControlsProps> = ({
  gridParams,
  onChangeParams,
}) => {
  const updateParam = <K extends keyof GridParams>(key: K, value: GridParams[K]) => {
    onChangeParams({
      ...gridParams,
      [key]: value,
    });
  };

  return (
    <div className="bg-[#0F1015] border border-[#232733] text-white p-4 sm:p-5 shadow-xl flex flex-col gap-4 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#232733]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#FF3B30]" />
          <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">GRID_DISPLAY_CONTROLLER</h2>
        </div>
        <span className="text-[9px] font-bold text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/30 px-2 py-0.5 uppercase">
          SWISS_STUDIO_MODULAR
        </span>
      </div>

      {/* Layer Toggle Checkboxes */}
      <div className="space-y-2">
        <span className="block text-xs font-bold text-[#C2C8D6] uppercase flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-[#FF3B30]" />
          <span>VISIBILITY_LAYERS</span>
        </span>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <label className="flex items-center gap-2 p-2 bg-[#12141C] border border-[#232733] cursor-pointer hover:border-[#3A3F52]">
            <input
              type="checkbox"
              checked={gridParams.showColumns && gridParams.showRows}
              onChange={(e) => {
                updateParam('showColumns', e.target.checked);
                updateParam('showRows', e.target.checked);
              }}
              className="accent-[#FF3B30]"
            />
            <span className="text-[#C2C8D6]">MODULE_GRID (모듈)</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-[#12141C] border border-[#232733] cursor-pointer hover:border-[#3A3F52]">
            <input
              type="checkbox"
              checked={gridParams.showBoundingBoxes}
              onChange={(e) => updateParam('showBoundingBoxes', e.target.checked)}
              className="accent-[#FF3B30]"
            />
            <span className="text-[#C2C8D6]">BOUNDING_BOXES</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-[#12141C] border border-[#232733] cursor-pointer hover:border-[#3A3F52]">
            <input
              type="checkbox"
              checked={gridParams.showMargins}
              onChange={(e) => updateParam('showMargins', e.target.checked)}
              className="accent-[#FF3B30]"
            />
            <span className="text-[#C2C8D6]">MARGINS (여백선)</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-[#12141C] border border-[#232733] cursor-pointer hover:border-[#3A3F52]">
            <input
              type="checkbox"
              checked={gridParams.showKeylines}
              onChange={(e) => updateParam('showKeylines', e.target.checked)}
              className="accent-[#FF3B30]"
            />
            <span className="text-[#C2C8D6]">KEYLINES (가이드)</span>
          </label>
        </div>
      </div>

      {/* Color Presets */}
      <div className="space-y-2 pt-2 border-t border-[#232733]">
        <span className="block text-xs font-bold text-[#C2C8D6] uppercase flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-[#FF3B30]" />
          <span>LINE_COLOR_THEME</span>
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {COLOR_PRESETS.map((p) => {
            const isSelected = gridParams.color === p.hex;
            return (
              <button
                key={p.hex}
                onClick={() => updateParam('color', p.hex)}
                className={`flex items-center gap-1.5 px-2.5 py-1 border text-[10px] font-bold uppercase transition-all ${
                  isSelected
                    ? 'border-[#FF3B30] bg-[#2A1416] text-white'
                    : 'border-[#232733] bg-[#12141C] text-[#8C93A6] hover:bg-[#1A1D27]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 border border-white/20 shrink-0"
                  style={{ backgroundColor: p.hex }}
                />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Opacity & Sub-Division Slider */}
      <div className="space-y-3 pt-2 border-t border-[#232733]">
        <span className="block text-xs font-bold text-[#C2C8D6] uppercase flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#FF3B30]" />
          <span>GRID_OPACITY</span>
        </span>
        <div className="bg-[#12141C] p-3 border border-[#232733] space-y-2 text-[11px]">
          <div className="flex justify-between">
            <span className="text-[#8C93A6]">OPACITY</span>
            <span className="text-white font-bold">{Math.round(gridParams.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={gridParams.opacity}
            onChange={(e) => updateParam('opacity', Number(e.target.value))}
            className="w-full accent-[#FF3B30]"
          />
        </div>
      </div>
    </div>
  );
};
