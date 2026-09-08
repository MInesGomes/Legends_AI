import React, { useState } from 'react';
import { ChapterComment, Language, Realm, UserProfile } from '../types';
import { REALMS } from '../data/realmsAndTales';
import { ShieldAlert, Sparkles, BookOpen, ShieldCheck, Settings, CheckCircle2, MessageSquare, Clock } from 'lucide-react';
import { getEffectiveDailyLimit, getMaxAllowedDailyLimit } from '../lib/supabase';
import { CommentsDrawer } from './CommentsDrawer';
import { t } from '../lib/i18n';

interface DashboardProps {
  user: UserProfile | null;
  currentLang?: Language;
  todayTalesCount?: number;
  onOpenProfile?: () => void;
  onSelectRealm: (realm: Realm) => void;
  commentsMap?: Record<string, ChapterComment[]>;
  onAddComment?: (chapterId: string, text: string) => void;
  onEditComment?: (chapterId: string, commentId: string, newText: string) => void;
  onDeleteComment?: (chapterId: string, commentId: string) => void;
  darkMode?: boolean;
}

// 3D Metallic Golden Family Icon 
const GoldFamilyIcon: React.FC = () => (
  <svg
    className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 filter drop-shadow-[0_2px_3px_rgba(150,90,10,0.45)]"
    viewBox="0 0 100 88"
    fill="none"
  >
    <defs>
      <linearGradient id="gold3dFamily" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff2af" />
        <stop offset="25%" stopColor="#f5c242" />
        <stop offset="50%" stopColor="#d49413" />
        <stop offset="75%" stopColor="#f8d66d" />
        <stop offset="100%" stopColor="#8c5804" />
      </linearGradient>
      <linearGradient id="gold3dSpec" x1="30%" y1="0%" x2="70%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="40%" stopColor="#f5c242" />
        <stop offset="100%" stopColor="#a36706" />
      </linearGradient>
    </defs>
    <g>
      {/* Dad (Left figure) */}
      <circle cx="28" cy="18" r="8" fill="url(#gold3dSpec)" />
      <path
        d="M 19 32 C 19 29, 37 29, 37 32 L 35 56 L 38 84 L 32 84 L 29 59 L 26 84 L 20 84 L 23 56 Z"
        fill="url(#gold3dFamily)"
      />
      {/* Dad Left Arm */}
      <path
        d="M 20 32 C 17 33, 15 39, 16 57 C 16 59, 19 59, 19 57 L 21 36 Z"
        fill="url(#gold3dFamily)"
      />
      {/* Dad Right Arm holding Child hand */}
      <path
        d="M 35 34 L 43 51 C 44 53, 47 52, 46 50 L 37 32 Z"
        fill="url(#gold3dFamily)"
      />

      {/* Child (Middle figure) */}
      <circle cx="50" cy="32" r="6" fill="url(#gold3dSpec)" />
      <path
        d="M 44 42 C 44 40, 56 40, 56 42 L 55 60 L 57 80 L 52 80 L 50 62 L 48 80 L 43 80 L 45 60 Z"
        fill="url(#gold3dFamily)"
      />
      {/* Child Left Arm connected to Dad */}
      <path
        d="M 45 43 L 42 52 C 41 53, 44 54, 45 52 L 48 44 Z"
        fill="url(#gold3dFamily)"
      />
      {/* Child Right Arm connected to Mom */}
      <path
        d="M 55 44 L 58 52 C 59 54, 62 53, 61 52 L 58 43 Z"
        fill="url(#gold3dFamily)"
      />

      {/* Mom (Right figure with dress) */}
      <circle cx="72" cy="18" r="8" fill="url(#gold3dSpec)" />
      <path
        d="M 63 32 C 63 29, 81 29, 81 32 L 78 46 L 86 78 C 86 80, 84 81, 82 81 L 62 81 C 60 81, 58 80, 58 78 L 66 46 Z"
        fill="url(#gold3dFamily)"
      />
      {/* Mom Legs */}
      <rect x="65.5" y="81" width="4.5" height="5" rx="1.5" fill="url(#gold3dFamily)" />
      <rect x="73.5" y="81" width="4.5" height="5" rx="1.5" fill="url(#gold3dFamily)" />
      {/* Mom Left Arm holding child hand */}
      <path
        d="M 65 32 L 57 50 C 56 52, 59 53, 60 51 L 67 34 Z"
        fill="url(#gold3dFamily)"
      />
      {/* Mom Right Arm */}
      <path
        d="M 79 32 C 82 33, 84 39, 83 57 C 83 59, 80 59, 80 57 L 78 36 Z"
        fill="url(#gold3dFamily)"
      />
    </g>
  </svg>
);

// Ornamental Cartouche Plaque Banner (Matching DadMom.png reference bracket shape)
const CartouchePlaque: React.FC<{
  icon: React.ReactNode;
  title: string;
}> = ({ icon, title }) => {
  return (
    <div className="relative w-full max-w-[92%] sm:max-w-[88%] h-14 sm:h-16 flex items-center justify-center filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.3)] transition-all duration-300 transform group-hover:scale-[1.02]">
      {/* SVG Ornamental Background Plaque with gold double border and bracket ends */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 380 76"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="plaqueGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffea9f" />
            <stop offset="25%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#ffe484" />
            <stop offset="75%" stopColor="#c59828" />
            <stop offset="100%" stopColor="#8f630f" />
          </linearGradient>
          <linearGradient id="plaqueBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#fffdf9" />
            <stop offset="100%" stopColor="#faf5e8" />
          </linearGradient>
        </defs>

        {/* Outer Ivory Plaque Body with Bracket Notched Ends */}
        <path
          d="M 46,3 L 334,3 C 350,3 360,11 366,21 C 372,31 379,38 379,38 C 379,38 372,45 366,55 C 360,65 350,73 334,73 L 46,73 C 30,73 20,65 14,55 C 8,45 1,38 1,38 C 1,38 8,31 14,21 C 20,11 30,3 46,3 Z"
          fill="url(#plaqueBgGrad)"
          stroke="url(#plaqueGoldRim)"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />

        {/* Delicate Inner Gold Hairline */}
        <path
          d="M 47,6 L 333,6 C 348,6 357,13 363,22 C 369,31 374,38 374,38 C 374,38 369,45 363,54 C 357,63 348,70 333,70 L 47,70 C 32,70 23,63 17,54 C 11,45 6,38 6,38 C 6,38 11,31 17,22 C 23,13 32,6 47,6 Z"
          fill="none"
          stroke="#e8c76e"
          strokeWidth="0.8"
          opacity="0.8"
        />
      </svg>

      {/* Content inside plaque: Icon + Title */}
      <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-4 px-6 sm:px-8">
        <div className="shrink-0 flex items-center justify-center">
          {icon}
        </div>
        <span className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-wider text-[#122d52] uppercase select-none">
          {title}
        </span>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  currentLang,
  todayTalesCount = 0,
  onOpenProfile,
  onSelectRealm,
  commentsMap,
  onAddComment,
  onEditComment,
  onDeleteComment,
  darkMode = false,
}) => {
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const feedbackComments = commentsMap?.['dashboard_feedback'] || [];

  const effectiveLang: Language = currentLang || user?.language || 'EN';

  const userAge = user?.age ?? 20; // Default adult if missing
  const isUnder18 = userAge < 18;
  const effectiveLimit = getEffectiveDailyLimit(user);
  const maxAllowed = getMaxAllowedDailyLimit(user?.age);
  const remainingTales = Math.max(0, effectiveLimit - todayTalesCount);
  const progressPercent = Math.min(100, Math.round((todayTalesCount / effectiveLimit) * 100));

  // Filter realms:
  // If user is less than 13 years old, ONLY show El Dorado world!
  // If user is under 18, hide adult-only realms (Work, Marriage, Dad & Mom)
  const visibleRealms = REALMS.filter((realm) => {
    if (userAge < 13) {
      return realm.id === 'realm-el-dorado';
    }
    if (isUnder18 && realm.isAdultOnly) {
      return false; // Hide Work, Marriage, Dad & Mom for under 18!
    }
    return true;
  });

  const getIcon = (realmKey: string) => {
    switch (realmKey) {
      case 'dad_mom':
        return <GoldFamilyIcon />;
      case 'work':
        return (
          <svg className="w-7 h-7 sm:w-8 sm:h-8 filter drop-shadow-[0_2px_3px_rgba(150,90,10,0.4)]" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="goldWorkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff2af" />
                <stop offset="50%" stopColor="#d49413" />
                <stop offset="100%" stopColor="#8c5804" />
              </linearGradient>
            </defs>
            <path
              d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"
              fill="url(#goldWorkGrad)"
            />
          </svg>
        );
      case 'marriage':
        return (
          <svg className="w-7 h-7 sm:w-8 sm:h-8 filter drop-shadow-[0_2px_3px_rgba(150,90,10,0.4)]" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="goldMarriageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff2af" />
                <stop offset="50%" stopColor="#d49413" />
                <stop offset="100%" stopColor="#8c5804" />
              </linearGradient>
            </defs>
            <circle cx="9" cy="12" r="5" stroke="url(#goldMarriageGrad)" strokeWidth="3" />
            <circle cx="15" cy="12" r="5" stroke="url(#goldMarriageGrad)" strokeWidth="3" />
          </svg>
        );
      case 'atlantis':
        return (
          <svg className="w-7 h-7 sm:w-8 sm:h-8 filter drop-shadow-[0_2px_3px_rgba(150,90,10,0.4)]" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="goldTridentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff2af" />
                <stop offset="50%" stopColor="#d49413" />
                <stop offset="100%" stopColor="#8c5804" />
              </linearGradient>
            </defs>
            <path
              d="M12 2v20M6 4v6a6 6 0 0012 0V4M6 4L4 7M18 4l2 3"
              stroke="url(#goldTridentGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'el_dorado':
        return (
          <svg className="w-7 h-7 sm:w-8 sm:h-8 filter drop-shadow-[0_2px_3px_rgba(150,90,10,0.4)]" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="goldPyramidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff2af" />
                <stop offset="50%" stopColor="#d49413" />
                <stop offset="100%" stopColor="#8c5804" />
              </linearGradient>
            </defs>
            <path d="M12 2L2 20h20L12 2zm0 3.8l6.8 12.2H5.2L12 5.8z" fill="url(#goldPyramidGrad)" />
            <path d="M8 13h8v2H8zm-2 3h12v2H6z" fill="url(#goldPyramidGrad)" />
          </svg>
        );
      case 'future_land':
        return (
          <svg className="w-7 h-7 sm:w-8 sm:h-8 filter drop-shadow-[0_2px_3px_rgba(150,90,10,0.4)]" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="goldCityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff2af" />
                <stop offset="50%" stopColor="#d49413" />
                <stop offset="100%" stopColor="#8c5804" />
              </linearGradient>
            </defs>
            <path
              d="M19 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 3h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2zm-4-8h2v2H8V5zm0 4h2v2H8V9zm0 4h2v2H8v-2zm-4-8h2v2H4V5zm0 4h2v2H4V9zm0 4h2v2H4v-2zm16 7H4v-1h16v1zm0-3h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2z"
              fill="url(#goldCityGrad)"
            />
          </svg>
        );
      default:
        return <Sparkles className="w-6 h-6 text-[#d4af37]" />;
    }
  };

  return (
    <div className={`min-h-[calc(100vh-65px)] transition-colors duration-300 pt-3 sm:pt-4 px-4 sm:px-6 md:px-8 pb-16 sm:pb-24 relative ${
      darkMode ? 'bg-[#18202f] text-slate-100' : 'bg-[#fcfbf9] text-slate-900'
    }`}>
      
      {/* Background ambient lighting */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Realms Grid (Matching DadMom.png reference exactly) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {visibleRealms.map((realm) => (
            <div
              key={realm.id}
              id={`realm-card-${realm.key}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelectRealm(realm)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectRealm(realm);
                }
              }}
              className="p-[3.5px] rounded-[30px] sm:rounded-[32px] bg-gradient-to-b from-[#ffe59e] via-[#d4af37] via-[#c49226] to-[#7d4d0b] shadow-[0_12px_32px_rgba(0,0,0,0.18),0_0_12px_rgba(212,175,55,0.25)] hover:shadow-[0_16px_40px_rgba(212,175,55,0.4)] transition-all duration-300 group cursor-pointer active:scale-[0.985]"
            >
              {/* Inner card with gold hairline border */}
              <div className="relative h-64 sm:h-72 md:h-[310px] rounded-[26px] sm:rounded-[28px] overflow-hidden bg-transparent text-left border-2 border-[#fff3cc]/80">
                {/* Background Cover Image */}
                <img
                  src={realm.bgImage}
                  alt={realm.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.98] group-hover:brightness-100"
                  referrerPolicy="no-referrer"
                />

                {/* Audience Label Badge (e.g. "Child" i18n label for El Dorado) */}
                {realm.audienceLabel && (
                  <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10 pointer-events-none">
                    <div className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#b8860b] text-[#3d2400] border-2 border-[#fff9e6] shadow-[0_4px_16px_rgba(0,0,0,0.35),0_0_12px_rgba(212,175,55,0.4)]">
                      <Sparkles className="w-3.5 h-3.5 text-[#7a4d04]" />
                      <span className="text-[11px] sm:text-xs font-cinzel font-bold tracking-wider uppercase drop-shadow-sm">
                        {realm.audienceLabel[effectiveLang] || realm.audienceLabel.EN}
                      </span>
                    </div>
                  </div>
                )}

                {/* Coming Soon Label Badge (for Marriage, Dad&Mom, FutureLand) */}
                {realm.isComingSoon && (
                  <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10 pointer-events-none">
                    <div className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#b8860b] text-[#3d2400] border-2 border-[#fff9e6] shadow-[0_4px_16px_rgba(0,0,0,0.35),0_0_12px_rgba(212,175,55,0.4)]">
                      <Clock className="w-3.5 h-3.5 text-[#7a4d04]" />
                      <span className="text-[11px] sm:text-xs font-cinzel font-bold tracking-wider uppercase drop-shadow-sm">
                        {t('comingSoon', effectiveLang)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Subtle Bottom Vignette Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                
                {/* Ornamental Cartouche Plaque Banner (Matching DadMom.png reference exactly) */}
                <div className="absolute bottom-3.5 sm:bottom-4 inset-x-0 flex items-center justify-center pointer-events-none">
                  <CartouchePlaque
                    icon={getIcon(realm.key)}
                    title={t(('realm_' + realm.key) as any, effectiveLang) || realm.title}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback Action Section at Bottom of Dashboard */}
        <div className="flex flex-col items-center justify-center gap-2 pt-6 pb-2">
          <button
            id="dashboard-feedback-btn"
            type="button"
            onClick={() => setShowCommentsDrawer(true)}
            className={`group relative flex items-center gap-2.5 px-6 py-2.5 rounded-full border-2 transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.97] shadow-lg cursor-pointer ${
              darkMode
                ? 'bg-gradient-to-r from-[#1b2536] via-[#101726] to-[#1b2536] border-[#d4af37] text-[#fce0a2] hover:border-[#fce0a2] hover:shadow-[0_4px_25px_rgba(212,175,55,0.3)] shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
                : 'bg-gradient-to-r from-[#fff9eb] via-[#fff4d6] to-[#fff9eb] border-[#b8860b] text-[#78350f] hover:border-[#78350f] hover:shadow-[0_4px_25px_rgba(184,134,11,0.25)] shadow-[0_4px_16px_rgba(184,134,11,0.15)]'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#996515] p-0.5 flex items-center justify-center shrink-0">
              <div className={`w-full h-full rounded-full flex items-center justify-center ${
                darkMode ? 'bg-[#101726]' : 'bg-white'
              }`}>
                <MessageSquare className="w-3.5 h-3.5 text-[#d4af37]" />
              </div>
            </div>
            <span className="text-xs sm:text-sm font-bold font-cinzel tracking-wider uppercase">
              {t('feedbackBtn', effectiveLang)}
            </span>
            {feedbackComments.length > 0 && (
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                darkMode
                  ? 'bg-[#d4af37]/20 border-[#d4af37]/60 text-[#fce0a2]'
                  : 'bg-[#b8860b]/20 border-[#b8860b]/60 text-[#78350f]'
              }`}>
                {feedbackComments.length}
              </span>
            )}
          </button>
          <span className={`text-[11px] font-sans ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('feedbackDesc', effectiveLang)}
          </span>
        </div>

        {/* Footer Subtitle */}
        <div className="text-center pt-6 pb-4 border-t border-[#d4af37]/20 flex items-center justify-center gap-3">
          <span className="text-[#d4af37] text-xs font-serif">--✦--</span>
          <p className={`text-base sm:text-lg font-cinzel tracking-wider font-semibold ${
            darkMode ? 'text-[#fce0a2]/90' : 'text-[#8a5d12]'
          }`}>
            {t('futureTagline', effectiveLang)}
          </p>
          <span className="text-[#d4af37] text-xs font-serif">--✦--</span>
        </div>

      </div>

      {/* Feedback Comments Drawer */}
      {showCommentsDrawer && (
        <CommentsDrawer
          chapterId="dashboard_feedback"
          chapterTitle={t('dashboardFeedbackTitle', effectiveLang)}
          comments={feedbackComments}
          user={user}
          currentLang={effectiveLang}
          onClose={() => setShowCommentsDrawer(false)}
          onAddComment={(text) => onAddComment?.('dashboard_feedback', text)}
          onEditComment={(commentId, newText) => onEditComment?.('dashboard_feedback', commentId, newText)}
          onDeleteComment={(commentId) => onDeleteComment?.('dashboard_feedback', commentId)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

