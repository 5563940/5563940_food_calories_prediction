import React from 'react';
import { Scale, Plus, Minus } from 'lucide-react';

interface PortionWeightSelectorProps {
  weightGrams: number;
  onChange: (weight: number) => void;
  disabled?: boolean;
}

const PRESET_GRAMS = [30, 50, 100, 150, 200, 250, 350, 500];

export const PortionWeightSelector: React.FC<PortionWeightSelectorProps> = ({
  weightGrams,
  onChange,
  disabled = false,
}) => {
  const handleStep = (delta: number) => {
    const next = Math.max(1, Math.min(2000, weightGrams + delta));
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 1) {
      onChange(Math.min(2000, Math.round(val)));
    } else if (e.target.value === '') {
      onChange(1);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-emerald-600" />
          Portion Weight Argument
        </label>
        <span className="text-[11px] font-medium text-slate-500">
          User Input in Grams (g)
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleStep(-10)}
          disabled={disabled || weightGrams <= 10}
          className="w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Decrease by 10g"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="relative flex-1">
          <input
            type="number"
            min="1"
            max="2000"
            step="1"
            value={weightGrams}
            onChange={handleInputChange}
            disabled={disabled}
            className="w-full h-10 text-center font-mono font-bold text-lg text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-8"
          />
          <span className="absolute right-3 top-2.5 font-mono text-sm text-slate-400 font-semibold pointer-events-none">
            g
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleStep(10)}
          disabled={disabled || weightGrams >= 2000}
          className="w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Increase by 10g"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Range slider */}
      <div className="space-y-1">
        <input
          type="range"
          min="1"
          max="500"
          value={weightGrams}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          disabled={disabled}
          className="w-full accent-emerald-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>1g</span>
          <span>100g (Standard)</span>
          <span>250g</span>
          <span>500g</span>
        </div>
      </div>

      {/* Preset pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {PRESET_GRAMS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            disabled={disabled}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              weightGrams === preset
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {preset}g
          </button>
        ))}
      </div>
    </div>
  );
};
