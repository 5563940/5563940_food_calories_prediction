import React from 'react';
import { NutritionCalculation } from '../data/foodDatabase';
import { Trash2, Download, Flame, Layers } from 'lucide-react';

interface MealHistoryProps {
  history: NutritionCalculation[];
  onClear: () => void;
  onSelect: (item: NutritionCalculation) => void;
}

export const MealHistory: React.FC<MealHistoryProps> = ({
  history,
  onClear,
  onSelect,
}) => {
  if (history.length === 0) return null;

  // Compute accumulated meal totals
  const totalCalories = Number(history.reduce((acc, curr) => acc + curr.calories, 0).toFixed(1));
  const totalCarbs = Number(history.reduce((acc, curr) => acc + curr.carbs, 0).toFixed(1));
  const totalProtein = Number(history.reduce((acc, curr) => acc + curr.protein, 0).toFixed(1));
  const totalFat = Number(history.reduce((acc, curr) => acc + curr.fat, 0).toFixed(1));

  const handleExportMeal = () => {
    let summary = `=== MEAL NUTRITION SUMMARY ===\n`;
    summary += `Items Logged: ${history.length}\n`;
    summary += `Total Calories: ${totalCalories} kcal\n`;
    summary += `Total Carbs: ${totalCarbs}g | Total Protein: ${totalProtein}g | Total Fat: ${totalFat}g\n\n`;
    summary += `--- ITEM BREAKDOWN ---\n`;
    history.forEach((item, index) => {
      summary += `\n#${index + 1}\n${item.formattedOutput}\n`;
    });

    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meal-log-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            Session Meal Log ({history.length} items)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMeal}
            className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
            title="Download full meal report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Log</span>
          </button>
          <button
            onClick={onClear}
            className="text-xs text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
            title="Clear history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Aggregate stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-mono text-center">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold block">Total Energy</span>
          <span className="text-base font-bold text-amber-700">{totalCalories} kcal</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold block">Total Carbs</span>
          <span className="text-base font-bold text-slate-800">{totalCarbs}g</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold block">Total Protein</span>
          <span className="text-base font-bold text-slate-800">{totalProtein}g</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold block">Total Fat</span>
          <span className="text-base font-bold text-slate-800">{totalFat}g</span>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {history.map((item, idx) => (
          <div
            key={`${item.foodItem.id}-${idx}`}
            onClick={() => onSelect(item)}
            className="p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-colors flex items-center justify-between cursor-pointer group"
          >
            <div>
              <div className="font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-950">
                {item.foodItem.name}
              </div>
              <div className="text-[11px] text-slate-500">
                Portion: <span className="font-mono font-medium">{item.weightGrams}g</span> • C: {item.carbs}g • P: {item.protein}g • F: {item.fat}g
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono font-bold text-sm text-amber-700">
                {item.calories} kcal
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
