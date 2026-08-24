import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, UserProfile, SkillType, ChapterComment } from '../types';
import { ActItem, getAtlantisActItems } from '../lib/atlantisData';
import { ASSETS, resolveAssetUrl } from '../lib/assetRegistry';
import { CommentsDrawer } from './CommentsDrawer';
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
  Info,
  RotateCcw
} from 'lucide-react';

interface ActPageProps {
  initialActId?: string;
  initialChapter?: number;
  user: UserProfile | null;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onClose: () => void;
  onEarnSkillPoint?: (skill: SkillType) => void;
  onRecordView?: (chapterId: string, lang: Language) => void;
  commentsMap?: Record<string, ChapterComment[]>;
  onAddComment?: (chapterId: string, text: string) => void;
  onEditComment?: (chapterId: string, commentId: string, newText: string) => void;
  onDeleteComment?: (chapterId: string, commentId: string) => void;
  darkMode?: boolean;
}

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'ES', label: 'Español', flag: '🇪🇸' },
  { code: 'IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'PT-pt', label: 'Português', flag: '🇵🇹' },
  { code: 'NL', label: 'Nederlands', flag: '🇳🇱' },
];

const CHOICE_FEEDBACK: Record<string, { summary: string; explanation: string; icon: string; tag: string }> = {
  Best: {
    tag: 'Optimal Choice',
    summary: 'Prioritized Human Lives & Courageous Unity',
    explanation: 'Organizing an immediate, orderly evacuation saved the lives of everyone in the eastern district. Even though the old subterranean tunnels collapsed from the shock, preserving people above all else proved true leadership and aligned with the higher spirit of Atlantis.',
    icon: '🌟'
  },
  Safe: {
    tag: 'Why this was not good',
    summary: 'Isolationism & Sacrificing the Vulnerable',
    explanation: 'Sealing the eastern dome protected the central city but cut off life-sustaining oxygen to the southern districts. Families were left trapped in the dark before rescue vessels could arrive. Pure self-preservation without collective solidarity leaves the vulnerable behind.',
    icon: '⚠️'
  },
  Weak: {
    tag: 'Why this was not good',
    summary: 'Fatal Indecision & Bureaucratic Delay',
    explanation: 'Waiting for Council authorization cost irreplaceable minutes during a high-velocity emergency. By the time permission was granted, catastrophic floodwaters had already overwhelmed the eastern sector. In urgent crises, hesitation can be fatal.',
    icon: '⏳'
  },
  Harmful: {
    tag: 'Why this was not good',
    summary: 'Destructive Force & Escalated Chaos',
    explanation: 'Attempting to violently force the mechanism ruptured internal pressure valves. The resulting mechanical explosion tore bridges apart, destroyed vital supply stores, and blackened the First Crystal. Brute force without calm coordination turns emergencies into disasters.',
    icon: '💥'
  }
};

export const ActPage: React.FC<ActPageProps> = ({
  initialActId,
  initialChapter = 1,
  user,
  currentLang,
  onLanguageChange,
  onClose,
  onEarnSkillPoint,
  onRecordView,
  commentsMap,
  onAddComment,
  onEditComment,
  onDeleteComment,
  darkMode = true,
}) => {
  const userGender = user?.gender || (user?.avatar_url?.toLowerCase().includes('male') && !user?.avatar_url?.toLowerCase().includes('female') ? 'male' : 'female');
  const actItems: ActItem[] = useMemo(() => {
    return getAtlantisActItems(currentLang, userGender);
  }, [currentLang, userGender]);
  
  // Find initial index
  const initialIdx = Math.max(
    0,
    actItems.findIndex((item) => item.id === initialActId || (initialChapter && item.chapterNumber === initialChapter))
  );

  const [currentIndex, setCurrentIndex] = useState<number>(initialIdx >= 0 ? initialIdx : 0);
  const [isMuted, setIsMuted] = useState(true);

  // Comments drawer state
  const [showCommentsDrawer, setShowCommentsDrawer] = useState<boolean>(false);

  // Progressive sentence state for narrative acts (appears 1 sentence at a time)
  const [visibleSentenceCount, setVisibleSentenceCount] = useState<number>(1);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);

  // Selected sentence index for multi-image acts (e.g. Act 2's 6 images for 6 sentences)
  const [selectedSentenceIdx, setSelectedSentenceIdx] = useState<number | null>(null);

  // Dialogue stepper index for dialogue/choice acts
  const [dialogueStep, setDialogueStep] = useState<number>(0);
  const [isSpeakingText, setIsSpeakingText] = useState(false);

  // Choice tracking and celebration state
  const [playedChoices, setPlayedChoices] = useState<string[]>([]);
  const [hasChosenBest, setHasChosenBest] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [showOtherOptions, setShowOtherOptions] = useState<boolean>(false);
  const [shuffledOrder, setShuffledOrder] = useState<string[]>([]);

  const currentAct = actItems[currentIndex] || actItems[0];
  const currentChapterId = currentAct.chapterNumber === 2 ? 'atlantis-ch2' : 'atlantis-ch1';

  // Automatically record chapter view for the current language
  useEffect(() => {
    if (onRecordView && currentChapterId) {
      onRecordView(currentChapterId, currentLang);
    }
  }, [currentChapterId, currentLang]);
  const hasSequentialImages = !!(currentAct?.images && currentAct.images.length > 0);

  const isChoiceOrDialogue = currentAct.type === 'dialogue' || currentAct.type === 'choice';
  const isDialogueFinished = !currentAct.dialogue || currentAct.dialogue.length === 0 || dialogueStep >= currentAct.dialogue.length - 1;

  const chapterChoices = useMemo(() => {
    return actItems.filter(
      (item) => item.chapterNumber === currentAct.chapterNumber && item.type === 'choice'
    );
  }, [actItems, currentAct.chapterNumber]);

  // Initialize and maintain a randomized shuffle order for choices in this chapter
  useEffect(() => {
    if (chapterChoices.length > 0 && shuffledOrder.length === 0) {
      const keys = chapterChoices.map((c) => c.choiceType || c.id);
      const shuffled = [...keys];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setShuffledOrder(shuffled);
    }
  }, [chapterChoices.length, shuffledOrder.length]);

  const orderedChapterChoices = useMemo(() => {
    if (shuffledOrder.length === 0) return chapterChoices;
    return [...chapterChoices].sort((a, b) => {
      const aIdx = shuffledOrder.indexOf(a.choiceType || a.id);
      const bIdx = shuffledOrder.indexOf(b.choiceType || b.id);
      return (aIdx >= 0 ? aIdx : 99) - (bIdx >= 0 ? bIdx : 99);
    });
  }, [chapterChoices, shuffledOrder]);

  const unplayedChoices = useMemo(() => {
    return orderedChapterChoices.filter((ch) => !playedChoices.includes(ch.choiceType || ''));
  }, [orderedChapterChoices, playedChoices]);

  // Comments Mapping: Filter to only show comments submitted by the current user
  const currentComments: ChapterComment[] = useMemo(() => {
    const allComments = (commentsMap && commentsMap[currentChapterId]) || [];
    return allComments.filter((c) => {
      if (!user || user.user_id === 'guest_user' || user.user_id === 'guest') {
        return !c.user_id || c.user_id === 'guest' || c.user_id === 'guest_user';
      }
      return c.user_id === user.user_id;
    });
  }, [commentsMap, currentChapterId, user]);

  const handleAddComment = (text: string) => {
    if (onAddComment) {
      onAddComment(currentChapterId, text);
    }
  };

  const handleEditComment = (commentId: string, newText: string) => {
    if (onEditComment) {
      onEditComment(currentChapterId, commentId, newText);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (onDeleteComment) {
      onDeleteComment(currentChapterId, commentId);
    }
  };

  const handleSelectChoice = (choiceKey: string) => {
    const targetActIdx = actItems.findIndex(
      (item) => item.chapterNumber === currentAct.chapterNumber && item.type === 'choice' && item.choiceType === choiceKey
    );
    if (targetActIdx >= 0) {
      setPlayedChoices((prev) => Array.from(new Set([...prev, choiceKey])));
      if (choiceKey === 'Best') {
        setHasChosenBest(true);
        setShowCelebration(true);
        if (onEarnSkillPoint) {
          onEarnSkillPoint('Win4All');
        }
      }
      setCurrentIndex(targetActIdx);
    }
  };

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
    setIsVideoFinished(false);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isAutoPlay) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
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

  // Synchronize video play / pause state whenever isAutoPlay changes
  useEffect(() => {
    if (videoRef.current) {
      if (isAutoPlay) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isAutoPlay]);

  // Synchronize video mute state with audio toggle
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Progressive timer: automatically reveals 1 sentence at a time when Autoplay is enabled
  useEffect(() => {
    if (
      !isAutoPlay ||
      (currentAct.type !== 'narrative' && currentAct.type !== 'character') ||
      visibleSentenceCount >= sentences.length
    ) {
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
    if ((currentAct.type === 'narrative' || currentAct.type === 'character') && narrativeBoxRef.current) {
      narrativeBoxRef.current.scrollTo({
        top: narrativeBoxRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [visibleSentenceCount, currentAct.type]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept if user is typing in an input, textarea, or contentEditable element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox')
      ) {
        return;
      }

      // Do not intercept hotkeys if Comments Drawer is open
      if (showCommentsDrawer) {
        return;
      }

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
        } else if (e.key === ' ' && (currentAct.type === 'narrative' || currentAct.type === 'character')) {
          e.preventDefault();
          if (visibleSentenceCount < sentences.length) {
            setVisibleSentenceCount((prev) => Math.min(sentences.length, prev + 1));
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, actItems.length, currentAct, dialogueStep, visibleSentenceCount, sentences.length, showCommentsDrawer]);

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

  const isActFinished = useMemo(() => {
    if (currentAct.type === 'narrative' || currentAct.type === 'character') {
      return visibleSentenceCount >= sentences.length && sentences.length > 0;
    }
    if (currentAct.type === 'dialogue' || currentAct.type === 'choice') {
      return !currentAct.dialogue || dialogueStep >= currentAct.dialogue.length - 1;
    }
    return false;
  }, [currentAct.type, currentAct.dialogue, visibleSentenceCount, sentences.length, dialogueStep]);

  const nextItem = actItems[currentIndex + 1];
  const nextIsNewChapter = nextItem && nextItem.chapterNumber !== currentAct.chapterNumber;
  const isLastAct = currentIndex >= actItems.length - 1;

  const handleReplay = () => {
    setVisibleSentenceCount(1);
    setSelectedSentenceIdx(null);
    setDialogueStep(0);
    setIsSpeakingText(false);
    setIsVideoFinished(false);
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
  };

  // Replay act from the beginning whenever user changes language
  useEffect(() => {
    handleReplay();
  }, [currentLang]);

  const renderCompletionControls = (isLightBg: boolean = false) => {
    if (!isActFinished) return null;

    const hideNext = isChoiceOrDialogue && !hasChosenBest;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-1 sm:gap-2 pt-2 pb-1.5 px-1.5 sm:px-3 border-t mt-2 rounded-2xl shadow-md overflow-hidden pointer-events-auto ${
          isLightBg
            ? 'bg-slate-100 border-[#d4af37]/40 text-black'
            : 'bg-black/80 border-[#d4af37]/40 text-white'
        }`}
      >
        {/* Left: Write a comment Button */}
        <button
          id="act-write-comment-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowCommentsDrawer(true);
          }}
          className="shrink-0 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full border-2 border-[#d4af37] bg-black text-[#d4af37] hover:bg-[#d4af37] hover:text-slate-950 text-[11px] sm:text-xs md:text-sm font-bold shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap"
          title="Write a comment"
        >
          <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#d4af37]" />
          <span>Write a comment</span>
          {currentComments.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#d4af37]/30 text-amber-200 font-mono font-bold">
              {currentComments.length}
            </span>
          )}
        </button>

        {/* Center: Language Selector (Always visible at the bottom) */}
        <div className="flex items-center justify-center gap-0.5 sm:gap-1 bg-black/90 p-0.5 sm:p-1.5 rounded-full border border-[#d4af37]/60 shadow-inner shrink-0">
          <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#d4af37] ml-0.5 sm:ml-1 mr-0.5 shrink-0 hidden md:block" />
          {LANGUAGES.map((lang) => {
            const isSelected = currentLang === lang.code;
            const shortCode = lang.code === 'PT-pt' ? 'PT' : lang.code;
            return (
              <button
                key={lang.code}
                onClick={(e) => {
                  e.stopPropagation();
                  onLanguageChange(lang.code);
                  handleReplay();
                }}
                className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold transition-all cursor-pointer flex items-center gap-0.5 sm:gap-1 shrink-0 ${
                  isSelected
                    ? 'bg-[#d4af37] text-slate-950 font-bold shadow scale-105'
                    : 'text-slate-200 hover:text-white hover:bg-white/20'
                }`}
                title={`Switch to ${lang.label} & replay`}
              >
                <span className="text-xs sm:text-sm leading-none">{lang.flag}</span>
                <span className="uppercase font-mono font-bold text-[9px] sm:text-xs leading-none">{shortCode}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Next Act / Chapter Button */}
        {!hideNext && (!isLastAct ? (
          <button
            id="act-next-completion-btn"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full border-2 border-[#d4af37] bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-[11px] sm:text-xs md:text-sm font-bold shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <span className="hidden sm:inline">Next {nextIsNewChapter ? 'Chapter' : 'Act'}</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        ) : (
          <button
            id="act-close-completion-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full border-2 border-[#d4af37] bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-[11px] sm:text-xs md:text-sm font-bold shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <span>Finish</span>
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        ))}
      </motion.div>
    );
  };

  // Render Formatted Narrative Text (Appearing 1 sentence at a time with smooth fade/slide)
  const renderFormattedText = () => {
    const visibleSentences = sentences.slice(0, visibleSentenceCount);

    if (hasSequentialImages) {
      return (
        <div className="space-y-0 font-sans text-sm sm:text-base md:text-lg leading-snug text-white p-0 m-0 text-center">
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
                className={`p-0 m-0 transition-all cursor-pointer select-text text-center ${
                  isActive ? 'text-amber-300 font-bold' : 'text-white font-normal'
                }`}
              >
                <p className={`tracking-normal leading-snug m-0 p-0 text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] ${isActive ? 'text-amber-300 font-bold' : 'text-white'}`}>
                  {line}
                </p>
              </motion.div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="font-sans text-sm sm:text-base md:text-lg leading-normal text-white font-medium space-y-0 p-0 m-0 text-center">
        {visibleSentences.map((line, idx) => {
          if (line.startsWith('*')) {
            const bulletContent = line.substring(1).trim();
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex items-center justify-center gap-2 m-0 p-0 text-white text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d4af37] flex-shrink-0 shadow-[0_0_6px_#d4af37]" />
                <span className="font-semibold text-white">{bulletContent}</span>
              </motion.div>
            );
          }

          return (
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="tracking-normal leading-normal m-0 p-0 text-white text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]"
            >
              {line}
            </motion.p>
          );
        })}
      </div>
    );
  };

  const aletheaAvatar = resolveAssetUrl(currentAct.femaleAvatar, ASSETS.avatarAlethea);
  const elionAvatar = resolveAssetUrl(currentAct.maleAvatar, ASSETS.avatarElion);
  const menAvatar = ASSETS.avatarMen;

  return (
    <div
      id="act-fullscreen-page"
      className="fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-950 text-slate-100 flex flex-col justify-between select-none"
    >
      {/* 1. FULLSCREEN MEDIA CONTAINER (Video Box / Sequential Scene Images) */}
      <div
        id="act-fullscreen-media-box"
        className="absolute inset-0 z-0 overflow-hidden bg-slate-950 flex items-center justify-center cursor-pointer select-none"
        onClick={() => setIsAutoPlay(!isAutoPlay)}
        title={isAutoPlay ? 'Click to stop / pause video & story' : 'Click to start / play video & story'}
      >
        {hasSequentialImages ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Ambient subtle backdrop fill */}
            {currentAct.images!.map((imgUrl, imgIdx) => (
              <motion.img
                key={`bg-blur-${imgUrl}`}
                src={resolveAssetUrl(imgUrl)}
                alt=""
                initial={false}
                animate={{
                  opacity: (activeSentenceIdx % currentAct.images!.length) === imgIdx ? 0.35 : 0,
                }}
                transition={{ duration: 0.65, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full object-cover filter blur-2xl scale-110 -z-20 pointer-events-none"
                referrerPolicy="no-referrer"
              />
            ))}
            {/* Main Fullscreen Scene Image */}
            {currentAct.images!.map((imgUrl, imgIdx) => (
              <motion.img
                key={imgUrl}
                src={resolveAssetUrl(imgUrl)}
                alt={`${currentAct.actTitle} scene ${imgIdx + 1}`}
                initial={false}
                animate={{
                  opacity: (activeSentenceIdx % currentAct.images!.length) === imgIdx ? 1 : 0,
                  scale: (activeSentenceIdx % currentAct.images!.length) === imgIdx ? 1 : 1.02,
                }}
                transition={{ duration: 0.65, ease: 'easeInOut' }}
                className="w-full h-full object-contain sm:object-cover z-0"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = resolveAssetUrl(currentAct.posterImage, ASSETS.realmAtlantisJpg);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-start pt-[40px] sm:pt-0 bg-slate-950">
            {/* Ambient subtle backdrop fill */}
            <img
              src={resolveAssetUrl(currentAct.posterImage, ASSETS.realmAtlantisJpg)}
              alt=""
              className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-30 scale-110 -z-20 pointer-events-none"
              referrerPolicy="no-referrer"
            />
            {currentAct.mp4 ? (
              <video
                id="act-fullscreen-video"
                ref={videoRef}
                key={currentAct.mp4}
                src={resolveAssetUrl(currentAct.mp4)}
                poster={resolveAssetUrl(currentAct.posterImage, ASSETS.realmAtlantisJpg)}
                muted={isMuted}
                playsInline
                preload="auto"
                onEnded={() => {
                  setIsVideoFinished(true);
                  if (
                    isAutoPlay &&
                    currentIndex < actItems.length - 1 &&
                    currentAct.type !== 'narrative' &&
                    currentAct.type !== 'character' &&
                    currentAct.type !== 'dialogue' &&
                    currentAct.type !== 'choice'
                  ) {
                    setTimeout(() => {
                      goToNext();
                    }, 5000);
                  }
                }}
                className="w-full max-h-full object-contain object-top z-0"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = resolveAssetUrl(currentAct.mp4);
                  if (fallback && target.src !== fallback) {
                    target.src = fallback;
                  } else {
                    target.style.display = 'none';
                  }
                }}
              />
            ) : (
              <img
                src={resolveAssetUrl(currentAct.posterImage, ASSETS.realmAtlantisJpg)}
                alt={currentAct.actTitle}
                className="w-full max-h-full object-contain object-top z-0"
                referrerPolicy="no-referrer"
              />
            )}

            {/* Play / Pause Indicator Badge overlay on top of video box when stopped/paused */}
            {!isAutoPlay && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all">
                <div className="p-4 sm:p-5 rounded-full bg-black/80 border-2 border-[#d4af37] text-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.6)] transform hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 text-[#d4af37] fill-[#d4af37] ml-1" />
                </div>
              </div>
            )}
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

      {/* 3. TOP CENTER: ACT TITLE */}
      <div className="absolute top-2.5 sm:top-6 inset-x-0 mx-auto z-20 flex flex-col items-center justify-center pointer-events-none px-12 sm:px-44 text-center">
        <div className="bg-black/80 backdrop-blur-md px-3.5 sm:px-6 py-1 sm:py-1.5 rounded-full border border-[#d4af37]/70 shadow-[0_4px_20px_rgba(0,0,0,0.8)] max-w-full truncate flex items-center justify-center">
          <span className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-[#d4af37] font-cinzel truncate">
            {currentAct.actTitle || currentAct.chapterTitle?.replace(/^Chapter\s*\d+\s*:\s*/i, '')}
          </span>
        </div>
      </div>

      {/* 4. TOP RIGHT: COMMENTS, AUTOPLAY TOGGLE, SOUND TOGGLE & LANGUAGE SELECTOR */}
      <div className="flex absolute top-2.5 right-2.5 sm:top-6 sm:right-6 z-30 items-center gap-2 sm:gap-3">
        {/* Comments Drawer Button */}
        <button
          id="act-top-comments-btn"
          onClick={() => setShowCommentsDrawer(true)}
          className="p-1.5 sm:p-3 rounded-full border sm:border-2 border-[#d4af37]/70 bg-black/60 hover:bg-black/90 text-amber-200 shadow-lg sm:shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center relative"
          title="Open Comments / Write a comment"
        >
          <MessageSquare className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#d4af37]" />
          {currentComments.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#d4af37] text-slate-950 text-[9px] sm:text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow">
              {currentComments.length}
            </span>
          )}
        </button>

        {/* Autoplay Toggle Button (|| to stop automatic, > to start automatic) */}
        <button
          id="act-autoplay-toggle"
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className={`p-1.5 sm:p-3 rounded-full border sm:border-2 shadow-lg sm:shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center ${
            isAutoPlay
              ? 'border-[#d4af37] bg-black/80 text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
              : 'border-[#d4af37]/50 bg-black/60 hover:bg-black/90 text-amber-200/70 hover:text-amber-200'
          }`}
          title={isAutoPlay ? 'Autoplay is ON — Click to pause' : 'Autoplay is OFF — Click to play automatically'}
        >
          {isAutoPlay ? (
            <Pause className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#d4af37] fill-[#d4af37]" />
          ) : (
            <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-200 fill-amber-200 ml-0.5" />
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

      {/* 5. CENTER RIGHT: NEXT `>` BUTTON (Hidden in choice/dialogue until best choice chosen) */}
      {(!isChoiceOrDialogue || hasChosenBest) && (
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
      )}

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
            
            {/* Unified Scroll Container: Scrolls all the way up */}
            <div
              ref={dialogueScrollContainerRef}
              className="space-y-2 max-h-[82vh] sm:max-h-[80vh] overflow-y-auto p-2 sm:p-3 select-none"
              onClick={() => {
                if (currentAct.dialogue && dialogueStep < currentAct.dialogue.length - 1) {
                  setDialogueStep((prev) => prev + 1);
                }
              }}
            >
              {/* Dialogue Stream: Revealed line-by-line / speaker-by-speaker on click */}
              {currentAct.dialogue &&
                currentAct.dialogue.slice(0, dialogueStep + 1).map((line, idx) => {
                  const isNarrator = line.speaker === 'Narrator';
                  const isMen = line.speaker?.toLowerCase() === 'men' || line.speaker?.toLowerCase() === 'young man' || line.speaker?.toLowerCase() === 'young men';
                  const isFemale = !isNarrator && !isMen && (line.speaker === 'Alethea' || line.voice === 'Female');
                  const isLatest = idx === dialogueStep;

                  if (isNarrator) {
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`mx-auto max-w-xl text-center px-3 py-1.5 rounded-2xl bg-white border text-black text-xs sm:text-sm italic font-medium shadow-sm ${
                          isLatest ? 'border-[#d4af37] ring-2 ring-[#d4af37]/40' : 'border-[#d4af37]/60'
                        }`}
                      >
                        {line.text}
                      </motion.div>
                    );
                  }

                  if (isFemale) {
                    // Female (Alethea): Aligned strictly to RIGHT with Avatar on far RIGHT
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-start justify-end gap-2 max-w-[85%] sm:max-w-[78%] ml-auto m-0 p-0"
                      >
                        <div
                          className="rounded-2xl bg-white border border-[#d4af37]/60 text-black p-2 sm:p-2.5 m-0 relative shadow-sm cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-3 pb-0.5 m-0 p-0">
                            <span className="text-[#b8860b] font-serif text-xs font-bold tracking-wide">
                              {line.speaker || 'Alethea'}
                            </span>
                            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                          </div>
                          <p className="text-xs sm:text-sm md:text-base font-bold text-black text-left m-0 p-0 font-sans leading-snug">
                            {line.text}
                          </p>
                        </div>

                        {/* Alethea Avatar */}
                        <img
                          src={aletheaAvatar}
                          alt="Alethea"
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-[#d4af37] shadow object-cover flex-shrink-0 mt-0.5"
                          onError={(e) => {
                            e.currentTarget.src = ASSETS.avatarAlethea;
                          }}
                        />
                      </motion.div>
                    );
                  }

                  if (isMen) {
                    // Men (Young Men / Citizens): Aligned to LEFT with AvatarMen.jpg
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-start justify-start gap-2 max-w-[85%] sm:max-w-[78%] mr-auto m-0 p-0"
                      >
                        {/* Men Avatar */}
                        <img
                          src={menAvatar}
                          alt="Men"
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-[#d4af37] shadow object-cover flex-shrink-0 mt-0.5"
                          onError={(e) => {
                            e.currentTarget.src = ASSETS.avatarMen;
                          }}
                        />

                        <div
                          className="rounded-2xl bg-white border border-[#d4af37]/60 text-black p-2 sm:p-2.5 m-0 relative shadow-sm cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-3 pb-0.5 m-0 p-0">
                            <span className="text-[#b8860b] uppercase tracking-wider text-xs font-bold font-sans">
                              Men
                            </span>
                            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                          </div>
                          <p className="text-xs sm:text-sm md:text-base font-bold text-black text-left m-0 p-0 font-sans leading-snug">
                            {line.text}
                          </p>
                        </div>
                      </motion.div>
                    );
                  }

                  // Male (Elion): Aligned strictly to LEFT with Avatar on far LEFT
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-start justify-start gap-2 max-w-[85%] sm:max-w-[78%] mr-auto m-0 p-0"
                    >
                      {/* Elion Avatar */}
                      <img
                        src={elionAvatar}
                        alt="Elion"
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-[#d4af37] shadow object-cover flex-shrink-0 mt-0.5"
                        onError={(e) => {
                          e.currentTarget.src = ASSETS.avatarElion;
                        }}
                      />

                      <div
                        className="rounded-2xl bg-white border border-[#d4af37]/60 text-black p-2 sm:p-2.5 m-0 relative shadow-sm cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-3 pb-0.5 m-0 p-0">
                          <span className="text-[#b8860b] uppercase tracking-wider text-xs font-bold font-sans">
                            {line.speaker || 'ELION'}
                          </span>
                          <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <p className="text-xs sm:text-sm md:text-base font-bold text-black text-left m-0 p-0 font-sans leading-snug">
                          {line.text}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}

              {/* Manual Next Speaker Arrow Indicator (shown only when autoplay is paused/off and not yet finished) */}
              {!isAutoPlay && currentAct.dialogue && dialogueStep < currentAct.dialogue.length - 1 && (
                <div className="flex justify-center pt-1.5 pb-0.5 m-0">
                  <button
                    id="dialogue-next-speaker-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDialogueStep((prev) => prev + 1);
                    }}
                    aria-label="Next Dialogue Line"
                    title="Reveal Next Line"
                    className="p-2 rounded-full border-2 border-[#d4af37] bg-white text-[#d4af37] hover:bg-slate-100 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer animate-bounce"
                  >
                    <ChevronDown className="w-4 h-4 text-[#d4af37]" />
                  </button>
                </div>
              )}

              {/* Tactical Feedback Card: Explains why non-best choices were suboptimal (only after dialogue finishes) */}
              {isDialogueFinished && currentAct.type === 'choice' && currentAct.choiceType && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`my-2 p-3 rounded-2xl border select-none ${
                    currentAct.choiceType === 'Best'
                      ? 'border-[#d4af37] bg-amber-50/90 text-slate-900'
                      : 'border-amber-400/80 bg-amber-50/95 text-slate-900'
                  } shadow-sm`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-900 font-cinzel mb-1">
                    <span className="text-base">{CHOICE_FEEDBACK[currentAct.choiceType]?.icon || 'ℹ️'}</span>
                    <span className="text-amber-900 font-bold">{CHOICE_FEEDBACK[currentAct.choiceType]?.tag || 'Feedback'}:</span>
                    <span className="text-slate-900">{CHOICE_FEEDBACK[currentAct.choiceType]?.summary}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 font-sans leading-relaxed">
                    {CHOICE_FEEDBACK[currentAct.choiceType]?.explanation}
                  </p>
                  {hasChosenBest && currentAct.choiceType !== 'Best' && (
                    <div className="mt-2 pt-2 border-t border-amber-300/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-600 font-medium">Best path already achieved.</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const bestIdx = actItems.findIndex(
                            (item) => item.chapterNumber === currentAct.chapterNumber && item.choiceType === 'Best'
                          );
                          if (bestIdx >= 0) setCurrentIndex(bestIdx);
                        }}
                        className="text-xs font-bold text-amber-900 hover:text-amber-700 underline cursor-pointer"
                      >
                        Return to Best Choice →
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* 4 Choices Buttons Below (shown only after dialogue finishes) */}
              {isDialogueFinished && isChoiceOrDialogue && (
                <div className="pt-2.5 pb-2 border-t border-[#d4af37]/40 space-y-2 select-none">
                  {!hasChosenBest ? (
                    <>
                      <div className="text-center font-cinzel font-bold text-xs sm:text-sm text-slate-900 tracking-wider">
                        What do you choose? {unplayedChoices.length > 0 && `(${unplayedChoices.length} left)`}
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-1">
                        {unplayedChoices.map((choice) => (
                          <button
                            key={choice.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectChoice(choice.choiceType || '');
                            }}
                            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-[#d4af37] bg-white hover:bg-[#d4af37] text-slate-950 hover:text-black text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                          >
                            {choice.choiceTitle || choice.actTitle}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                        <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-900">
                          <Sparkles className="w-4 h-4 text-[#d4af37]" />
                          <span>Best Choice Completed!</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowOtherOptions((prev) => !prev);
                          }}
                          className="px-3 py-1 rounded-full border-2 border-[#d4af37] bg-white hover:bg-[#d4af37] text-slate-950 text-xs font-bold shadow transition-all cursor-pointer hover:scale-105"
                        >
                          {showOtherOptions ? 'Hide Alternative Options' : 'Explore Other Options & Feedback'}
                        </button>
                      </div>

                      {showOtherOptions && (
                        <div className="p-2.5 rounded-2xl bg-amber-50/80 border border-[#d4af37]/40 space-y-2 animate-fadeIn">
                          <p className="text-[11px] sm:text-xs text-slate-700 font-medium">
                            Explore alternative paths below to discover the outcomes and learn why they were suboptimal:
                          </p>
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            {orderedChapterChoices.map((choice) => {
                              const isCurrent = currentAct.choiceType === choice.choiceType;
                              return (
                                <button
                                  key={choice.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectChoice(choice.choiceType || '');
                                  }}
                                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    isCurrent
                                      ? 'bg-[#d4af37] text-slate-950 border-2 border-[#ffe599] shadow scale-105'
                                      : 'bg-white text-slate-900 border border-[#d4af37]/60 hover:border-[#d4af37] hover:bg-amber-100'
                                  }`}
                                >
                                  {choice.choiceTitle || choice.actTitle}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Replay & Languages Selector bar when Dialogue Act Finishes */}
              {renderCompletionControls(true)}

              {/* Invisible scroll target */}
              <div ref={dialogueEndRef} className="h-1" />
            </div>

          </div>
        ) : (
          /* B. NARRATIVE / CHARACTER ACT MODE (Fullscreen Width at Bottom, 1 Sentence at a Time) */
          <div className="w-full bg-transparent text-white animate-fadeIn m-0 p-0">
            <div
              ref={narrativeBoxRef}
              onClick={() => {
                if (!isAllSentencesRevealed) {
                  setVisibleSentenceCount((prev) => Math.min(sentences.length, prev + 1));
                }
              }}
              className="max-h-[46vh] sm:max-h-[44vh] overflow-y-auto scroll-smooth p-0 m-0 cursor-pointer select-none bg-transparent"
            >
              {/* Formatted Text (Appearing 1 sentence at a time) */}
              <div className="p-0 m-0 bg-transparent">
                {renderFormattedText()}
              </div>

              {/* Manual Next Sentence Arrow Indicator (shown only when autoplay is paused/off and not yet finished) */}
              {!isAutoPlay && !isAllSentencesRevealed && (
                <div className="flex justify-center pt-2 pb-1 m-0">
                  <button
                    id="narrative-next-sentence-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVisibleSentenceCount((prev) => Math.min(sentences.length, prev + 1));
                    }}
                    aria-label="Next Sentence"
                    title="Reveal Next Sentence"
                    className="p-2 rounded-full border-2 border-[#d4af37] bg-black/60 text-[#d4af37] hover:bg-black/90 shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer animate-bounce"
                  >
                    <ChevronDown className="w-5 h-5 text-[#d4af37]" />
                  </button>
                </div>
              )}

              {/* Bottom Replay & Languages Selector bar when Narrative / Character Act Finishes */}
              {renderCompletionControls(false)}
            </div>
          </div>
        )}
      </motion.div>

      {/* CELEBRATION MODAL ON BEST CHOICE */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md pointer-events-auto"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              className="relative max-w-md w-full rounded-3xl border-2 border-[#d4af37] bg-slate-950 p-6 text-center text-white shadow-[0_0_50px_rgba(212,175,55,0.7)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-tr from-[#d4af37] to-amber-200 flex items-center justify-center shadow-lg animate-bounce">
                <Sparkles className="w-9 h-9 text-slate-950" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-[#d4af37] mb-2">
                🌟 Best Choice Celebrated!
              </h3>
              <p className="text-sm text-slate-200 mb-5 font-sans leading-relaxed">
                You chose to organize a full evacuation! The district is safely evacuated, unlocking the next stage of your journey.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowCelebration(false);
                    setShowOtherOptions(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-full border border-[#d4af37] bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                >
                  Explore Other Options
                </button>
                <button
                  onClick={() => setShowCelebration(false)}
                  className="w-full sm:w-auto px-6 py-2 rounded-full border-2 border-[#d4af37] bg-[#d4af37] text-slate-950 font-bold hover:bg-amber-400 shadow-lg cursor-pointer transition-all hover:scale-105 text-xs sm:text-sm"
                >
                  Continue Adventure
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMMENTS DRAWER OVERLAY */}
      {showCommentsDrawer && (
        <CommentsDrawer
          chapterId={currentChapterId}
          chapterTitle={currentAct.chapterTitle || 'The Heart of Atlantis'}
          comments={currentComments}
          user={user}
          onClose={() => setShowCommentsDrawer(false)}
          onAddComment={handleAddComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
          darkMode={darkMode}
        />
      )}

    </div>
  );
};
