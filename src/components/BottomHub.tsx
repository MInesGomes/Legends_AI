import React, { useState } from 'react';
import { Type, ZoomIn, ZoomOut, Check, Sparkles, BookOpen, ShieldCheck, ChevronUp, ChevronDown, Minimize2, Maximize2 } from 'lucide-react';
import { UserProfile } from '../types';
import { getEffectiveDailyLimit } from '../lib/supabase';

export type FontScale = 'normal' | 'large' | 'xlarge';

interface BottomHubProps {
  fontScale: FontScale;
  onChangeFontScale: (scale: FontScale) => void;
  user: UserProfile | null;
  todayTalesCount?: number;
  onOpenProfile?: () => void;
  darkMode?: boolean;
}

export const BottomHub: React.FC<BottomHubProps> = ({
  fontScale,
  onChangeFontScale,
  user,
  todayTalesCount = 0,
  onOpenProfile,
  darkMode = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const effectiveLimit = getEffectiveDailyLimit(user);
  const isUnder18 = (user?.age ?? 20) < 18;

  const fontOptions: { key: FontScale; label: string; sizeLabel: string; percent: string }[] = [
    { key: 'normal', label: 'Standard', sizeLabel: 'A', percent: '100%' },
    { key: 'large', label: 'Large', sizeLabel: 'A+', percent: '115%' },
    { key: 'xlarge', label: 'X-Large', sizeLabel: 'A++', percent: '130%' },
  ];

  const handleStep = (direction: 'up' | 'down') => {
    if (direction === 'up') {
      if (fontScale === 'normal') onChangeFontScale('large');
      else if (fontScale === 'large') onChangeFontScale('xlarge');
    } else {
      if (fontScale === 'xlarge') onChangeFontScale('large');
      else if (fontScale === 'large') onChangeFontScale('normal');
    }
  };

  return (
    <aside
      aria-label="Accessibility and display settings"
      className="fixed bottom-3 inset-x-0 z-40 pointer-events-none flex justify-center px-4"
    >
      {isMinimized ? (
        /* Collapsed Floating Icon in the exact middle */
        <button
          onClick={() => setIsMinimized(false)}
          className={`pointer-events-auto group relative flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl backdrop-blur-xl cursor-pointer ${
            darkMode
              ? 'bg-[#101726]/95 border-[#d4af37] text-[#fce0a2] shadow-[0_8px_25px_rgba(212,175,55,0.35)]'
              : 'bg-white/95 border-[#d4af37] text-[#8a5d12] shadow-[0_8px_25px_rgba(212,175,55,0.3)]'
          }`}
          title="Open Text Size & Readability Hub"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#996515] p-0.5 flex items-center justify-center">
            <div className={`w-full h-full rounded-full flex items-center justify-center ${
              darkMode ? 'bg-[#101726]' : 'bg-white'
            }`}>
              <Type className="w-3.5 h-3.5 text-[#d4af37]" />
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-[#d4af37]">
            {fontOptions.find((o) => o.key === fontScale)?.percent}
          </span>
          <ChevronUp className="w-3.5 h-3.5 text-[#d4af37] group-hover:-translate-y-0.5 transition-transform" />
        </button>
      ) : (
        /* Full Bottom Hub Container */
        <div
          className={`pointer-events-auto max-w-xl w-full rounded-2xl border-2 transition-all duration-300 shadow-2xl backdrop-blur-xl animate-fadeIn ${
            darkMode
              ? 'bg-[#101726]/95 border-[#d4af37]/60 text-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
              : 'bg-white/95 border-[#d4af37]/70 text-slate-900 shadow-[0_8px_32px_rgba(212,175,55,0.25)]'
          }`}
        >
          {/* Expanded Controls Drawer */}
          {isOpen && (
            <div className="p-4 border-b border-[#d4af37]/30 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-[#d4af37]" />
                  <span className="text-xs sm:text-sm font-bold font-cinzel uppercase tracking-wider text-[#d4af37]">
                    Text Size &amp; Readability
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37]">
                  {fontOptions.find((o) => o.key === fontScale)?.percent} Size
                </span>
              </div>

              {/* Font Size Presets */}
              <div className="grid grid-cols-3 gap-2">
                {fontOptions.map((opt) => {
                  const isActive = fontScale === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => onChangeFontScale(opt.key)}
                      className={`py-2 px-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-slate-950 border-[#ffe599] font-bold shadow-md'
                          : darkMode
                          ? 'bg-[#182130] border-slate-700 text-slate-200 hover:border-[#d4af37]/60'
                          : 'bg-slate-50 border-slate-300 text-slate-800 hover:border-[#d4af37]/60'
                      }`}
                    >
                      <span className="font-bold text-sm sm:text-base font-serif">{opt.sizeLabel}</span>
                      <span className="text-[10px] sm:text-xs font-medium opacity-90">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Hub Main Strip Bar */}
          <div className="p-2 sm:p-2.5 flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Left: Quick Font Scale Stepper */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/40 text-xs font-bold font-cinzel">
                <Type className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="hidden sm:inline text-[#d4af37]">Font:</span>
                <span className="font-mono text-[#d4af37]">{fontOptions.find((o) => o.key === fontScale)?.percent}</span>
              </div>

              {/* Stepper Buttons */}
              <div className="flex items-center rounded-lg border border-[#d4af37]/50 overflow-hidden bg-black/20">
                <button
                  onClick={() => handleStep('down')}
                  disabled={fontScale === 'normal'}
                  className="p-1.5 px-2.5 text-xs font-bold hover:bg-[#d4af37]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Decrease Font Size"
                >
                  A-
                </button>
                <div className="w-[1px] h-4 bg-[#d4af37]/40" />
                <button
                  onClick={() => handleStep('up')}
                  disabled={fontScale === 'xlarge'}
                  className="p-1.5 px-2.5 text-xs font-bold hover:bg-[#d4af37]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[#d4af37]"
                  title="Increase Font Size"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Right: Expand Options & Minimise Button */}
            <div className="flex items-center gap-1.5">
              {/* Expand Toggle for Full Font Settings */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isOpen
                    ? 'bg-[#d4af37] text-slate-950 border-[#ffe599]'
                    : darkMode
                    ? 'bg-[#182130] border-[#d4af37]/50 text-[#fce0a2] hover:bg-[#1f2c42]'
                    : 'bg-amber-50 border-[#d4af37]/60 text-[#8a5d12] hover:bg-amber-100'
                }`}
                title="Toggle Font Size & Display options"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Options</span>
                {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>

              {/* Minimise to Center Icon Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(true);
                }}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-[#182130] border-slate-700 text-slate-300 hover:text-[#d4af37] hover:border-[#d4af37]/60'
                    : 'bg-slate-100 border-slate-300 text-slate-600 hover:text-[#8a5d12] hover:border-[#d4af37]/60'
                }`}
                title="Minimise Hub to small middle icon"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </aside>
  );
};

