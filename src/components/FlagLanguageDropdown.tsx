import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { ChevronDown, Check, Volume2, Subtitles, Globe } from 'lucide-react';

export interface FlagDropdownProps {
  id?: string;
  selectedLang: Language;
  onSelectLang: (lang: Language) => void;
  type?: 'mp3' | 'vtt' | 'language';
  darkMode?: boolean;
  availableLangs?: Language[];
  tooltip?: string;
}

export const LANGUAGE_METADATA: {
  code: Language;
  label: string;
  nativeLabel: string;
  flagCode: string;
}[] = [
  { code: 'EN', label: 'English', nativeLabel: 'English', flagCode: 'GB' },
  { code: 'ES', label: 'Spanish', nativeLabel: 'Español', flagCode: 'ES' },
  { code: 'NL', label: 'Dutch', nativeLabel: 'Nederlands', flagCode: 'NL' },
  { code: 'IT', label: 'Italian', nativeLabel: 'Italiano', flagCode: 'IT' },
  { code: 'PT-pt', label: 'Portuguese', nativeLabel: 'Português', flagCode: 'PT' },
];

export const CircularFlag: React.FC<{ code: Language; size?: number; className?: string }> = ({
  code,
  size = 30,
  className = '',
}) => {
  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 select-none shadow-[0_2px_6px_rgba(0,0,0,0.35)] ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 2px 5px rgba(0,0,0,0.3)',
      }}
    >
      {/* 1. Base Flag Graphic */}
      {code === 'EN' && (
        <svg viewBox="0 0 60 60" className="w-full h-full block">
          <defs>
            <clipPath id="uk-circle-clip">
              <circle cx="30" cy="30" r="30" />
            </clipPath>
          </defs>
          <g clipPath="url(#uk-circle-clip)">
            {/* Deep Royal Navy */}
            <rect width="60" height="60" fill="#012169" />
            {/* White Diagonals */}
            <path d="M0,0 L60,60 M60,0 L0,60" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="square" />
            {/* Red Diagonals */}
            <path d="M0,0 L60,60 M60,0 L0,60" stroke="#C8102E" strokeWidth="4" strokeLinecap="square" />
            {/* White Central Cross */}
            <path d="M30,0 v60 M0,30 h60" stroke="#FFFFFF" strokeWidth="18" />
            {/* Red Central Cross */}
            <path d="M30,0 v60 M0,30 h60" stroke="#C8102E" strokeWidth="10" />
          </g>
        </svg>
      )}

      {code === 'ES' && (
        <svg viewBox="0 0 60 60" className="w-full h-full block">
          <defs>
            <clipPath id="es-circle-clip">
              <circle cx="30" cy="30" r="30" />
            </clipPath>
          </defs>
          <g clipPath="url(#es-circle-clip)">
            <rect width="60" height="15" fill="#AA151B" />
            <rect y="15" width="60" height="30" fill="#F1BF00" />
            <rect y="45" width="60" height="15" fill="#AA151B" />
            {/* Coat of arms shield emblem */}
            <circle cx="21" cy="30" r="6" fill="#AA151B" opacity="0.95" />
            <circle cx="21" cy="30" r="4.2" fill="#F1BF00" />
            <circle cx="21" cy="30" r="2.5" fill="#AA151B" />
            <rect x="20" y="22" width="2" height="3" fill="#AA151B" />
          </g>
        </svg>
      )}

      {code === 'NL' && (
        <svg viewBox="0 0 60 60" className="w-full h-full block">
          <defs>
            <clipPath id="nl-circle-clip">
              <circle cx="30" cy="30" r="30" />
            </clipPath>
          </defs>
          <g clipPath="url(#nl-circle-clip)">
            <rect width="60" height="20" fill="#AE1C28" />
            <rect y="20" width="60" height="20" fill="#FFFFFF" />
            <rect y="40" width="60" height="20" fill="#21468B" />
          </g>
        </svg>
      )}

      {code === 'IT' && (
        <svg viewBox="0 0 60 60" className="w-full h-full block">
          <defs>
            <clipPath id="it-circle-clip">
              <circle cx="30" cy="30" r="30" />
            </clipPath>
          </defs>
          <g clipPath="url(#it-circle-clip)">
            <rect width="20" height="60" fill="#009246" />
            <rect x="20" width="20" height="60" fill="#FFFFFF" />
            <rect x="40" width="20" height="60" fill="#CE2B37" />
          </g>
        </svg>
      )}

      {code === 'PT-pt' && (
        <svg viewBox="0 0 60 60" className="w-full h-full block">
          <defs>
            <clipPath id="pt-circle-clip">
              <circle cx="30" cy="30" r="30" />
            </clipPath>
          </defs>
          <g clipPath="url(#pt-circle-clip)">
            <rect width="24" height="60" fill="#046A38" />
            <rect x="24" width="36" height="60" fill="#DA291C" />
            {/* Portuguese Armillary Sphere Shield */}
            <circle cx="24" cy="30" r="9" fill="#FFCC00" />
            <circle cx="24" cy="30" r="6" fill="#DA291C" />
            <circle cx="24" cy="30" r="3.5" fill="#FFFFFF" />
            <circle cx="24" cy="30" r="2" fill="#012169" />
          </g>
        </svg>
      )}

      {/* 2. Realistic 3D Convex Gloss / Specular Shine Overlay */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 45%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.3) 100%)',
        }}
      />

      {/* 3. Gold Beveled Metallic Rim */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: '2px solid #d4af37',
          boxShadow: 'inset 0 0 3px rgba(212,175,55,0.8), 0 0 2px rgba(255,235,160,0.5)',
        }}
      />
    </div>
  );
};

export const FlagLanguageDropdown: React.FC<FlagDropdownProps> = ({
  id,
  selectedLang,
  onSelectLang,
  type = 'language',
  darkMode = true,
  availableLangs,
  tooltip,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const displayedOptions = availableLangs
    ? LANGUAGE_METADATA.filter((item) => availableLangs.includes(item.code))
    : LANGUAGE_METADATA;

  const currentMeta = LANGUAGE_METADATA.find((l) => l.code === selectedLang) || LANGUAGE_METADATA[0];

  const defaultTooltip =
    tooltip ||
    (type === 'mp3'
      ? `Audio Voice: ${currentMeta.label}`
      : type === 'vtt'
      ? `Subtitles: ${currentMeta.label}`
      : `Language: ${currentMeta.label}`);

  return (
    <div
      ref={containerRef}
      id={id || `flag-dropdown-${type}`}
      className="relative inline-flex items-center select-none"
    >
      {/* Trigger Button with exact circular flag + golden chevron matching reference image */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`group flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 rounded-full border transition-all duration-200 cursor-pointer shadow-md hover:scale-105 active:scale-95 ${
          darkMode
            ? 'bg-slate-900/95 hover:bg-slate-800 border-[#d4af37]/80 text-[#fce0a2] shadow-[0_2px_12px_rgba(0,0,0,0.6)]'
            : 'bg-white/98 hover:bg-amber-50/90 border-[#d4af37] text-slate-900 shadow-[0_2px_10px_rgba(212,175,55,0.25)]'
        }`}
        title={defaultTooltip}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {/* Circular Glossy Flag Icon */}
        <CircularFlag code={selectedLang} size={26} />

        {/* Golden Metallic Chevron Down Arrow */}
        <div className="flex items-center justify-center pr-0.5">
          <svg
            className={`w-3.5 h-3.5 text-[#d4af37] transition-transform duration-250 ${
              isOpen ? 'rotate-180' : ''
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div
          className={`absolute ${
            type === 'vtt' ? 'right-0 bottom-full mb-2 sm:mb-3' : 'right-0 top-full mt-2'
          } z-[100] min-w-[180px] sm:min-w-[205px] rounded-2xl border-2 border-[#d4af37] backdrop-blur-2xl p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-150 ${
            darkMode ? 'bg-slate-950/98 text-slate-100' : 'bg-[#fffdfa]/98 text-slate-900'
          }`}
          role="listbox"
        >
          {/* Header Label */}
          <div
            className={`flex items-center justify-between px-2.5 py-1.5 mb-1 border-b text-[10px] sm:text-xs font-bold uppercase tracking-wider font-cinzel ${
              darkMode ? 'border-[#d4af37]/30 text-[#d4af37]' : 'border-[#d4af37]/40 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {type === 'mp3' ? (
                <Volume2 className="w-3.5 h-3.5 text-[#d4af37]" />
              ) : type === 'vtt' ? (
                <Subtitles className="w-3.5 h-3.5 text-[#d4af37]" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-[#d4af37]" />
              )}
              <span>
                {type === 'mp3'
                  ? 'Audio (MP3)'
                  : type === 'vtt'
                  ? 'Subtitles (VTT)'
                  : 'Language'}
              </span>
            </div>
            <span className="text-[9px] opacity-75 font-mono">
              {selectedLang === 'PT-pt' ? 'PT' : selectedLang}
            </span>
          </div>

          {/* Language Options List */}
          <div className="space-y-0.5">
            {displayedOptions.map((item) => {
              const isSelected = item.code === selectedLang;
              const shortCode = item.code === 'PT-pt' ? 'PT' : item.code;

              return (
                <button
                  key={item.code}
                  id={`${id || `flag-dropdown-${type}`}-opt-${item.code}`}
                  data-lang={item.code}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLang(item.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#d4af37] text-slate-950 font-bold shadow'
                      : darkMode
                      ? 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                      : 'text-slate-800 hover:bg-amber-100/80 hover:text-black'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2">
                    <CircularFlag code={item.code} size={22} />
                    <div className="flex flex-col text-left">
                      <span className="leading-tight text-[11px] sm:text-xs">
                        {item.nativeLabel}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-mono ${
                          isSelected
                            ? 'text-slate-950 font-bold'
                            : darkMode
                            ? 'text-slate-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-black/20 text-slate-950'
                          : darkMode
                          ? 'bg-slate-800 text-amber-300'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {shortCode}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
