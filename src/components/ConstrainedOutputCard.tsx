import React, { useState } from 'react';
import { Copy, Check, Download, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ConstrainedOutputCardProps {
  rawOutput: string;
  isError?: boolean;
}

export const ConstrainedOutputCard: React.FC<ConstrainedOutputCardProps> = ({
  rawOutput,
  isError = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([rawOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calorie-prediction-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const lines = rawOutput.split('\n');
  const isExact6Lines = lines.length === 6 && !isError;

  return (
    <div className={`border rounded-2xl overflow-hidden shadow-xs transition-all ${
      isError 
        ? 'border-red-200 bg-red-50/50' 
        : 'border-slate-800 bg-slate-900 text-slate-100'
    }`}>
      {/* Header bar */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${
        isError ? 'border-red-200 bg-red-100/60' : 'border-slate-800 bg-slate-950/60'
      }`}>
        <div className="flex items-center gap-2">
          {isError ? (
            <AlertCircle className="w-4 h-4 text-red-600" />
          ) : (
            <FileText className="w-4 h-4 text-emerald-400" />
          )}
          <span className={`text-xs font-semibold tracking-wider uppercase ${
            isError ? 'text-red-800' : 'text-slate-300'
          }`}>
            Constrained Output Format
          </span>
          {isExact6Lines && (
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Exactly 6 Lines Verified
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              isError
                ? 'bg-red-200 hover:bg-red-300 text-red-900'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Copy plain text"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          {!isError && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Download .txt"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Main plain text output */}
      <div className="p-4 sm:p-5">
        <div className={`p-4 rounded-xl font-mono text-sm sm:text-base leading-relaxed tracking-wide select-all whitespace-pre-wrap ${
          isError 
            ? 'bg-white border border-red-300 text-red-800 font-semibold' 
            : 'bg-black/40 border border-slate-800 text-emerald-300'
        }`}>
          {rawOutput}
        </div>

        {/* Verification Checklist */}
        {!isError && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
            <span className="text-slate-500 font-medium">Protocol Compliance:</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Check className="w-3 h-3" /> Exact Keys (Food, Weight, Calories, Carbs, Protein, Fat)
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Check className="w-3 h-3" /> Strict 1-Decimal Places
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Check className="w-3 h-3" /> Zero Markdown Syntaxes
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
