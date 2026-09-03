import React, { useState } from 'react';
import { UserProfile, UserSkillsPoints, Language, SUPPORTED_LANGUAGES, SkillType } from '../types';
import { FEMALE_AVATARS, MALE_AVATARS, getAvatarByUrlOrId } from '../data/avatars';
import { X, Globe, BookOpen, LogOut, Sparkles, Check, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { t } from '../lib/i18n';

interface ProfileDrawerProps {
  user: UserProfile | null;
  skillsPoints?: UserSkillsPoints;
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
  darkMode?: boolean;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  user,
  skillsPoints,
  languageChaptersViewed,
  currentLang,
  onLanguageChange,
  onUpdateAvatar,
  onClose,
  onSignOut,
  darkMode = true,
}) => {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [activeGenderTab, setActiveGenderTab] = useState<'female' | 'male'>(
    user?.gender || 'female'
  );

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
        
              
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                  darkMode
                    ? 'bg-[#d4af37]/20 border-[#d4af37]/40 text-[#fce0a2]'
                    : 'bg-[#d4af37]/15 border-[#d4af37]/50 text-[#8a5d12]'
                }`}>
                  {activeAvatarObj?.title || `${user?.gender === 'female' ? 'Lady' : 'Gentlemen'} Avatar`}
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

          {/* Languages & Chapters Explored */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className={`text-xs font-bold font-cinzel uppercase tracking-wider flex items-center gap-1.5 ${
                darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
              }`}>
                <Globe className="w-4 h-4 text-[#d4af37]" /> {t('languagesTitle', currentLang)}
              </h5>
              <span className={`text-[11px] font-mono font-semibold ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {t('chaptersSeen', currentLang)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const count = languageChaptersViewed?.[lang.code]?.length || 0;
                const isCurrent = currentLang === lang.code;

                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => onLanguageChange(lang.code)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all text-left cursor-pointer ${
                      isCurrent
                        ? darkMode
                          ? 'bg-[#1e293b] border-[#d4af37] ring-1 ring-[#d4af37]/50 shadow-md'
                          : 'bg-amber-50 border-[#d4af37] ring-1 ring-[#d4af37]/50 shadow-sm'
                        : darkMode
                          ? 'bg-[#182130] border-[#d4af37]/20 hover:border-[#d4af37]/50 hover:bg-[#1e293b]/70'
                          : 'bg-white border-[#d4af37]/30 shadow-sm hover:bg-amber-50/50'
                    }`}
                    title={`Switch to ${lang.label}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg leading-none shrink-0">{lang.flag}</span>
                      <div className="truncate">
                        <span className={`font-semibold text-xs block truncate ${
                          darkMode ? 'text-slate-200' : 'text-slate-800'
                        }`}>
                          {lang.label}
                        </span>
                        <span className={`text-[10px] font-mono uppercase ${
                          isCurrent ? 'text-[#d4af37] font-bold' : darkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {lang.code} {isCurrent ? `• ${t('activeStatus', currentLang)}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className={`font-bold font-mono px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 ${
                        count > 0
                          ? darkMode
                            ? 'text-[#fce0a2] bg-[#d4af37]/20 border-[#d4af37]/30'
                            : 'text-[#8a5d12] bg-[#f4e8c1] border-[#d4af37]/50'
                          : darkMode
                            ? 'text-slate-400 bg-slate-800/60 border-slate-700/60'
                            : 'text-slate-500 bg-slate-100 border-slate-200'
                      }`}>
                        <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>{count} {count === 1 ? t('chapterUnit', currentLang) : t('chaptersUnit', currentLang)}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

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
                {t('totalPts', currentLang, {
                  pts: Number(
                    Object.values(skillsPoints || {}).reduce<number>(
                      (sum, val) => sum + (Number(val) || 0),
                      0
                    )
                  ),
                })}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {(['Leader', 'Plan', 'Win4All', 'Listen', 'Recharge'] as SkillType[]).map((skillName) => {
                const points = skillsPoints?.[skillName] || 0;
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
                      +{points}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={onSignOut}
            className={`w-full py-3 border rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer ${
              darkMode
                      ? 'text-[#fce0a2] bg-[#d4af37]/20 border-[#d4af37]/30'
                      : 'text-[#8a5d12] bg-[#f4e8c1] border-[#d4af37]/50'
            }`}
          >
            <LogOut className="w-4 h-4" /> {t('signOut', currentLang)}
          </button>

        </div>

      </div>
    </div>
  );
};

