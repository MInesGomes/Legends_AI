import React from 'react';
import { X, Download, Share, PlusSquare, Smartphone, Monitor, CheckCircle, Sparkles } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstall: () => void;
  darkMode: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstall,
  darkMode,
}) => {
  if (!isOpen) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          darkMode
            ? 'bg-[#121824] border-[#d4af37]/40 text-slate-100'
            : 'bg-[#fefcf8] border-[#d4af37]/50 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          darkMode ? 'border-slate-800 bg-[#161f2e]' : 'border-amber-100 bg-amber-50/60'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#fce0a2] p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-[#121824] rounded-[10px] flex items-center justify-center">
                <Download className="w-4 h-4 text-[#d4af37]" />
              </div>
            </div>
            <div>
              <h3 className={`font-cinzel font-bold text-sm sm:text-base ${
                darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
              }`}>
                Add to Home Screen
              </h3>
              <p className="text-[11px] text-slate-400">Install Learn with Legends on your device</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-700/30 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Direct Install Button if browser supports beforeinstallprompt */}
          {deferredPrompt ? (
            <div className="space-y-3">
              <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                Click below to install the official Progressive Web App directly to your home screen or desktop:
              </p>
              <button
                id="pwa-modal-direct-install-btn"
                onClick={() => {
                  onInstall();
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#d4af37] via-[#f5ca4e] to-[#c58913] text-slate-950 shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Install Now</span>
              </button>
            </div>
          ) : isIOS ? (
            /* iOS Safari Instructions */
            <div className="space-y-3">
              <p className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                To install on your iPhone or iPad:
              </p>
              <ol className="space-y-2.5">
                <li className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${
                  darkMode ? 'bg-[#182130] border-slate-700/60' : 'bg-white border-amber-200/70 shadow-xs'
                }`}>
                  <div className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="leading-snug">
                      Tap the <strong className="text-[#d4af37] inline-flex items-center gap-1">Share <Share className="w-3.5 h-3.5 inline" /></strong> button in Safari's bottom toolbar.
                    </p>
                  </div>
                </li>

                <li className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${
                  darkMode ? 'bg-[#182130] border-slate-700/60' : 'bg-white border-amber-200/70 shadow-xs'
                }`}>
                  <div className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="leading-snug">
                      Scroll down and tap <strong className="text-[#d4af37] inline-flex items-center gap-1">Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline" /></strong>.
                    </p>
                  </div>
                </li>

                <li className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${
                  darkMode ? 'bg-[#182130] border-slate-700/60' : 'bg-white border-amber-200/70 shadow-xs'
                }`}>
                  <div className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="leading-snug">
                      Tap <strong className="text-[#d4af37]">Add</strong> in the top right to place the app on your home screen.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          ) : (
            /* Android / Chrome / Desktop Generic Instructions */
            <div className="space-y-3">
              <p className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                To add this app to your Home Screen / Desktop:
              </p>
              <ol className="space-y-2.5">
                <li className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${
                  darkMode ? 'bg-[#182130] border-slate-700/60' : 'bg-white border-amber-200/70 shadow-xs'
                }`}>
                  <div className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="leading-snug">
                      Tap the browser menu <strong className="text-[#d4af37]">(⋮ or Menu)</strong> in your browser header or address bar.
                    </p>
                  </div>
                </li>

                <li className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${
                  darkMode ? 'bg-[#182130] border-slate-700/60' : 'bg-white border-amber-200/70 shadow-xs'
                }`}>
                  <div className="w-5 h-5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="leading-snug">
                      Select <strong className="text-[#d4af37]">"Add to Home Screen"</strong> or <strong className="text-[#d4af37]">"Install Learn with Legends"</strong>.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* Key Advantages */}
          <div className={`p-3 rounded-xl border space-y-1.5 text-xs ${
            darkMode ? 'bg-[#151c28] border-[#d4af37]/20 text-slate-300' : 'bg-amber-50/70 border-[#d4af37]/30 text-slate-700'
          }`}>
            <p className="font-semibold flex items-center gap-1.5 text-[#d4af37]">
              <Sparkles className="w-3.5 h-3.5" /> Why install?
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" /> Fullscreen immersion
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" /> Instant 1-tap access
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" /> Fast offline caching
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" /> Zero storage overhead
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className={`w-full py-2.5 border rounded-xl font-semibold text-xs transition-all cursor-pointer ${
              darkMode
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Got it, close
          </button>
        </div>
      </div>
    </div>
  );
};
