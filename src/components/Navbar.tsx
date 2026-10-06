import React from 'react';
import { Database, Sparkles, Scale, Info } from 'lucide-react';

interface NavbarProps {
  onOpenDatabase: () => void;
  databaseCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDatabase, databaseCount }) => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-lg tracking-tight">
                NutriVision
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Prototype
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              AI Vision & Nutritional Matrix Scaler
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strict 1-Decimal Math: <code className="text-slate-800 font-mono">(Val×g)/100</code></span>
          </div>

          <button
            onClick={onOpenDatabase}
            className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors px-3 py-2 rounded-lg border border-slate-200 cursor-pointer"
            title="Browse all verified items in Database Matrix"
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Database Matrix</span>
            <span className="bg-emerald-600 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              {databaseCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
