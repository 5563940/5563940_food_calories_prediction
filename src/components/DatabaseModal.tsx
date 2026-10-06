import React, { useState, useMemo } from 'react';
import { X, Search, Database, ArrowRight, Filter } from 'lucide-react';
import { FoodItem } from '../data/foodDatabase';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  foods: FoodItem[];
  onSelectFood: (food: FoodItem) => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  foods,
  onSelectFood,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    foods.forEach(f => set.add(f.category));
    return ['All', ...Array.from(set).sort()];
  }, [foods]);

  // Filter foods by search query and category
  const filteredFoods = useMemo(() => {
    const q = search.toLowerCase().trim();
    return foods.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [foods, search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Verified Database Matrix
              </h2>
              <p className="text-xs text-slate-500">
                {foods.length} items with laboratory nutrition scaled per 100g
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search food name, English name, or botanical scientific name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium px-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white font-medium shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs text-slate-500 mb-2 font-medium">
            Showing {filteredFoods.length} of {foods.length} items
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-3">Food Item & Taxonomy</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Calories</th>
                  <th className="p-3 text-right">Carbs</th>
                  <th className="p-3 text-right">Protein</th>
                  <th className="p-3 text-right">Fat</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredFoods.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-sans">
                      No foods matching &ldquo;{search}&rdquo;
                    </td>
                  </tr>
                ) : (
                  filteredFoods.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-emerald-50/50 transition-colors group cursor-pointer"
                      onClick={() => {
                        onSelectFood(item);
                        onClose();
                      }}
                    >
                      <td className="p-3 font-sans font-medium text-slate-900">
                        {item.name}
                      </td>
                      <td className="p-3 font-sans text-slate-500 text-[11px]">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-amber-700">
                        {item.calories100g}
                      </td>
                      <td className="p-3 text-right text-slate-700">
                        {item.carbs100g}g
                      </td>
                      <td className="p-3 text-right text-slate-700">
                        {item.protein100g}g
                      </td>
                      <td className="p-3 text-right text-slate-700">
                        {item.fat100g}g
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          className="px-2.5 py-1 text-[11px] font-sans font-semibold rounded-md bg-emerald-100 text-emerald-800 hover:bg-emerald-600 hover:text-white transition group-hover:shadow-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          Select <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Click any food item row to populate the vision calculator.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-100 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
