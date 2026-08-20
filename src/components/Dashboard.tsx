import React from 'react';
import { Realm, UserProfile } from '../types';
import { REALMS } from '../data/realmsAndTales';
import { ShieldAlert, Sparkles, BookOpen, ShieldCheck, Settings, CheckCircle2 } from 'lucide-react';
import { getEffectiveDailyLimit, getMaxAllowedDailyLimit } from '../lib/supabase';

interface DashboardProps {
  user: UserProfile | null;
  todayTalesCount?: number;
  onOpenProfile?: () => void;
  onSelectRealm: (realm: Realm) => void;
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
  todayTalesCount = 0,
  onOpenProfile,
  onSelectRealm,
  darkMode = false,
}) => {
  const userAge = user?.age ?? 20; // Default adult if missing
  const isUnder18 = userAge < 18;
  const effectiveLimit = getEffectiveDailyLimit(user);
  const maxAllowed = getMaxAllowedDailyLimit(user?.age);
  const remainingTales = Math.max(0, effectiveLimit - todayTalesCount);
  const progressPercent = Math.min(100, Math.round((todayTalesCount / effectiveLimit) * 100));

  // Filter realms if under 18: hide Work, Marriage, Dad & Mom!
  const visibleRealms = REALMS.filter((realm) => {
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
        
        {/* Youth Restriction Banner if under 18 */}
        {isUnder18 && (
          <div className={`rounded-xl p-3.5 flex items-center justify-between text-xs shadow-md border ${
            darkMode
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              : 'bg-amber-100/80 border-amber-400 text-amber-900'
          }`}>
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm sm:text-base font-semibold">Youth Mode Active (Age {userAge} &lt; 18)</p>
                <p className="text-xs sm:text-sm opacity-90">Adult realms (Work, Marriage, Dad &amp; Mom) are filtered out for safety.</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-[10px] font-bold uppercase tracking-wider">
              3 Youth Realms Available
            </span>
          </div>
        )}

        {/* Realms Grid (Matching DadMom.png reference exactly) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {visibleRealms.map((realm) => (
            <div
              key={realm.id}
              onClick={() => onSelectRealm(realm)}
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


                {/* Subtle Bottom Vignette Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                
                {/* Ornamental Cartouche Plaque Banner (Matching DadMom.png reference exactly) */}
                <div className="absolute bottom-3.5 sm:bottom-4 inset-x-0 flex items-center justify-center pointer-events-none">
                  <CartouchePlaque
                    icon={getIcon(realm.key)}
                    title={realm.title}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Daily Tales Quota & Reading Progress Card (Placed at the bottom of the Dashboard) */}
        {user && (
          <div className="p-[2.5px] rounded-2xl bg-gradient-to-r from-[#ffe59e]/70 via-[#d4af37] to-[#8c5804]/70 shadow-xl">
            <div className={`rounded-[14px] p-5 sm:p-6 transition-all ${
              darkMode ? 'bg-[#121824]/95 text-slate-100' : 'bg-white/95 text-slate-900 shadow-sm'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Left: Quota Stats & Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#996515] p-0.5 flex items-center justify-center shadow-md">
                      <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${
                        darkMode ? 'bg-[#121824] text-[#fce0a2]' : 'bg-white text-[#8a5d12]'
                      }`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <h3 className={`text-lg sm:text-xl font-bold font-cinzel tracking-wide ${
                        darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
                      }`}>
                        Daily Tales Journey
                      </h3>
                      <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {remainingTales > 0 ? (
                          <>
                            <strong className="text-[#d4af37] font-semibold">{remainingTales} tale{remainingTales > 1 ? 's' : ''}</strong> left to explore today
                          </>
                        ) : (
                          <span className="text-[#d4af37] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 inline text-[#d4af37]" /> Daily Reading Quota Completed!
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
                        style={{ width: `${progressPercent}%` }}
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
          </div>
        )}

        {/* Footer Subtitle */}
        <div className="text-center pt-8 pb-4 border-t border-[#d4af37]/20 flex items-center justify-center gap-3">
          <span className="text-[#d4af37] text-xs font-serif">--✦--</span>
          <p className={`text-base sm:text-lg font-cinzel tracking-wider font-semibold ${
            darkMode ? 'text-[#fce0a2]/90' : 'text-[#8a5d12]'
          }`}>
            To be ready for the future with AI.
          </p>
          <span className="text-[#d4af37] text-xs font-serif">--✦--</span>
        </div>

      </div>
    </div>
  );
};

