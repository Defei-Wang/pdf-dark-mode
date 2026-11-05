import React, { useState } from 'react';
import { COLOR_PRESETS } from '../constants/presets';
import { ColorPreset } from '../types';
import { Sliders, Check } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface ColorSelectorProps {
  selectedPreset: ColorPreset;
  onSelectPreset: (preset: ColorPreset) => void;
  customColor: [number, number, number];
  onCustomColorChange: (color: [number, number, number]) => void;
  isCustom: boolean;
  setIsCustom: (val: boolean) => void;
  disabled?: boolean;
  lang: Language;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
  customColor,
  onCustomColorChange,
  isCustom,
  setIsCustom,
  disabled = false,
  lang,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const t = translations[lang];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">{t.colorPrefTitle}</h2>
          <p className="text-xs text-zinc-400 mt-0.5">{t.colorPrefDesc}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            const next = !showAdvanced;
            setShowAdvanced(next);
            if (next && !isCustom) {
              setIsCustom(true);
            }
          }}
          disabled={disabled}
          className="text-xs flex items-center gap-1 text-zinc-400 hover:text-zinc-200 disabled:opacity-50"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showAdvanced ? t.presetBtnSimple : t.presetBtnCustom}</span>
        </button>
      </div>

      {!showAdvanced ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {COLOR_PRESETS.map((preset) => {
            const isSelected = !isCustom && selectedPreset.id === preset.id;
            const presetI18n = t.presets[preset.id as keyof typeof t.presets];
            const name = presetI18n?.name || preset.name;
            const desc = presetI18n?.description || preset.description;

            return (
              <button
                key={preset.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setIsCustom(false);
                  onSelectPreset(preset);
                }}
                className={`relative p-3 rounded-lg border text-left transition-all flex items-start space-x-3 ${
                  isSelected
                    ? 'border-sky-500 bg-sky-950/20 ring-1 ring-sky-500/50'
                    : 'border-zinc-850 bg-zinc-800/40 hover:bg-zinc-800/80 border-zinc-800'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {/* 模拟的底色/字色小色块 */}
                <div
                  className="w-7 h-7 rounded border border-zinc-700/80 flex items-center justify-center flex-shrink-0 text-[10px] font-bold shadow-inner"
                  style={{
                    backgroundColor: preset.badgeBg,
                    color: preset.badgeText,
                  }}
                >
                  Aa
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-200">{name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3.5 bg-zinc-950/60 p-4 rounded-lg border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-300">
            <span>{t.currentVector}</span>
            <span className="font-mono text-sky-400">
              [{customColor[0].toFixed(2)}, {customColor[1].toFixed(2)}, {customColor[2].toFixed(2)}]
            </span>
          </div>

          <div className="space-y-2">
            {(['R', 'G', 'B'] as const).map((channel, idx) => (
              <div key={channel} className="flex items-center space-x-3 text-xs">
                <span className="w-4 font-mono text-zinc-400 font-semibold">{channel}</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.01"
                  disabled={disabled}
                  value={customColor[idx]}
                  onChange={(e) => {
                    const next = [...customColor] as [number, number, number];
                    next[idx] = parseFloat(e.target.value);
                    onCustomColorChange(next);
                  }}
                  className="flex-1 accent-sky-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <span className="w-10 text-right font-mono text-zinc-400">
                  {customColor[idx].toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
            <span>{t.customNote}</span>
            <button
              type="button"
              onClick={() => {
                setIsCustom(false);
                setShowAdvanced(false);
              }}
              className="text-sky-400 hover:underline"
            >
              {t.backToPresets}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
