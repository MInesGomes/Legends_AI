import React, { useState } from 'react';
import { UserProfile, UserSkillsPoints, Language } from '../types';
import { FEMALE_AVATARS, MALE_AVATARS, getAvatarByUrlOrId } from '../data/avatars';
import { getMaxAllowedDailyLimit, getEffectiveDailyLimit } from '../lib/supabase';
import { X, Award, LogOut, Sparkles, Check, ChevronDown, ChevronUp, BookOpen, ShieldCheck, Minus, Plus } from 'lucide-react';

interface ProfileDrawerProps {
  user: UserProfile | null;
  skillsPoints: UserSkillsPoints;
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
  todayTalesCount = 0,
  currentLang,
  onLanguageChange,
  onUpdateAvatar,
  onUpdateDailyLimit,
  onClose,
  onSignOut,
  darkMode = true,
}) => {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [activeGenderTab, setActiveGenderTab] = useState<'female' | 'male'>(
    user?.gender || 'female'
  );

  const isUnder18 = (user?.age ?? 20) < 18;
  const maxAllowed = getMaxAllowedDailyLimit(user?.age);
  const effectiveLimit = getEffectiveDailyLimit(user);

  const activeAvatarObj = user?.avatar_url ? getAvatarByUrlOrId(user.avatar_url) : null;
  const avatarList = activeGenderTab === 'female' ? FEMALE_AVATARS : MALE_AVATARS;

  const handleAdjustLimit = (delta: number) => {
    if (!onUpdateDailyLimit) return;
    const nextVal = Math.min(Math.max(1, effectiveLimit + delta), maxAllowed);
    onUpdateDailyLimit(nextVal);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onUpdateDailyLimit) return;
    const nextVal = Math.min(Math.max(1, parseInt(e.target.value, 10) || 1), maxAllowed);
    onUpdateDailyLimit(nextVal);
  };

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
            Traveler Profile
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
                  title="Change Avatar"
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
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {activeAvatarObj ? `${activeAvatarObj.title} • ${activeAvatarObj.role}` : user?.email}
              </p>
              
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                  darkMode
                    ? 'bg-[#d4af37]/20 border-[#d4af37]/40 text-[#fce0a2]'
                    : 'bg-[#d4af37]/15 border-[#d4af37]/50 text-[#8a5d12]'
                }`}>
                  {activeAvatarObj?.title || `${user?.gender === 'female' ? 'Lady' : 'Gentlemen'} Avatar`}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                  isUnder18
                    ? darkMode
                      ? 'bg-amber-950/50 border-amber-500/50 text-amber-300'
                      : 'bg-amber-50 border-amber-300 text-amber-800'
                    : darkMode
                      ? 'bg-slate-800 border-slate-700 text-slate-300'
                      : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}>
                  Age {user?.age} {isUnder18 && '• Under 18'}
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
                {showAvatarPicker ? 'Hide Avatar Choices' : 'Change Avatar (8 Choices)'}
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
                  Lady (4)
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
                  Gentlemen (4)
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
                        <div className="text-[9px] text-slate-400 truncate">
                          {av.role}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Daily Tales Limit Configuration Section */}
          <div className={`p-4 rounded-xl border space-y-3.5 ${
            darkMode ? 'bg-[#182130] border-[#d4af37]/30' : 'bg-white border-[#d4af37]/40 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#d4af37]" />
                <h5 className={`text-xs font-bold font-cinzel uppercase tracking-wider ${
                  darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
                }`}>
                  Daily Tales Limit
                </h5>
              </div>
              
              {isUnder18 ? (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <ShieldCheck className="w-3 h-3 text-amber-400" /> Max 5 (Under 18)
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40">
                  Max 10 (Adult)
                </span>
              )}
            </div>

            {/* Current Limit & Today's Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                  Reading limit:
                </span>
                <span className="font-bold text-[#d4af37] font-mono text-sm">
                  {effectiveLimit} tales / day
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-700/40 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    todayTalesCount >= effectiveLimit
                      ? 'bg-rose-500'
                      : 'bg-gradient-to-r from-[#d4af37] to-[#fce0a2]'
                  }`}
                  style={{
                    width: `${Math.min(100, (todayTalesCount / Math.max(1, effectiveLimit)) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-[11px] opacity-80">
                <span>Today's Tales Explored:</span>
                <span className={`font-semibold ${todayTalesCount >= effectiveLimit ? 'text-rose-400' : 'text-[#d4af37]'}`}>
                  {todayTalesCount} of {effectiveLimit}
                </span>
              </div>
            </div>

            {/* Stepper and Slider to Configure to Less or More (within bounds) */}
            {onUpdateDailyLimit && (
              <div className="space-y-3 pt-1 border-t border-slate-700/30">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleAdjustLimit(-1)}
                    disabled={effectiveLimit <= 1}
                    className={`p-1.5 rounded-lg border transition-all ${
                      effectiveLimit <= 1
                        ? 'opacity-40 cursor-not-allowed border-slate-700'
                        : darkMode
                          ? 'border-[#d4af37]/40 bg-slate-800 text-[#fce0a2] hover:bg-slate-700'
                          : 'border-[#d4af37]/50 bg-slate-100 text-[#8a5d12] hover:bg-slate-200'
                    }`}
                    title="Decrease daily limit"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="range"
                    min={1}
                    max={maxAllowed}
                    step={1}
                    value={effectiveLimit}
                    onChange={handleSliderChange}
                    className="flex-1 accent-[#d4af37] cursor-pointer"
                  />

                  <button
                    type="button"
                    onClick={() => handleAdjustLimit(1)}
                    disabled={effectiveLimit >= maxAllowed}
                    className={`p-1.5 rounded-lg border transition-all ${
                      effectiveLimit >= maxAllowed
                        ? 'opacity-40 cursor-not-allowed border-slate-700'
                        : darkMode
                          ? 'border-[#d4af37]/40 bg-slate-800 text-[#fce0a2] hover:bg-slate-700'
                          : 'border-[#d4af37]/50 bg-slate-100 text-[#8a5d12] hover:bg-slate-200'
                    }`}
                    title="Increase daily limit"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Preset Fast Selection Pills */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Quick set:</span>
                  {(isUnder18 ? [1, 2, 3, 5] : [1, 3, 5, 8, 10]).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => onUpdateDailyLimit(num)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        effectiveLimit === num
                          ? 'bg-[#d4af37] text-slate-950 font-black shadow-sm'
                          : darkMode
                            ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400 italic leading-tight">
                  {isUnder18
                    ? '🛡️ Parental & youth protection limits daily tales to max 5. You can configure it to any lower number.'
                    : '⚙️ Max limit is 10 tales per day. You can customize it to fewer tales anytime.'}
                </p>
              </div>
            )}
          </div>

          {/* Skill Points Breakdown */}
          <div className="space-y-3">
            <h5 className={`text-xs font-bold font-cinzel uppercase tracking-wider flex items-center gap-1.5 ${
              darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
            }`}>
              <Award className="w-4 h-4 text-[#d4af37]" /> Earned Skill Points
            </h5>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(skillsPoints).map(([skillName, points]) => (
                <div
                  key={skillName}
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    darkMode
                      ? 'bg-[#182130] border-[#d4af37]/20'
                      : 'bg-white border-[#d4af37]/30 shadow-sm'
                  }`}
                >
                  <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{skillName}</span>
                  <span className={`font-bold font-mono px-2 py-0.5 rounded border ${
                    darkMode
                      ? 'text-[#fce0a2] bg-[#d4af37]/20 border-[#d4af37]/30'
                      : 'text-[#8a5d12] bg-[#f4e8c1] border-[#d4af37]/50'
                  }`}>
                    +{points}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={onSignOut}
            className={`w-full py-3 border rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer ${
              darkMode
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
                : 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>

        </div>

      </div>
    </div>
  );
};

