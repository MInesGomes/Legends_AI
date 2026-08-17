import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, UserProfile, SkillType } from '../types';
import { ActItem, getAtlantisActItems } from '../lib/atlantisData';
import {
  X as CloseIcon,
  ChevronLeft,
  ChevronRight,
  Globe,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Volume2,
  VolumeX,
  MessageSquare,
  Sparkles,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info
} from 'lucide-react';

interface ActPageProps {
  initialActId?: string;
  initialChapter?: number;
  user: UserProfile | null;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onClose: () => void;
  onEarnSkillPoint?: (skill: SkillType) => void;
  darkMode?: boolean;
}

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'ES', label: 'Español', flag: '🇪🇸' },
  { code: 'IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'PT-pt', label: 'Português', flag: '🇵🇹' },
  { code: 'NL', label: 'Nederlands', flag: '🇳🇱' },
];

export const ActPage: React.FC<ActPageProps> = ({
  initialActId,
  initialChapter = 1,
  user,
  currentLang,
  onLanguageChange,
  onClose,
  onEarnSkillPoint,
  darkMode = true,
}) => {
  const userGender = user?.gender || (user?.avatar_url?.toLowerCase().includes('male') && !user?.avatar_url?.toLowerCase().includes('female') ? 'male' : 'female');
  const actItems: ActItem[] = getAtlantisActItems(currentLang, userGender);
  
  // Find initial index
  const initialIdx = Math.max(
    0,
    actItems.findIndex((item) => item.id === initialActId || (initialChapter && item.chapterNumber === initialChapter))
  );

  const [currentIndex, setCurrentIndex] = useState<number>(initialIdx >= 0 ? initialIdx : 0);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Typewriter state for narrative acts - starts playing immediately
  const [typedLength, setTypedLength] = useState<number>(0);
  const [isTypewriterPlaying, setIsTypewriterPlaying] = useState<boolean>(true);
  const [typingSpeed, setTypingSpeed] = useState<'normal' | 'fast'>('normal');
  const [isTypewriterDone, setIsTypewriterDone] = useState<boolean>(false);

  // Dialogue stepper index for dialogue/choice acts
  const [dialogueStep, setDialogueStep] = useState<number>(0);
  const [isSpeakingText, setIsSpeakingText] = useState(false);

  // Background animation state: do not repeat, only reveal overlay when animation ends
  const [isVideoFinished, setIsVideoFinished] = useState<boolean>(!actItems[initialIdx >= 0 ? initialIdx : 0]?.mp4);

  const videoRef = useRef<HTMLVideoElement>(null);
  const dialogueScrollContainerRef = useRef<HTMLDivElement>(null);
  const dialogueEndRef = useRef<HTMLDivElement>(null);
  const typewriterBoxRef = useRef<HTMLDivElement>(null);
  const typewriterCursorRef = useRef<HTMLSpanElement>(null);
  const currentAct = actItems[currentIndex] || actItems[0];

  // Reset typewriter, dialogue step & video finish state whenever act changes
  useEffect(() => {
    setTypedLength(0);
    setIsTypewriterDone(false);
    setDialogueStep(0);
    setIsSpeakingText(false);
    const noVideo = !currentAct?.mp4;
    setIsVideoFinished(noVideo);
    // If there is no background video, start playing immediately
    setIsTypewriterPlaying(noVideo);

    if (typewriterBoxRef.current) {
      typewriterBoxRef.current.scrollTop = 0;
    }
    if (dialogueScrollContainerRef.current) {
      dialogueScrollContainerRef.current.scrollTop = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [currentIndex]);

  // When video animation finishes or overlay appears, start typewriter immediately
  useEffect(() => {
    if (isVideoFinished && currentAct.type === 'narrative' && !isTypewriterDone) {
      setIsTypewriterPlaying(true);
    }
  }, [isVideoFinished, currentAct.type, isTypewriterDone]);

  // Auto-scroll down when a new speaker is revealed in dialogue
  useEffect(() => {
    if (currentAct.type === 'dialogue' || currentAct.type === 'choice') {
      dialogueEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      if (dialogueScrollContainerRef.current) {
        dialogueScrollContainerRef.current.scrollTo({
          top: dialogueScrollContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [dialogueStep, currentIndex, isVideoFinished]);

  // Auto-scroll typewriter container when new text/cursor is not readable below
  useEffect(() => {
    if (isTypewriterPlaying && typewriterCursorRef.current && typewriterBoxRef.current) {
      typewriterCursorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      const box = typewriterBoxRef.current;
      const distanceFromBottom = box.scrollHeight - (box.scrollTop + box.clientHeight);
      if (distanceFromBottom > 10) {
        box.scrollTo({
          top: box.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [typedLength, isTypewriterPlaying]);

  // Handle Typewriter Animation
  const rawText = currentAct?.text || '';
  useEffect(() => {
    if (!rawText || !isTypewriterPlaying || isTypewriterDone) return;

    const baseDelay = typingSpeed === 'fast' ? 12 : 26;
    const timer = setTimeout(() => {
      if (typedLength < rawText.length) {
        const nextChar = rawText[typedLength];
        let pause = 0;
        if (nextChar === '.' || nextChar === '!' || nextChar === '?') {
          pause = typingSpeed === 'fast' ? 120 : 300;
        } else if (nextChar === ',') {
          pause = typingSpeed === 'fast' ? 60 : 150;
        } else if (nextChar === '\n') {
          pause = typingSpeed === 'fast' ? 150 : 350;
        }
        setTypedLength((prev) => prev + 1);
      } else {
        setIsTypewriterDone(true);
        setIsTypewriterPlaying(false);
      }
    }, baseDelay);

    return () => clearTimeout(timer);
  }, [typedLength, rawText, isTypewriterPlaying, isTypewriterDone, typingSpeed]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (currentAct.type === 'dialogue' || currentAct.type === 'choice') {
          if (dialogueStep < (currentAct.dialogue?.length || 1) - 1) {
            e.preventDefault();
            setDialogueStep((prev) => prev + 1);
          }
        } else if (e.key === ' ' && currentAct.type === 'narrative') {
          e.preventDefault();
          setIsTypewriterPlaying((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, actItems.length, currentAct, dialogueStep]);

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < actItems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSkipAnimation = () => {
    setIsVideoFinished(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleSkipTypewriter = () => {
    if (!rawText) return;
    setTypedLength(rawText.length);
    setIsTypewriterDone(true);
    setIsTypewriterPlaying(false);
  };

  const handleReplayTypewriter = () => {
    setTypedLength(0);
    setIsTypewriterDone(false);
    setIsTypewriterPlaying(true);
  };

  // Speech Read-Aloud
  const handleReadAloud = (textToRead: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeakingText) {
      window.speechSynthesis.cancel();
      setIsSpeakingText(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead.replace(/\*/g, ''));
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = currentLang === 'ES' ? 'es-ES' : currentLang === 'IT' ? 'it-IT' : currentLang === 'PT-pt' ? 'pt-PT' : currentLang === 'NL' ? 'nl-NL' : 'en-US';

    setIsSpeakingText(true);
    utterance.onend = () => setIsSpeakingText(false);
    utterance.onerror = () => setIsSpeakingText(false);

    window.speechSynthesis.speak(utterance);
  };

  // Render Formatted Narrative Text (with paragraph spacing and bullet points)
  const renderFormattedText = (fullString: string, currentSliceLength: number) => {
    const visibleText = fullString.slice(0, currentSliceLength);
    const lines = visibleText.split('\n');

    return (
      <div className="space-y-3 font-sans text-sm sm:text-base md:text-lg leading-relaxed text-black font-medium">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }

          if (trimmed.startsWith('*')) {
            const bulletContent = trimmed.substring(1).trim();
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-3 sm:pl-4 py-0.5 text-black">
                <span className="inline-block w-2 h-2 rounded-full bg-[#d4af37] mt-2 flex-shrink-0 shadow-[0_0_8px_#d4af37]" />
                <span className="font-semibold">{bulletContent}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="tracking-wide text-black">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  const aletheaAvatar = currentAct.femaleAvatar || '/src/assets/avatars/0Alethea.jpg';
  const elionAvatar = currentAct.maleAvatar || '/src/assets/avatars/0Elion.jpg';

  return (
    <div
      id="act-fullscreen-page"
      className="fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col justify-between select-none"
    >
      {/* 1. BACKGROUND VIDEO / ANIMATION WITH FALLBACK POSTER (Crystal clear, align top, crop bottom if necessary) */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950 pointer-events-none">
        <video
          ref={videoRef}
          key={currentAct.mp4}
          src={currentAct.mp4}
          poster={currentAct.posterImage}
          autoPlay
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover object-top"
          onEnded={() => setIsVideoFinished(true)}
          onError={(e) => {
            // Graceful fallback to poster background image if video can't decode
            const target = e.currentTarget;
            target.style.display = 'none';
            setIsVideoFinished(true);
          }}
        />
        {/* Fallback image behind video */}
        <img
          src={currentAct.posterImage}
          alt={currentAct.actTitle}
          className="absolute inset-0 w-full h-full object-cover object-top -z-10"
        />
      </div>

      {/* 2. TOP LEFT: CLOSE 'X' BUTTON (Very small on mobile) */}
      <div className="absolute top-2.5 left-2.5 sm:top-6 sm:left-6 z-30 flex items-center gap-2 sm:gap-3">
        <button
          id="act-close-button"
          onClick={onClose}
          aria-label="Close Act Page"
          className="p-1.5 sm:p-3 rounded-full border sm:border-2 border-[#d4af37] bg-black/70 hover:bg-[#d4af37] text-[#fce0a2] hover:text-black shadow-lg sm:shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center group"
          title="Close Act (Esc)"
        >
          <CloseIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5 transition-transform group-hover:rotate-90" />
        </button>

        {/* Current Act / Chapter Pill */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-[#d4af37]/60 bg-black/50 text-xs tracking-wider font-cinzel text-amber-200">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
          <span>Chapter {currentAct.chapterNumber} · {currentAct.type === 'choice' ? (currentAct.choiceTitle || 'Choice') : currentAct.type.toUpperCase()} ({currentIndex + 1}/{actItems.length})</span>
        </div>
      </div>

      {/* 3. TOP RIGHT: SKIP ANIMATION, LANGUAGE SELECTOR & SOUND TOGGLE */}
      <div className="absolute top-2.5 right-2.5 sm:top-6 sm:right-6 z-30 flex items-center gap-2 sm:gap-3">
        {!isVideoFinished && currentAct.mp4 && (
          <button
            id="top-skip-animation-btn"
            onClick={handleSkipAnimation}
            className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full border-2 border-[#d4af37] bg-black/80 hover:bg-[#d4af37] text-amber-200 hover:text-slate-950 font-cinzel font-bold text-xs sm:text-sm tracking-wider flex items-center gap-2 shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
            title="Skip background animation"
          >
            <span>Skip Animation</span>
            <FastForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}

        {/* Ambient Sound Toggle (Hidden on mobile) */}
        <button
          id="act-sound-toggle"
          onClick={() => setIsMuted(!isMuted)}
          className="hidden sm:flex p-3 rounded-full border-2 border-[#d4af37]/70 bg-black/60 hover:bg-black/90 text-amber-200 shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer items-center justify-center"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-[#d4af37]" />}
        </button>

        {/* Language Selector Dropdown (Hidden on mobile) */}
        <div className="relative hidden sm:block">
          <button
            id="act-lang-selector"
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full border-2 border-[#d4af37] bg-black/60 hover:bg-black/90 text-amber-200 shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Select Language"
          >
            <Globe className="w-4 h-4 text-[#d4af37]" />
            <span className="font-bold text-xs tracking-wider uppercase font-cinzel">
              {currentLang}
            </span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl border-2 border-[#d4af37] bg-slate-950/95 shadow-2xl p-2 z-50 animate-fadeIn">
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37] px-3 py-1 font-cinzel">
                Select Language
              </div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentLang === lang.code
                      ? 'bg-[#d4af37] text-slate-950 font-bold shadow-md'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. CENTER LEFT: PREVIOUS `<` BUTTON */}
      <button
        id="act-prev-button"
        onClick={goToPrev}
        disabled={currentIndex === 0}
        aria-label="Previous Act or Choice"
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-14 sm:h-14 rounded-full border sm:border-2 border-[#d4af37] bg-black/70 hover:bg-[#d4af37] text-amber-200 hover:text-slate-950 disabled:opacity-20 disabled:pointer-events-none shadow-lg sm:shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer group"
        title="Previous (Left Arrow)"
      >
        <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8 transition-transform group-hover:-translate-x-0.5" />
      </button>

      {/* 5. CENTER RIGHT: NEXT `>` BUTTON */}
      <button
        id="act-next-button"
        onClick={goToNext}
        disabled={currentIndex === actItems.length - 1}
        aria-label="Next Act or Choice"
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-14 sm:h-14 rounded-full border sm:border-2 border-[#d4af37] bg-black/70 hover:bg-[#d4af37] text-amber-200 hover:text-slate-950 disabled:opacity-20 disabled:pointer-events-none shadow-lg sm:shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer group"
        title="Next (Right Arrow)"
      >
        <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* 6. MAIN CONTENT DISPLAY (NARRATIVE TYPEWRITER OR DIALOGUE SPEECH CARDS) */}
      {isVideoFinished ? (
        <motion.div
          key={`content-${currentIndex}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 flex-1 flex flex-col justify-end p-4 sm:p-8 md:p-12 max-w-5xl mx-auto w-full overflow-y-auto"
        >
          {/* A. DIALOGUE / CHOICE ACT MODE (Alternating Left/Right speech bubbles matching reference screenshot) */}
          {(currentAct.type === 'dialogue' || currentAct.type === 'choice') ? (
            <div className="w-full space-y-4 pb-4 animate-fadeIn">
              
              {/* If this is a Choice Act, show the 4 Choice selection pills using the choice titles */}
              {currentAct.type === 'choice' && (
                <div className="flex flex-wrap items-center justify-center gap-2.5 py-1">
                  {(['Best', 'Safe', 'Weak', 'Harmful'] as const).map((choiceKey) => {
                    const targetAct = actItems.find(
                      (item) => item.type === 'choice' && item.choiceType === choiceKey
                    );
                    const targetActIdx = actItems.findIndex(
                      (item) => item.type === 'choice' && item.choiceType === choiceKey
                    );
                    const isCurrent = currentAct.choiceType === choiceKey;
                    const choiceLabel = targetAct?.choiceTitle || targetAct?.actTitle || `${choiceKey} Choice`;

                    return (
                      <button
                        key={choiceKey}
                        onClick={() => {
                          if (targetActIdx >= 0) setCurrentIndex(targetActIdx);
                        }}
                        className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide border-2 transition-all cursor-pointer whitespace-nowrap shadow-md ${
                          isCurrent
                            ? choiceKey === 'Best'
                              ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105 font-bold'
                              : choiceKey === 'Safe'
                              ? 'bg-blue-500 text-white border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105 font-bold'
                              : choiceKey === 'Weak'
                              ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105 font-bold'
                              : 'bg-rose-500 text-white border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.5)] scale-105 font-bold'
                            : 'bg-black/60 text-slate-200 border-slate-700 hover:border-[#d4af37] hover:text-white hover:bg-black/80'
                        }`}
                      >
                        {choiceLabel}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Unified Scroll Container: Narrative text box + Dialogue Stream scroll together */}
              <div
                ref={dialogueScrollContainerRef}
                className="space-y-4 max-h-[62vh] sm:max-h-[68vh] overflow-y-auto pr-1 select-none"
                onClick={() => {
                  if (currentAct.dialogue && dialogueStep < currentAct.dialogue.length - 1) {
                    setDialogueStep((prev) => prev + 1);
                  }
                }}
              >
                {/* Top Scene / Narrator card (scrolls with dialogue) */}
                {currentAct.sceneNarrative && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full rounded-3xl border-2 border-[#d4af37] bg-white/85 text-black p-5 sm:p-6 shadow-2xl relative"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm sm:text-base md:text-lg leading-relaxed font-sans text-black font-medium">
                        {currentAct.sceneNarrative}
                      </p>
                      <MessageSquare className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                    </div>
                  </motion.div>
                )}

                {/* Dialogue Stream: Revealed line-by-line / speaker-by-speaker on click */}
                {currentAct.dialogue &&
                  currentAct.dialogue.slice(0, dialogueStep + 1).map((line, idx) => {
                    const isFemale = line.speaker === 'Alethea' || line.voice === 'Female';
                    const isMale = line.speaker === 'Elion' || line.voice === 'Male';
                    const isNarrator = line.speaker === 'Narrator';
                    const isLatest = idx === dialogueStep;

                    if (isNarrator) {
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className={`mx-auto max-w-2xl text-center px-4 py-2 rounded-2xl bg-white/85 border text-black text-xs sm:text-sm italic font-medium shadow-md ${
                            isLatest ? 'border-[#d4af37] ring-2 ring-[#d4af37]/40' : 'border-[#d4af37]'
                          }`}
                        >
                          {line.text}
                        </motion.div>
                      );
                    }

                    if (isFemale) {
                      // Female (Alethea): Aligned RIGHT with Avatar on far RIGHT
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25 }}
                          className="flex items-center justify-end gap-3 sm:gap-4 pl-6 sm:pl-12"
                        >
                          <div
                            className={`flex-1 max-w-xl rounded-3xl border-2 bg-white/85 text-black p-4 sm:p-5 shadow-xl relative cursor-pointer ${
                              isLatest
                                ? 'border-[#d4af37] ring-2 ring-[#d4af37]/40'
                                : 'border-[#d4af37]'
                            }`}
                          >
                            <div className="flex items-center justify-between pb-1">
                              <span className="text-[#996515] font-serif text-sm font-semibold tracking-wide">
                                {line.speaker || 'Alethea'}
                              </span>
                              <MessageSquare className="w-4 h-4 text-amber-700/80" />
                            </div>
                            <p className="text-base sm:text-xl font-bold text-black text-center py-1 font-sans">
                              {line.text}
                            </p>
                          </div>

                          {/* Alethea Avatar */}
                          <img
                            src={aletheaAvatar}
                            alt="Alethea"
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#d4af37] shadow-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = '/src/assets/realms/atlantis/0Alethea.jpg';
                            }}
                          />
                        </motion.div>
                      );
                    }

                    // Male (Elion): Aligned LEFT with Avatar on far LEFT
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-center justify-start gap-3 sm:gap-4 pr-6 sm:pr-12"
                      >
                        {/* Elion Avatar */}
                        <img
                          src={elionAvatar}
                          alt="Elion"
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#d4af37] shadow-lg object-cover flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = '/src/assets/realms/atlantis/2Elion.jpg';
                          }}
                        />

                        <div
                          className={`flex-1 max-w-xl rounded-3xl border-2 bg-white/85 text-black p-4 sm:p-5 shadow-xl relative cursor-pointer ${
                            isLatest
                              ? 'border-[#d4af37] ring-2 ring-[#d4af37]/40'
                              : 'border-[#d4af37]'
                          }`}
                        >
                          <div className="flex items-center justify-between pb-1">
                            <span className="text-[#996515] uppercase tracking-widest text-xs font-bold font-sans">
                              {line.speaker || 'ELION'}
                            </span>
                            <MessageSquare className="w-4 h-4 text-amber-700/80" />
                          </div>
                          <p className="text-base sm:text-xl font-bold text-black text-left py-1 font-sans">
                            {line.text}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}

                {/* Interactive Click-to-Continue Prompt for Next Speaker */}
                {currentAct.dialogue && dialogueStep < currentAct.dialogue.length - 1 && (
                  <div className="flex justify-center pt-2 pb-1">
                    <button
                      id="dialogue-next-speaker-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDialogueStep((prev) => prev + 1);
                      }}
                      className="px-4 py-2 rounded-full border-2 border-[#d4af37] bg-white/95 text-black hover:bg-amber-100 font-sans font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
                    >
                      <span>Click to continue ({currentAct.dialogue[dialogueStep + 1]?.speaker || 'Next'})</span>
                      <ChevronRight className="w-4 h-4 text-amber-700" />
                    </button>
                  </div>
                )}

                {/* Invisible scroll target */}
                <div ref={dialogueEndRef} className="h-1" />
              </div>

            </div>
          ) : (
            /* B. NARRATIVE / CHARACTER TYPEWRITER ACT MODE */
            <div className="w-full space-y-4 pb-2 animate-fadeIn">
              
              {/* Act Header Title (Hidden on mobile) */}
              <div className="hidden sm:block text-center px-4">
                <span className="inline-block px-3.5 py-1.5 rounded-full bg-white/80 border-2 border-[#d4af37] text-black text-xs font-cinzel uppercase font-bold tracking-widest mb-1 shadow-md">
                  {currentAct.actTitle}
                </span>
              </div>

              {/* Typewriter Text Box */}
              <motion.div
                ref={typewriterBoxRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full rounded-3xl border-2 border-[#d4af37] bg-white/85 text-black shadow-2xl p-5 sm:p-7 md:p-8 relative max-h-[58vh] overflow-y-auto scroll-smooth"
              >
                {/* Typewriter Header Controls */}
                <div className="flex items-center justify-between border-b border-amber-300 pb-3 mb-4">
                  {/* Chapter Title & Icon (Hidden on mobile) */}
                  <div className="hidden sm:flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#d4af37]" />
                    <span className="font-cinzel text-xs sm:text-sm font-bold text-black uppercase tracking-wider">
                      {currentAct.chapterTitle}
                    </span>
                  </div>

                  {/* Controls: Play/Pause (Always visible), Speed/Sound/Skip (Hidden on mobile) */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Read Aloud / Sound Button (Hidden on mobile) */}
                    <button
                      onClick={() => handleReadAloud(rawText)}
                      className={`hidden sm:inline-flex p-2 rounded-xl border text-xs font-semibold items-center gap-1 transition-all cursor-pointer ${
                        isSpeakingText
                          ? 'bg-[#d4af37] text-black border-[#d4af37]'
                          : 'bg-white/90 text-black border-amber-400 hover:bg-amber-100'
                      }`}
                      title={isSpeakingText ? 'Stop reading' : 'Read text aloud'}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{isSpeakingText ? 'Speaking...' : 'Listen'}</span>
                    </button>

                    {/* Play / Pause Toggle (Visible on Mobile & Desktop) */}
                    {!isTypewriterDone ? (
                      <button
                        onClick={() => setIsTypewriterPlaying(!isTypewriterPlaying)}
                        className="px-3.5 py-1.5 rounded-xl border border-amber-400 bg-white/90 text-black hover:bg-amber-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                        title={isTypewriterPlaying ? 'Pause typewriter' : 'Play typewriter'}
                      >
                        {isTypewriterPlaying ? (
                          <>
                            <Pause className="w-4 h-4 text-amber-700" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 text-emerald-700 fill-emerald-600" />
                            <span className="font-bold text-emerald-900">Play</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleReplayTypewriter}
                        className="px-3.5 py-1.5 rounded-xl border border-amber-400 bg-white/90 text-black hover:bg-amber-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                        title="Restart typewriter"
                      >
                        <RotateCcw className="w-4 h-4 text-amber-700" />
                        <span>Replay</span>
                      </button>
                    )}

                    {/* Speed Toggle 1x/2x (Hidden on mobile) */}
                    <button
                      onClick={() => setTypingSpeed(typingSpeed === 'normal' ? 'fast' : 'normal')}
                      className="hidden sm:inline-flex px-2.5 py-1 rounded-xl border border-amber-400 bg-white/90 text-black hover:bg-amber-100 text-xs font-bold cursor-pointer transition-all"
                      title="Toggle typing speed"
                    >
                      {typingSpeed === 'fast' ? '2x' : '1x'}
                    </button>

                    {/* Skip to Full Text >> (Hidden on mobile) */}
                    {!isTypewriterDone && (
                      <button
                        onClick={handleSkipTypewriter}
                        className="hidden sm:inline-flex p-2 rounded-xl border border-amber-400 bg-white/90 text-black hover:bg-amber-100 text-xs font-semibold items-center gap-1 cursor-pointer transition-all"
                        title="Show complete text"
                      >
                        <FastForward className="w-4 h-4" />
                        <span>Skip</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Formatted Typewriter Text */}
                <div className="pr-1">
                  {renderFormattedText(rawText, typedLength)}
                  {!isTypewriterDone ? (
                    <span
                      ref={typewriterCursorRef}
                      className="inline-block w-2.5 h-5 bg-[#d4af37] ml-1 animate-pulse align-middle"
                    />
                  ) : (
                    <span ref={typewriterCursorRef} className="inline-block h-1 w-1" />
                  )}
                </div>
              </motion.div>

            </div>
          )}

          {/* Bottom Act Navigation Progress Dots */}
          <div className="flex items-center justify-center gap-1.5 py-2">
            {actItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'w-7 bg-[#d4af37] shadow-[0_0_8px_#d4af37]'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                title={`${item.chapterTitle} - ${item.actTitle}`}
              />
            ))}
          </div>

        </motion.div>
      ) : (
        /* While animation plays: user can watch clear animation or tap anywhere to skip */
        <div
          className="relative z-10 flex flex-col items-center justify-end pb-6 sm:pb-8 w-full cursor-pointer"
          onClick={() => handleSkipAnimation()}
        >
          {/* Bottom Act Navigation Progress Dots */}
          <div className="flex items-center justify-center gap-1.5 py-2" onClick={(e) => e.stopPropagation()}>
            {actItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'w-7 bg-[#d4af37] shadow-[0_0_8px_#d4af37]'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                title={`${item.chapterTitle} - ${item.actTitle}`}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
