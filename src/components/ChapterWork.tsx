import React, { useState, useEffect } from 'react';
import { UserProfile, Language, SkillType, ChapterComment } from '../types';
import startupWinnerData from '../data/startupWinner.json';
import officeSceneImg from '../assets/realms/work/office_startup_scene_1786656202157.jpg';
import { CommentsDrawer } from './CommentsDrawer';
import { 
  Sun, 
  Moon, 
  ChevronDown, 
  ThumbsUp, 
  Eye, 
  Feather, 
  X, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw,
  UserCheck
} from 'lucide-react';

interface ChapterWorkProps {
  user: UserProfile | null;
  currentLang: Language;
  onLanguageChange?: (lang: Language) => void;
  onClose: () => void;
  onEarnSkillPoint: (skill: SkillType) => void;
  likedChapters: string[];
  viewedChapters: string[];
  commentsMap: Record<string, ChapterComment[]>;
  onToggleLike: (chapterId: string) => void;
  onRecordView: (chapterId: string) => void;
  onAddComment: (chapterId: string, text: string) => void;
  onEditComment?: (chapterId: string, commentId: string, text: string) => void;
  onDeleteComment?: (chapterId: string, commentId: string) => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

// 8-Point 3D Compass Star Emblem
const GoldCompassEmblem: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={`${className} shrink-0 filter drop-shadow-[0_2px_4px_rgba(180,120,20,0.5)]`} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="cwGoldLight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff8cf" />
        <stop offset="35%" stopColor="#f5ca4e" />
        <stop offset="100%" stopColor="#d49619" />
      </linearGradient>
      <linearGradient id="cwGoldDark" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c58913" />
        <stop offset="60%" stopColor="#9b6107" />
        <stop offset="100%" stopColor="#673c00" />
      </linearGradient>
      <linearGradient id="cwGoldRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fce595" />
        <stop offset="30%" stopColor="#d49c25" />
        <stop offset="70%" stopColor="#f7d976" />
        <stop offset="100%" stopColor="#8d5607" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="36" stroke="url(#cwGoldRing)" strokeWidth="3" fill="none" />
    <polygon points="50,50 74,26 54,46" fill="url(#cwGoldLight)" />
    <polygon points="50,50 74,26 46,54" fill="url(#cwGoldDark)" />
    <polygon points="50,50 74,74 54,54" fill="url(#cwGoldLight)" />
    <polygon points="50,50 74,74 46,54" fill="url(#cwGoldDark)" />
    <polygon points="50,50 26,74 46,54" fill="url(#cwGoldLight)" />
    <polygon points="50,50 26,74 54,46" fill="url(#cwGoldDark)" />
    <polygon points="50,50 26,26 46,46" fill="url(#cwGoldLight)" />
    <polygon points="50,50 26,26 54,46" fill="url(#cwGoldDark)" />
    <polygon points="50,4 50,50 43,50" fill="url(#cwGoldLight)" />
    <polygon points="50,4 50,50 57,50" fill="url(#cwGoldDark)" />
    <polygon points="50,96 50,50 43,50" fill="url(#cwGoldDark)" />
    <polygon points="50,96 50,50 57,50" fill="url(#cwGoldLight)" />
    <polygon points="4,50 50,50 50,43" fill="url(#cwGoldDark)" />
    <polygon points="4,50 50,50 50,57" fill="url(#cwGoldLight)" />
    <polygon points="96,50 50,50 50,43" fill="url(#cwGoldLight)" />
    <polygon points="96,50 50,50 50,57" fill="url(#cwGoldDark)" />
    <circle cx="50" cy="50" r="3.2" fill="#ffeaa2" stroke="#875306" strokeWidth="1" />
  </svg>
);

// Hexagonal SVG Frame for Choice Buttons
const HexagonButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  subLabel?: string;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick: () => void;
}> = ({ icon, label, subLabel, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center focus:outline-none transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
    >
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 115"
          fill="none"
        >
          <defs>
            <linearGradient id="hexGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff2af" />
              <stop offset="30%" stopColor="#e5b338" />
              <stop offset="70%" stopColor="#c59124" />
              <stop offset="100%" stopColor="#7a4f08" />
            </linearGradient>
            <linearGradient id="hexInnerDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isSelected ? "#1e293b" : "#0d131f"} />
              <stop offset="100%" stopColor={isSelected ? "#0f172a" : "#060910"} />
            </linearGradient>
            <radialGradient id="hexGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Hexagon Body Path */}
          <polygon
            points="50,3 95,29 95,86 50,112 5,86 5,29"
            fill="url(#hexInnerDark)"
            stroke="url(#hexGoldRim)"
            strokeWidth={isSelected ? "3.5" : "2.2"}
            className="transition-all duration-300 group-hover:stroke-[#fff0a6]"
          />

          {isSelected && (
            <polygon
              points="50,10 88,32 88,83 50,105 12,83 12,32"
              fill="url(#hexGlow)"
              stroke="#fce0a2"
              strokeWidth="1"
              opacity="0.8"
            />
          )}

          {/* Inner hairline border */}
          <polygon
            points="50,8 90,31 90,84 50,107 10,84 10,31"
            fill="none"
            stroke="#f5d061"
            strokeWidth="0.8"
            strokeOpacity="0.5"
          />
        </svg>

        {/* Center Golden Icon */}
        <div className="absolute inset-0 flex items-center justify-center text-[#fce0a2] group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>

      {/* Button Sub-Label text on wooden desk */}
      <span className={`mt-1.5 text-[11px] sm:text-xs font-cinzel text-center max-w-[110px] sm:max-w-[125px] leading-tight transition-colors ${
        isSelected 
          ? 'text-[#fce0a2] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]' 
          : 'text-slate-300 group-hover:text-[#fce0a2]'
      }`}>
        {label}
      </span>
      {subLabel && (
        <span className="text-[9px] text-[#d4af37]/80 italic mt-0.5 max-w-[100px] text-center line-clamp-1">
          {subLabel}
        </span>
      )}
    </button>
  );
};

export const ChapterWork: React.FC<ChapterWorkProps> = ({
  user,
  currentLang,
  onLanguageChange,
  onClose,
  onEarnSkillPoint,
  likedChapters,
  viewedChapters,
  commentsMap,
  onToggleLike,
  onRecordView,
  onAddComment,
  onEditComment,
  onDeleteComment,
  darkMode = true,
  onToggleDarkMode,
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(1); // 0 = Chapter 1 (Intro & Profiles), 1 = Chapter 2 (Choice Game)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [hasAwardedPoints, setHasAwardedPoints] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);

  const chapter2Data = startupWinnerData.chapters[1];
  const chapter1Data = startupWinnerData.chapters[0];
  const chapterId = `work-startup-winner-ch${currentChapterIndex + 1}`;

  const isLiked = likedChapters.includes(chapterId);
  const isViewed = viewedChapters.includes(chapterId);

  // Auto record view count
  useEffect(() => {
    if (!isViewed) {
      onRecordView(chapterId);
    }
  }, [chapterId]);

  // Selected Option Object
  const currentOption = chapter2Data.options.find(
    (opt) => opt.id === selectedOptionId
  );

  // Handle Option Select
  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    const chosen = chapter2Data.options.find((opt) => opt.id === optionId);
    
    // Award skill points if not already awarded
    if (chosen && !hasAwardedPoints) {
      if (chosen.points > 0) {
        onEarnSkillPoint('Listen');
      }
      setHasAwardedPoints(true);
    }

    // TTS speech read out if audio is enabled
    if (!isAudioMuted && chosen && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(chosen.dialog);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setSpeechActive(true);
      utterance.onend = () => setSpeechActive(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // TTS Read Mara's prompt
  const handleReadMaraPrompt = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = chapter2Data.text;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.onstart = () => setSpeechActive(true);
      utterance.onend = () => setSpeechActive(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black text-slate-100 flex flex-col select-none">
      
      {/* BACKGROUND SCENE (Matching Chapter2.png reference exactly) */}
      <div className="absolute inset-0 z-0">
        <img
          src={officeSceneImg}
          alt="Startup Office Scene"
          className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05]"
        />
        {/* Ambient Subtle Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* TOP HEADER CONTROLS BAR (Right Corner as in Chapter2.png) */}
      <div className="relative z-30 w-full px-4 py-3 flex items-center justify-between pointer-events-auto">
        {/* Left: Back to Tales button */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-[#fce0a2] border border-[#d4af37]/50 backdrop-blur-md transition-all active:scale-95 shadow-lg text-xs font-semibold"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Exit Legend</span>
        </button>

        {/* Center Chapter Title */}
        <div className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#d4af37]/40 text-center shadow-lg">
          <span className="font-cinzel text-xs sm:text-sm font-bold gold-gradient-text tracking-wider">
            {startupWinnerData.title} — Chapter {currentChapterIndex + 1}
          </span>
        </div>

        {/* Right: Theme Toggle & Language Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio voice toggle */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`p-2 rounded-full border backdrop-blur-md transition-all ${
              !isAudioMuted 
                ? 'bg-[#d4af37] text-slate-900 border-[#d4af37]' 
                : 'bg-black/60 text-slate-300 border-white/20 hover:border-[#d4af37]/60'
            }`}
            title={isAudioMuted ? "Enable Voice Audio" : "Mute Voice Audio"}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Theme Toggle Button (Sun icon in circular button matching Chapter2.png) */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-[#fce0a2] border border-[#d4af37]/50 backdrop-blur-md transition-all active:scale-95 shadow-lg"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-[#fce0a2]" /> : <Moon className="w-4 h-4 text-[#fce0a2]" />}
            </button>
          )}

          {/* UK Flag / Language Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-[#d4af37]/50 text-white backdrop-blur-md transition-all shadow-lg text-xs"
            >
              <span className="text-base leading-none">🇬🇧</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#fce0a2]" />
            </button>

            {showLanguageDropdown && onLanguageChange && (
              <div className="absolute right-0 mt-2 w-32 rounded-xl bg-slate-900/95 border border-[#d4af37] py-1 shadow-2xl backdrop-blur-md z-50">
                {(['EN', 'ES', 'IT', 'PT-pt', 'NL'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      onLanguageChange(lang);
                      setShowLanguageDropdown(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs hover:bg-[#d4af37]/20 flex items-center justify-between ${
                      currentLang === lang ? 'text-[#fce0a2] font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span>{lang}</span>
                    {currentLang === lang && <CheckCircle2 className="w-3 h-3 text-[#d4af37]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CHAPTER CONTENT AREA */}
      <div className="relative z-20 flex-1 flex flex-col justify-between p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* =================================================== */}
        {/* CHAPTER 1: INTRODUCTION & CHARACTER DOSSIERS VIEW */}
        {/* =================================================== */}
        {currentChapterIndex === 0 && (
          <div className="my-auto w-full max-w-3xl mx-auto bg-black/75 backdrop-blur-md border-2 border-[#d4af37] rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(212,175,55,0.25)] animate-fadeIn">
            <div className="text-center mb-6">
              <span className="text-xs font-cinzel font-bold text-[#d4af37] uppercase tracking-widest">
                Chapter 1 — Introduction
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#fce0a2] mt-1">
                {startupWinnerData.title}
              </h2>
              <div className="w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto my-3" />
              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl mx-auto">
                {chapter1Data.introduction}
              </p>
            </div>

            {/* Character Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {chapter1Data.characters.map((char) => (
                <div
                  key={char.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-[#d4af37]/40 flex items-start gap-3.5 shadow-md"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#7a4f08] p-0.5 shrink-0 shadow-md">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[#fce0a2] font-bold font-serif text-lg">
                      {char.name[0]}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold font-serif text-[#fce0a2]">{char.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fce0a2] border border-[#d4af37]/30 uppercase font-semibold">
                        {char.role}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                      {char.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Proceed to Chapter 2 Button */}
            <div className="text-center mt-8">
              <button
                onClick={() => setCurrentChapterIndex(1)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#d4af37] text-slate-900 font-extrabold text-sm shadow-xl hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Enter Chapter 2: The Communication Crisis</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================== */}
        {/* CHAPTER 2: INTERACTIVE VISUAL DIALOGUE (Chapter2.png) */}
        {/* =================================================== */}
        {currentChapterIndex === 1 && (
          <div className="relative flex-1 flex flex-col justify-between">
            
            {/* SPEECH BUBBLES LAYER OVER CHARACTERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 sm:pt-8">
              
              {/* LEFT: MARA'S SPEECH BUBBLE (Exact placement as Chapter2.png) */}
              <div className="flex flex-col items-center md:items-start pl-0 md:pl-28 lg:pl-36">
                <div 
                  onClick={handleReadMaraPrompt}
                  className="group relative cursor-pointer max-w-sm sm:max-w-md bg-[#0c121e]/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border-2 border-[#d4af37] shadow-[0_8px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(212,175,55,0.2)] transition-transform duration-300 hover:scale-[1.02]"
                >
                  {/* Ornate corner brackets */}
                  <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#fce0a2]" />
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#fce0a2]" />
                  <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#fce0a2]" />
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#fce0a2]" />

                  {/* Speech Bubble Arrow pointing left-down towards Mara */}
                  <div className="absolute -bottom-3 left-8 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-[#d4af37]" />
                  <div className="absolute -bottom-2.5 left-8 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[10px] border-t-[#0c121e]" />

                  {/* Header Mara Speaker Name */}
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-[#d4af37]/30">
                    <span className="text-[11px] font-cinzel font-bold text-[#fce0a2] tracking-wider uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      Mara (Front-end Dev)
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:text-[#fce0a2] flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> Click to listen
                    </span>
                  </div>

                  {/* Mara's Dialog Text (as in Chapter2.png) */}
                  <p className="font-serif text-base sm:text-lg md:text-xl font-normal text-[#fce0a2] leading-snug tracking-wide">
                    {currentOption?.mara_reply 
                      ? currentOption.mara_reply.replace(/^Mara:\s*['"]?/, '').replace(/['"]?$/, '')
                      : "I cannot stand how disorganized our communication is!"}
                  </p>
                </div>
              </div>

              {/* RIGHT: LEO'S SPEECH BUBBLE (Exact placement as Chapter2.png) */}
              <div className="flex flex-col items-center md:items-end pr-0 md:pr-12 lg:pr-20 mt-4 md:mt-24">
                <div className="relative max-w-sm sm:max-w-md bg-[#0c121e]/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border-2 border-[#d4af37] shadow-[0_8px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(212,175,55,0.2)]">
                  {/* Ornate corner brackets */}
                  <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#fce0a2]" />
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#fce0a2]" />
                  <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#fce0a2]" />
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#fce0a2]" />

                  {/* Speech Bubble Arrow pointing right towards Leo */}
                  <div className="absolute top-6 -right-3 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[12px] border-l-[#d4af37]" />
                  <div className="absolute top-6 -right-2.5 w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-l-[10px] border-l-[#0c121e]" />

                  {/* Header Leo Speaker Name */}
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-[#d4af37]/30">
                    <span className="text-[11px] font-cinzel font-bold text-[#fce0a2] tracking-wider uppercase flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                      Leo (Product Manager)
                    </span>
                    {currentOption && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        currentOption.type === 'Best' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                          : currentOption.type === 'Safe'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : currentOption.type === 'Weak'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {currentOption.type} Option ({currentOption.points > 0 ? `+${currentOption.points}` : currentOption.points} pts)
                      </span>
                    )}
                  </div>

                  {/* Leo's Dialog Spoken Text */}
                  <p className="font-serif text-base sm:text-lg md:text-xl font-normal text-[#fce0a2] leading-snug tracking-wide">
                    {currentOption 
                      ? currentOption.dialog.replace(/^Leo:\s*['"]?/, '').replace(/['"]?$/, '')
                      : "It sounds like you're feeling overwhelmed."}
                  </p>

                  {/* Feedback Banner if an option was clicked */}
                  {currentOption && currentOption.feedback && (
                    <div className="mt-3 pt-2 border-t border-white/10 text-xs text-slate-300 flex items-start gap-1.5 bg-black/40 p-2 rounded-lg">
                      <Sparkles className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                      <span>{currentOption.feedback}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Empty Center Spacer */}
            <div className="flex-1 min-h-[30px]" />
          </div>
        )}

        {/* =================================================== */}
        {/* BOTTOM WOODEN DESK CONTROLS BAR (Matching Chapter2.png) */}
        {/* =================================================== */}
        <div className="relative z-30 pt-4 pb-2">
          
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* BOTTOM LEFT: CHAPTER PAGINATION CONTROLS (<< [Star Compass] >>) */}
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#d4af37]/40 shadow-lg">
              <button
                onClick={() => setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1))}
                disabled={currentChapterIndex === 0}
                className="p-1 rounded-full text-[#fce0a2] hover:text-white disabled:opacity-30 transition-all"
                title="Previous Chapter"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="px-1 flex items-center justify-center">
                <GoldCompassEmblem className="w-6 h-6" />
              </div>

              <button
                onClick={() => setCurrentChapterIndex(Math.min(1, currentChapterIndex + 1))}
                disabled={currentChapterIndex === 1}
                className="p-1 rounded-full text-[#fce0a2] hover:text-white disabled:opacity-30 transition-all"
                title="Next Chapter"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* CENTER: 4 HEXAGONAL CHOICE BUTTONS (Matching Chapter2.png icons & labels) */}
            {currentChapterIndex === 1 && (
              <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
                
                {/* 1. BEST OPTION: Hands Holding Golden Heart ("It's not your fault / Mirror Sentiment") */}
                <HexagonButton
                  isSelected={selectedOptionId === 'opt-best'}
                  onClick={() => handleSelectOption('opt-best')}
                  label="It's not your fault."
                  subLabel="Mirror sentiment"
                  icon={
                    <svg className="w-7 h-7 sm:w-9 sm:h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#d4af37" fillOpacity="0.4" stroke="#fce0a2" />
                      <path d="M4 18c2-2 5-2 8-2s6 0 8 2" stroke="#fce0a2" strokeLinecap="round" />
                    </svg>
                  }
                />

                {/* 2. WEAK OPTION: Kanban / Strategy / Calendar ("Maybe we should reset the plan") */}
                <HexagonButton
                  isSelected={selectedOptionId === 'opt-weak'}
                  onClick={() => handleSelectOption('opt-weak')}
                  label="Maybe we should reset the plan."
                  subLabel="Quick fixes"
                  icon={
                    <svg className="w-7 h-7 sm:w-9 sm:h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="#fce0a2" />
                      <line x1="16" y1="2" x2="16" y2="6" stroke="#fce0a2" strokeLinecap="round" />
                      <line x1="8" y1="2" x2="8" y2="6" stroke="#fce0a2" strokeLinecap="round" />
                      <line x1="3" y1="10" x2="21" y2="10" stroke="#fce0a2" />
                      <path d="M8 14l2 2 4-4" stroke="#fce0a2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                />

                {/* 3. SAFE OPTION: Person Speaking & Mountain Path ("I've been in this situation before") */}
                <HexagonButton
                  isSelected={selectedOptionId === 'opt-safe'}
                  onClick={() => handleSelectOption('opt-safe')}
                  label="I've been in this situation before."
                  subLabel="Similar story"
                  icon={
                    <svg className="w-7 h-7 sm:w-9 sm:h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#fce0a2" />
                      <circle cx="12" cy="7" r="4" stroke="#fce0a2" />
                      <path d="M17 11l2 2 4-4" stroke="#d4af37" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                />

                {/* 4. HARMFUL/INQUIRY OPTION: Clipboard with Magnifying Glass ("Let's break it down") */}
                <HexagonButton
                  isSelected={selectedOptionId === 'opt-harmful'}
                  onClick={() => handleSelectOption('opt-harmful')}
                  label="Let's break it down. What's on your mind?"
                  subLabel="Invalidate / Inquiry"
                  icon={
                    <svg className="w-7 h-7 sm:w-9 sm:h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="#fce0a2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" stroke="#fce0a2" />
                      <circle cx="12" cy="14" r="3" stroke="#fce0a2" />
                      <path d="M14.5 16.5L18 20" stroke="#fce0a2" strokeLinecap="round" />
                    </svg>
                  }
                />

              </div>
            )}

            {/* BOTTOM RIGHT: SOCIAL COUNTERS (Likes, Views, Feather Quill) */}
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#d4af37]/40 shadow-lg text-xs font-semibold text-[#fce0a2]">
              {/* Thumbs Up Like */}
              <button
                onClick={() => onToggleLike(chapterId)}
                className={`flex items-center gap-1.5 transition-all active:scale-90 ${
                  isLiked ? 'text-amber-300 font-bold' : 'text-[#fce0a2] hover:text-white'
                }`}
                title="Like this Chapter"
              >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current text-[#d4af37]' : ''}`} />
                <span>{124 + (isLiked ? 1 : 0)}</span>
              </button>

              <span className="text-white/20">|</span>

              {/* Eye Views */}
              <div className="flex items-center gap-1 text-[#fce0a2]">
                <Eye className="w-4 h-4" />
                <span>32</span>
              </div>

              <span className="text-white/20">|</span>

              {/* Quill Feather for Notes / Feedback */}
              <button
                onClick={() => setShowCommentsDrawer(true)}
                className="p-1 rounded-full text-[#fce0a2] hover:text-white hover:bg-white/10 transition-all"
                title="Legend Notes & Comments"
              >
                <Feather className="w-4 h-4 text-[#fce0a2]" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* COMMENTS / NOTES DRAWER */}
      {showCommentsDrawer && (
        <CommentsDrawer
          chapterId={chapterId}
          comments={commentsMap[chapterId] || []}
          user={user}
          onClose={() => setShowCommentsDrawer(false)}
          onAddComment={(text) => onAddComment(chapterId, text)}
          onEditComment={(commentId, text) => onEditComment && onEditComment(chapterId, commentId, text)}
          onDeleteComment={(commentId) => onDeleteComment && onDeleteComment(chapterId, commentId)}
          darkMode={darkMode}
        />
      )}

    </div>
  );
};
