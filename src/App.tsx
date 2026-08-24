import React, { useState, useEffect } from 'react';
import { UserProfile, Language, Realm, Tale, DatabaseState, SkillType } from './types';
import {
  getLocalDb,
  saveLocalDb,
  supabase,
  syncUserProfileToSupabase,
  syncSkillPointsToSupabase,
  syncChapterLikeToSupabase,
  syncChapterViewToSupabase,
  syncCommentToSupabase,
  syncUpdateCommentToSupabase,
  syncDeleteCommentToSupabase,
  syncTaleToSupabase,
  getTodayDateString,
  getTodayTalesRead,
  getTodayTalesCount,
  getEffectiveDailyLimit,
} from './lib/supabase';
import { REALMS, INITIAL_TALES } from './data/realmsAndTales';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { TalesPage } from './components/TalesPage';
import { FullscreenChapterView } from './components/ChapterIntro';
import { ActPage } from './components/ActPage';
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

  // Apply font scale to document element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
    root.classList.add(`font-scale-${fontScale}`);
    localStorage.setItem('legends_font_scale', fontScale);
  }, [fontScale]);

  // PWA Install Event
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    }
  };

  // Sync state to local storage and Supabase
  useEffect(() => {
    saveLocalDb(dbState);
  }, [dbState]);

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

  // Add Custom User Tale
  const handleSubmitNewTale = (newTale: Tale) => {
    setDbState((prev) => ({
      ...prev,
      user_tales: [newTale, ...prev.user_tales],
    }));
    syncTaleToSupabase(newTale);
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
  const handleRecordView = (chapterId: string, lang: Language = currentLang) => {
    const userId = dbState.user_profile?.user_id || 'guest';
    setDbState((prev) => {
      const existingGlobal = prev.chapters_id_Views || [];
      const newGlobal = existingGlobal.includes(chapterId)
        ? existingGlobal
        : [...existingGlobal, chapterId];

      const currentLangViews = prev.language_chapters_viewed?.[lang] || [];
      const newLangViews = currentLangViews.includes(chapterId)
        ? currentLangViews
        : [...currentLangViews, chapterId];

      const updatedLanguageViews: Record<Language, string[]> = {
        'EN': [],
        'ES': [],
        'IT': [],
        'PT-pt': [],
        'NL': [],
        ...(prev.language_chapters_viewed || {}),
        [lang]: newLangViews,
      };

      syncChapterViewToSupabase(userId, chapterId);
      return {
        ...prev,
        chapters_id_Views: newGlobal,
        language_chapters_viewed: updatedLanguageViews,
      };
    });
  };

  // Add Comment (up to 10 comments per day limit enforced in drawer)
  const handleAddComment = (chapterId: string, text: string) => {
    const user = dbState.user_profile;
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
            todayTalesCount={todayTalesCount}
            onOpenProfile={() => setShowProfileDrawer(true)}
            onSelectRealm={handleSelectRealm}
            darkMode={darkMode}
          />
        ) : currentPage === 'tails' && activeRealm ? (
          <TalesPage
            realm={activeRealm}
            tales={allTales}
            user={dbState.user_profile}
            dailyLogs={dbState.daily_tales_log}
            todayTalesCount={todayTalesCount}
            todayTalesList={todayTalesList}
            onOpenProfile={() => setShowProfileDrawer(true)}
            onBack={() => setCurrentPage('dashboard')}
            onSelectTale={handleSelectTale}
            onSubmitNewTale={handleSubmitNewTale}
            darkMode={darkMode}
          />
        ) : currentPage === 'chapter' && activeTale ? (
          activeTale.id === 'tale-5-crystals' ? (
            <ActPage
              user={dbState.user_profile}
              currentLang={currentLang}
              onLanguageChange={handleLanguageChange}
              commentsMap={dbState.chapters_id_Comments}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              onClose={() => setCurrentPage('tails')}
              onEarnSkillPoint={handleEarnSkillPoint}
              onRecordView={handleRecordView}
              darkMode={darkMode}
            />
          ) : (
            <FullscreenChapterView
              tale={activeTale}
              user={dbState.user_profile}
              currentLang={currentLang}
              likedChapters={dbState.chapters_id_Liked}
              viewedChapters={dbState.chapters_id_Views}
              commentsMap={dbState.chapters_id_Comments}
              onClose={() => setCurrentPage('tails')}
              onToggleLike={handleToggleLike}
              onRecordView={handleRecordView}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              onEarnSkillPoint={handleEarnSkillPoint}
              darkMode={darkMode}
            />
          )
        ) : null}
      </main>

      {/* Persistent Bottom Accessibility Hub with Font Size Controller */}
      {dbState.user_profile && currentPage !== 'chapter' && (
        <BottomHub
          fontScale={fontScale}
          onChangeFontScale={setFontScale}
          user={dbState.user_profile}
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
