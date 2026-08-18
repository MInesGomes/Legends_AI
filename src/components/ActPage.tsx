import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, UserProfile, SkillType } from '../types';
import { ActItem, getAtlantisActItems } from '../lib/atlantisData';
import {
  X as CloseIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Globe,
  Play,
  Pause,
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

  // Progressive sentence state for narrative acts (appears 1 sentence at a time)
  const [visibleSentenceCount, setVisibleSentenceCount] = useState<number>(1);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);

  // Selected sentence index for multi-image acts (e.g. Act 2's 6 images for 6 sentences)
  const [selectedSentenceIdx, setSelectedSentenceIdx] = useState<number | null>(null);

  // Dialogue stepper index for dialogue/choice acts
  const [dialogueStep, setDialogueStep] = useState<number>(0);
  const [isSpeakingText, setIsSpeakingText] = useState(false);

  const currentAct = actItems[currentIndex] || actItems[0];
  const hasSequentialImages = !!(currentAct?.images && currentAct.images.length > 0);

  // Background animation state: do not repeat, only reveal overlay when animation ends
  const [isVideoFinished, setIsVideoFinished] = useState<boolean>(!actItems[initialIdx >= 0 ? initialIdx : 0]?.mp4 || hasSequentialImages);

  const videoRef = useRef<HTMLVideoElement>(null);
  const dialogueScrollContainerRef = useRef<HTMLDivElement>(null);
  const dialogueEndRef = useRef<HTMLDivElement>(null);
  const narrativeBoxRef = useRef<HTMLDivElement>(null);

  // Parse sentences for the current act
  const sentences = useMemo(() => {
    if (!currentAct?.text) return [];
    const lines = currentAct.text.split('\n').map((s) => s.trim()).filter(Boolean);
    if (lines.length > 1) return lines;
    const matched = currentAct.text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);
    return matched ? matched.map((s) => s.trim()).filter(Boolean) : [currentAct.text];
  }, [currentAct?.text]);

  const isAllSentencesRevealed = visibleSentenceCount >= sentences.length;

  // Reset states whenever act changes
  useEffect(() => {
    setVisibleSentenceCount(1);
    setSelectedSentenceIdx(null);
    setDialogueStep(0);
    setIsSpeakingText(false);
    setIsVideoFinished(true);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

    if (narrativeBoxRef.current) {
      narrativeBoxRef.current.scrollTop = 0;
    }
    if (dialogueScrollContainerRef.current) {
      dialogueScrollContainerRef.current.scrollTop = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [currentIndex]);

  // Progressive timer: automatically reveals 1 sentence at a time when Autoplay is enabled
  useEffect(() => {
    if (!isAutoPlay || currentAct.type !== 'narrative' || visibleSentenceCount >= sentences.length) {
      return;
    }

    const currentSentence = sentences[visibleSentenceCount - 1] || '';
    const wordCount = currentSentence.split(/\s+/).length;
    const delay = Math.max(1800, Math.min(4200, wordCount * 140 + 800));

    const timer = setTimeout(() => {
      setVisibleSentenceCount((prev) => Math.min(sentences.length, prev + 1));
    }, delay);

    return () => clearTimeout(timer);
  }, [isAutoPlay, visibleSentenceCount, sentences, currentAct.type]);

  // Progressive timer: automatically advances dialogue when Autoplay is enabled
  useEffect(() => {
    if (
      !isAutoPlay ||
      (currentAct.type !== 'dialogue' && currentAct.type !== 'choice') ||
      !currentAct.dialogue ||
      dialogueStep >= currentAct.dialogue.length - 1
    ) {
      return;
    }

    const currentLine = currentAct.dialogue[dialogueStep]?.text || '';
    const wordCount = currentLine.split(/\s+/).length;
    const delay = Math.max(2200, Math.min(4800, wordCount * 140 + 1000));

    const timer = setTimeout(() => {
      setDialogueStep((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isAutoPlay, dialogueStep, currentAct.dialogue, currentAct.type]);

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

  // Auto-scroll narrative box when new sentence appears
  useEffect(() => {
    if (currentAct.type === 'narrative' && narrativeBoxRef.current) {
      narrativeBoxRef.current.scrollTo({
        top: narrativeBoxRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [visibleSentenceCount, currentAct.type]);

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
          if (visibleSentenceCount < sentences.length) {
            setVisibleSentenceCount((prev) => Math.min(sentences.length, prev + 1));
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, actItems.length, currentAct, dialogueStep, visibleSentenceCount, sentences.length]);

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

  const activeSentenceIdx = selectedSentenceIdx !== null
    ? selectedSentenceIdx
    : Math.min(visibleSentenceCount - 1, Math.max(0, sentences.length - 1));

  // Render Formatted Narrative Text (Appearing 1 sentence at a time with smooth fade/slide)
  const renderFormattedText = () => {
    const visibleSentences = sentences.slice(0, visibleSentenceCount);

    if (hasSequentialImages) {
      return (
        <div className="space-y-0.5 font-sans text-sm sm:text-base md:text-lg leading-snug text-black">
          {visibleSentences.map((line, idx) => {
            const isActive = activeSentenceIdx === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSentenceIdx(idx);
                }}
                className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer select-text ${
                  isActive
                    ? 'border-[#d4af37] bg-amber-400/25 shadow-sm ring-1 ring-[#d4af37]/60'
                    : 'border-amber-200/80 hover:border-amber-400 hover:bg-amber-50/70 bg-white/75'
                }`}
              >
                <p className={`tracking-normal leading-snug my-0 ${isActive ? 'text-black font-bold' : 'text-slate-800 font-medium'}`}>
                  {line}
                </p>
              </motion.div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="font-sans text-sm sm:text-base md:text-lg leading-normal text-black font-medium space-y-0">
        {visibleSentences.map((line, idx) => {
          if (line.startsWith('*')) {
            const bulletContent = line.substring(1).trim();
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex items-start gap-2 pl-3 py-0.5 text-black"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-1.5 flex-shrink-0 shadow-[0_0_6px_#d4af37]" />
                <span className="font-semibold">{bulletContent}</span>
              </motion.div>
            );
          }

          return (
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="tracking-normal leading-normal my-0 py-0 text-black"
            >
              {line}
            </motion.p>
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
      {/* 1. BACKGROUND VIDEO / MULTI-SCENE IMAGES / FALLBACK POSTER (Top-Aligned & Uncropped) */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950 pointer-events-none flex items-start justify-center">
        {hasSequentialImages ? (
          <div className="relative w-full h-full flex items-start justify-center">
            {/* Ambient subtle backdrop fill */}
            {currentAct.images!.map((imgUrl, imgIdx) => (
              <motion.img
                key={`bg-blur-${imgUrl}`}
                src={imgUrl}
                alt=""
                initial={false}
                animate={{
                  opacity: (activeSentenceIdx % currentAct.images!.length) === imgIdx ? 0.35 : 0,
                }}
                transition={{ duration: 0.65, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full object-cover object-top filter blur-2xl scale-110 -z-20"
                referrerPolicy="no-referrer"
              />
            ))}
            {/* Main Crisp, Top-Aligned & Uncropped Scene Image */}
            {currentAct.images!.map((imgUrl, imgIdx) => (
              <motion.img
                key={imgUrl}
                src={imgUrl}
                alt={`${currentAct.actTitle} scene ${imgIdx + 1}`}
                initial={false}
                animate={{
                  opacity: (activeSentenceIdx % currentAct.images!.length) === imgIdx ? 1 : 0,
                  scale: (activeSentenceIdx % currentAct.images!.length) === imgIdx ? 1 : 0.98,
                }}
                transition={{ duration: 0.65, ease: 'easeInOut' }}
                className="absolute inset-x-0 top-0 w-full h-[52vh] sm:h-[58vh] object-contain object-top z-0"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = currentAct.posterImage || '/src/assets/realms/atlantis/realm_atlantis_bg.png';
                }}
              />
            ))}
          </div>
        ) : (
          <div className="relative w-full h-full flex items-start justify-center">
            {/* Ambient subtle backdrop fill */}
            <img
              src={currentAct.posterImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-top filter blur-2xl opacity-35 scale-110 -z-20"
              referrerPolicy="no-referrer"
            />
            <video
              ref={videoRef}
              key={currentAct.mp4}
              src={currentAct.mp4}
              poster={currentAct.posterImage}
              autoPlay
              muted={isMuted}
              playsInline
              onEnded={() => {
                setIsVideoFinished(true);
                if (isAutoPlay && currentIndex < actItems.length - 1) {
                  goToNext();
                }
              }}
              className="absolute inset-x-0 top-0 w-full h-[52vh] sm:h-[58vh] object-contain object-top z-0"
              onError={(e) => {
                // Graceful fallback to poster background image if video can't decode
                const target = e.currentTarget;
                target.style.display = 'none';
              }}
            />
            {/* Fallback image behind video */}
            <img
              src={currentAct.posterImage}
              alt={currentAct.actTitle}
              className="absolute inset-x-0 top-0 w-full h-[52vh] sm:h-[58vh] object-contain object-top -z-10"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>

      {/* 2. TOP LEFT: CLOSE 'X' BUTTON */}
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
      </div>

      {/* 3. TOP RIGHT: AUTOPLAY TOGGLE, SOUND TOGGLE & LANGUAGE SELECTOR */}
      <div className="flex absolute top-2.5 right-2.5 sm:top-6 sm:right-6 z-30 items-center gap-2 sm:gap-3">
        {/* Autoplay Toggle Button (same circular format as sound button) */}
        <button
          id="act-autoplay-toggle"
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className={`p-1.5 sm:p-3 rounded-full border sm:border-2 shadow-lg sm:shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center ${
            isAutoPlay
              ? 'border-[#d4af37] bg-black/80 text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
              : 'border-[#d4af37]/40 bg-black/60 hover:bg-black/90 text-amber-200/50'
          }`}
          title={isAutoPlay ? 'Autoplay: ON (Auto-advances when animation finishes)' : 'Autoplay: OFF (Manual mode)'}
        >
          {isAutoPlay ? (
            <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#d4af37] fill-[#d4af37]" />
          ) : (
            <Pause className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-200/60" />
          )}
        </button>

        {/* Ambient Sound Toggle */}
        <button
          id="act-sound-toggle"
          onClick={() => setIsMuted(!isMuted)}
          className="p-1.5 sm:p-3 rounded-full border sm:border-2 border-[#d4af37]/70 bg-black/60 hover:bg-black/90 text-amber-200 shadow-lg sm:shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> : <Volume2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#d4af37]" />}
        </button>

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            id="act-lang-selector"
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 rounded-full border sm:border-2 border-[#d4af37] bg-black/60 hover:bg-black/90 text-amber-200 shadow-lg sm:shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Select Language"
          >
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d4af37]" />
            <span className="font-bold text-[10px] sm:text-xs tracking-wider uppercase font-cinzel">
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

      {/* 6. MAIN CONTENT DISPLAY (FULLSCREEN WIDTH AT THE BOTTOM) */}
      <motion.div
        key={`content-${currentIndex}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-none flex flex-col justify-end mt-auto overflow-hidden"
      >
        {/* A. DIALOGUE / CHOICE ACT MODE (Alternating Left/Right speech bubbles matching reference screenshot) */}
        {(currentAct.type === 'dialogue' || currentAct.type === 'choice') ? (
          <div className="w-full bg-white/95 text-black rounded-t-3xl border-t-2 border-[#d4af37] shadow-[0_-10px_35px_rgba(0,0,0,0.6)] backdrop-blur-md animate-fadeIn">
            
            {/* Unified Scroll Container: Choice header pills + Narrative text box + Dialogue Stream all scroll together */}
            <div
              ref={dialogueScrollContainerRef}
              className="space-y-4 max-h-[46vh] sm:max-h-[44vh] overflow-y-auto p-4 sm:p-6 pr-3 select-none"
              onClick={() => {
                if (currentAct.dialogue && dialogueStep < currentAct.dialogue.length - 1) {
                  setDialogueStep((prev) => prev + 1);
                }
              }}
            >
              {/* If this is a Choice Act, show the 4 Choice selection pills */}
              {currentAct.type === 'choice' && (
                <div className="flex flex-wrap items-center justify-center gap-2.5 pb-1">
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
                        onClick={(e) => {
                          e.stopPropagation();
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

              {/* Top Scene / Narrator card (scrolls with dialogue) */}
              {currentAct.sceneNarrative && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full rounded-2xl border-2 border-[#d4af37] bg-white text-black p-4 sm:p-5 shadow-md relative"
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
                        className={`mx-auto max-w-2xl text-center px-4 py-2 rounded-2xl bg-white border text-black text-xs sm:text-sm italic font-medium shadow-md ${
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
                          className={`flex-1 rounded-2xl border-2 bg-white text-black p-4 sm:p-5 shadow-md relative cursor-pointer ${
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
                        className={`flex-1 rounded-2xl border-2 bg-white text-black p-4 sm:p-5 shadow-md relative cursor-pointer ${
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

              {/* Interactive Click-to-Continue Prompt for Next Speaker + Autoplay Toggle */}
              {currentAct.dialogue && dialogueStep < currentAct.dialogue.length - 1 && (
                <div className="flex items-center justify-center gap-3 pt-2 pb-1">
                  <button
                    id="dialogue-next-speaker-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDialogueStep((prev) => prev + 1);
                    }}
                    aria-label="Next Dialogue Line"
                    title="Next Dialogue Line"
                    className="p-2.5 rounded-full border-2 border-[#d4af37] bg-white text-black hover:bg-amber-100 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer animate-bounce"
                  >
                    <ChevronDown className="w-5 h-5 text-[#996515]" />
                  </button>

                  <button
                    id="dialogue-autoplay-toggle-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAutoPlay((prev) => !prev);
                    }}
                    className="px-3 py-1.5 rounded-full border-2 border-[#996515] bg-white text-[#996515] hover:bg-amber-50 text-xs font-bold font-sans flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                    title={isAutoPlay ? 'Autoplay active (click to switch to Manual)' : 'Manual active (click to switch to Autoplay)'}
                  >
                    {isAutoPlay ? (
                      <>
                        <Play className="w-3.5 h-3.5 text-[#996515] fill-[#996515]" />
                        <span>Auto</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5 text-[#996515]" />
                        <span>Manual</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Invisible scroll target */}
              <div ref={dialogueEndRef} className="h-1" />
            </div>

          </div>
        ) : (
          /* B. NARRATIVE / CHARACTER ACT MODE (Fullscreen Width at Bottom, 1 Sentence at a Time) */
          <div className="w-full bg-white/95 text-black rounded-t-3xl border-t-2 border-[#d4af37] shadow-[0_-10px_35px_rgba(0,0,0,0.6)] backdrop-blur-md animate-fadeIn">
            <div
              ref={narrativeBoxRef}
              onClick={() => {
                if (!isAllSentencesRevealed) {
                  setVisibleSentenceCount((prev) => Math.min(sentences.length, prev + 1));
                }
              }}
              className="max-h-[46vh] sm:max-h-[44vh] overflow-y-auto scroll-smooth p-4 sm:p-6 md:p-8 pr-3 cursor-pointer select-none"
            >
              {/* Header (Scrolls with text) */}
              <div className="flex items-center justify-between border-b border-amber-300 pb-3 mb-3">
                {/* Chapter & Act Title */}
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37]" />
                  <span className="font-cinzel text-xs sm:text-sm font-bold text-black uppercase tracking-wider">
                    {currentAct.chapterTitle} · {currentAct.actTitle}
                  </span>
                </div>
              </div>

              {/* Formatted Text (Appearing 1 sentence at a time) */}
              <div className="pr-1">
                {renderFormattedText()}
              </div>

              {/* Next Sentence Arrow Indicator + Autoplay Toggle (if more sentences remain) */}
              {!isAllSentencesRevealed && (
                <div className="flex items-center justify-center gap-3 pt-3 pb-1">
                  <button
                    id="narrative-next-sentence-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVisibleSentenceCount((prev) => Math.min(sentences.length, prev + 1));
                    }}
                    aria-label="Next Sentence"
                    title="Next Sentence"
                    className="p-2 rounded-full border-2 border-[#d4af37] bg-white text-black hover:bg-amber-100 shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer animate-bounce"
                  >
                    <ChevronDown className="w-4 h-4 text-[#996515]" />
                  </button>

                  <button
                    id="narrative-autoplay-toggle-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAutoPlay((prev) => !prev);
                    }}
                    className="px-3 py-1.5 rounded-full border-2 border-[#996515] bg-white text-[#996515] hover:bg-amber-50 text-xs font-bold font-sans flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                    title={isAutoPlay ? 'Autoplay active (click to switch to Manual)' : 'Manual active (click to switch to Autoplay)'}
                  >
                    {isAutoPlay ? (
                      <>
                        <Play className="w-3.5 h-3.5 text-[#996515] fill-[#996515]" />
                        <span>Auto</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5 text-[#996515]" />
                        <span>Manual</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

    </div>
  );
};
