import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SafeYouTubeVideo,
  type YouTubeAdapter,
} from './SafeYouTubeVideo';
import {
  Language,
  UserProfile,
  SkillType,
  ChapterComment,
  Tale,
} from '../types';
import { ChoiceId, ChapterChoiceConfig, ChapterConfig, resolveChapterChoices } from '../lib/chapterTypes';
import { resolveChapterConfig, resolveChapterMeta } from '../lib/chapterConfigResolver';
import {
  getChoiceLocalizedTitle,
  getChoiceLocalizedSubtitle,
} from '../lib/choiceLocalization';
import { FlowStep, ChapterMeta, getNextFlowOutcome, getPrevFlowOutcome } from '../lib/chapterFlowMachine';
import {
  Act,
  ATLANTIS_VIDEO_IDS,
  ATLANTIS_VIDEO_URLS,
  normalizeLangCode,
  realmAtlantisJpg,
  extractYouTubeVideoId,
  getYouTubeImageUrl,
} from '../lib/assetRegistry';
import { applyAudioTrack } from '../lib/youtubeAudioTrack';
import { CommentsDrawer } from './CommentsDrawer';
import { FlagLanguageDropdown } from './FlagLanguageDropdown';
import { ReadAloudPromptText } from './ReadAloudPromptText';
import { isUserOver16 } from '../lib/googleAgeSignals';
import { isBestChoice, fireVictoryConfetti, playVictorySound } from '../lib/celebration';
import { t, Translations } from '../lib/i18n';
import {
  X as CloseIcon,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  MessageSquare,
  Sparkles,
  Film,
  Headphones,
  FastForward,
  Shuffle,
  Compass,
  Play,
  Pause,
} from 'lucide-react';

export const LANGUAGE_FULL_NAMES: Record<string, Record<Language, string>> = {
  EN: { EN: 'English', ES: 'Inglés', IT: 'Inglese', PT: 'Inglês', NL: 'Engels' },
  ES: { EN: 'Spanish', ES: 'Español', IT: 'Spagnolo', PT: 'Espanhol', NL: 'Spaans' },
  IT: { EN: 'Italian', ES: 'Italiano', IT: 'Italiano', PT: 'Italiano', NL: 'Italiaans' },
  PT: { EN: 'Portuguese', ES: 'Português', IT: 'Portoghese', PT: 'Português', NL: 'Portugees' },
  NL: { EN: 'Dutch', ES: 'Holandés', IT: 'Olandese', PT: 'Holandês', NL: 'Nederlands' },
};

export function getTaleWorldAndName(tale: Tale | undefined): { world: string; taleName: string } {
  if (!tale) return { world: 'Atlantis', taleName: '5crystals' };
  const realmId = tale.realmId || '';
  const taleId = tale.id || '';
  const taleTitle = (tale.title || '').toLowerCase();

  if (realmId === 'realm-work') {
    return { world: 'Leader', taleName: taleId === 'tale-job-quest' ? 'job_quest' : 'startup_winner' };
  }
  if (realmId === 'realm-marriage') {
    return { world: 'Marriage', taleName: taleId === 'tale-one-hart' ? 'one_hart' : 'pride_prejudice' };
  }
  if (realmId === 'realm-dad-mom') {
    return { world: 'DadMom', taleName: taleId === 'tale-baby' ? 'baby' : taleId === 'tale-teens' ? 'teens' : 'child' };
  }
  if (
    realmId === 'realm-eldorado' ||
    realmId === 'realm-el-dorado' ||
    realmId.includes('dorado') ||
    taleId === 'tale-the-torch' ||
    taleId === 'tale-golden-city' ||
    taleTitle.includes('torch')
  ) {
    return { world: 'ElDorado', taleName: 'the_torch' };
  }
  if (realmId === 'realm-futureland' || realmId === 'realm-future-land') {
    return { world: 'FutureLand', taleName: 'ai_horizon' };
  }
  return { world: 'Atlantis', taleName: '5crystals' };
}

// ChoiceId / ChapterChoiceConfig / ChapterConfig now live in lib/chapterTypes.ts;
// re-exported here so existing imports of `from './components/ChapterFlow'` keep working.
export type { ChoiceId, ChapterChoiceConfig, ChapterConfig };
export { resolveChapterChoices };

// getChoiceLocalizedTitle/Subtitle/Description now live in lib/choiceLocalization.ts
// (one shared lookup instead of three near-identical copies); re-exported for the same reason.
export { getChoiceLocalizedTitle, getChoiceLocalizedSubtitle };

export interface ChapterFlowProps {
  tale?: Tale;
  chapterConfigs?: ChapterConfig[];
  user?: UserProfile | null;
  userGender?: 'male' | 'female';
  currentLang?: Language;
  onLanguageChange?: (lang: Language) => void;
  onClose?: () => void;
  onEarnSkillPoint?: (skill: SkillType) => void;
  onEarnLanguagePoints?: (lang: Language, points: number) => void;
  onChooseBestChoice?: (skill: SkillType, lang: Language) => void;
  onReadAloudChoice?: (skill: SkillType, lang: Language) => void;
  onRecordView?: (chapterId: string, lang: Language) => void;
  commentsMap?: Record<string, ChapterComment[]>;
  onAddComment?: (chapterId: string, text: string) => void;
  onEditComment?: (chapterId: string, commentId: string, newText: string) => void;
  onDeleteComment?: (chapterId: string, commentId: string) => void;
  darkMode?: boolean;
  initialChapterId?: number;
}

// Default narrative configuration - single source of truth from ATLANTIS_VIDEO_IDS
export const DEFAULT_CHAPTER_CONFIGS: ChapterConfig[] = [
  {
    id: 0,
    skill: 'Win4All',
    act0VideoID: ATLANTIS_VIDEO_IDS['0:act0'],
    choices: [],
  },
  {
    id: 1,
    skill: 'Proactive',
    act0VideoID: ATLANTIS_VIDEO_IDS['1:act0'],
    choices: [ATLANTIS_VIDEO_IDS['1:choice1'], ATLANTIS_VIDEO_IDS['1:choice2']],
  },
  {
    id: 2,
    skill: 'Plan',
    choices: [],
  },
  {
    id: 3,
    skill: 'Win4All',
    act0VideoID: ATLANTIS_VIDEO_IDS['3:act0'],
    choices: [
      ATLANTIS_VIDEO_IDS['3:choice1'],
      ATLANTIS_VIDEO_IDS['3:choice2'],
      ATLANTIS_VIDEO_IDS['3:choice3'],
    ],
  },
];

const ALL_SUPPORTED_LANGUAGES: Language[] = ['EN', 'ES', 'NL', 'IT', 'PT'];

export const ChapterFlow: React.FC<ChapterFlowProps> = ({
  tale,
  chapterConfigs = DEFAULT_CHAPTER_CONFIGS,
  user,
  userGender,
  currentLang = 'EN',
  onLanguageChange,
  onClose,
  onEarnSkillPoint,
  onEarnLanguagePoints,
  onChooseBestChoice,
  onReadAloudChoice,
  onRecordView,
  commentsMap,
  onAddComment,
  onEditComment,
  onDeleteComment,
  darkMode = true,
  initialChapterId = 0,
}) => {
  // Resolve effective avatar gender ('male' or 'female')
  const effectiveGender: 'male' | 'female' =
    userGender ||
    user?.gender ||
    (user?.avatar_url?.toLowerCase().includes('male') && !user?.avatar_url?.toLowerCase().includes('female')
      ? 'male'
      : 'female');

  // Chapter tracking (0..N)
  const [currentChapterNumber, setCurrentChapterNumber] = useState<number>(initialChapterId);

  // Active step within the chapter — see lib/chapterFlowMachine.ts for the full
  // state diagram (act0 -> gender acts? -> choices? -> choice_act -> choice_feedback?).
  const [currentStep, setCurrentStep] = useState<FlowStep>('act0');
  const [selectedChoiceId, setSelectedChoiceId] = useState<ChoiceId>('choice1');

  // Audio & Subtitle language selectors
  const [selectedAudioLang, setSelectedAudioLang] = useState<Language>(currentLang);
  const [selectedSubtitleLang, setSelectedSubtitleLang] = useState<Language>(currentLang);

  // Synchronize audio and subtitle languages when parent currentLang prop updates
  useEffect(() => {
    if (currentLang) {
      setSelectedAudioLang((prev) => (prev !== currentLang ? currentLang : prev));
      setSelectedSubtitleLang((prev) => (prev !== currentLang ? currentLang : prev));
    }
  }, [currentLang]);

  // Video playback state
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);
  const ytMediaRef = useRef<YouTubeAdapter | null>(null);
  const ytCaptionTracksRef = useRef<any[]>([]);
  const ytCurrentTimeRef = useRef<number>(0);
  const [ytStartSeconds, setYtStartSeconds] = useState<number>(0);

  const sendYtCommand = useCallback((func: string, args: any[] = []) => {
    try {
      const engine = ytMediaRef.current?.engine as any;
      if (engine && typeof engine[func] === 'function') {
        engine[func](...args);
        return;
      }
      if (ytIframeRef.current?.contentWindow) {
        const targetOrigin = ytIframeRef.current.src
          ? new URL(ytIframeRef.current.src).origin
          : 'https://www.youtube.com';
        ytIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          targetOrigin
        );
      }
    } catch {}
  }, []);

  const syncYouTubeAudioTrack = useCallback(
    (langOverride?: Language) => {
      const player = ytMediaRef.current?.engine;
      if (!player) return;
      void applyAudioTrack(player, normalizeLangCode(langOverride || selectedAudioLang || 'EN'));
    },
    [selectedAudioLang]
  );

  const syncYouTubeSubtitles = useCallback(
    (langOverride?: Language) => {
      const activeLang = langOverride || selectedSubtitleLang || 'EN';
      const langCode = normalizeLangCode(activeLang);

      const player = ytMediaRef.current?.engine;
      if (player) {
        try {
          if (typeof player.loadModule === 'function') {
            player.loadModule('captions');
          }
          if (typeof player.setOption === 'function') {
            player.setOption('captions', 'track', { languageCode: langCode });
            player.setOption('cc', 'track', { languageCode: langCode });
            player.setOption('captions', 'fontSize', 1);
          }
        } catch {}
      }

      if (ytIframeRef.current?.contentWindow) {
        sendYtCommand('loadModule', ['captions']);
        sendYtCommand('setOption', ['captions', 'track', { languageCode: langCode }]);
        sendYtCommand('setOption', ['cc', 'track', { languageCode: langCode }]);
      }
    },
    [selectedSubtitleLang, sendYtCommand]
  );

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const isAutoPlay = true;
  const [isYtPlaying, setIsYtPlaying] = useState<boolean>(false);
  const [isVideoFinished, setIsVideoFinished] = useState<boolean>(false);
  const [isMediaNotFound, setIsMediaNotFound] = useState<boolean>(false);

  // Comments drawer
  const [showCommentsDrawer, setShowCommentsDrawer] = useState<boolean>(false);
  const canAccessComments = isUserOver16(user);

  // Choice page Star Wars crawl state
  const [feedbackParagraphs, setFeedbackParagraphs] = useState<string[]>([]);
  const [isCrawlFinished, setIsCrawlFinished] = useState<boolean>(false);
  const [feedbackFontSize, setFeedbackFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const lastAudioResyncAtRef = useRef<number>(0);
  const crawlContainerRef = useRef<HTMLDivElement | null>(null);
  const crawlSentinelRef = useRef<HTMLDivElement | null>(null);

  // Derive world and tale name for Supabase storage paths
  const { world: currentWorld, taleName: currentTaleName } = useMemo(() => {
    return getTaleWorldAndName(tale);
  }, [tale]);

  // Find the active chapter configuration (ElDorado defaults, generic 4-choice
  // fallback, etc. all live in lib/chapterConfigResolver.ts so the same rules
  // apply whether we're resolving the *current* chapter or a neighbouring one
  // during back/forward navigation).
  const currentChapterConfig = useMemo(() => {
    return resolveChapterConfig(currentChapterNumber, chapterConfigs, currentWorld, currentTaleName);
  }, [chapterConfigs, currentChapterNumber, currentWorld, currentTaleName]);

  const maxChapterId = useMemo(() => {
    if (!chapterConfigs || chapterConfigs.length === 0) return 1;
    return Math.max(...chapterConfigs.map((c) => c.id));
  }, [chapterConfigs]);

  const activeSkill: SkillType = currentChapterConfig?.skill || tale?.skill || 'Plan';

  // Track celebratory confetti and victory sound for feedback1 (feedback for best choice)
  const hasCelebratedFeedbackRef = useRef<string>('');

  useEffect(() => {
    if (currentStep === 'choice_feedback' && isBestChoice(selectedChoiceId)) {
      const celebrationKey = `${currentWorld}-${currentChapterNumber}-${selectedChoiceId}`;
      if (hasCelebratedFeedbackRef.current !== celebrationKey) {
        hasCelebratedFeedbackRef.current = celebrationKey;
        fireVictoryConfetti();
        playVictorySound();
      }
    }
  }, [currentStep, selectedChoiceId, currentChapterNumber, currentWorld]);

  const isFeedbackMode = currentStep === 'choice_feedback';
  const isVideoStep = currentStep !== 'choices' && currentStep !== 'choice_feedback';

  // When crawl is active, automatically show full text as soon as the last line appears in view
  useEffect(() => {
    if (currentStep !== 'choice_feedback' || isCrawlFinished) return;

    let animId: number;
    let finished = false;

    const checkSentinel = () => {
      if (finished) return;
      if (crawlSentinelRef.current && crawlContainerRef.current) {
        const sentinelRect = crawlSentinelRef.current.getBoundingClientRect();
        const containerRect = crawlContainerRef.current.getBoundingClientRect();

        // Check if the sentinel has entered the visible viewport of the container
        if (
          sentinelRect.top > 0 &&
          sentinelRect.bottom <= containerRect.bottom - 8
        ) {
          finished = true;
          setIsCrawlFinished(true);
          return;
        }
      }
      animId = requestAnimationFrame(checkSentinel);
    };

    animId = requestAnimationFrame(checkSentinel);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [currentStep, isCrawlFinished]);

  // Available choices in SHUFFLE order
  // "render buttons for each AVAILABLE choice (in shuffle order choice1, choice2, choice3, choice4)"
  // "If a chapter defines only choice1 and choice2 as available, render ONLY 2 buttons - omit unavailable choices."
  const resolvedChoices = useMemo(() => {
    return resolveChapterChoices(currentChapterConfig);
  }, [currentChapterConfig]);

  const shuffledAvailableChoices = useMemo(() => {
    const available = resolvedChoices.filter((c) => c.available);
    const array = [...available];
    // Deterministic or pseudo-random shuffle
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }, [resolvedChoices]);

  // Construct current Act definition based on flow step
  const currentActData: Act = useMemo(() => {
    if (currentChapterNumber === 0) {
      if (currentStep === 'act0') {
        return {
          chapter: 0,
          act: 'act0',
          type: 'narrative',
        };
      }
      if (currentStep === 'male_act') {
        return {
          chapter: 0,
          act: 'male_act',
          characterName: 'Elion',
          gender: 'male',
          type: 'character',
          videoUrl: currentWorld !== 'ElDorado' ? ATLANTIS_VIDEO_URLS['0:male_act'] : undefined,
        };
      }
      if (currentStep === 'female_act') {
        return {
          chapter: 0,
          act: 'female_act',
          characterName: 'Alethea',
          gender: 'female',
          type: 'character',
        };
      }
    }

    if (currentStep === 'choice_act' || currentStep === 'choice_feedback') {
      const choiceNum = selectedChoiceId.replace('choice', '') || '1';
      return {
        chapter: currentChapterNumber,
        act: `choice${choiceNum}`,
        type: 'choice',
      };
    }

    // Standard acts (act0) for Chapter 1..N
    return {
      chapter: currentChapterNumber,
      act: 'act0',
      type: 'dialogue',
    };
  }, [currentChapterNumber, currentStep, effectiveGender, currentChapterConfig, selectedChoiceId, currentLang]);

  // Resolve active YouTube video URL directly from single source of truth
  const currentVideoUrl = useMemo(() => {
    if (currentStep === 'choice_act') {
      const activeChoice = resolvedChoices.find((c) => c.id === selectedChoiceId);
      return (
        activeChoice?.videoUrl ||
        (activeChoice?.videoID ? `https://youtu.be/${activeChoice.videoID}` : undefined) ||
        ATLANTIS_VIDEO_URLS[`${currentChapterNumber}:${selectedChoiceId}`] ||
        ''
      );
    }
    if (currentStep === 'act0' || currentActData.act === 'act0') {
      return (
        (currentChapterConfig?.act0VideoID ? `https://youtu.be/${currentChapterConfig.act0VideoID}` : undefined) ||
        currentChapterConfig?.act0VideoUrl ||
        currentActData.videoUrl ||
        ATLANTIS_VIDEO_URLS[`${currentChapterNumber}:act0`] ||
        ''
      );
    }
    return currentActData.videoUrl || ATLANTIS_VIDEO_URLS[`${currentChapterNumber}:${currentActData.act}`] || '';
  }, [currentStep, resolvedChoices, selectedChoiceId, currentChapterNumber, currentChapterConfig, currentActData]);

  const currentYouTubeId = useMemo(() => {
    return extractYouTubeVideoId(currentVideoUrl);
  }, [currentVideoUrl]);

  const isComingSoon = isVideoStep && (!currentYouTubeId || isMediaNotFound);
  const isVideoPlaying = isVideoStep && !isComingSoon && isYtPlaying && !isVideoFinished;

  // Reset media when step, chapter, or choice changes
  useEffect(() => {
    setIsMediaNotFound(false);
    setIsVideoFinished(false);
    setIsYtPlaying(false);
    setYtStartSeconds(0);
    ytCurrentTimeRef.current = 0;
  }, [currentChapterNumber, currentStep, selectedChoiceId]);

  const handleTimeUpdate = (curr: number) => {
    ytCurrentTimeRef.current = curr;
  };

  const handleVideoError = () => {
    setIsMediaNotFound(true);
  };

  // Synchronize YouTube video autoplay, play/pause, mute/volume, and subtitles
  useEffect(() => {
    setIsYtPlaying(false);
    ytCaptionTracksRef.current = [];
  }, [currentYouTubeId]);

  useEffect(() => {
    if (currentYouTubeId) {
      syncYouTubeSubtitles();
    }
  }, [currentYouTubeId, syncYouTubeSubtitles]);

  useEffect(() => {
    if (currentYouTubeId) {
      if (isAutoPlay) {
        try {
          const p = ytMediaRef.current?.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } catch {}
        sendYtCommand('playVideo');
      } else {
        setIsYtPlaying(false);
        ytMediaRef.current?.pause();
        sendYtCommand('pauseVideo');
      }
    }
  }, [isAutoPlay, currentYouTubeId, sendYtCommand]);

  useEffect(() => {
    if (currentYouTubeId) {
      if (ytMediaRef.current) {
        ytMediaRef.current.muted = isMuted;
        ytMediaRef.current.volume = 1;
      }
      if (isMuted) {
        sendYtCommand('mute');
        sendYtCommand('setVolume', [0]);
      } else {
        sendYtCommand('unMute');
        sendYtCommand('setVolume', [100]);
      }
    }
  }, [isMuted, currentYouTubeId, sendYtCommand]);

  // Replay
  const handleReplay = () => {
    setIsVideoFinished(false);
    setYtStartSeconds(0);
    ytCurrentTimeRef.current = 0;
    if (currentYouTubeId) {
      if (ytMediaRef.current) {
        ytMediaRef.current.currentTime = 0;
        try {
          const p = ytMediaRef.current.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } catch {}
      }
      sendYtCommand('seekTo', [0, true]);
      sendYtCommand('playVideo');
    }
  };

  // Skip playback
  const handleSkipMedia = () => {
    if (currentYouTubeId) {
      ytMediaRef.current?.pause();
      sendYtCommand('pauseVideo');
      sendYtCommand('seekTo', [9999, true]);
    }
    setIsVideoFinished(true);
  };

  const advanceChapterOrClose = useCallback(() => {
    const nextChapterId = currentChapterNumber + 1;
    const nextExists = chapterConfigs.some((cfg) => cfg.id === nextChapterId) || nextChapterId <= maxChapterId;
    if (nextExists) {
      setCurrentChapterNumber(nextChapterId);
      setCurrentStep('act0');
      setIsVideoFinished(false);
      setIsYtPlaying(false);
    } else {
      if (onClose) onClose();
    }
  }, [currentChapterNumber, chapterConfigs, maxChapterId, onClose]);

  /**
   * Primary FLOW TRANSITION LOGIC — see lib/chapterFlowMachine.ts for the full
   * state diagram and lib/chapterConfigResolver.ts for how hasGenderActs /
   * hasChoices are resolved per chapter. Neither of those files knows
   * anything about i18n or component state; this is just the glue that
   * applies their pure outcomes to React state.
   */
  const currentChapterMeta: ChapterMeta = useMemo(
    () => resolveChapterMeta(currentChapterNumber, chapterConfigs, currentWorld, currentTaleName),
    [chapterConfigs, currentChapterNumber, currentWorld, currentTaleName]
  );

  const getChapterMeta = useCallback(
    (chapterNumber: number): ChapterMeta =>
      resolveChapterMeta(chapterNumber, chapterConfigs, currentWorld, currentTaleName),
    [chapterConfigs, currentWorld, currentTaleName]
  );

  const applyFlowOutcome = (outcome: ReturnType<typeof getNextFlowOutcome>) => {
    switch (outcome.kind) {
      case 'goto':
        setCurrentChapterNumber(outcome.position.chapterNumber);
        setCurrentStep(outcome.position.step);
        return;
      case 'select-first-choice': {
        const firstAvail = resolvedChoices.find((c) => c.available) || resolvedChoices[0];
        if (firstAvail) handleSelectChoice(firstAvail.id);
        return;
      }
      case 'advance-chapter':
        advanceChapterOrClose();
        return;
      case 'close':
        if (onClose) onClose();
        return;
      case 'noop':
      default:
        return;
    }
  };

  const goToNext = () => {
    const isCurrentBestChoice = isBestChoice(selectedChoiceId);
    const outcome = getNextFlowOutcome(
      { chapterNumber: currentChapterNumber, step: currentStep },
      effectiveGender,
      currentChapterMeta,
      feedbackParagraphs.length > 0,
      isCurrentBestChoice
    );
    applyFlowOutcome(outcome);
  };

  const goToPrev = () => {
    const outcome = getPrevFlowOutcome(
      { chapterNumber: currentChapterNumber, step: currentStep },
      effectiveGender,
      currentChapterMeta,
      getChapterMeta
    );
    applyFlowOutcome(outcome);
  };

  // Choice selection handler: plays the chosen act video and audio
  const handleSelectChoice = (choiceId: ChoiceId) => {
    hasCelebratedFeedbackRef.current = '';
    setSelectedChoiceId(choiceId);
    setIsVideoFinished(false);
    setIsMediaNotFound(false);
    setFeedbackParagraphs([]);
    setCurrentStep('choice_act');

    // Record best choice stat callback
    if (isBestChoice(choiceId)) {
      const activeSkill: SkillType = currentChapterConfig?.skill || tale?.skill || 'Plan';
      if (onChooseBestChoice) {
        onChooseBestChoice(activeSkill, selectedAudioLang || currentLang);
      }
    }
  };

  // Language selectors
  const handleAudioLanguageSelected = (newLang: Language) => {
    setSelectedAudioLang(newLang);
    const player = ytMediaRef.current?.engine;
    if (player) {
      void applyAudioTrack(player, normalizeLangCode(newLang), { force: true });
    }
    if (onLanguageChange) onLanguageChange(newLang);
  };

  const handleSubtitleLanguageSelected = (newLang: Language) => {
    setSelectedSubtitleLang(newLang);
    if (currentYouTubeId) {
      syncYouTubeSubtitles(newLang);
    }
  };

  const handlePrevChapterNav = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentChapterNumber > 1) {
      setCurrentChapterNumber(currentChapterNumber - 1);
      setCurrentStep('act0');
      setIsVideoFinished(false);
      setIsYtPlaying(false);
    } else {
      goToPrev();
    }
  };

  const handleNextChapterNav = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextChapterId = currentChapterNumber + 1;
    const nextExists = chapterConfigs.some((cfg) => cfg.id === nextChapterId) || nextChapterId <= maxChapterId;
    if (nextExists) {
      setCurrentChapterNumber(nextChapterId);
      setCurrentStep('act0');
      setIsVideoFinished(false);
      setIsYtPlaying(false);
    } else {
      goToNext();
    }
  };

  const handleVideoEnded = useCallback(() => {
    setIsVideoFinished(true);
    setIsYtPlaying(false);
    setTimeout(() => {
      advanceChapterOrClose();
    }, 1000);
  }, [advanceChapterOrClose]);

  // Listen to postMessage events from YouTube Iframe
  useEffect(() => {
    if (!currentYouTubeId) return;

    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin !== 'https://www.youtube.com' &&
        event.origin !== 'https://www.youtube-nocookie.com'
      ) {
        return;
      }

      try {
        const raw = event.data;
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!data) return;

        if (data.event === 'onReady' || data.event === 'initialDelivery') {
          if (isAutoPlay) {
            sendYtCommand('playVideo');
          } else {
            sendYtCommand('pauseVideo');
          }
          if (isMuted) {
            sendYtCommand('mute');
            sendYtCommand('setVolume', [0]);
          } else {
            sendYtCommand('unMute');
            sendYtCommand('setVolume', [100]);
          }
          syncYouTubeAudioTrack();
          syncYouTubeSubtitles();
        }

        if (data.event === 'apiInfoDelivery' && data.info?.captions?.tracklist) {
          const tracklist = data.info.captions.tracklist;
          if (Array.isArray(tracklist) && tracklist.length > 0) {
            ytCaptionTracksRef.current = tracklist;
            syncYouTubeSubtitles();
          }
        }

        if (data.info?.captionTracks && Array.isArray(data.info.captionTracks) && data.info.captionTracks.length > 0) {
          ytCaptionTracksRef.current = data.info.captionTracks;
          syncYouTubeSubtitles();
        }

        if (
          (data.event === 'onStateChange' && data.info === 0) ||
          (data.event === 'infoDelivery' && data.info && data.info.playerState === 0)
        ) {
          setIsYtPlaying(false);
          handleVideoEnded();
        } else if (
          (data.event === 'onStateChange' && data.info === 1) ||
          (data.event === 'infoDelivery' && data.info && data.info.playerState === 1)
        ) {
          if (!isAutoPlay) {
            setIsYtPlaying(false);
            sendYtCommand('pauseVideo');
          } else {
            setIsYtPlaying((prev) => {
              if (!prev) {
                syncYouTubeSubtitles();
              }
              return true;
            });
          }
        } else if (
          (data.event === 'onStateChange' && (data.info === 2 || data.info === -1 || data.info === 5)) ||
          (data.event === 'infoDelivery' &&
            data.info &&
            (data.info.playerState === 2 || data.info.playerState === -1 || data.info.playerState === 5))
        ) {
          setIsYtPlaying(false);
        } else if (data.event === 'infoDelivery' && data.info && typeof data.info.currentTime === 'number') {
          ytCurrentTimeRef.current = data.info.currentTime;
          handleTimeUpdate(data.info.currentTime);
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    const interval = setInterval(() => {
      if (ytIframeRef.current?.contentWindow) {
        const targetOrigin = ytIframeRef.current.src
          ? new URL(ytIframeRef.current.src).origin
          : 'https://www.youtube.com';
        ytIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'listening' }),
          targetOrigin
        );
      }
    }, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
  }, [currentYouTubeId, isAutoPlay, isMuted, handleVideoEnded]);

  // Clean chapter / act identifier for comments
  const chapterCommentId = useMemo(() => {
    return `${tale?.id || 'atlantis'}-ch${currentChapterNumber}-${currentStep}-${selectedChoiceId}`;
  }, [tale, currentChapterNumber, currentStep, selectedChoiceId]);

  const currentComments = (commentsMap && commentsMap[chapterCommentId]) || [];

  return (
    <div
      id="act-fullscreen-page"
      className={`fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] overflow-hidden select-none ${
        darkMode ? 'bg-black text-slate-100' : 'bg-[#fcfbf9] text-stone-900'
      }`}
    >
      {/* 1. TOP HEADER OVERLAY: Completely transparent background, cinematic buttons (hidden while video is playing) */}
      {!isVideoPlaying && (
        <div className="absolute top-0 left-0 right-0 z-30 w-full px-3 sm:px-6 pt-3 sm:pt-4 pb-2 flex items-center justify-between pointer-events-auto bg-transparent">
          {/* Left: Close Button & Story Plaque */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="act-close-button"
              onClick={onClose}
              className={`p-1.5 sm:p-2 transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center bg-transparent border-0 rounded-none ${
                darkMode
                  ? 'text-[#d4af37] hover:text-[#ffe81f] drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]'
                  : 'text-amber-800 hover:text-amber-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]'
              }`}
              title={t('closeAct', currentLang)}
              aria-label={t('closeAct', currentLang)}
            >
              <CloseIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-colors" />
            </button>

            {/* Quick Chapter Selector Pills */}
            <div className="flex items-center gap-1.5 ml-1">
              {chapterConfigs.map((cfg) => (
                <button
                  key={`ch-pill-${cfg.id}`}
                  onClick={() => {
                    setCurrentChapterNumber(cfg.id);
                    setCurrentStep('act0');
                    setIsVideoFinished(false);
                  }}
                  className={`px-2 py-0.5 text-[10px] sm:text-xs font-mono font-bold rounded-md transition-all cursor-pointer ${
                    currentChapterNumber === cfg.id
                      ? 'bg-[#d4af37] text-slate-950 shadow-sm ring-1 ring-[#ffe81f]'
                      : 'bg-black/50 text-amber-200/80 hover:text-white border border-[#d4af37]/40 hover:border-[#ffe81f]'
                  }`}
                  title={`Chapter ${cfg.id}${cfg.skill ? ` (${t((`skill_${cfg.skill}`) as keyof Translations, currentLang)})` : ''}`}
                  aria-label={`Jump to Chapter ${cfg.id}`}
                >
                  Ch {cfg.id}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Audio / Voice & Sound Controls */}
          {!isFeedbackMode && (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sound Toggle */}
              <button
                id="act-sound-toggle"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-1.5 sm:p-2 transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center bg-transparent border-0 rounded-none ${
                  darkMode
                    ? 'text-[#d4af37] hover:text-[#ffe81f] drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]'
                    : 'text-amber-800 hover:text-amber-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]'
                }`}
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isMuted ? (
                  <VolumeX className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-stone-400 hover:text-stone-700'} transition-colors`} />
                ) : (
                  <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 transition-colors" />
                )}
              </button>

              {/* Top Audio Dub Language Selector */}
              <div className="flex items-center gap-1.5" title="Audio Dub Language">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-amber-200/90 hidden xs:inline-block">
                  AUDIO:
                </span>
                <FlagLanguageDropdown
                  id="act-top-audio-selector"
                  type="audio"
                  selectedLang={selectedAudioLang}
                  onSelectLang={handleAudioLanguageSelected}
                  darkMode={darkMode}
                  cinematic={true}
                  tooltip="Audio Dub"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. MAIN VIEWPORT AREA: Full Screen Edge-to-Edge */}
      <div
        id="act-fullscreen-media-box"
        className={`absolute inset-0 w-full h-full ${
          currentStep === 'choices' || currentStep === 'choice_feedback'
            ? 'overflow-y-auto'
            : 'overflow-hidden'
        } flex items-start sm:items-center justify-center z-0`}
      >
        {/* A. CHAPTERS 2..N: CHOICES SELECTION SCREEN */}
        {currentStep === 'choices' && (
          <div
            id="chapter-choices-container"
            className="relative z-20 w-full max-w-4xl px-4 py-16 sm:py-10 my-auto flex flex-col items-center justify-center animate-in fade-in duration-300"
          >
            {/* Ambient Background Glow */}
            <div
              className={`absolute inset-0 -z-10 ${
                darkMode
                  ? 'bg-radial from-amber-500/10 via-transparent to-transparent'
                  : 'bg-radial from-amber-400/25 via-amber-200/15 to-transparent'
              } blur-2xl pointer-events-none`}
            />

            <div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
              {currentChapterConfig?.skill && (
                <span className="px-2.5 py-0.5 text-[10px] rounded-full uppercase tracking-wider font-extrabold bg-amber-400/20 border border-amber-400/60 text-amber-300 shadow-xs">
                  Skill: {t((`skill_${currentChapterConfig.skill}`) as keyof Translations, currentLang)}
                </span>
              )}
            </div>

            <h2
              className={`text-xl sm:text-3xl md:text-4xl font-cinzel font-bold text-center mb-4 sm:mb-6 ${
                darkMode
                  ? 'gold-gradient-text drop-shadow-md'
                  : 'text-amber-950 drop-shadow-sm'
              }`}
            >
              { t('chooseYourPath', currentLang)}
            </h2>

            {/* Shuffled Available Choice Buttons */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {shuffledAvailableChoices.map((choice, idx) => {
                const choiceImgUrl =
                  choice.imageUrl ||
                  (choice.videoID ? getYouTubeImageUrl(choice.videoID) : '') ||
                  realmAtlantisJpg;

                return (
                  <button
                    key={choice.id}
                    id={`choice-btn-${choice.id}`}
                    onClick={() => handleSelectChoice(choice.id)}
                    type="button"
                    className="group relative p-2 sm:p-2.5 rounded-2xl border-2 border-[#d4af37]/70 hover:border-[#ffe81f] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.7)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.45)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-left cursor-pointer flex flex-col justify-between bg-black/80 backdrop-blur-xl"
                  >
                    {/* Visual Image Viewport */}
                    <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-slate-950">
                      <img
                        src={choiceImgUrl}
                        alt={`Choice ${idx + 1}`}
                        crossOrigin="anonymous"
                        loading="eager"
                        className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108 ${
                          darkMode ? '' : 'brightness-110 contrast-[1.02]'
                        }`}
                        onError={(e) => {
                          const imgEl = e.currentTarget;
                          if (!imgEl.dataset.fallbackApplied) {
                            imgEl.dataset.fallbackApplied = 'true';
                            imgEl.src = realmAtlantisJpg;
                          }
                        }}
                      />

                      {/* Top & Bottom Cinematic Gradient Overlays */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-t ${
                          darkMode ? 'from-black/90 via-black/30' : 'from-black/75 via-black/15'
                        } to-transparent pointer-events-none`}
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-b ${
                          darkMode ? 'from-black/60' : 'from-black/30'
                        } via-transparent to-transparent pointer-events-none`}
                      />

                      {/* Top Bar: Action Arrow Indicator */}
                      <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 flex items-center justify-end z-10 pointer-events-none">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 border border-[#d4af37]/80 text-[#ffe81f] flex items-center justify-center backdrop-blur-md group-hover:bg-[#d4af37] group-hover:text-black transition-colors shadow-md">
                          <span className="text-xs sm:text-sm font-bold group-hover:translate-x-0.5 transition-transform">
                            →
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        )}

        {/* B. CHOICE FEEDBACK: STAR WARS INTRO EFFECT & READ ALOUD SCREEN */}
        {currentStep === 'choice_feedback' && feedbackParagraphs.length > 0 && (
          <div
            id="choice-feedback-starwars-view"
            className="relative z-20 w-full h-full flex flex-col items-center justify-center p-3 sm:p-6"
          >
            {/* Thematic Adaptive Backdrop for high readability */}
            <div
              className={`absolute inset-0 -z-10 transition-colors duration-300 ${
                darkMode
                  ? 'bg-black/95 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/60 via-slate-950 to-black'
                  : 'bg-[#f7f5f0] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-100/50 via-[#f4f0e6] to-[#ebe3d3]'
              }`}
            />

            {!isCrawlFinished ? (
              /* STAR WARS 3D PERSPECTIVE INTRO EFFECT WITH DUAL-MODE CONTRAST */
              <div
                ref={crawlContainerRef}
                className="relative w-full h-[70vh] sm:h-[76vh] flex flex-col items-center justify-center overflow-hidden [perspective:420px] select-none"
              >
                {/* Skip / Fast Forward Button */}
                <button
                  id="starwars-skip-crawl-btn"
                  onClick={() => setIsCrawlFinished(true)}
                  className={`absolute top-2 right-3 sm:right-6 z-40 px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    darkMode
                      ? 'border-[#d4af37]/70 bg-slate-950/90 hover:bg-[#d4af37] text-amber-200 hover:text-slate-950'
                      : 'border-amber-600/50 bg-white/95 hover:bg-amber-500 text-amber-950 hover:text-white'
                  }`}
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>Skip Intro & Read</span>
                </button>

                {/* 3D Crawling Text Block */}
                <div
                  className="absolute w-[92%] sm:w-[80%] max-w-2xl text-center origin-[50%_100%] [transform:rotateX(25deg)] animate-starwars-crawl pointer-events-none"
                  onAnimationEnd={() => setIsCrawlFinished(true)}
                >
                  {isBestChoice(selectedChoiceId) && (
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/25 border border-amber-400/80 text-[#ffe81f] font-bold text-xs uppercase tracking-wider mb-2 drop-shadow-md">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t('bestChoiceTitle', currentLang)}</span>
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}

                  <div
                    className={`space-y-6 text-base sm:text-xl font-cinzel font-semibold leading-relaxed ${
                      darkMode
                        ? 'text-[#ffe81f] drop-shadow-[0_0_8px_rgba(255,232,31,0.5)]'
                        : 'text-stone-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]'
                    }`}
                  >
                    {feedbackParagraphs.map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                    {/* Sentinel placed after last line to detect when text appears and reveal read aloud page */}
                    <div ref={crawlSentinelRef} className="h-1 w-full" />
                  </div>
                </div>
              </div>
            ) : (
              /* FEEDBACK READ ALOUD MODE:
                 - Choice title as heading (Point 3)
                 - Read aloud button placed near the shortened prompt text instead of path icon (Points 7 & 9)
                 - Real-time spoken transcript feedback
                 - NO numbers, NO dividers, all feedback text together (Point 5)
                 - NO borders or box divs around the text (Point 6)
                 - Removed "I have read it aloud (Claim points)" (Point 8)
                 - Removed lang:EN (Point 10)
                 - Removed finish/next chapter text label, only '>' button (Point 10)
                 - Font size adjustment (A, A+, A++) at the bottom near the language selector (Point 11)
              */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="relative z-30 w-full max-w-3xl flex flex-col p-4 sm:p-6 select-text"
              >
                {/* Header: Best Choice Badge + Read Aloud prompt with Read Aloud button near text */}
                <div className="mb-4">
                  {isBestChoice(selectedChoiceId) && (
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/70 text-amber-300 font-bold text-xs uppercase tracking-wider shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        {t('bestChoiceTitle', currentLang)}
                      </span>
                    </div>
                  )}

                  {/* Read Aloud prompt component */}
                  <ReadAloudPromptText
                    key={`${currentChapterNumber}-${selectedChoiceId}-${selectedAudioLang || currentLang}`}
                    feedbackParagraphs={feedbackParagraphs}
                    activeSkill={activeSkill}
                    selectedAudioLang={selectedAudioLang}
                    currentLang={currentLang}
                    darkMode={darkMode}
                    onReadAloudChoice={onReadAloudChoice}
                    onChooseBestChoice={onChooseBestChoice}
                    onEarnLanguagePoints={onEarnLanguagePoints}
                    onEarnSkillPoint={onEarnSkillPoint}
                  />
                </div>

                {/* All Feedback Text Displayed Together - NO borders, NO container divs, NO numbers */}
                <div
                  id="choice-feedback-full-text"
                  className={`flex-1 overflow-y-auto pr-2 my-2 max-h-[50vh] sm:max-h-[58vh] custom-scrollbar space-y-4 ${
                    darkMode ? 'text-slate-100' : 'text-stone-900 font-normal sm:font-medium'
                  }`}
                >
                  {feedbackParagraphs.map((para, i) => (
                    <p
                      key={i}
                      style={{
                        fontSize:
                          feedbackFontSize === 'normal'
                            ? '0.9375rem'
                            : feedbackFontSize === 'large'
                            ? '1.1875rem'
                            : '1.45rem',
                        lineHeight:
                          feedbackFontSize === 'normal'
                            ? '1.65'
                            : feedbackFontSize === 'large'
                            ? '1.75'
                            : '1.85',
                      }}
                      className={`transition-all duration-150 ${
                        feedbackFontSize === 'normal'
                          ? '!text-sm sm:!text-base'
                          : feedbackFontSize === 'large'
                          ? '!text-base sm:!text-lg md:!text-xl font-medium'
                          : '!text-lg sm:!text-xl md:!text-2xl font-medium'
                      }`}
                    >
                      {para}
                    </p>
                  ))}
                </div>

                {/* Bottom Bar: Font size (A, A+, A++) at bottom-left, Language Selector & `>` at bottom-right */}
                <div className="mt-4 pt-2 flex items-center justify-between gap-4">
                  {/* Bottom Left: Font size adjustment buttons */}
                  <div
                    className={`flex items-center rounded-lg border p-0.5 text-xs font-semibold ${
                      darkMode
                        ? 'bg-slate-900 border-slate-700 text-slate-300'
                        : 'bg-amber-50/80 border-amber-200 text-slate-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setFeedbackFontSize('normal')}
                      className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                        feedbackFontSize === 'normal'
                          ? darkMode
                            ? 'bg-amber-400/25 text-amber-200 font-bold'
                            : 'bg-white text-amber-950 font-bold shadow-xs'
                          : 'hover:opacity-80'
                      }`}
                      title="Standard Text Size"
                    >
                      A
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackFontSize('large')}
                      className={`px-2.5 py-1 rounded text-sm transition-colors cursor-pointer ${
                        feedbackFontSize === 'large'
                          ? darkMode
                            ? 'bg-amber-400/25 text-amber-200 font-bold'
                            : 'bg-white text-amber-950 font-bold shadow-xs'
                          : 'hover:opacity-80'
                      }`}
                      title="Large Text Size"
                    >
                      A+
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackFontSize('xlarge')}
                      className={`px-2.5 py-1 rounded text-base transition-colors cursor-pointer ${
                        feedbackFontSize === 'xlarge'
                          ? darkMode
                            ? 'bg-amber-400/25 text-amber-200 font-bold'
                            : 'bg-white text-amber-950 font-bold shadow-xs'
                          : 'hover:opacity-80'
                      }`}
                      title="Extra Large Text Size"
                    >
                      A++
                    </button>
                  </div>

                  {/* Bottom Right: Back to Choices Button, and Next Action Button */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                    {/* Back to Choices Button */}
                    <button
                      id="feedback-back-to-choices-btn"
                      onClick={() => {
                        setCurrentStep('choices');
                      }}
                      type="button"
                      className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                        darkMode
                          ? 'bg-slate-900/80 border-[#d4af37]/60 text-amber-200 hover:text-[#ffe81f] hover:border-[#ffe81f]'
                          : 'bg-white/90 border-amber-300 text-amber-950 hover:bg-amber-100 shadow-xs'
                      }`}
                      title={t('backToChoices', currentLang)}
                      aria-label={t('backToChoices', currentLang)}
                    >
                      <Compass className="w-4 h-4" />
                      <span>{t('backToChoices', currentLang)}</span>
                    </button>

                    {/* Next Chapter (for best choice) or Forward button */}
                    {isBestChoice(selectedChoiceId) ? (
                      <button
                        id="feedback-next-chapter-action-btn"
                        onClick={goToNext}
                        type="button"
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37] via-amber-400 to-[#ffe81f] text-slate-950 font-bold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-[0_4px_16px_rgba(212,175,55,0.4)]"
                        title={t('nextChapter', currentLang)}
                        aria-label={t('nextChapter', currentLang)}
                      >
                        <span>{t('nextChapter', currentLang)}</span>
                        <ChevronRight className="w-4 h-4 stroke-[3]" />
                      </button>
                    ) : (
                      <button
                        id="feedback-next-chapter-action-btn"
                        onClick={goToNext}
                        type="button"
                        className={`p-2 transition-all hover:scale-125 active:scale-95 cursor-pointer flex items-center justify-center bg-transparent border-0 rounded-none ${
                          darkMode
                            ? 'text-[#d4af37] hover:text-[#ffe81f] drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]'
                            : 'text-amber-800 hover:text-amber-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]'
                        }`}
                        title={t('chooseYourPath', currentLang)}
                        aria-label={t('chooseYourPath', currentLang)}
                      >
                        <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 transition-colors stroke-[2.5]" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* C. ACT VIDEO MEDIA (Only YouTube videos; if none exists, Coming Soon) */}
        {currentStep !== 'choices' && currentStep !== 'choice_feedback' && (
          <div className="relative w-full h-full flex items-start sm:items-center justify-center overflow-hidden bg-black">
            {currentYouTubeId && !isMediaNotFound ? (
              <div
                className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black select-none"
                style={{ overflow: 'hidden' }}
              >
                <div
                  className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden transition-opacity duration-200 flex items-center justify-center ${
                    isVideoFinished ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <SafeYouTubeVideo
                    instanceKey={`yt-${currentYouTubeId}`}
                    ref={ytIframeRef}
                    mediaRef={ytMediaRef}
                    src={currentVideoUrl}
                    audioLang={selectedAudioLang}
                    subtitleLang={selectedSubtitleLang}
                    autoplay={true}
                    defaultMuted={false}
                    muted={isMuted}
                    controls={false}
                    playsInline={true}
                    className="w-full h-full border-0 pointer-events-none select-none"
                    iframeClassName="w-full h-full border-0 pointer-events-none select-none"
                    style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
                    source={{
                      src: currentVideoUrl,
                      engine: {
                        youtube: {
                          controls: 0,
                          modestbranding: 1,
                          showinfo: 0,
                          cc_load_policy: 1,
                          cc_lang_pref: normalizeLangCode(selectedSubtitleLang),
                          hl: normalizeLangCode(selectedAudioLang),
                          disablekb: 1,
                          fs: 0,
                          rel: 0,
                          iv_load_policy: 3,
                          ...(ytStartSeconds > 0 ? { start: ytStartSeconds } : {}),
                          origin: typeof window !== 'undefined' ? window.location.origin : undefined,
                          widget_referrer: typeof window !== 'undefined' ? window.location.origin : undefined,
                        },
                      },
                    }}
                    onLoadedMetadata={(e) => {
                      e.currentTarget.muted = isMuted;
                      e.currentTarget.volume = 1;
                      try {
                        const p = e.currentTarget?.play?.();
                        if (p && typeof p.catch === 'function') p.catch(() => {});
                      } catch {}
                      syncYouTubeAudioTrack();
                      syncYouTubeSubtitles();
                    }}
                    onPlay={() => {
                      setIsYtPlaying(true);
                      syncYouTubeAudioTrack();
                      syncYouTubeSubtitles();
                    }}
                    onPlaying={() => {
                      setIsYtPlaying(true);
                    }}
                    onPause={() => {
                      setIsYtPlaying(false);
                    }}
                    onTimeUpdate={(e) => {
                      const curr = e.currentTarget.currentTime;
                      ytCurrentTimeRef.current = curr;
                      handleTimeUpdate(curr);
                    }}
                    onEnded={() => {
                      setIsYtPlaying(false);
                      handleVideoEnded();
                    }}
                  />
                </div>

               
                {/* Seamless overlay that intercepts taps/clicks to toggle play/pause and renders a Gold Circle button when paused */}
                <div
                  className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (isYtPlaying) {
                      setIsYtPlaying(false);
                      ytMediaRef.current?.pause();
                      sendYtCommand('pauseVideo');
                    } else {
                      setIsYtPlaying(true);
                      try {
                        const p = ytMediaRef.current?.play();
                        if (p && typeof p.catch === 'function') p.catch(() => {});
                      } catch {}
                      sendYtCommand('playVideo');
                    }
                  }}
                >
                  {!isYtPlaying && !isVideoFinished && (
                    <div
                      id="youtube-gold-pause-circle"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#ffe81f] via-[#d4af37] to-[#9a7209] border-2 border-[#fff6b3] shadow-[0_4px_20px_rgba(0,0,0,0.75),0_0_20px_rgba(212,175,55,0.7),inset_0_1px_4px_rgba(255,255,255,0.65)] flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95"
                    >
                      <Play className="w-6 h-6 sm:w-8 sm:h-8 text-slate-950 fill-slate-950 ml-0.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Coming Soon Screen when no YouTube video exists */
              <div className="flex flex-col items-center justify-center gap-3 p-6 text-center z-10 animate-fadeIn">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900/90 border-2 border-[#d4af37] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)] mb-2">
                  <Film className="w-8 h-8 sm:w-10 sm:h-10 text-[#d4af37]" />
                </div>
                <div className="px-6 py-2 rounded-full border-2 border-[#d4af37] bg-slate-950 text-[#d4af37] font-bold text-base sm:text-xl tracking-wider font-cinzel shadow-2xl">
                  {t('comingSoon', selectedAudioLang || currentLang)}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-sm leading-relaxed mt-1 font-sans">
                  {t('comingSoonDesc', selectedAudioLang || currentLang, { title: currentActData.characterName || currentChapterConfig?.title || `Chapter ${currentChapterNumber}` })}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. CENTER LEFT: PREVIOUS CHAPTER `<` BUTTON (Cinematic floating chevron, visible when paused) */}
      {!isFeedbackMode && !isVideoPlaying && (
        <button
          id="act-prev-button"
          onClick={handlePrevChapterNav}
          aria-label="Previous Chapter"
          className={`absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 transition-all hover:scale-125 active:scale-95 flex items-center justify-center cursor-pointer group bg-transparent border-0 rounded-none ${
            darkMode
              ? 'text-[#d4af37] hover:text-[#ffe81f] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]'
              : 'text-amber-800 hover:text-amber-950 drop-shadow-[0_1px_3px_rgba(255,255,255,0.8)]'
          }`}
          title="Previous Chapter"
        >
          <ChevronLeft className="w-8 h-8 sm:w-12 sm:h-12 transition-transform group-hover:-translate-x-1 stroke-[2.5]" />
        </button>
      )}

      {/* 4. CENTER RIGHT: NEXT CHAPTER `>` BUTTON (Cinematic floating chevron, visible when paused) */}
      {!isFeedbackMode && currentStep !== 'choices' && !isVideoPlaying && (
        <button
          id="act-next-button"
          onClick={handleNextChapterNav}
          aria-label="Next Chapter"
          className={`absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 transition-all hover:scale-125 active:scale-95 flex items-center justify-center cursor-pointer group bg-transparent border-0 rounded-none ${
            darkMode
              ? 'text-[#d4af37] hover:text-[#ffe81f] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]'
              : 'text-amber-800 hover:text-amber-950 drop-shadow-[0_1px_3px_rgba(255,255,255,0.8)]'
          }`}
          title="Next Chapter"
        >
          <ChevronRight className="w-8 h-8 sm:w-12 sm:h-12 transition-transform group-hover:translate-x-1 stroke-[2.5]" />
        </button>
      )}

      {/* 5. BOTTOM AREA: Hidden while video is playing, visible when paused or finished */}
      {!isFeedbackMode && !isVideoPlaying && (
        <div
          id="act-bottom-controls-bar"
          key={`bottom-bar-${currentChapterNumber}-${currentStep}-${selectedChoiceId}`}
          className="absolute bottom-0 left-0 right-0 z-30 w-full flex flex-col justify-end pointer-events-auto bg-transparent pb-3 sm:pb-5 px-3 sm:px-6 select-none"
        >
          {/* Center Status / Subtitle Display */}
          <div className="flex items-center justify-between gap-3 px-1 sm:px-2 min-h-[2rem]">
            <div className="w-8 shrink-0 hidden sm:block" />

            <div className="flex-1 flex items-center justify-center text-center px-2">
              <p
                className={`font-cinzel text-xs sm:text-sm font-bold tracking-wider text-center ${
                  darkMode
                    ? 'text-[#ffe81f] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]'
                    : 'text-amber-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]'
                }`}
              >
                {currentStep === 'choices'
                  ? ''
                  : currentStep === 'choice_act'
                  ? (isVideoFinished ? 'Choice Finished' : '')
                  : currentStep === 'choice_feedback'
                  ? `Language Practice: ${selectedAudioLang || currentLang}`
                  : !currentYouTubeId || isMediaNotFound
                  ? t('comingSoon', selectedAudioLang || currentLang)
                  : isVideoFinished
                  ? t('actCompleted', selectedAudioLang || currentLang)
                  : ''}
              </p>
            </div>

            <div className="w-8 shrink-0 hidden sm:block" />
          </div>

          {/* Completion Action Bar: completely transparent */}
          <div className="w-full flex items-center justify-between gap-4 pt-2 pb-1 px-2 sm:px-4 bg-transparent border-0">
            {/* Left: Comment Drawer Button - Only visible if user is > 16 */}
            <div className="flex items-center gap-2">
              {canAccessComments ? (
                <button
                  id="act-write-comment-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCommentsDrawer(true);
                  }}
                  className={`p-2 transition-all hover:scale-125 active:scale-95 cursor-pointer flex items-center justify-center bg-transparent border-0 rounded-none ${
                    darkMode
                      ? 'text-[#d4af37] hover:text-[#ffe81f] drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]'
                      : 'text-amber-800 hover:text-amber-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]'
                  }`}
                  title={t('commentBtn', currentLang)}
                  aria-label={t('commentBtn', currentLang)}
                >
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 transition-colors" />
                </button>
              ) : (
                <div className="w-9" />
              )}

              {/* Back to Choices Button (available during choice video or feedback) */}
              {(currentStep === 'choice_act' || currentStep === 'choice_feedback') && (
                <button
                  id="act-back-to-choices-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentStep('choices');
                  }}
                  className="p-2 transition-all hover:scale-125 active:scale-95 cursor-pointer flex items-center justify-center text-[#d4af37] hover:text-[#ffe81f] drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] bg-transparent border-0 rounded-none"
                  title={t('backToChoices', currentLang)}
                  aria-label={t('backToChoices', currentLang)}
                >
                  <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-[#d4af37] hover:text-[#ffe81f] transition-colors" />
                </button>
              )}
            </div>

            {/* Right: Bottom Subtitles Language Selector replacing next arrow */}
            <div className="flex items-center gap-1.5 ml-auto" title="Subtitles Language">
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-amber-200/90 hidden xs:inline-block">
                SUBTITLES:
              </span>
              <FlagLanguageDropdown
                id="act-bottom-subtitle-selector"
                type="language"
                direction="up"
                selectedLang={selectedSubtitleLang}
                onSelectLang={handleSubtitleLanguageSelected}
                darkMode={darkMode}
                cinematic={true}
                tooltip="Subtitles Language"
              />
            </div>
          </div>
        </div>
      )}

      {/* COMMENTS DRAWER */}
      {showCommentsDrawer && canAccessComments && (
        <CommentsDrawer
          chapterId={chapterCommentId}
          chapterTitle={`Chapter ${currentChapterNumber}: ${tale?.title || 'Atlantis'}`}
          comments={currentComments}
          user={user || null}
          currentLang={currentLang}
          onClose={() => setShowCommentsDrawer(false)}
          onAddComment={(text) => onAddComment && onAddComment(chapterCommentId, text)}
          onEditComment={(cId, text) => onEditComment && onEditComment(chapterCommentId, cId, text)}
          onDeleteComment={(cId) => onDeleteComment && onDeleteComment(chapterCommentId, cId)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};
