import React from 'react';
import { Flame, Wheat, Beef, Droplet, ArrowRight, Activity, Percent } from 'lucide-react';
import { NutritionCalculation } from '../data/foodDatabase';

interface MacroVisualizerProps {
  calculation: NutritionCalculation;
}

export const MacroVisualizer: React.FC<MacroVisualizerProps> = ({ calculation }) => {
  const { foodItem, weightGrams, calories, carbs, protein, fat } = calculation;

  // Calorie breakdown by macronutrient (Carbs 4 kcal/g, Protein 4 kcal/g, Fat 9 kcal/g)
  const carbCalories = carbs * 4;
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const totalMacroCalories = carbCalories + proteinCalories + fatCalories || 1;

  const carbPct = Math.round((carbCalories / totalMacroCalories) * 100);
  const proteinPct = Math.round((proteinCalories / totalMacroCalories) * 100);
  const fatPct = Math.max(0, 100 - (carbPct + proteinPct));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold text-emerald-600 tracking-wider uppercase">
            Nutritional Computation
          </span>
          <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
            {foodItem.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Category: <span className="font-medium text-slate-700">{foodItem.category}</span> • Scaled for <strong className="text-slate-900">{weightGrams}g</strong> portion
          </p>
        </div>

        <div className="flex items-baseline gap-1 bg-amber-50 border border-amber-200/80 px-4 py-2.5 rounded-xl self-start sm:self-auto">
          <Flame className="w-5 h-5 text-amber-500 self-center" />
          <span className="font-mono text-2xl font-extrabold text-amber-900">
            {calories.toFixed(1)}
          </span>
          <span className="text-xs font-bold text-amber-700">kcal</span>
        </div>
      </div>

      {/* 3 Macro Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Carbs */}
        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold">
            <span className="flex items-center gap-1.5">
              <Wheat className="w-4 h-4 text-amber-600" />
              Carbohydrates
            </span>
            <span className="text-[11px] font-mono text-amber-700/80">{carbPct}% energy</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-bold text-slate-900">
              {carbs.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-slate-500">g</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {carbCalories.toFixed(1)} kcal ({foodItem.carbs100g}g per 100g)
          </div>
        </div>

        {/* Protein */}
        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-blue-800 font-semibold">
            <span className="flex items-center gap-1.5">
              <Beef className="w-4 h-4 text-blue-600" />
              Protein
            </span>
            <span className="text-[11px] font-mono text-blue-700/80">{proteinPct}% energy</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-bold text-slate-900">
              {protein.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-slate-500">g</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {proteinCalories.toFixed(1)} kcal ({foodItem.protein100g}g per 100g)
          </div>
        </div>

        {/* Fat */}
        <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-rose-800 font-semibold">
            <span className="flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-rose-600" />
              Total Fat
            </span>
            <span className="text-[11px] font-mono text-rose-700/80">{fatPct}% energy</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-bold text-slate-900">
              {fat.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-slate-500">g</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {fatCalories.toFixed(1)} kcal ({foodItem.fat100g}g per 100g)
          </div>
        </div>
      </div>

      {/* Macro Ratio Distribution Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>Macronutrient Caloric Ratio</span>
          <span className="font-mono text-[11px]">
            C:{carbPct}% • P:{proteinPct}% • F:{fatPct}%
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${carbPct}%` }}
            className="bg-amber-400 transition-all duration-500"
            title={`Carbs: ${carbPct}%`}
          />
          <div
            style={{ width: `${proteinPct}%` }}
            className="bg-blue-500 transition-all duration-500"
            title={`Protein: ${proteinPct}%`}
          />
          <div
            style={{ width: `${fatPct}%` }}
            className="bg-rose-400 transition-all duration-500"
            title={`Fat: ${fatPct}%`}
          />
        </div>
      </div>

      {/* Mathematical Scaling Verification Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
        <div className="px-3.5 py-2 bg-slate-100/70 border-b border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between">
          <span>Matrix Scaling Computation Breakdown</span>
          <span className="font-mono text-[11px] text-slate-500">
            Multiplier: ×{(weightGrams / 100).toFixed(2)}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50">
              <tr>
                <th className="py-2 px-3 font-semibold">Nutrient</th>
                <th className="py-2 px-3 font-semibold">Dataset (per 100g)</th>
                <th className="py-2 px-3 font-semibold text-center">Formula</th>
                <th className="py-2 px-3 font-semibold text-right">Scaled Result ({weightGrams}g)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Energy (kcal)</td>
                <td className="py-2 px-3 text-slate-600">{foodItem.calories100g}</td>
                <td className="py-2 px-3 text-center text-slate-400">({foodItem.calories100g} × {weightGrams}) / 100</td>
                <td className="py-2 px-3 text-right font-bold text-amber-600">{calories.toFixed(1)} kcal</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Carbohydrates</td>
                <td className="py-2 px-3 text-slate-600">{foodItem.carbs100g}g</td>
                <td className="py-2 px-3 text-center text-slate-400">({foodItem.carbs100g} × {weightGrams}) / 100</td>
                <td className="py-2 px-3 text-right font-bold text-slate-800">{carbs.toFixed(1)}g</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Protein</td>
                <td className="py-2 px-3 text-slate-600">{foodItem.protein100g}g</td>
                <td className="py-2 px-3 text-center text-slate-400">({foodItem.protein100g} × {weightGrams}) / 100</td>
                <td className="py-2 px-3 text-right font-bold text-slate-800">{protein.toFixed(1)}g</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Fat</td>
                <td className="py-2 px-3 text-slate-600">{foodItem.fat100g}g</td>
                <td className="py-2 px-3 text-center text-slate-400">({foodItem.fat100g} × {weightGrams}) / 100</td>
                <td className="py-2 px-3 text-right font-bold text-slate-800">{fat.toFixed(1)}g</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
