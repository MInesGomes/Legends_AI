import React, { useState, useEffect } from 'react';
import { Realm, Tale, UserProfile, DailyTaleLog, ChapterComment, Language } from '../types';
import { AddTaleModal } from './AddTaleModal';
import { getEffectiveDailyLimit, getMaxAllowedDailyLimit, hasReachedDailyTaleLimit } from '../lib/supabase';
import { isUserOver16, isUserUnder18 } from '../lib/googleAgeSignals';
import { t } from '../lib/i18n';
import { ArrowLeft, Plus, Eye, Heart, MessageSquare, Sparkles, BookOpen, ShieldCheck, Settings, X, Clock, Lock } from 'lucide-react';

interface TalesPageProps {
  realm: Realm;
  tales: Tale[];
  user: UserProfile | null;
  currentLang?: Language;
  dailyLogs?: DailyTaleLog[];
  todayTalesCount?: number;
  todayTalesList?: string[];
  commentsMap?: Record<string, ChapterComment[]>;
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
  currentLang,
  dailyLogs = [],
  todayTalesCount = 0,
  todayTalesList = [],
  commentsMap = {},
  onOpenProfile,
  onBack,
  onSelectTale,
  onSubmitNewTale,
  darkMode = true,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [comingSoonTale, setComingSoonTale] = useState<Tale | null>(null);

  const effectiveLang: Language = currentLang || user?.language || 'EN';

  // Scroll to top whenever the Tales page loads or realm changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [realm.id]);

  const effectiveLimit = getEffectiveDailyLimit(user);
  const maxAllowed = getMaxAllowedDailyLimit(user);
  const isUnder18 = isUserUnder18(user);
  const canViewComments = isUserOver16(user);

  // Filter tales belonging to this realm:
  // Custom user tales are hidden until approved (cards under review are removed).
  const realmTales = tales.filter((t) => {
    const isCurrentRealm = t.realmId === realm.id || t.realmId === realm.key;
    if (!isCurrentRealm) return false;

    // Official realm tales are visible to all users
    if (!t.isCustomUserTale) return true;

    // Only approved custom tales are visible; pending/under-review tales are removed
    return t.isApproved === true;
  });

  // Calculate user-submitted comments for this tale
  const getTaleUserCommentsCount = (t: Tale) => {
    if (!commentsMap) return 0;
    const chapterPrefix = t.id === 'tale-job-quest' ? 'jobquest-ch' : t.id === 'tale-startup-winner' ? 'work-ch' : 'atlantis-ch';
    let total = 0;
    Object.entries(commentsMap).forEach(([chId, comms]) => {
      if ((chId.startsWith(chapterPrefix) || chId.includes(t.id)) && Array.isArray(comms)) {
        total += (comms as ChapterComment[]).filter((c) => {
          if (!user || user.user_id === 'guest_user' || user.user_id === 'guest') {
            return !c.user_id || c.user_id === 'guest' || c.user_id === 'guest_user';
          }
          return c.user_id === user.user_id;
        }).length;
      }
    });
    return total;
  };

  const handleCardClick = (tale: Tale) => {
    if (tale.isComingSoon) {
      setComingSoonTale(tale);
      return;
    }
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
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className={`text-2xl sm:text-3xl font-bold font-cinzel ${
                darkMode ? 'gold-gradient-text' : 'text-[#8a5d12]'
              }`}>
                {t(('realm_' + realm.key) as any, effectiveLang) || realm.title}
              </h2>
              {realm.audienceLabel && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#b8860b] text-[#3d2400] border border-[#fff9e6] shadow-sm text-[11px] font-cinzel font-bold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-[#7a4d04]" />
                  {realm.audienceLabel[effectiveLang] || realm.audienceLabel.EN}
                </span>
              )}
              {realm.isComingSoon && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#b8860b] text-[#3d2400] border border-[#fff9e6] shadow-sm text-[11px] font-cinzel font-bold tracking-wider uppercase">
                  <Clock className="w-3.5 h-3.5 text-[#7a4d04]" />
                  {t('comingSoon', effectiveLang)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tales Cards Grid or Coming Soon Empty State */}
        {realmTales.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shadow-lg shadow-[#d4af37]/10">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className={`text-xl sm:text-2xl font-cinzel font-bold ${
              darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
            }`}>
              {t('comingSoon', effectiveLang)}
            </h3>
            <p className={`text-sm max-w-md mx-auto ${
              darkMode ? 'text-slate-300' : 'text-stone-600'
            }`}>
              {t('comingSoonDesc', effectiveLang).replace('{title}', realm.title)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {realmTales.map((tale) => {
            const alreadyReadToday = todayTalesList.includes(tale.id);
            const isApprovedCustomTale = Boolean(tale.isCustomUserTale && tale.isApproved);

            return (
              <div
                key={tale.id}
                onClick={() => handleCardClick(tale)}
                className="group relative cursor-pointer p-[3px] rounded-[18px] transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.99] bg-gradient-to-b from-[#f3e5ab] via-[#d4af37] to-[#8a5d12] shadow-xl hover:shadow-2xl hover:shadow-[#d4af37]/30"
              >
                {/* Inner Card Box without background color */}
                <div className="relative h-72 sm:h-80 rounded-[15px] overflow-hidden text-left flex flex-col justify-between bg-transparent">
                  
                  {/* Background Image */}
                  <img
                    src={tale.coverImage}
                    alt={tale.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.98] group-hover:brightness-100"
                    referrerPolicy="no-referrer"
                  />

                  {/* Custom Tale Moderation Status Badges */}
                  {isApprovedCustomTale && (
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-[#182130]/90 border border-[#d4af37]/80 text-[10px] font-bold text-[#fce0a2] uppercase tracking-wider shadow-lg flex items-center gap-1 backdrop-blur-sm">
                        <Sparkles className="w-3 h-3 text-[#d4af37]" />
                        {t('approvedTale', effectiveLang)}
                      </span>
                    </div>
                  )}

                  {/* Top Read Today Indicator without blur */}
                  {!tale.isComingSoon && alreadyReadToday && (
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/60 text-[10px] font-bold text-emerald-300 uppercase tracking-wider shadow-md">
                        {t('unlockedToday', effectiveLang)}
                      </span>
                    </div>
                  )}

                  {/* Coming Soon Badge (Smaller, elegant, no dark overlay covering the card) */}
                  {tale.isComingSoon && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center p-3 pointer-events-none">
                      <div className="px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-black/65 border border-[#d4af37]/80 shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_10px_rgba(212,175,55,0.3)] backdrop-blur-sm">
                        <span className="block text-xs sm:text-sm font-cinzel font-bold tracking-[0.2em] text-[#fce0a2] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                          {t('comingSoon', effectiveLang)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Bottom Gold Title Banner with clear high-contrast text */}
                  <div className="relative z-10 px-4 pt-2 pb-5 sm:pb-6 text-center flex flex-col items-center justify-end">
                    <h3 className="text-2xl sm:text-3xl font-bold font-cinzel text-[#fce0a2] tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      {tale.title}
                    </h3>
                    
                    {/* Decorative Gold Filigree Divider with Diamond */}
                    <div className="w-full max-w-[80%] flex items-center justify-center my-1.5 text-[#d4af37] filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent flex-1" />
                      <span className="px-2 text-xs font-serif">❖</span>
                      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent flex-1" />
                    </div>

                    {tale.subtitle && (
                      <p className="text-sm text-slate-100 font-serif-display italic line-clamp-1 mb-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] font-medium">
                        {tale.subtitle}
                      </p>
                    )}

                    {/* Social Stats */}
                    <div className="flex items-center justify-center gap-4 text-xs text-[#fce0a2] mt-1 font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-[#fce0a2]" /> {tale.viewsCount}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-[#fce0a2]" /> {tale.likesCount}</span>
                      {canViewComments && (
                        <span className="flex items-center gap-1" title={t('userCommentsTooltip', effectiveLang)}>
                          <MessageSquare className="w-3.5 h-3.5 text-[#fce0a2]" /> {getTaleUserCommentsCount(tale)}
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
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
                  {t('dailyLimitReachedTitle', effectiveLang)}
                </h3>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  {t('dailyLimitReachedDesc', effectiveLang, { limit: effectiveLimit, count: todayTalesCount })}
                </p>

                {/* Progress / Status banner */}
                <div className={`p-3.5 rounded-xl border text-xs text-left space-y-2 ${
                  darkMode ? 'bg-[#182130] border-[#d4af37]/30' : 'bg-white border-[#d4af37]/40 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-300">{t('dailyTalesGoal', effectiveLang)}</span>
                    <span className="font-mono font-bold text-[#d4af37]">{todayTalesCount} / {effectiveLimit}</span>
                  </div>

                  {isUnder18 ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                      <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                      <span>{t('youthProtectionRule', effectiveLang)}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300">
                      {t('adultLimitRule', effectiveLang)}
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
                      <Settings className="w-3.5 h-3.5" /> {t('adjustLimitProfile', effectiveLang)}
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
                    {t('returnToTales', effectiveLang)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coming Soon Tale Modal */}
        {comingSoonTale && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className={`w-full max-w-md p-6 rounded-2xl border border-[#d4af37]/60 shadow-2xl relative space-y-4 ${
              darkMode ? 'bg-[#121824] text-slate-100' : 'bg-[#fbf9f4] text-slate-900'
            }`}>
              <button
                onClick={() => setComingSoonTale(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-[#d4af37] p-0.5 mx-auto flex items-center justify-center shadow-lg">
                  <div className="w-full h-full rounded-full bg-[#121824] flex items-center justify-center text-[#d4af37]">
                    <Clock className="w-7 h-7" />
                  </div>
                </div>

                <h3 className="text-xl font-bold font-cinzel text-[#fce0a2]">
                  {comingSoonTale.title}
                </h3>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  {t('comingSoonDesc', effectiveLang).replace('{title}', comingSoonTale.title)}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => setComingSoonTale(null)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#d4af37] text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-110 transition-all cursor-pointer"
                  >
                    {t('returnToTales', effectiveLang)}
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
            user={user}
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
