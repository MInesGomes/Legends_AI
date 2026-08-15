import React, { useState } from 'react';
import { UserProfile, Language } from '../types';
import { calculateAge } from '../lib/supabase';
import {
  FEMALE_AVATARS,
  MALE_AVATARS,
  DEFAULT_FEMALE_AVATAR,
  DEFAULT_MALE_AVATAR,
  DEFAULT_YOUTH_MALE_AVATAR,
  AvatarOption,
} from '../data/avatars';
import { Sparkles, Calendar, User, ArrowRight, Sun, Moon, Check, ShieldCheck, Sparkle, BookOpen } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  currentLang: Language;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  currentLang,
  darkMode = true,
  onToggleDarkMode,
}) => {
  const [mode, setMode] = useState<'create' | 'login'>('create');
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Credentials, Step 2: Onboarding (DOB & Avatars)

  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Onboarding Fields
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [dob, setDob] = useState('1998-05-15');
  const [lang] = useState<Language>(currentLang);

  const [selectedAvatar, setSelectedAvatar] = useState<string>(DEFAULT_FEMALE_AVATAR);

  const calculatedAge = calculateAge(dob);

  const handleGenderSwitch = (newGender: 'female' | 'male') => {
    setGender(newGender);
    if (newGender === 'female') {
      const match = FEMALE_AVATARS.find((a) => a.url === selectedAvatar);
      if (!match) {
        setSelectedAvatar(calculatedAge < 18 ? FEMALE_AVATARS[3].url : FEMALE_AVATARS[0].url);
      }
    } else {
      const match = MALE_AVATARS.find((a) => a.url === selectedAvatar);
      if (!match) {
        setSelectedAvatar(calculatedAge < 18 ? MALE_AVATARS[3].url : MALE_AVATARS[0].url);
      }
    }
  };

  const handleCreateStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    setStep(2); // Go to Onboarding page
  };

  const handleFinishOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProfile = {
      user_id: `user_${Date.now()}`,
      name: name || 'Legendary Traveler',
      email: email || 'user@example.com',
      gender,
      date_of_birth: dob,
      age: calculatedAge,
      language: lang,
      avatar_url: selectedAvatar,
      daily_tale_limit: calculatedAge < 18 ? 5 : 10,
      created_at: new Date().toISOString(),
    };
    onLoginSuccess(newUser);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Direct Login skips onboarding!
    const existingUser: UserProfile = {
      user_id: 'user_existing_123',
      name: name || 'Returning Traveler',
      email: email || 'login@example.com',
      gender: 'female',
      date_of_birth: '1995-08-20',
      age: 30,
      language: currentLang,
      avatar_url: DEFAULT_FEMALE_AVATAR,
      daily_tale_limit: 10,
      created_at: new Date().toISOString(),
    };
    onLoginSuccess(existingUser);
  };

  // Demo instant loggers with reference avatars
  const handleQuickDemo = (preset: 'female' | 'male' | 'youth') => {
    if (preset === 'female') {
      onLoginSuccess({
        user_id: 'user_demo_female',
        name: 'Aria Vale',
        email: 'aria@legends.app',
        gender: 'female',
        date_of_birth: '1996-04-12',
        age: 28,
        language: 'EN',
        avatar_url: FEMALE_AVATARS[0].url, // The Wayfinder
        daily_tale_limit: 10,
        created_at: new Date().toISOString(),
      });
    } else if (preset === 'male') {
      onLoginSuccess({
        user_id: 'user_demo_male',
        name: 'Elion Drake',
        email: 'elion@legends.app',
        gender: 'male',
        date_of_birth: '1992-11-03',
        age: 32,
        language: 'EN',
        avatar_url: MALE_AVATARS[1].url, // The Palace Champion
        daily_tale_limit: 10,
        created_at: new Date().toISOString(),
      });
    } else {
      onLoginSuccess({
        user_id: 'user_demo_youth',
        name: 'Leo Star',
        email: 'leo@youth.app',
        gender: 'male',
        date_of_birth: '2011-09-10',
        age: 14, // Under 18 years old!
        language: 'EN',
        avatar_url: DEFAULT_YOUTH_MALE_AVATAR, // The Torchbearer
        daily_tale_limit: 5, // Under 18 max 5
        created_at: new Date().toISOString(),
      });
    }
  };

  const activeAvatarsList: AvatarOption[] = gender === 'female' ? FEMALE_AVATARS : MALE_AVATARS;
  const currentSelectedAvatarObj = activeAvatarsList.find((a) => a.url === selectedAvatar) || activeAvatarsList[0];

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300 ${
      darkMode ? 'bg-[#0f141c] text-slate-100' : 'bg-[#f4f1ea] text-slate-900'
    }`}>
      
      {/* Background Ambient Glows */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
        darkMode ? 'bg-[#d4af37]/10' : 'bg-[#d4af37]/15'
      }`} />
      <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
        darkMode ? 'bg-cyan-900/15' : 'bg-amber-200/40'
      }`} />

      {/* Theme Toggle in top right */}
      {onToggleDarkMode && (
        <button
          type="button"
          onClick={onToggleDarkMode}
          className={`absolute top-4 right-4 z-20 p-2 rounded-full border transition-all ${
            darkMode
              ? 'bg-[#121824] border-[#d4af37]/40 text-[#fce0a2] hover:bg-[#182130]'
              : 'bg-white border-[#d4af37]/50 text-[#8a5d12] hover:bg-[#fbf9f4] shadow-md'
          }`}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      )}

      <div className={`w-full max-w-md border rounded-2xl p-6 sm:p-8 relative z-10 shadow-2xl transition-colors ${
        darkMode
          ? 'bg-[#121824]/95 border-[#d4af37]/40 shadow-black/60'
          : 'bg-white/95 border-[#d4af37]/40 shadow-amber-900/10'
      }`}>
        
        {/* Title Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#996515] p-0.5 mx-auto mb-3 shadow-lg">
            <div className={`w-full h-full rounded-full flex items-center justify-center ${
              darkMode ? 'bg-[#121824] text-[#d4af37]' : 'bg-white text-[#9e7b0d]'
            }`}>
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <h2 className={`text-2xl font-bold font-cinzel ${
            darkMode ? 'gold-gradient-text' : 'text-[#8a5d12]'
          }`}>
            Learn with Legends
          </h2>
          <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {mode === 'create'
              ? step === 1
                ? 'Create your account to start your journey'
                : 'Onboarding: Customize Your Profile & Avatar'
              : 'Sign in to return to your dashboard'}
          </p>
        </div>

        {/* Tab Switcher: Create Account vs Sign In */}
        <div className={`flex p-1 rounded-xl border mb-6 transition-colors ${
          darkMode
            ? 'bg-[#0b0f17] border-[#d4af37]/20'
            : 'bg-slate-100 border-[#d4af37]/30'
        }`}>
          <button
            type="button"
            onClick={() => { setMode('create'); setStep(1); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'create'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-slate-950 font-bold shadow-md'
                : darkMode
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-slate-950 font-bold shadow-md'
                : darkMode
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* CREATE ACCOUNT MODE */}
        {mode === 'create' && (
          <>
            {step === 1 ? (
              <form onSubmit={handleCreateStep1Next} className="space-y-4">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aria Vale"
                    className={`w-full rounded-lg px-3.5 py-2.5 text-sm border focus:outline-none transition-colors ${
                      darkMode
                        ? 'bg-[#0b0f17] border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#d4af37]'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aria@example.com"
                    className={`w-full rounded-lg px-3.5 py-2.5 text-sm border focus:outline-none transition-colors ${
                      darkMode
                        ? 'bg-[#0b0f17] border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#d4af37]'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-lg px-3.5 py-2.5 text-sm border focus:outline-none transition-colors ${
                      darkMode
                        ? 'bg-[#0b0f17] border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#d4af37]'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#d4af37] text-slate-950 font-bold text-sm rounded-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  Continue to Onboarding <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* STEP 2: ONBOARDING PAGE (DOB & Avatars Female/Male) */
              <form onSubmit={handleFinishOnboarding} className="space-y-5 animate-fadeIn">
                
                {/* Date of Birth Picker (Native PWA) */}
                <div className="date-picker-container space-y-1.5">
                  <label
                    htmlFor="pwa-date"
                    className={`block text-xs font-medium flex items-center gap-1.5 font-cinzel ${
                      darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#d4af37]" /> Date of Birth
                  </label>
                  <input
                    id="pwa-date"
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    min="1930-01-01"
                    className={`native-datepicker w-full rounded-lg px-3.5 py-2.5 text-sm border focus:outline-none transition-colors ${
                      darkMode
                        ? 'bg-[#0b0f17] border-[#d4af37]/40 text-slate-100 focus:border-[#d4af37] [color-scheme:dark]'
                        : 'bg-white border-[#d4af37]/50 text-slate-900 focus:border-[#d4af37] [color-scheme:light]'
                    }`}
                  />
                  <div className={`mt-1 flex items-center justify-between text-[11px] ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    <span>
                      Calculated Age:{' '}
                      <strong className={`font-semibold ${darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'}`}>
                        {calculatedAge} years old
                      </strong>
                    </span>
                    {calculatedAge < 18 && (
                      <span className={`font-semibold px-2 py-0.5 rounded border ${
                        darkMode
                          ? 'text-amber-400 bg-amber-950/60 border-amber-500/30'
                          : 'text-amber-800 bg-amber-100 border-amber-300'
                      }`}>
                        Under 18 Youth Mode
                      </span>
                    )}
                  </div>
                </div>

                {/* Gender & Avatar Choice (Female / Male) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className={`text-xs font-semibold font-cinzel flex items-center gap-1.5 ${
                      darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
                    }`}>
                      <User className="w-3.5 h-3.5 text-[#d4af37]" /> Choose Traveler Avatar
                    </label>
                    <span className="text-[11px] font-medium text-slate-400">
                      4 {gender === 'female' ? 'Female' : 'Male'} Archetypes
                    </span>
                  </div>

                  {/* Gender Selector Toggle */}
                  <div className={`grid grid-cols-2 p-1 rounded-xl border transition-colors ${
                    darkMode ? 'bg-[#0b0f17] border-[#d4af37]/30' : 'bg-slate-100 border-[#d4af37]/40'
                  }`}>
                    <button
                      type="button"
                      onClick={() => handleGenderSwitch('female')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        gender === 'female'
                          ? 'bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-slate-950 shadow-md font-bold'
                          : darkMode
                            ? 'text-slate-400 hover:text-slate-200'
                            : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Female Avatars
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGenderSwitch('male')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        gender === 'male'
                          ? 'bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-slate-950 shadow-md font-bold'
                          : darkMode
                            ? 'text-slate-400 hover:text-slate-200'
                            : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Male Avatars
                    </button>
                  </div>

                  {/* 4 Avatar Grid Choice Cards */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    {activeAvatarsList.map((avatar) => {
                      const isSelected = selectedAvatar === avatar.url;
                      return (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setSelectedAvatar(avatar.url)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col items-center gap-2 transition-all relative cursor-pointer ${
                            isSelected
                              ? darkMode
                                ? 'bg-[#d4af37]/15 border-[#d4af37] ring-2 ring-[#d4af37]/60 shadow-lg shadow-[#d4af37]/10'
                                : 'bg-[#d4af37]/15 border-[#d4af37] ring-2 ring-[#d4af37]/60 shadow-md shadow-amber-500/10'
                              : darkMode
                                ? 'bg-[#0b0f17]/90 border-slate-800 hover:border-slate-700 hover:bg-[#121824]'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#d4af37] text-slate-950 flex items-center justify-center shadow">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}

                          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 p-0.5 border-[#d4af37]/70 shadow-md flex-shrink-0">
                            <img
                              src={avatar.url}
                              alt={avatar.title}
                              className="w-full h-full object-cover rounded-full"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          <div className="text-center w-full min-w-0">
                            <div className={`text-xs font-bold font-cinzel truncate ${
                              isSelected
                                ? darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
                                : darkMode ? 'text-slate-200' : 'text-slate-800'
                            }`}>
                              {avatar.title}
                            </div>
                            
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {avatar.role}
                              </span>
                              {avatar.isYouthRecommended && (
                                <span className="text-[10px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  Youth
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Avatar Detailed Info Preview */}
                  {currentSelectedAvatarObj && (
                    <div className={`p-2.5 rounded-lg border flex items-center gap-3 text-xs ${
                      darkMode ? 'bg-[#151c28] border-[#d4af37]/20 text-slate-300' : 'bg-amber-50/70 border-[#d4af37]/30 text-slate-700'
                    }`}>
                      <img
                        src={currentSelectedAvatarObj.url}
                        alt={currentSelectedAvatarObj.title}
                        className="w-8 h-8 rounded-full object-cover border border-[#d4af37]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className={`font-semibold font-cinzel text-xs ${darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'}`}>
                          {currentSelectedAvatarObj.title} ({currentSelectedAvatarObj.name})
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {currentSelectedAvatarObj.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Daily Tales Limit Notice */}
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                    calculatedAge < 18
                      ? darkMode
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                        : 'bg-amber-50 border-amber-300 text-amber-900'
                      : darkMode
                        ? 'bg-[#121824] border-[#d4af37]/30 text-slate-300'
                        : 'bg-white border-[#d4af37]/40 text-slate-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#d4af37]" />
                      <span>
                        Daily Tale Limit:{' '}
                        <strong>{calculatedAge < 18 ? 'Max 5 tales/day (Under 18 Shield)' : 'Max 10 tales/day'}</strong>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Customizable in Profile</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={`px-4 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      darkMode
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#d4af37] text-slate-950 font-bold text-sm rounded-lg hover:brightness-110 transition-all shadow-md cursor-pointer"
                  >
                    Complete Onboarding & Start
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* SIGN IN MODE (Direct login -> skips onboarding) */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aria@example.com"
                className={`w-full rounded-lg px-3.5 py-2.5 text-sm border focus:outline-none transition-colors ${
                  darkMode
                    ? 'bg-[#0b0f17] border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#d4af37]'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-lg px-3.5 py-2.5 text-sm border focus:outline-none transition-colors ${
                  darkMode
                    ? 'bg-[#0b0f17] border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#d4af37]'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#d4af37] text-slate-950 font-bold text-sm rounded-lg hover:brightness-110 active:scale-[0.99] transition-all shadow-lg cursor-pointer"
            >
              Sign In to Dashboard
            </button>
          </form>
        )}

        {/* OAuth / Demo Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`} />
          </div>
          <span className={`relative px-3 text-[11px] uppercase tracking-wider font-cinzel ${
            darkMode ? 'bg-[#121824] text-slate-500' : 'bg-white text-slate-500'
          }`}>
            Or quick demo login
          </span>
        </div>

        {/* Quick Demo Logins for Instant Testing */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('female')}
            className={`w-full py-2 px-3 border text-xs font-medium rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
              darkMode
                ? 'bg-[#0b0f17] border-[#d4af37]/30 text-[#fce0a2] hover:bg-[#d4af37]/10'
                : 'bg-[#fcfaf5] border-[#d4af37]/40 text-[#8a5d12] hover:bg-[#d4af37]/10'
            }`}
          >
            <span>👩 Demo Female Adult (Age 28)</span>
            <span className={`text-[10px] font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              All 6 Realms
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('male')}
            className={`w-full py-2 px-3 border text-xs font-medium rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
              darkMode
                ? 'bg-[#0b0f17] border-[#d4af37]/30 text-[#fce0a2] hover:bg-[#d4af37]/10'
                : 'bg-[#fcfaf5] border-[#d4af37]/40 text-[#8a5d12] hover:bg-[#d4af37]/10'
            }`}
          >
            <span>👨 Demo Male Adult (Age 32)</span>
            <span className={`text-[10px] font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              All 6 Realms
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('youth')}
            className={`w-full py-2 px-3 border text-xs font-medium rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
              darkMode
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 hover:bg-amber-900/40'
                : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span>👦 Demo Youth Mode (Age 14)</span>
            <span className={`text-[10px] font-semibold ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
              Hides Adult Realms
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

