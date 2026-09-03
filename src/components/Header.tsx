import React, { useState } from 'react';
import { Sun, Moon, Download, User, Smartphone } from 'lucide-react';
import { UserProfile, Language } from '../types';
import { PWAInstallModal } from './PWAInstallModal';
import { t } from '../lib/i18n';

interface HeaderProps {
  user: UserProfile | null;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenProfile: () => void;
  deferredPrompt: any;
  onInstallPWA: () => void;
  isInstalled?: boolean;
}

// 8-Point 3D Faceted Compass Star with Golden Ring
const CompassStarIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8 sm:w-10 sm:h-10" }) => (
  <svg
    className={`${className} shrink-0 filter drop-shadow-[0_2px_4px_rgba(140,85,10,0.45)]`}
    viewBox="0 0 100 100"
    fill="none"
  >
    <defs>
      <linearGradient id="compassGoldLight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff8cf" />
        <stop offset="35%" stopColor="#f5ca4e" />
        <stop offset="100%" stopColor="#d49619" />
      </linearGradient>
      <linearGradient id="compassGoldDark" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c58913" />
        <stop offset="60%" stopColor="#9b6107" />
        <stop offset="100%" stopColor="#673c00" />
      </linearGradient>
      <linearGradient id="compassGoldRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fce595" />
        <stop offset="30%" stopColor="#d49c25" />
        <stop offset="70%" stopColor="#f7d976" />
        <stop offset="100%" stopColor="#8d5607" />
      </linearGradient>
    </defs>

    {/* Outer Circular Ring */}
    <circle
      cx="50"
      cy="50"
      r="36"
      stroke="url(#compassGoldRing)"
      strokeWidth="2.8"
      fill="none"
    />
    <circle
      cx="50"
      cy="50"
      r="33.5"
      stroke="#caa038"
      strokeWidth="0.8"
      strokeOpacity="0.6"
      fill="none"
    />

    {/* Diagonal Star Points (Intermediate Facets) */}
    {/* NE */}
    <polygon points="50,50 74,26 54,46" fill="url(#compassGoldLight)" />
    <polygon points="50,50 74,26 46,54" fill="url(#compassGoldDark)" />

    {/* SE */}
    <polygon points="50,50 74,74 54,54" fill="url(#compassGoldLight)" />
    <polygon points="50,50 74,74 46,54" fill="url(#compassGoldDark)" />

    {/* SW */}
    <polygon points="50,50 26,74 46,54" fill="url(#compassGoldLight)" />
    <polygon points="50,50 26,74 54,46" fill="url(#compassGoldDark)" />

    {/* NW */}
    <polygon points="50,50 26,26 46,46" fill="url(#compassGoldLight)" />
    <polygon points="50,50 26,26 54,46" fill="url(#compassGoldDark)" />

    {/* 4 Major Cardinal Points (Faceted 3D) */}
    {/* North (Top) */}
    <polygon points="50,4 50,50 43,50" fill="url(#compassGoldLight)" />
    <polygon points="50,4 50,50 57,50" fill="url(#compassGoldDark)" />

    {/* South (Bottom) */}
    <polygon points="50,96 50,50 43,50" fill="url(#compassGoldDark)" />
    <polygon points="50,96 50,50 57,50" fill="url(#compassGoldLight)" />

    {/* West (Left) */}
    <polygon points="4,50 50,50 50,43" fill="url(#compassGoldDark)" />
    <polygon points="4,50 50,50 50,57" fill="url(#compassGoldLight)" />

    {/* East (Right) */}
    <polygon points="96,50 50,50 50,43" fill="url(#compassGoldLight)" />
    <polygon points="96,50 50,50 50,57" fill="url(#compassGoldDark)" />

    {/* Center Diamond / Hub Accent */}
    <circle cx="50" cy="50" r="2.8" fill="#ffeaa2" stroke="#875306" strokeWidth="1" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  user,
  currentLang,
  todayTalesCount = 0,
  onLanguageChange,
  darkMode,
  onToggleDarkMode,
  onOpenProfile,
  deferredPrompt,
  onInstallPWA,
  isInstalled = false,
}) => {
  const [showPwaModal, setShowPwaModal] = useState(false);

  const handlePwaClick = () => {
    if (deferredPrompt) {
      onInstallPWA();
    } else {
      setShowPwaModal(true);
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 px-4 py-2.5 shadow-sm ${
        darkMode 
          ? 'bg-[#121824]/90 text-slate-100' 
          : 'bg-[#fefdfa]/95 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: User Avatar Profile Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenProfile}
              className="group relative p-0.5 rounded-full bg-gradient-to-tr from-[#d4af37] via-[#fce0a2] to-[#996515] transition-transform active:scale-95 hover:scale-105 shadow-md"
              title={t('profileProgress', currentLang)}
            >
              <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 ${
                darkMode ? 'bg-[#121824] border-[#121824]' : 'bg-white border-white'
              }`}>
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name || 'User'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-5 h-5 text-[#d4af37]" />
                )}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#d4af37] border-2 ${
                darkMode ? 'border-[#121824]' : 'border-white'
              }`} />
            </button>
            
            {user && (
              <div className="hidden sm:block">
                <p className={`text-sm font-semibold font-cinzel leading-none ${
                  darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
                }`}>{user.name}</p>
              </div>
            )}
          </div>

          {/* Center: Brand Title & Icon */}
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src="https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub/favicons/android-chrome-192x192.png"
              alt="Learn with Legends"
              className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 object-contain shrink-0 filter drop-shadow-[0_2px_4px_rgba(140,85,10,0.45)]"
              referrerPolicy="no-referrer"
            />
            <h1
              className="font-serif-display text-xl sm:text-2xl md:text-3xl lg:text-[34px] font-bold tracking-normal select-none"
              style={{
                background: 'linear-gradient(180deg, #f7e098 0%, #e0aa37 38%, #b97c14 72%, #7f4b02 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 1.5px 2px rgba(110, 68, 8, 0.45))',
              }}
            >
              Learn with legends
            </h1>
          </div>

          {/* Right: Controls (Theme, Language, PWA Install) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* PWA / Add to Home Screen Button (Hidden once installed) */}
            {!isInstalled && (
              <button
                id="header-pwa-install-btn"
                onClick={handlePwaClick}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-sm ${
                  darkMode
                    ? 'bg-[#d4af37]/15 border-[#d4af37]/50 text-[#fce0a2] hover:bg-[#d4af37]/30 hover:border-[#d4af37]'
                    : 'bg-amber-50 border-[#d4af37]/60 text-[#8a5d12] hover:bg-amber-100 hover:border-[#d4af37]'
                }`}
                title={t('installApp', currentLang)}
              >
                <Download className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                <span className="hidden sm:inline">{t('installApp', currentLang)}</span>
                <span className="sm:hidden">{t('installApp', currentLang)}</span>
              </button>
            )}

            {/* Theme Toggle Button (Light/Dark pill button matching 1DASHBOARD.png) */}
            <button
              onClick={onToggleDarkMode}
              className={`p-2 rounded-full border transition-all active:scale-95 shadow-sm flex items-center justify-center cursor-pointer ${
                darkMode
                  ? 'bg-slate-800/80 border-slate-700/60 text-[#d4af37] hover:bg-slate-700'
                  : 'bg-white border-[#d4af37]/50 text-amber-600 hover:bg-amber-50'
              }`}
              title={t('toggleTheme', currentLang)}
            >
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500 fill-amber-400" />}
            </button>

            {/* Language Switcher Dropdown (Pill button with flag matching 1DASHBOARD.png) */}
            <div className="relative group">
              <select
                value={currentLang}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className={`appearance-none border rounded-full px-3 py-1.5 pr-7 text-xs font-semibold cursor-pointer focus:outline-none shadow-sm ${
                  darkMode
                    ? 'bg-[#1a2332] text-[#fce0a2] border-[#d4af37]/40 focus:border-[#d4af37]'
                    : 'bg-white text-[#8a5d12] border-[#d4af37]/50 focus:border-[#d4af37]'
                }`}
              >
                <option value="EN">🇬🇧</option>
                <option value="ES">🇪🇸</option>
                <option value="IT">🇮🇹</option>
                <option value="PT-pt">🇵🇹</option>
                <option value="NL">🇳🇱</option>
              </select>
              <div className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] ${
                darkMode ? 'text-[#d4af37]' : 'text-[#8a5d12]'
              }`}>
                ∨
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* PWA Add to Home Screen Modal */}
      <PWAInstallModal
        isOpen={showPwaModal}
        onClose={() => setShowPwaModal(false)}
        deferredPrompt={deferredPrompt}
        onInstall={onInstallPWA}
        darkMode={darkMode}
      />
    </>
  );
};
