import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, Language, Realm, Tale, DatabaseState, SkillType } from './types';
import {
  getLocalDb,
  saveLocalDb,
  supabase,
  syncUserProfileToSupabase,
  syncSkillPointsToSupabase,
  syncChapterLikeToSupabase,
  syncCommentToSupabase,
  syncUpdateCommentToSupabase,
  syncDeleteCommentToSupabase,
  syncTaleToSupabase,
  getTodayDateString,
  getTodayTalesRead,
  getTodayTalesCount,
  getEffectiveDailyLimit,
  incrementUserStatInSupabase,
  fetchUserStatsFromSupabase,
} from './lib/supabase';
import { isUserOver16 } from './lib/googleAgeSignals';
import { REALMS, INITIAL_TALES } from './data/realmsAndTales';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { TalesPage } from './components/TalesPage';
import { ActPage } from './components/ActPage';
import { ChapterFlow } from './components/ChapterFlow';
import { ProfileDrawer } from './components/ProfileDrawer';
import { BottomHub, FontScale } from './components/BottomHub';

export default function App() {
  const [dbState, setDbState] = useState<DatabaseState>(() => getLocalDb());
  
  // Navigation State
  const [currentPage, setCurrentPage] = useState<'auth' | 'dashboard' | 'tails' | 'chapter'>(
    dbState.user_profile ? 'dashboard' : 'auth'
  );

  const [activeRealm, setActiveRealm] = useState<Realm | null>(null);
  const [activeTale, setActiveTale] = useState<Tale | null>(null);

  // App UI Settings
  const [currentLang, setCurrentLang] = useState<Language>(
    dbState.user_profile?.language || 'EN'
  );
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  // Font Scaling (Persisted in localStorage)
  const [fontScale, setFontScale] = useState<FontScale>(() => {
    const saved = localStorage.getItem('legends_font_scale');
    return (saved === 'large' || saved === 'xlarge' || saved === 'normal') ? saved : 'normal';
  });

  // App Initial Loading Screen
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Apply font scale to document element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
    root.classList.add(`font-scale-${fontScale}`);
    localStorage.setItem('legends_font_scale', fontScale);
  }, [fontScale]);

  // PWA Install Event & State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    const isSavedInstalled = localStorage.getItem('pwa_is_installed') === 'true';
    return isStandalone || isIOSStandalone || isSavedInstalled;
  });

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      localStorage.setItem('pwa_is_installed', 'true');
    };

    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        localStorage.setItem('pwa_is_installed', 'true');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      }
    };
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult && choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          localStorage.setItem('pwa_is_installed', 'true');
        }
        setDeferredPrompt(null);
      });
    }
  };

  // Sync state to local storage and Supabase
  useEffect(() => {
    saveLocalDb(dbState);
  }, [dbState]);

  // Fetch user_stats from Supabase if logged in
  useEffect(() => {
    const userId = dbState.user_profile?.user_id;
    if (userId && userId !== 'guest') {
      fetchUserStatsFromSupabase(userId).then((serverStats) => {
        if (serverStats && Object.keys(serverStats).length > 0) {
          setDbState((prev) => ({
            ...prev,
            user_stats: {
              ...(prev.user_stats || {}),
              ...serverStats,
            },
          }));
        }
      });
    }
  }, [dbState.user_profile?.user_id]);

  // Language Change handler (persisted in DB & user profile)
  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    setDbState((prev) => {
      const updatedProfile = prev.user_profile
        ? { ...prev.user_profile, language: lang }
        : null;
      if (updatedProfile) {
        syncUserProfileToSupabase(updatedProfile);
      }
      return { ...prev, user_profile: updatedProfile };
    });
  };

  // Login / Onboarding Finish Success
  const handleLoginSuccess = (userProfile: UserProfile) => {
    setDbState((prev) => ({
      ...prev,
      user_profile: userProfile,
    }));
    setCurrentLang(userProfile.language);
    setCurrentPage('dashboard');
    syncUserProfileToSupabase(userProfile);
    syncSkillPointsToSupabase(userProfile.user_id, dbState.user_skills_points);
  };

  // Sign Out
  const handleSignOut = () => {
    setDbState((prev) => ({ ...prev, user_profile: null }));
    setShowProfileDrawer(false);
    setCurrentPage('auth');
  };

  // Handle Realm Selection
  const handleSelectRealm = (realm: Realm) => {
    setActiveRealm(realm);
    setCurrentPage('tails');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  // Handle Tale Selection -> Fullscreen Chapter and record to daily_tales_log
  const handleSelectTale = (tale: Tale) => {
    setDbState((prev) => {
      const today = getTodayDateString();
      const existingLogs = prev.daily_tales_log || [];
      const alreadyLogged = existingLogs.some(
        (l) => l.tale_id === tale.id && (l.date === today || l.timestamp?.startsWith(today))
      );
      const updatedLogs = alreadyLogged
        ? existingLogs
        : [...existingLogs, { tale_id: tale.id, date: today, timestamp: new Date().toISOString() }];
      return {
        ...prev,
        daily_tales_log: updatedLogs,
      };
    });
    setActiveTale(tale);
    setCurrentPage('chapter');
  };

  // Update Daily Tale Limit
  const handleUpdateDailyLimit = (newLimit: number) => {
    setDbState((prev) => {
      if (!prev.user_profile) return prev;
      const updatedProfile: UserProfile = {
        ...prev.user_profile,
        daily_tale_limit: newLimit,
      };
      syncUserProfileToSupabase(updatedProfile);
      return {
        ...prev,
        user_profile: updatedProfile,
      };
    });
  };

  // Add Custom User Tale (defaults to isApproved: false, hidden from all other users)
  const handleSubmitNewTale = (newTale: Tale) => {
    const taleWithAuthorAndApproval: Tale = {
      ...newTale,
      authorId: newTale.authorId || dbState.user_profile?.user_id || 'guest',
      authorName: newTale.authorName || dbState.user_profile?.name || 'Traveler',
      isApproved: newTale.isApproved ?? false,
    };

    setDbState((prev) => ({
      ...prev,
      user_tales: [taleWithAuthorAndApproval, ...prev.user_tales],
    }));
    syncTaleToSupabase(taleWithAuthorAndApproval);
  };

  // Toggle Chapter Like
  const handleToggleLike = (chapterId: string) => {
    const userId = dbState.user_profile?.user_id || 'guest';
    setDbState((prev) => {
      const isLiked = prev.chapters_id_Liked.includes(chapterId);
      const newLiked = isLiked
        ? prev.chapters_id_Liked.filter((id) => id !== chapterId)
        : [...prev.chapters_id_Liked, chapterId];
      
      syncChapterLikeToSupabase(userId, chapterId, !isLiked);
      return { ...prev, chapters_id_Liked: newLiked };
    });
  };

  // Record Chapter View (tracks both overall and per-language chapter views)
  const handleRecordView = useCallback((chapterId: string, lang: Language = currentLang) => {
    setDbState((prev) => {
      const existingGlobal = prev.chapters_id_Views || [];
      const currentLangViews = prev.language_chapters_viewed?.[lang] || [];

      const isGlobalRecorded = existingGlobal.includes(chapterId);
      const isLangRecorded = currentLangViews.includes(chapterId);

      // Prevent redundant state mutation and infinite re-render loops
      if (isGlobalRecorded && isLangRecorded) {
        return prev;
      }

      const newGlobal = isGlobalRecorded
        ? existingGlobal
        : [...existingGlobal, chapterId];

      const newLangViews = isLangRecorded
        ? currentLangViews
        : [...currentLangViews, chapterId];

      const updatedLanguageViews: Record<Language, string[]> = {
        'EN': [],
        'ES': [],
        'IT': [],
        'PT': [],
        'NL': [],
        ...(prev.language_chapters_viewed || {}),
        [lang]: newLangViews,
      };

      return {
        ...prev,
        chapters_id_Views: newGlobal,
        language_chapters_viewed: updatedLanguageViews,
      };
    });
  }, [currentLang]);

  // Add Comment (up to 10 comments per day limit enforced in drawer, allowed only if > 16)
  const handleAddComment = (chapterId: string, text: string) => {
    const user = dbState.user_profile;
    if (!isUserOver16(user)) {
      return;
    }
    const newComment = {
      id: `comm_${Date.now()}`,
      chapter_id: chapterId,
      user_id: user?.user_id || 'guest',
      user_name: user?.name || 'Traveler',
      user_avatar: user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      text,
      created_at: new Date().toISOString(),
    };

    setDbState((prev) => {
      const existing = prev.chapters_id_Comments[chapterId] || [];
      const updatedChapterComments = [newComment, ...existing];
      const updatedAllComments = [newComment, ...prev.user_comments];

      syncCommentToSupabase(newComment);

      return {
        ...prev,
        user_comments: updatedAllComments,
        chapters_id_Comments: {
          ...prev.chapters_id_Comments,
          [chapterId]: updatedChapterComments,
        },
      };
    });
  };

  // Edit an existing comment
  const handleEditComment = (chapterId: string, commentId: string, newText: string) => {
    setDbState((prev) => {
      const existing = prev.chapters_id_Comments[chapterId] || [];
      const updatedChapterComments = existing.map((c) =>
        c.id === commentId ? { ...c, text: newText } : c
      );
      const updatedAllComments = prev.user_comments.map((c) =>
        c.id === commentId ? { ...c, text: newText } : c
      );

      syncUpdateCommentToSupabase(commentId, newText);

      return {
        ...prev,
        user_comments: updatedAllComments,
        chapters_id_Comments: {
          ...prev.chapters_id_Comments,
          [chapterId]: updatedChapterComments,
        },
      };
    });
  };

  // Delete an existing comment
  const handleDeleteComment = (chapterId: string, commentId: string) => {
    setDbState((prev) => {
      const existing = prev.chapters_id_Comments[chapterId] || [];
      const updatedChapterComments = existing.filter((c) => c.id !== commentId);
      const updatedAllComments = prev.user_comments.filter((c) => c.id !== commentId);

      syncDeleteCommentToSupabase(commentId);

      return {
        ...prev,
        user_comments: updatedAllComments,
        chapters_id_Comments: {
          ...prev.chapters_id_Comments,
          [chapterId]: updatedChapterComments,
        },
      };
    });
  };

  // Award +1 Skill Point
  const handleEarnSkillPoint = (skill: SkillType) => {
    const userId = dbState.user_profile?.user_id || 'guest';
    setDbState((prev) => {
      const currentVal = prev.user_skills_points[skill] || 0;
      const updatedSkills = {
        ...prev.user_skills_points,
        [skill]: currentVal + 1,
      };
      syncSkillPointsToSupabase(userId, updatedSkills);
      return {
        ...prev,
        user_skills_points: updatedSkills,
      };
    });
  };

  // Increment user_stats view count whenever a user reads aloud ANY choice for a skill in a language
  const handleReadAloudChoice = useCallback((skill: SkillType, lang: Language = currentLang) => {
    const userId = dbState.user_profile?.user_id || 'guest';
    const statKey = `${lang}:${skill}`;

    setDbState((prev) => {
      const currentStats = prev.user_stats || {};
      const currentCount = currentStats[statKey] || 0;
      const nextCount = currentCount + 1;
      const updatedStats = {
        ...currentStats,
        [statKey]: nextCount,
      };

      incrementUserStatInSupabase(userId, lang, skill);

      return {
        ...prev,
        user_stats: updatedStats,
      };
    });
  }, [currentLang, dbState.user_profile?.user_id]);

  const handleChooseBestChoice = handleReadAloudChoice;

  // Update User Avatar and optionally gender
  const handleUpdateAvatar = (newAvatarUrl: string, newGender?: 'female' | 'male') => {
    setDbState((prev) => {
      if (!prev.user_profile) return prev;
      const updatedProfile = {
        ...prev.user_profile,
        avatar_url: newAvatarUrl,
        ...(newGender ? { gender: newGender } : {}),
      };
      syncUserProfileToSupabase(updatedProfile);
      return {
        ...prev,
        user_profile: updatedProfile,
      };
    });
  };

  // Combined tales list (Initial Tales + Custom User Tales)
  const allTales = [...INITIAL_TALES, ...dbState.user_tales];

  // Daily tales calculation
  const todayTalesList = getTodayTalesRead(dbState.daily_tales_log);
  const todayTalesCount = todayTalesList.length;

  if (isAppLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0f141c] text-[#fce0a2] z-50 select-none">
        <div className="flex flex-col items-center justify-center text-center px-6 py-8">
          <img
            src="https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub/favicons/android-chrome-192x192.png"
            alt="Legends"
            className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] object-contain filter drop-shadow-[0_4px_14px_rgba(212,175,55,0.45)] animate-pulse"
            referrerPolicy="no-referrer"
          />
          <h1
            className="mt-4 font-serif-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide"
            style={{
              background: 'linear-gradient(180deg, #f7e098 0%, #e0aa37 38%, #b97c14 72%, #7f4b02 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.7))',
            }}
          >
            Learn with Legends
          </h1>
          <div className="mt-3.5 w-12 sm:w-16 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#18202f] text-slate-100' : 'bg-[#fcfbf9] text-slate-900'} antialiased selection:bg-[#d4af37] selection:text-black font-sans`}>
      
      {/* Show Navigation Header when logged in */}
      {dbState.user_profile && currentPage !== 'chapter' && (
        <Header
          user={dbState.user_profile}
          currentLang={currentLang}
          onLanguageChange={handleLanguageChange}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenProfile={() => setShowProfileDrawer(true)}
          deferredPrompt={deferredPrompt}
          onInstallPWA={handleInstallPWA}
          isInstalled={isInstalled}
        />
      )}

      {/* Main Content Area with bottom padding for Bottom Hub */}
      <main className={dbState.user_profile && currentPage !== 'chapter' ? 'pb-20' : ''}>
        {/* ROUTING CONTROLLER */}
        {currentPage === 'auth' || !dbState.user_profile ? (
          <AuthScreen
            onLoginSuccess={handleLoginSuccess}
            currentLang={currentLang}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />
        ) : currentPage === 'dashboard' ? (
          <Dashboard
            user={dbState.user_profile}
            currentLang={currentLang}
            todayTalesCount={todayTalesCount}
            onOpenProfile={() => setShowProfileDrawer(true)}
            onSelectRealm={handleSelectRealm}
            commentsMap={dbState.chapters_id_Comments}
            onAddComment={handleAddComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            darkMode={darkMode}
          />
        ) : currentPage === 'tails' && activeRealm ? (
          <TalesPage
            realm={activeRealm}
            tales={allTales}
            user={dbState.user_profile}
            currentLang={currentLang}
            dailyLogs={dbState.daily_tales_log}
            todayTalesCount={todayTalesCount}
            todayTalesList={todayTalesList}
            commentsMap={dbState.chapters_id_Comments}
            onOpenProfile={() => setShowProfileDrawer(true)}
            onBack={() => setCurrentPage('dashboard')}
            onSelectTale={handleSelectTale}
            onSubmitNewTale={handleSubmitNewTale}
            darkMode={darkMode}
          />
        ) : currentPage === 'chapter' && activeTale ? (
          <ChapterFlow
            tale={activeTale}
            user={dbState.user_profile}
            userGender={dbState.user_profile?.gender}
            currentLang={currentLang}
            onLanguageChange={handleLanguageChange}
            commentsMap={dbState.chapters_id_Comments}
            onAddComment={handleAddComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            onClose={() => setCurrentPage('tails')}
            onEarnSkillPoint={handleEarnSkillPoint}
            onChooseBestChoice={handleChooseBestChoice}
            onReadAloudChoice={handleReadAloudChoice}
            onRecordView={handleRecordView}
            darkMode={darkMode}
          />
        ) : null}
      </main>

      {/* Persistent Bottom Accessibility Hub with Font Size Controller */}
      {dbState.user_profile && currentPage !== 'chapter' && (
        <BottomHub
          fontScale={fontScale}
          onChangeFontScale={setFontScale}
          user={dbState.user_profile}
          currentLang={currentLang}
          todayTalesCount={todayTalesCount}
          onOpenProfile={() => setShowProfileDrawer(true)}
          darkMode={darkMode}
        />
      )}

      {/* Profile Drawer */}
      {showProfileDrawer && (
        <ProfileDrawer
          user={dbState.user_profile}
          skillsPoints={dbState.user_skills_points}
          userStats={dbState.user_stats}
          languageChaptersViewed={dbState.language_chapters_viewed}
          likedCount={dbState.chapters_id_Liked.length}
          viewedCount={dbState.chapters_id_Views.length}
          todayTalesCount={todayTalesCount}
          currentLang={currentLang}
          onLanguageChange={handleLanguageChange}
          onUpdateAvatar={handleUpdateAvatar}
          onUpdateDailyLimit={handleUpdateDailyLimit}
          onClose={() => setShowProfileDrawer(false)}
          onSignOut={handleSignOut}
          darkMode={darkMode}
        />
      )}

    </div>
  );
}
