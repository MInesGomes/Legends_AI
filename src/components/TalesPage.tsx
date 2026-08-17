import React, { useState } from 'react';
import { Realm, Tale, UserProfile, DailyTaleLog } from '../types';
import { AddTaleModal } from './AddTaleModal';
import { getEffectiveDailyLimit, getMaxAllowedDailyLimit, hasReachedDailyTaleLimit } from '../lib/supabase';
import { ArrowLeft, Plus, Eye, Heart, MessageSquare, Sparkles, BookOpen, ShieldCheck, Settings, X } from 'lucide-react';

interface TalesPageProps {
  realm: Realm;
  tales: Tale[];
  user: UserProfile | null;
  dailyLogs?: DailyTaleLog[];
  todayTalesCount?: number;
  todayTalesList?: string[];
  onOpenProfile?: () => void;
  onBack: () => void;
  onSelectTale: (tale: Tale) => void;
  onSubmitNewTale: (newTale: Tale) => void;
  darkMode?: boolean;
}

export const TalesPage: React.FC<TalesPageProps> = ({
  realm,
  tales,
  user,
  dailyLogs = [],
  todayTalesCount = 0,
  todayTalesList = [],
  onOpenProfile,
  onBack,
  onSelectTale,
  onSubmitNewTale,
  darkMode = true,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);

  const effectiveLimit = getEffectiveDailyLimit(user);
  const maxAllowed = getMaxAllowedDailyLimit(user?.age);
  const isUnder18 = (user?.age ?? 20) < 18;

  // Filter tales belonging to this realm or custom user tales
  const realmTales = tales.filter(
    (t) => t.realmId === realm.id || t.realmId === realm.key
  );

  const handleCardClick = (tale: Tale) => {
    // Check if the user is allowed to read this tale
    const reached = hasReachedDailyTaleLimit(user, dailyLogs, tale.id);
    if (reached) {
      setLimitModalOpen(true);
      return;
    }
    onSelectTale(tale);
  };

  return (
    <div className={`min-h-[calc(100vh-65px)] transition-colors duration-300 pt-3 sm:pt-4 px-4 sm:px-6 md:px-8 pb-16 sm:pb-24 ${
      darkMode ? 'bg-[#18202f] text-slate-100' : 'bg-[#fcfbf9] text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d4af37]/30 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className={`p-2 rounded-full border border-[#d4af37]/50 hover:bg-[#d4af37]/20 transition-all active:scale-95 shadow-md ${
                darkMode ? 'bg-[#1e293b] text-[#fce0a2]' : 'bg-white text-[#8a5d12]'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className={`text-2xl sm:text-3xl font-bold font-cinzel ${
                darkMode ? 'gold-gradient-text' : 'text-[#8a5d12]'
              }`}>
                {realm.title} TALES
              </h2>
            </div>
          </div>
        </div>

        {/* Tales Cards Grid (Matching reference screenshots 2AtlantisTales, 2Dad&MomTales, 2MarriageTales, 2WorkTales) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {realmTales.map((tale) => {
            const alreadyReadToday = todayTalesList.includes(tale.id);
            return (
              <div
                key={tale.id}
                onClick={() => handleCardClick(tale)}
                className="group relative cursor-pointer p-[3px] rounded-[18px] bg-gradient-to-b from-[#f3e5ab] via-[#d4af37] to-[#8a5d12] shadow-xl hover:shadow-2xl hover:shadow-[#d4af37]/30 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.99]"
              >
                {/* Inner Card Box (transparent background) */}
                <div className="relative h-72 sm:h-80 rounded-[15px] overflow-hidden bg-transparent text-left flex flex-col justify-between">
                  
                  {/* Background Image */}
                  <img
                    src={tale.coverImage}
                    alt={tale.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95 group-hover:brightness-100"
                    referrerPolicy="no-referrer"
                  />

                  {/* Corner Filigree Flourish Accents (Matching exact reference borders) */}
                  <div className="absolute top-1.5 left-1.5 pointer-events-none text-[#fce0a2]/80">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 10V2h8M2 2l8 8" />
                    </svg>
                  </div>
                  <div className="absolute top-1.5 right-1.5 pointer-events-none text-[#fce0a2]/80">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 10V2h-8M22 2l-8 8" />
                    </svg>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 pointer-events-none text-[#fce0a2]/80 z-10">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 14v8h8M2 22l8-8" />
                    </svg>
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 pointer-events-none text-[#fce0a2]/80 z-10">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 14v8h-8M22 22l-8-8" />
                    </svg>
                  </div>

                  {/* Top Read Today Indicator (Skill badge removed as requested) */}
                  {alreadyReadToday && (
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950/85 backdrop-blur-md border border-emerald-500/60 text-[10px] font-bold text-emerald-300 uppercase tracking-wider shadow-md">
                        Unlocked Today
                      </span>
                    </div>
                  )}

                  {/* Dark Vignette Gradient Overlay at Bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                  {/* Bottom Gold Title Banner with reduced top padding and increased bottom padding */}
                  <div className="relative z-10 px-4 pt-2 pb-5 sm:pb-6 text-center flex flex-col items-center justify-end">
                    <h3 className="text-2xl sm:text-3xl font-bold font-cinzel text-[#fce0a2] tracking-wider drop-shadow-md">
                      {tale.title}
                    </h3>
                    
                    {/* Decorative Gold Filigree Divider with Diamond */}
                    <div className="w-full max-w-[80%] flex items-center justify-center my-1.5 text-[#d4af37]">
                      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent flex-1" />
                      <span className="px-2 text-xs font-serif">❖</span>
                      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent flex-1" />
                    </div>

                    {tale.subtitle && (
                      <p className="text-sm text-slate-200 font-serif-display italic line-clamp-1 mb-1">
                        {tale.subtitle}
                      </p>
                    )}

                    {/* Social Stats */}
                    <div className="flex items-center justify-center gap-4 text-xs text-[#fce0a2] mt-1">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-[#fce0a2]" /> {tale.viewsCount}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-[#fce0a2]" /> {tale.likesCount}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-[#fce0a2]" /> {tale.commentsCount}</span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}

          {/* ADD BUTTON CARD (transparent background) */}
          <div
            onClick={() => setShowAddModal(true)}
            className="p-[3px] rounded-[18px] bg-gradient-to-b from-[#f3e5ab]/60 via-[#d4af37]/40 to-[#8a5d12]/60 hover:from-[#f3e5ab] hover:to-[#8a5d12] shadow-xl transition-all duration-300 group cursor-pointer"
          >
            <div className="relative h-72 sm:h-80 rounded-[15px] p-6 flex flex-col items-center justify-center text-center bg-transparent transition-colors">
              <div className="w-16 h-16 rounded-full border-2 border-[#d4af37] bg-transparent p-0.5 mb-3 group-hover:scale-110 transition-transform shadow-lg flex items-center justify-center">
                <Plus className="w-8 h-8 text-[#d4af37]" />
              </div>
              <h3 className={`text-xl font-bold font-cinzel ${
                darkMode ? 'text-[#fce0a2] group-hover:text-white' : 'text-[#8a5d12]'
              }`}>
                Add Suggestion Tale
              </h3>
              <p className={`text-sm max-w-xs mt-2 ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>
                Teel your story of success, or what are you struggling with, that could inpire a new tale in the realm {realm.title}.
              </p>
              <span className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#996515] text-slate-900 font-bold text-xs shadow-md group-hover:brightness-110 transition-all">
                + Suggest a Tale
              </span>
            </div>
          </div>

        </div>

        {/* Daily Tales Quota & Reading Progress Card (At the bottom of TalesPage - transparent background) */}
        {user && (
          <div className="rounded-2xl border-2 border-[#d4af37]/60 bg-transparent shadow-xl p-5 sm:p-6 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Left: Quota Stats & Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl border border-[#d4af37] bg-transparent flex items-center justify-center shadow-md">
                    <BookOpen className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <div>
                    <h3 className={`text-lg sm:text-xl font-bold font-cinzel tracking-wide ${
                      darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
                    }`}>
                      Daily Tales Journey
                    </h3>
                    <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {Math.max(0, effectiveLimit - todayTalesCount) > 0 ? (
                        <>
                          <strong className="text-[#d4af37] font-semibold">
                            {Math.max(0, effectiveLimit - todayTalesCount)} tale{Math.max(0, effectiveLimit - todayTalesCount) > 1 ? 's' : ''}
                          </strong> left to explore today
                        </>
                      ) : (
                        <span className="text-emerald-400 font-semibold">
                          Daily Reading Quota Completed! ✨
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {isUnder18 && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Youth Protection Limit: Under 18 accounts are limited to a max of 5 tales/day.</span>
                  </div>
                )}
              </div>

              {/* Center / Right: Progress Bar & Action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 min-w-[260px] sm:min-w-[320px]">
                
                {/* Progress Meter Bar */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>Today's Tales Read</span>
                    <span className="text-[#d4af37] text-sm font-extrabold">{todayTalesCount} / {effectiveLimit}</span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden border ${
                    darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-200 border-slate-300'
                  }`}>
                    <div
                      className="h-full bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#b8860b] rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${Math.min(100, Math.round((todayTalesCount / effectiveLimit) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Configure Goal Button */}
                {onOpenProfile && (
                  <button
                    onClick={onOpenProfile}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap ${
                      darkMode
                        ? 'bg-[#1a2332] border-[#d4af37]/50 text-[#fce0a2] hover:bg-[#222e42]'
                        : 'bg-amber-50 border-[#d4af37]/60 text-[#8a5d12] hover:bg-amber-100'
                    }`}
                    title="Adjust daily tale reading limit"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Set Goal</span>
                  </button>
                )}

              </div>

            </div>
          </div>
        )}

        {/* Daily Tale Limit Reached Warning Modal */}
        {limitModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className={`w-full max-w-md p-6 rounded-2xl border border-[#d4af37]/60 shadow-2xl relative space-y-4 ${
              darkMode ? 'bg-[#121824] text-slate-100' : 'bg-[#fbf9f4] text-slate-900'
            }`}>
              <button
                onClick={() => setLimitModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-[#d4af37] p-0.5 mx-auto flex items-center justify-center shadow-lg">
                  <div className="w-full h-full rounded-full bg-[#121824] flex items-center justify-center text-[#d4af37]">
                    <BookOpen className="w-7 h-7" />
                  </div>
                </div>

                <h3 className="text-xl font-bold font-cinzel text-[#fce0a2]">
                  Daily Limit Reached
                </h3>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  You have reached your daily reading quota of <strong className="text-[#d4af37] font-bold">{effectiveLimit} tales</strong> for today ({todayTalesCount} explored).
                </p>

                {/* Progress / Status banner */}
                <div className={`p-3.5 rounded-xl border text-xs text-left space-y-2 ${
                  darkMode ? 'bg-[#182130] border-[#d4af37]/30' : 'bg-white border-[#d4af37]/40 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-300">Daily Tales Goal:</span>
                    <span className="font-mono font-bold text-[#d4af37]">{todayTalesCount} / {effectiveLimit}</span>
                  </div>

                  {isUnder18 ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                      <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                      <span>Youth Protection Rule: Under 18 accounts are limited to a maximum of 5 tales per day.</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300">
                      Adult accounts are capped at a maximum of 10 tales per day to encourage meaningful reflection between decisions.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  {effectiveLimit < maxAllowed && onOpenProfile && (
                    <button
                      onClick={() => {
                        setLimitModalOpen(false);
                        onOpenProfile();
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#d4af37] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 transition-all cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" /> Adjust Limit in Profile
                    </button>
                  )}
                  <button
                    onClick={() => setLimitModalOpen(false)}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      darkMode
                        ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                        : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    Return to Tales
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for adding tale */}
        {showAddModal && (
          <AddTaleModal
            realm={realm}
            onClose={() => setShowAddModal(false)}
            onSubmitTale={(newT) => {
              onSubmitNewTale(newT);
              setShowAddModal(false);
            }}
            darkMode={darkMode}
          />
        )}

      </div>
    </div>
  );
};
