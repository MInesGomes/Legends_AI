import React, { useState, useEffect } from 'react';
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
import {
  Sparkles,
  Calendar,
  User,
  ArrowRight,
  Sun,
  Moon,
  Check,
  ShieldCheck,
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Copy,
  CheckCircle2,
  X,
} from 'lucide-react';

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
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Credentials, Step 2: Onboarding (DOB & Avatars)

  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Google OAuth State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [showOAuthHelpModal, setShowOAuthHelpModal] = useState(false);
  const [copiedCallback, setCopiedCallback] = useState(false);

  // Onboarding Fields
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [dob, setDob] = useState('1998-05-15');
  const [lang] = useState<Language>(currentLang);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(DEFAULT_FEMALE_AVATAR);

  const calculatedAge = calculateAge(dob);

  // Listen for Google OAuth popup postMessage
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data.user) {
        setIsGoogleLoading(false);
        const gUser = event.data.user;
        const profile: UserProfile = {
          user_id: gUser.sub || `google_${Date.now()}`,
          name: gUser.name || 'Google Traveler',
          email: gUser.email || 'traveler@google.com',
          gender: 'female',
          date_of_birth: '1996-05-15',
          age: 28,
          language: currentLang,
          avatar_url: gUser.picture || DEFAULT_FEMALE_AVATAR,
          daily_tale_limit: 10,
          created_at: new Date().toISOString(),
        };
        onLoginSuccess(profile);
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        setIsGoogleLoading(false);
        setGoogleError(event.data.error || 'Google authentication could not be completed.');
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [currentLang, onLoginSuccess]);

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

  // Google OAuth Flow
  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    setIsGoogleLoading(true);

    try {
      const origin = window.location.origin;
      const response = await fetch(`/api/auth/google/url?origin=${encodeURIComponent(origin)}`);
      const data = await response.json();

      if (data.configured && data.url) {
        // Open Google's OAuth URL in popup
        const width = 560;
        const height = 680;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2.5;

        const authWindow = window.open(
          data.url,
          'google_oauth_popup',
          `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
        );

        if (!authWindow) {
          setIsGoogleLoading(false);
          setGoogleError('Popup blocked by browser. Please allow popups for this site.');
        }
      } else {
        // Not configured yet -> Show informative setup dialog with instant test login
        setIsGoogleLoading(false);
        setShowOAuthHelpModal(true);
      }
    } catch (err) {
      console.error('Google OAuth init error:', err);
      setIsGoogleLoading(false);
      setShowOAuthHelpModal(true);
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
      daily_tale_limit: calculatedAge < 18 ? 2 : 5,
      created_at: new Date().toISOString(),
    };
    onLoginSuccess(newUser);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existingUser: UserProfile = {
      user_id: 'user_existing_123',
      name: name || (email.split('@')[0] ? email.split('@')[0].replace(/[._]/g, ' ') : 'Returning Traveler'),
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

  // Demo instant loggers
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
        avatar_url: FEMALE_AVATARS[0].url,
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
        avatar_url: MALE_AVATARS[1].url,
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
        age: 14,
        language: 'EN',
        avatar_url: DEFAULT_YOUTH_MALE_AVATAR,
        daily_tale_limit: 5,
        created_at: new Date().toISOString(),
      });
    }
  };

  // Instant Google Mock Sign-In (when testing without cloud secrets configured)
  const handleInstantGoogleMock = () => {
    setShowOAuthHelpModal(false);
    onLoginSuccess({
      user_id: 'google_user_demo_7788',
      name: 'Mobile Traveler',
      email: 'mobilegotop@gmail.com',
      gender: 'female',
      date_of_birth: '1995-06-18',
      age: 29,
      language: currentLang,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      daily_tale_limit: 10,
      created_at: new Date().toISOString(),
    });
  };

  const activeAvatarsList: AvatarOption[] = gender === 'female' ? FEMALE_AVATARS : MALE_AVATARS;
  const currentSelectedAvatarObj = activeAvatarsList.find((a) => a.url === selectedAvatar) || activeAvatarsList[0];

  const callbackUrl = `${window.location.origin}/auth/google/callback`;

  const copyCallbackUrl = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2500);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-300 ${
        darkMode ? 'bg-[#0b0f17] text-slate-100' : 'bg-[#f6f4ee] text-slate-900'
      }`}
    >
      {/* Subtle Background Glows */}
      <div
        className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
          darkMode ? 'bg-[#d4af37]/10' : 'bg-amber-300/20'
        }`}
      />
      <div
        className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
          darkMode ? 'bg-cyan-900/15' : 'bg-amber-100/40'
        }`}
      />

      {/* Theme Toggle in top right */}
      {onToggleDarkMode && (
        <button
          type="button"
          onClick={onToggleDarkMode}
          aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`absolute top-4 right-4 z-20 p-2.5 rounded-full border transition-all cursor-pointer ${
            darkMode
              ? 'bg-[#121824] border-[#d4af37]/40 text-[#fce0a2] hover:bg-[#182130] shadow-md'
              : 'bg-white border-amber-300 text-[#854d0e] hover:bg-amber-50 shadow-md'
          }`}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      )}

      {/* Main Authentication Card */}
      <div
        className={`w-full max-w-md border rounded-2xl p-6 sm:p-8 relative z-10 shadow-2xl transition-all ${
          darkMode
            ? 'bg-[#131b28]/95 border-[#d4af37] shadow-black/70 ring-1 ring-[#d4af37]/40'
            : 'bg-white border-[#d4af37] shadow-amber-950/10 ring-1 ring-[#d4af37]/40'
        }`}
      >
        {/* Brand Header */}
        <div className="text-center mb-6 text-[#d4af37]">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#d4af37] via-[#f3c457] to-[#996515] p-0.5 mx-auto mb-3.5 shadow-lg shadow-[#d4af37]/20 flex items-center justify-center">
            <div
              className={`w-full h-full rounded-full flex items-center justify-center ${
                darkMode ? 'bg-[#121824] text-[#d4af37]' : 'bg-white text-[#d4af37]'
              }`}
            >
              <Sparkles className="w-7 h-7 text-[#d4af37]" />
            </div>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-bold font-cinzel tracking-wide text-[#d4af37]`}
          >
            Learn with Legends
          </h1>
          <p
            className={`text-sm mt-1.5 font-medium ${
              darkMode ? 'text-[#d4af37]/90' : 'text-[#b38f2a]'
            }`}
          >
            {mode === 'login'
              ? 'Sign in to continue your epic journey'
              : step === 1
              ? 'Create an account to embark on legendary tales'
              : 'Step 2: Choose Traveler Archetype & Birthdate'}
          </p>
        </div>

        {/* GOOGLE OAUTH PRIMARY ACTION */}
        <div className="mb-5 space-y-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className={`w-full py-3 px-4 rounded-xl border font-semibold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm ${
              darkMode
                ? 'bg-[#1a2333] hover:bg-[#202c40] border-[#d4af37]/60 text-slate-100 hover:border-[#d4af37] active:bg-[#151c28]'
                : 'bg-white hover:bg-slate-50 border-[#d4af37]/60 text-slate-800 hover:border-[#d4af37] active:bg-slate-100'
            }`}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#d4af37]" />
                <span className="text-[#d4af37]">Connecting to Google...</span>
              </>
            ) : (
              <>
                {/* Official Google "G" Icon */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="font-semibold text-[#d4af37]">Continue with Google</span>
              </>
            )}
          </button>

          {googleError && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs bg-red-500/10 border border-red-500/30 text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{googleError}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${darkMode ? 'border-[#d4af37]/30' : 'border-[#d4af37]/30'}`} />
          </div>
          <span
            className={`relative px-3 text-xs font-semibold uppercase tracking-wider text-[#d4af37] ${
              darkMode ? 'bg-[#131b28]' : 'bg-white'
            }`}
          >
            Or with email
          </span>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div
          className={`grid grid-cols-2 p-1 rounded-xl border mb-5 transition-colors ${
            darkMode ? 'bg-[#0b0f17] border-[#d4af37]/40' : 'bg-slate-100 border-[#d4af37]/40'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setStep(1);
            }}
            className={`py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-gradient-to-r from-[#d4af37] via-[#f3c457] to-[#b38f2a] text-slate-950 font-bold shadow-md'
                : darkMode
                ? 'text-[#d4af37]/80 hover:text-[#d4af37]'
                : 'text-[#854d0e] hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('create');
              setStep(1);
            }}
            className={`py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'create'
                ? 'bg-gradient-to-r from-[#d4af37] via-[#f3c457] to-[#b38f2a] text-slate-950 font-bold shadow-md'
                : darkMode
                ? 'text-[#d4af37]/80 hover:text-[#d4af37]'
                : 'text-[#854d0e] hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* SIGN IN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label
                className={`block text-xs sm:text-sm font-semibold mb-1.5 flex items-center gap-1.5 text-[#d4af37]`}
              >
                <Mail className="w-3.5 h-3.5 text-[#d4af37]" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="traveler@example.com"
                className={`w-full rounded-xl px-4 py-3 text-sm border focus:outline-none transition-all ${
                  darkMode
                    ? 'bg-[#0b0f17] border-[#d4af37]/40 text-slate-100 placeholder-slate-500 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30'
                    : 'bg-white border-[#d4af37]/50 text-slate-900 placeholder-slate-400 focus:border-[#b38f2a] focus:ring-2 focus:ring-amber-200'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 text-[#d4af37]`}
                >
                  <Lock className="w-3.5 h-3.5 text-[#d4af37]" /> Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-xl px-4 py-3 pr-11 text-sm border focus:outline-none transition-all ${
                    darkMode
                      ? 'bg-[#0b0f17] border-[#d4af37]/40 text-slate-100 placeholder-slate-500 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30'
                      : 'bg-white border-[#d4af37]/50 text-slate-900 placeholder-slate-400 focus:border-[#b38f2a] focus:ring-2 focus:ring-amber-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors cursor-pointer ${
                    darkMode ? 'text-[#d4af37]/70 hover:text-[#d4af37]' : 'text-[#854d0e] hover:text-slate-800'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] via-[#f3c457] to-[#d4af37] text-slate-950 font-bold text-sm rounded-xl hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* CREATE ACCOUNT MODE */}
        {mode === 'create' && (
          <>
            {step === 1 ? (
              <form onSubmit={handleCreateStep1Next} className="space-y-4">
                <div>
                  <label
                    className={`block text-xs sm:text-sm font-semibold mb-1.5 flex items-center gap-1.5 text-[#d4af37]`}
                  >
                    <User className="w-3.5 h-3.5 text-[#d4af37]" /> Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aria Vale"
                    className={`w-full rounded-xl px-4 py-3 text-sm border focus:outline-none transition-all ${
                      darkMode
                        ? 'bg-[#0b0f17] border-[#d4af37]/40 text-slate-100 placeholder-slate-500 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30'
                        : 'bg-white border-[#d4af37]/50 text-slate-900 placeholder-slate-400 focus:border-[#b38f2a] focus:ring-2 focus:ring-amber-200'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs sm:text-sm font-semibold mb-1.5 flex items-center gap-1.5 text-[#d4af37]`}
                  >
                    <Mail className="w-3.5 h-3.5 text-[#d4af37]" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aria@example.com"
                    className={`w-full rounded-xl px-4 py-3 text-sm border focus:outline-none transition-all ${
                      darkMode
                        ? 'bg-[#0b0f17] border-[#d4af37]/40 text-slate-100 placeholder-slate-500 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30'
                        : 'bg-white border-[#d4af37]/50 text-slate-900 placeholder-slate-400 focus:border-[#b38f2a] focus:ring-2 focus:ring-amber-200'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs sm:text-sm font-semibold mb-1.5 flex items-center gap-1.5 text-[#d4af37]`}
                  >
                    <Lock className="w-3.5 h-3.5 text-[#d4af37]" /> Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full rounded-xl px-4 py-3 pr-11 text-sm border focus:outline-none transition-all ${
                        darkMode
                          ? 'bg-[#0b0f17] border-[#d4af37]/40 text-slate-100 placeholder-slate-500 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30'
                          : 'bg-white border-[#d4af37]/50 text-slate-900 placeholder-slate-400 focus:border-[#b38f2a] focus:ring-2 focus:ring-amber-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors cursor-pointer ${
                        darkMode ? 'text-[#d4af37]/70 hover:text-[#d4af37]' : 'text-[#854d0e] hover:text-slate-800'
                      }`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] via-[#f3c457] to-[#d4af37] text-slate-950 font-bold text-sm rounded-xl hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <span>Continue to Step 2 (Avatar & Age)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* STEP 2: ONBOARDING PAGE (DOB & Avatars Female/Male) */
              <form onSubmit={handleFinishOnboarding} className="space-y-5">
                {/* Date of Birth Picker */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="pwa-date"
                    className={`block text-xs sm:text-sm font-semibold flex items-center gap-1.5 font-cinzel text-[#d4af37]`}
                  >
                    <Calendar className="w-4 h-4 text-[#d4af37]" /> Date of Birth
                  </label>
                  <input
                    id="pwa-date"
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    min="1930-01-01"
                    className={`w-full rounded-xl px-4 py-3 text-sm border focus:outline-none transition-all ${
                      darkMode
                        ? 'bg-[#0b0f17] border-[#d4af37] text-slate-100 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 [color-scheme:dark]'
                        : 'bg-white border-[#d4af37] text-slate-900 focus:border-[#b38f2a] focus:ring-2 focus:ring-amber-200 [color-scheme:light]'
                    }`}
                  />
                  <div
                    className={`mt-1.5 flex items-center justify-between text-xs text-[#d4af37]`}
                  >
                    <span>
                      Calculated Age:{' '}
                      <strong className={`font-bold text-[#d4af37]`}>
                        {calculatedAge} years old
                      </strong>
                    </span>
                    {calculatedAge < 18 && (
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-full border text-[11px] flex items-center gap-1 text-[#d4af37] border-[#d4af37]/60 bg-[#d4af37]/10`}
                      >
                        <ShieldCheck className="w-3 h-3 text-[#d4af37]" /> Youth Shield Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Gender & Avatar Choice */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label
                      className={`text-xs sm:text-sm font-semibold font-cinzel flex items-center gap-1.5 text-[#d4af37]`}
                    >
                      <User className="w-4 h-4 text-[#d4af37]" /> Choose Archetype
                    </label>
                    <span className="text-xs font-medium text-[#d4af37]/80">
                      4 {gender === 'female' ? 'Lady' : 'Gentlemen'} Options
                    </span>
                  </div>

                  {/* Gender Selector Toggle */}
                  <div
                    className={`grid grid-cols-2 p-1 rounded-xl border transition-colors ${
                      darkMode ? 'bg-[#0b0f17] border-[#d4af37]/40' : 'bg-slate-100 border-[#d4af37]/40'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleGenderSwitch('female')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        gender === 'female'
                          ? 'bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-slate-950 shadow-md font-bold'
                          : darkMode
                          ? 'text-[#d4af37]/80 hover:text-[#d4af37]'
                          : 'text-[#854d0e] hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" /> Lady Avatars
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGenderSwitch('male')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        gender === 'male'
                          ? 'bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-slate-950 shadow-md font-bold'
                          : darkMode
                          ? 'text-[#d4af37]/80 hover:text-[#d4af37]'
                          : 'text-[#854d0e] hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" /> Gentlemen Avatars
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
                          className={`p-3 rounded-xl border text-left flex flex-col items-center gap-2 transition-all relative cursor-pointer ${
                            isSelected
                              ? darkMode
                                ? 'bg-[#d4af37]/20 border-[#d4af37] ring-2 ring-[#d4af37]/70 shadow-lg shadow-[#d4af37]/15'
                                : 'bg-amber-100/70 border-[#d4af37] ring-2 ring-[#d4af37] shadow-md'
                              : darkMode
                              ? 'bg-[#0b0f17] border-[#d4af37]/30 hover:border-[#d4af37] hover:bg-[#121824]'
                              : 'bg-white border-[#d4af37]/30 hover:border-[#d4af37] hover:bg-amber-50/50'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#d4af37] text-slate-950 flex items-center justify-center shadow">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}

                          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 p-0.5 border-[#d4af37] shadow-md flex-shrink-0">
                            <img
                              src={avatar.url}
                              alt={avatar.title}
                              className="w-full h-full object-cover rounded-full"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          <div className="text-center w-full min-w-0">
                            <div
                              className={`text-xs font-bold font-cinzel truncate text-[#d4af37]`}
                            >
                              {avatar.title}
                            </div>

                            <div className="flex items-center justify-center gap-1 mt-1">
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                                  darkMode ? 'bg-slate-800 text-[#d4af37]' : 'bg-amber-50 text-[#854d0e] border border-[#d4af37]/30'
                                }`}
                              >
                                {avatar.role}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Avatar Detailed Info Preview */}
                  {currentSelectedAvatarObj && (
                    <div
                      className={`p-3 rounded-xl border flex items-center gap-3 text-xs ${
                        darkMode
                          ? 'bg-[#151c28] border-[#d4af37] text-slate-200'
                          : 'bg-amber-50 border-[#d4af37] text-slate-800'
                      }`}
                    >
                      <img
                        src={currentSelectedAvatarObj.url}
                        alt={currentSelectedAvatarObj.title}
                        className="w-9 h-9 rounded-full object-cover border border-[#d4af37] flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          className={`font-semibold font-cinzel text-xs text-[#d4af37]`}
                        >
                          {currentSelectedAvatarObj.title} ({currentSelectedAvatarObj.name})
                        </div>
                        <p className="text-xs text-[#d4af37]/90 line-clamp-1 mt-0.5">
                          {currentSelectedAvatarObj.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Daily Tales Limit Summary */}
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      calculatedAge < 18
                        ? darkMode
                          ? 'bg-amber-950/40 border-[#d4af37]/60 text-[#d4af37]'
                          : 'bg-amber-50 border-[#d4af37] text-[#854d0e]'
                        : darkMode
                        ? 'bg-[#121824] border-[#d4af37]/40 text-[#d4af37]'
                        : 'bg-slate-50 border-[#d4af37]/40 text-[#854d0e]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#d4af37]" />
                      <span>
                        Daily Tale Limit:{' '}
                        <strong className="text-[#d4af37]">{calculatedAge < 18 ? 'Max 5 tales/day' : 'Max 10 tales/day'}</strong>
                      </span>
                    </div>
                    <span className="text-[11px] text-[#d4af37]/80">Profile Configurable</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                      darkMode
                        ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-gradient-to-r from-[#d4af37] via-[#f3c457] to-[#d4af37] text-slate-950 font-bold text-sm rounded-xl hover:brightness-110 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    Complete & Enter Realms
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* DEMO LOGINS SECTION */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t border-[#d4af37]/30`} />
          </div>
          <span
            className={`relative px-3 text-xs font-semibold uppercase tracking-wider text-[#d4af37] ${
              darkMode ? 'bg-[#131b28]' : 'bg-white'
            }`}
          >
            Instant Demo Logins
          </span>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('female')}
            className={`w-full py-2.5 px-3.5 border text-xs sm:text-sm font-medium rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              darkMode
                ? 'bg-[#0b0f17] border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37]/15 hover:border-[#d4af37]'
                : 'bg-[#fcfaf5] border-[#d4af37]/60 text-[#854d0e] hover:bg-amber-100/50 hover:border-[#d4af37]'
            }`}
          >
            <span className="font-semibold text-[#d4af37]">👩 Aria Vale (Adult Lady, Age 28)</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold border border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10`}
            >
              All 6 Realms
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('male')}
            className={`w-full py-2.5 px-3.5 border text-xs sm:text-sm font-medium rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              darkMode
                ? 'bg-[#0b0f17] border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37]/15 hover:border-[#d4af37]'
                : 'bg-[#fcfaf5] border-[#d4af37]/60 text-[#854d0e] hover:bg-amber-100/50 hover:border-[#d4af37]'
            }`}
          >
            <span className="font-semibold text-[#d4af37]">👨 Elion Drake (Adult Gent, Age 32)</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold border border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10`}
            >
              All 6 Realms
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo('youth')}
            className={`w-full py-2.5 px-3.5 border text-xs sm:text-sm font-medium rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              darkMode
                ? 'bg-[#0b0f17] border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37]/15 hover:border-[#d4af37]'
                : 'bg-amber-50 border-[#d4af37]/60 text-[#854d0e] hover:bg-amber-100'
            }`}
          >
            <span className="font-semibold text-[#d4af37]">👦 Leo Star (Youth Shield, Age 14)</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold border border-[#d4af37] text-[#d4af37] bg-[#d4af37]/20`}
            >
              Child Safe
            </span>
          </button>
        </div>
      </div>

      {/* GOOGLE OAUTH CONFIGURATION & TEST MODAL */}
      {showOAuthHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 sm:p-7 shadow-2xl relative animate-fadeIn ${
              darkMode
                ? 'bg-[#131b28] border-[#d4af37]/40 text-slate-100'
                : 'bg-white border-amber-300 text-slate-900'
            }`}
          >
            <button
              type="button"
              onClick={() => setShowOAuthHelpModal(false)}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors cursor-pointer ${
                darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold font-cinzel">Google OAuth Integration</h3>
                <p className="text-xs text-slate-400">Connect Google Cloud Client Credentials</p>
              </div>
            </div>

            <p className={`text-sm mb-4 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Google Sign-In is integrated with server-side authorization and popup handlers. To use your live Google credentials, add them to Settings or test instantly below:
            </p>

            {/* Callback URL Box */}
            <div className={`p-3.5 rounded-xl border mb-4 ${
              darkMode ? 'bg-[#0b0f17] border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-400">Authorized Redirect URI:</span>
                <button
                  type="button"
                  onClick={copyCallbackUrl}
                  className="flex items-center gap-1 text-xs font-bold text-[#d4af37] hover:underline cursor-pointer"
                >
                  {copiedCallback ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy URI
                    </>
                  )}
                </button>
              </div>
              <code className="text-xs font-mono break-all text-[#fce0a2] block">
                {callbackUrl}
              </code>
            </div>

            {/* Quick Steps */}
            <div className={`p-3.5 rounded-xl border mb-5 text-xs space-y-2 ${
              darkMode ? 'bg-[#182130] border-slate-700 text-slate-300' : 'bg-amber-50/70 border-amber-200 text-slate-700'
            }`}>
              <div className="font-semibold text-sm font-cinzel text-[#d4af37]">Required Environment Variables:</div>
              <ul className="list-disc pl-4 space-y-1">
                <li><code>GOOGLE_CLIENT_ID</code> (or <code>CLIENT_ID</code>)</li>
                <li><code>GOOGLE_CLIENT_SECRET</code> (or <code>CLIENT_SECRET</code>)</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleInstantGoogleMock}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-[#d4af37] via-[#f3c457] to-[#d4af37] text-slate-950 font-bold text-sm rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Continue with Test Google Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowOAuthHelpModal(false)}
                className={`py-3 px-4 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
