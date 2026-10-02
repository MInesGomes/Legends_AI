import React, { useState } from 'react';
import { UserProfile, UserSkillsPoints, Language, SUPPORTED_LANGUAGES, SkillType, UserStatsMap } from '../types';
import { FEMALE_AVATARS, MALE_AVATARS, getAvatarByUrlOrId } from '../data/avatars';
import { X, Globe, BookOpen, LogOut, Sparkles, Check, ChevronDown, ChevronUp, Award, BarChart2, ShieldCheck, Lock, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { t } from '../lib/i18n';

interface ProfileDrawerProps {
  user: UserProfile | null;
  skillsPoints?: UserSkillsPoints;
  userStats?: UserStatsMap;
  languageChaptersViewed?: Record<Language, string[]>;
  likedCount?: number;
  viewedCount?: number;
  todayTalesCount?: number;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onUpdateAvatar?: (avatarUrl: string, gender?: 'female' | 'male') => void;
  onUpdateDailyLimit?: (limit: number) => void;
  onClose: () => void;
  onSignOut: () => void;
  onDeleteAccount?: () => void;
  darkMode?: boolean;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  user,
  skillsPoints,
  userStats,
  languageChaptersViewed,
  currentLang,
  onLanguageChange,
  onUpdateAvatar,
  onClose,
  onSignOut,
  onDeleteAccount,
  darkMode = true,
}) => {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [statsLang, setStatsLang] = useState<Language>(currentLang);
  const [activeGenderTab, setActiveGenderTab] = useState<'female' | 'male'>(
    user?.gender || 'female'
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isGuest = !user || user.user_id === 'guest' || user.user_id === 'guest_user' || (user as any).is_guest === true || user.name?.toLowerCase() === 'guest';
  const activeAvatarObj = user?.avatar_url ? getAvatarByUrlOrId(user.avatar_url) : null;
  const avatarList = activeGenderTab === 'female' ? FEMALE_AVATARS : MALE_AVATARS;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-start animate-fadeIn">
      <div className={`w-full max-w-sm border-r border-[#d4af37]/40 h-full flex flex-col shadow-2xl relative overflow-y-auto ${
        darkMode ? 'bg-[#121824] text-slate-100' : 'bg-[#fbf9f4] text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`p-4 border-b border-[#d4af37]/30 flex items-center justify-between sticky top-0 z-10 ${
          darkMode ? 'bg-[#161e2d]' : 'bg-white'
        }`}>
          <h3 className={`text-base font-bold font-cinzel uppercase tracking-wider ${
            darkMode ? 'gold-gradient-text' : 'text-[#8a5d12]'
          }`}>
            {t('travelerProfile', currentLang)}
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full ${
              darkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          
          {/* User Card */}
          <div className="text-center space-y-3">
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#996515] p-1 mx-auto shadow-xl">
              <img
                src={user?.avatar_url || FEMALE_AVATARS[0].url}
                alt={user?.name}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
              {onUpdateAvatar && (
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#d4af37] text-slate-950 hover:scale-110 shadow-lg transition-transform cursor-pointer"
                  title={t('changeAvatar', currentLang)}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div>
              <h4 className={`text-lg font-bold font-cinzel ${
                darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
              }`}>
                {user?.name || 'Traveler'}
              </h4>
        
              
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                  darkMode
                    ? 'bg-[#d4af37]/20 border-[#d4af37]/40 text-[#fce0a2]'
                    : 'bg-[#d4af37]/15 border-[#d4af37]/50 text-[#8a5d12]'
                }`}>
                  {activeAvatarObj?.title || `${user?.gender === 'female' ? 'Lady' : 'Gentlemen'} Avatar`}
                </span>

                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold flex items-center gap-1 ${
                  darkMode
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-500/50 text-emerald-800'
                }`} title="Google Play Age Signals API verified. No DOB stored.">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Signal: {user?.age_signal || '>18'}
                </span>
              </div>
            </div>

            {/* Avatar Picker Accordion Toggle */}
            {onUpdateAvatar && (
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-[#182130] border-[#d4af37]/30 text-[#fce0a2] hover:border-[#d4af37]'
                    : 'bg-amber-50 border-[#d4af37]/40 text-[#8a5d12] hover:bg-amber-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                {showAvatarPicker ? t('hideAvatarChoices', currentLang) : t('changeAvatarChoices', currentLang)}
                {showAvatarPicker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Collapsible Avatar Picker Gallery */}
          {showAvatarPicker && onUpdateAvatar && (
            <div className={`p-3 rounded-xl border space-y-3 animate-fadeIn ${
              darkMode ? 'bg-[#0b0f17] border-[#d4af37]/30' : 'bg-white border-[#d4af37]/30 shadow-sm'
            }`}>
              <div className="flex rounded-lg p-1 bg-[#121824] border border-[#d4af37]/20">
                <button
                  type="button"
                  onClick={() => setActiveGenderTab('female')}
                  className={`flex-1 py-1 text-xs font-semibold rounded ${
                    activeGenderTab === 'female'
                      ? 'bg-[#d4af37] text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('femaleTab', currentLang)} (4)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGenderTab('male')}
                  className={`flex-1 py-1 text-xs font-semibold rounded ${
                    activeGenderTab === 'male'
                      ? 'bg-[#d4af37] text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('maleTab', currentLang)} (4)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {avatarList.map((av) => {
                  const isSelected = user?.avatar_url === av.url;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => onUpdateAvatar(av.url, activeGenderTab)}
                      className={`p-2 rounded-lg border flex flex-col items-center gap-1.5 transition-all text-left relative cursor-pointer ${
                        isSelected
                          ? 'border-[#d4af37] bg-[#d4af37]/20 ring-1 ring-[#d4af37]'
                          : darkMode
                            ? 'border-slate-800 bg-[#121824] hover:border-slate-700'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#d4af37] text-slate-950 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <img
                        src={av.url}
                        alt={av.title}
                        className="w-12 h-12 rounded-full object-cover border border-[#d4af37]/60"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-center w-full min-w-0">
                        <div className={`text-[11px] font-bold font-cinzel truncate ${
                          darkMode ? 'text-slate-200' : 'text-slate-800'
                        }`}>
                          {av.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skill Points Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className={`text-xs font-bold font-cinzel uppercase tracking-wider flex items-center gap-1.5 ${
                darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
              }`}>
                <Award className="w-4 h-4 text-[#d4af37]" /> {t('skillsProgress', currentLang)}
              </h5>
              <span className={`text-[11px] font-mono font-semibold ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {isGuest
                  ? t('availableIfLogin', currentLang)
                  : t('totalPts', currentLang, {
                      pts: Number(
                        Object.values(skillsPoints || {}).reduce<number>(
                          (sum, val) => sum + (Number(val) || 0),
                          0
                        )
                      ),
                    })}
              </span>
            </div>

            {isGuest ? (
              <div className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 ${
                darkMode ? 'bg-[#182130]/60 border-[#d4af37]/25 text-slate-300' : 'bg-amber-50/60 border-[#d4af37]/30 text-amber-900'
              }`}>
                <Lock className="w-4 h-4 text-[#d4af37]" />
                <span className="text-xs font-semibold">{t('availableIfLogin', currentLang)}</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {(['Proactive', 'Plan', 'Win4All', 'Listen', 'Recharge'] as SkillType[]).map((skillName) => {
                  const points = skillsPoints?.[skillName] ?? (skillName === 'Proactive' ? skillsPoints?.Leader : 0) ?? 0;
                  const skillLabelKey = `skill_${skillName}` as const;
                  return (
                    <div
                      key={skillName}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        darkMode
                          ? 'bg-[#182130] border-[#d4af37]/20'
                          : 'bg-white border-[#d4af37]/30 shadow-sm'
                      }`}
                    >
                      <span className={`font-medium truncate ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {t(skillLabelKey, currentLang)}
                      </span>
                      <span className={`font-bold font-mono px-2 py-0.5 rounded border text-[11px] shrink-0 ml-1.5 ${
                        points > 0
                          ? darkMode
                            ? 'text-[#fce0a2] bg-[#d4af37]/20 border-[#d4af37]/30'
                            : 'text-[#8a5d12] bg-[#f4e8c1] border-[#d4af37]/50'
                          : darkMode
                            ? 'text-slate-400 bg-slate-800/60 border-slate-700/60'
                            : 'text-slate-500 bg-slate-100 border-slate-200'
                      }`}>
                        {points}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Languages & Chapters Seen */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h5 className={`text-xs font-bold font-cinzel uppercase tracking-wider flex items-center gap-1.5 ${
                darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
              }`}>
                <Globe className="w-4 h-4 text-[#d4af37]" /> {t('languagesTitle', currentLang)}
              </h5>
              <span className={`text-[11px] font-mono font-semibold ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {isGuest ? t('availableIfLogin', currentLang) : t('chaptersSeen', currentLang)}
              </span>
            </div>

            {isGuest ? (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isCurrent = currentLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => onLanguageChange(lang.code)}
                        className={`p-2 rounded-lg border flex items-center gap-2 transition-all text-left cursor-pointer ${
                          isCurrent
                            ? darkMode
                              ? 'bg-[#1e293b] border-[#d4af37] text-[#fce0a2] ring-1 ring-[#d4af37]'
                              : 'bg-amber-50 border-[#d4af37] text-[#8a5d12] ring-1 ring-[#d4af37]'
                            : darkMode
                              ? 'bg-[#182130]/80 border-[#d4af37]/15 text-slate-300 hover:border-[#d4af37]/40'
                              : 'bg-white border-[#d4af37]/20 text-slate-700 hover:bg-amber-50/40'
                        }`}
                        title={`Switch to ${lang.label}`}
                      >
                        <span className="text-base leading-none shrink-0">{lang.flag}</span>
                        <span className="font-medium truncate">{lang.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className={`p-3 rounded-xl border text-center flex items-center justify-center gap-2 ${
                  darkMode ? 'bg-[#182130]/60 border-[#d4af37]/25 text-slate-300' : 'bg-amber-50/60 border-[#d4af37]/30 text-amber-900'
                }`}>
                  <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span className="text-xs font-semibold">{t('availableIfLogin', currentLang)}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const count = languageChaptersViewed?.[lang.code]?.length || 0;
                  const isCurrent = currentLang === lang.code;

                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => onLanguageChange(lang.code)}
                      className={`p-2 rounded-lg border flex items-center justify-between transition-all text-left cursor-pointer ${
                        isCurrent
                          ? darkMode
                            ? 'bg-[#1e293b] border-[#d4af37] ring-1 ring-[#d4af37]/50 shadow-sm'
                            : 'bg-amber-50 border-[#d4af37] ring-1 ring-[#d4af37]/50 shadow-sm'
                          : darkMode
                            ? 'bg-[#182130]/80 border-[#d4af37]/15 hover:border-[#d4af37]/40 hover:bg-[#1e293b]/50'
                            : 'bg-white border-[#d4af37]/20 hover:bg-amber-50/40 shadow-xs'
                      }`}
                      title={`Switch to ${lang.label}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base leading-none shrink-0">{lang.flag}</span>
                        <span className={`font-medium truncate ${
                          isCurrent
                            ? darkMode ? 'text-[#fce0a2] font-semibold' : 'text-[#8a5d12] font-semibold'
                            : darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          {lang.label}
                        </span>
                      </div>

                      <span className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] shrink-0 ml-1.5 ${
                        count > 0
                          ? darkMode
                            ? 'text-[#fce0a2] bg-[#d4af37]/20 border border-[#d4af37]/30'
                            : 'text-[#8a5d12] bg-[#f4e8c1] border border-[#d4af37]/40'
                          : darkMode
                            ? 'text-slate-500 bg-slate-800/40 border border-slate-700/40'
                            : 'text-slate-400 bg-slate-100 border border-slate-200'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Stats: Views per Language & Skill */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex items-center justify-between">
                <h5 className={`text-xs font-bold font-cinzel uppercase tracking-wider flex items-center gap-1.5 ${
                  darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
                }`}>
                  <BarChart2 className="w-4 h-4 text-[#d4af37]" /> {t('readAloudSkillViews', currentLang)}
                </h5>
                <span className={`text-[11px] font-mono font-semibold ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {isGuest
                    ? t('availableIfLogin', currentLang)
                    : t('totalPts', currentLang, {
                        pts: (['Proactive', 'Plan', 'Win4All', 'Listen', 'Recharge'] as SkillType[]).reduce(
                          (sum, skillName) =>
                            sum +
                            (Number(userStats?.[`${statsLang}:${skillName}`]) ||
                              (skillName === 'Proactive' ? Number(userStats?.[`${statsLang}:Leader`]) || 0 : 0)),
                          0
                        ),
                      })}
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('readAloudSkillViewsDesc', currentLang)}
              </p>
            </div>

            {isGuest ? (
              <div className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 ${
                darkMode ? 'bg-[#182130]/60 border-[#d4af37]/25 text-slate-300' : 'bg-amber-50/60 border-[#d4af37]/30 text-amber-900'
              }`}>
                <Lock className="w-4 h-4 text-[#d4af37]" />
                <span className="text-xs font-semibold">{t('availableIfLogin', currentLang)}</span>
              </div>
            ) : (
              <>
                {/* Language Selector Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-lg border border-[#d4af37]/20 bg-black/10 overflow-x-auto">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setStatsLang(lang.code)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        statsLang === lang.code
                          ? 'bg-[#d4af37] text-slate-950 shadow-sm'
                          : darkMode
                            ? 'text-slate-400 hover:text-slate-200'
                            : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lang.flag} {lang.code}
                    </button>
                  ))}
                </div>

                {/* Skill Views for Selected Language */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  {(['Proactive', 'Plan', 'Win4All', 'Listen', 'Recharge'] as SkillType[]).map((skillName) => {
                    const key = `${statsLang}:${skillName}`;
                    const viewsCount =
                      (userStats?.[key] || 0) +
                      (skillName === 'Proactive' ? userStats?.[`${statsLang}:Leader`] || 0 : 0);
                    const skillLabelKey = `skill_${skillName}` as const;

                    return (
                      <div
                        key={skillName}
                        className={`p-2 rounded-lg border flex items-center justify-between ${
                          darkMode
                            ? 'bg-[#182130]/80 border-[#d4af37]/15'
                            : 'bg-white border-[#d4af37]/20'
                        }`}
                      >
                        <span className={`font-medium truncate ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          {t(skillLabelKey, currentLang)}
                        </span>
                        <span className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] shrink-0 ml-1.5 ${
                          viewsCount > 0
                            ? darkMode
                              ? 'text-[#fce0a2] bg-[#d4af37]/20 border border-[#d4af37]/30'
                              : 'text-[#8a5d12] bg-[#f4e8c1] border border-[#d4af37]/40'
                            : darkMode
                              ? 'text-slate-500 bg-slate-800/40 border border-slate-700/40'
                              : 'text-slate-400 bg-slate-100 border border-slate-200'
                        }`}>
                          {viewsCount} 
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Actions: Sign Out & Delete Account */}
          <div className="space-y-2.5 pt-6 border-t border-[#d4af37]/20 mt-6">
            <button
              type="button"
              id="profile-sign-out-btn"
              onClick={onSignOut}
              className={`w-full py-2.5 border rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                darkMode
                  ? 'text-[#fce0a2] bg-[#d4af37]/20 border-[#d4af37]/30 hover:bg-[#d4af37]/30'
                  : 'text-[#8a5d12] bg-[#f4e8c1] border-[#d4af37]/50 hover:bg-[#ebd9a5]'
              }`}
            >
              <LogOut className="w-4 h-4" /> {t('signOut', currentLang)}
            </button>

            {onDeleteAccount && (
              <button
                type="button"
                id="profile-delete-account-btn"
                onClick={() => setShowDeleteConfirm(true)}
                className={`w-full py-2.5 border rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  darkMode
                    ? 'text-red-400 bg-red-950/20 border-red-500/30 hover:bg-red-950/40 hover:border-red-500/50'
                    : 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300'
                }`}
              >
                <Trash2 className="w-4 h-4 text-red-500" /> {t('deleteAccount', currentLang)}
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-4 ${
            darkMode ? 'bg-[#131b28] border-red-500/40 text-slate-100' : 'bg-white border-red-300 text-slate-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-cinzel text-red-500">
                  {t('deleteAccountConfirmTitle', currentLang)}
                </h4>
                <p className="text-[11px] text-slate-400">Irreversible Action</p>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {t('deleteAccountConfirmDesc', currentLang)}
            </p>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t('cancel', currentLang)}
              </button>

              <button
                type="button"
                id="btn-confirm-delete-account"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    if (onDeleteAccount) {
                      await onDeleteAccount();
                    }
                  } finally {
                    setIsDeleting(false);
                    setShowDeleteConfirm(false);
                  }
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{t('confirmDelete', currentLang)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

