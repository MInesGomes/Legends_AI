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
import { ActItem, getTaleActItems, getAtlantisActItems, getTaleFolderPath } from '../lib/taleData';
import { ChoiceId, ChapterChoiceConfig, ChapterConfig } from '../lib/chapterTypes';
import { resolveChapterConfig, resolveChapterMeta } from '../lib/chapterConfigResolver';
import {
  getChoiceLocalizedTitle,
  getChoiceLocalizedSubtitle,
  getFallbackChoiceFeedback,
} from '../lib/choiceLocalization';
import { FlowStep, ChapterMeta, getNextFlowOutcome, getPrevFlowOutcome } from '../lib/chapterFlowMachine';
import {
  Act,
  SUPABASE_BASE_URL,
  getActMp4CandidateUrls,
  getActVttCandidateUrls,
  getChoiceImageUrl,
  getChoiceMp4CandidateUrls,
  getChoiceVttCandidateUrls,
  getChoiceFeedbackVttCandidateUrls,
  normalizeLangCode,
  realmAtlantisJpg,
  extractYouTubeVideoId,
} from '../lib/assetRegistry';
import { CommentsDrawer } from './CommentsDrawer';
import { FlagLanguageDropdown } from './FlagLanguageDropdown';
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
  CheckCircle2,
  RotateCcw,
  Film,
  Mic,
  MicOff,
  Headphones,
  Award,
  FastForward,
  Shuffle,
  Compass,
  Play,
  Pause,
} from 'lucide-react';

const LANGUAGE_FULL_NAMES: Record<string, Record<Language, string>> = {
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
    return { world: 'Work', taleName: taleId === 'tale-job-quest' ? 'job_quest' : 'startup_winner' };
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

// Default narrative configuration
export const DEFAULT_CHAPTER_CONFIGS: ChapterConfig[] = [
  {
    id: 0,
    skill: 'Win4All',
    act0VideoUrl: 'https://youtu.be/-B_vlZaUDDc',
    choices: [],
  },
  {
    id: 1,
    skill: 'Proactive',
    act0VideoUrl: 'https://youtu.be/LBCpY7bI638',
    choices: [
      {
        id: 'choice1', // always the "best" choice — see isBestChoice() in lib/chapterTypes.ts
        available: true,
      },
      {
        id: 'choice2',
        available: true,
      },
      {
        id: 'choice3',
        available: true,
      },
      {
        id: 'choice4',
        available: true,
      },
    ],
  },
  {
    id: 2,
    skill: 'Plan',
    choices: [
      {
        id: 'choice1', // always the "best" choice
        available: true,
      },
      {
        id: 'choice2',
        available: true,
      },
      {
        id: 'choice3',
        available: true,
      },
      {
        id: 'choice4',
        available: false,
      },
    ],
  },
  {
    id: 3,
    skill: 'Win4All',
    act0VideoUrl: 'https://youtu.be/-64kwqW5q6k',
    choices: [
      {
        id: 'choice1', // always the "best" choice
        imageUrl: 'https://img.youtube.com/vi/7DEPbiuRvuU/hqdefault.jpg',
        videoUrl: 'https://youtu.be/7DEPbiuRvuU',
        available: true,
      },
      {
        id: 'choice2',
        imageUrl: 'https://img.youtube.com/vi/B4bsJHLc7V0/hqdefault.jpg',
        videoUrl: 'https://youtu.be/B4bsJHLc7V0',
        available: true,
      },
      {
        id: 'choice3',
        imageUrl: 'https://img.youtube.com/vi/TP1-nip4GiM/hqdefault.jpg',
        videoUrl: 'https://youtu.be/TP1-nip4GiM',
        available: true,
      },
      {
        id: 'choice4',
        available: false,
      },
    ],
  },
];

interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

function parseVttToCues(vttText: string): SubtitleCue[] {
  const parseTime = (t: string): number => {
    const parts = t.trim().split(':');
    if (parts.length === 3) {
      return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2].replace(',', '.'));
    } else if (parts.length === 2) {
      return parseFloat(parts[0]) * 60 + parseFloat(parts[1].replace(',', '.'));
    }
    return 0;
  };

  const regex = /(\d{1,2}:\d{2}:\d{2}[\.,]\d{2,3}|\d{1,2}:\d{2}[\.,]\d{2,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[\.,]\d{2,3}|\d{1,2}:\d{2}[\.,]\d{2,3})/g;
  const cues: SubtitleCue[] = [];
  const matches: { start: number; end: number; index: number; length: number }[] = [];
  let match;
  while ((match = regex.exec(vttText)) !== null) {
    matches.push({
      start: parseTime(match[1]),
      end: parseTime(match[2]),
      index: match.index,
      length: match[0].length,
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const textStart = current.index + current.length;
    const textEnd = i + 1 < matches.length ? matches[i + 1].index : vttText.length;
    let cueText = vttText.substring(textStart, textEnd).trim();
    cueText = cueText.replace(/\s*\d+$/, '').trim();
    if (cueText) {
      cues.push({ start: current.start, end: current.end, text: cueText });
    }
  }
  return cues;
}

/**
 * Cleanly extracts readable text paragraphs from a WebVTT feedback string
 */
function extractCleanTextFromVtt(vttContent: string): string[] {
  const lines = vttContent.split('\n');
  const paragraphs: string[] = [];
  let currentPara: string[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) {
      if (currentPara.length > 0) {
        paragraphs.push(currentPara.join(' '));
        currentPara = [];
      }
      continue;
    }
    if (
      line.startsWith('WEBVTT') ||
      line.startsWith('NOTE') ||
      /^\d+$/.test(line) ||
      /\d{1,2}:\d{2}/.test(line)
    ) {
      continue;
    }
    const cleanLine = line.replace(/<[^>]+>/g, '').trim();
    if (cleanLine) {
      currentPara.push(cleanLine);
    }
  }
  if (currentPara.length > 0) {
    paragraphs.push(currentPara.join(' '));
  }
  return paragraphs.filter((p) => p.length > 0);
}

/**
 * Builds candidate Supabase Storage URLs for feedback VTT matching the required pattern:
 * ${SUPABASE_BASE_URL}/${world}/${tale}/chapter${chapterNumber}/choice${choiceNumber}/choice${choiceNumber}.vtt
 * e.g. ${SUPABASE_BASE_URL}/Atlantis/5Ctrystals/chapter1/choice1/choice1.vtt
 */
function buildFeedbackVttCandidateUrls(
  tale: Tale | undefined,
  chapterNumber: number,
  choiceId: ChoiceId,
  lang: Language
): string[] {
  const choiceNumber = choiceId.replace('choice', '') || '1';
  const langCode = normalizeLangCode(lang);
  const { world, taleName } = getTaleWorldAndName(tale);

  return [
    `${SUPABASE_BASE_URL}/${world}/${taleName}/chapter${chapterNumber}/choice${choiceNumber}/vtt/feedback_${langCode}.vtt`,
    `${SUPABASE_BASE_URL}/${world}/${taleName}/chapter${chapterNumber}/choice${choiceNumber}/vtt/feedback${choiceNumber}_${langCode}.vtt`,
    `${SUPABASE_BASE_URL}/${world}/${taleName}/chapter${chapterNumber}/choice${choiceNumber}/vtt/feedback${choiceNumber}.vtt`,
    `${SUPABASE_BASE_URL}/${world}/${taleName}/chapter${chapterNumber}/choice${choiceNumber}/feedback_${langCode}.vtt`,
    `${SUPABASE_BASE_URL}/${world}/${taleName}/chapter${chapterNumber}/choice${choiceNumber}/feedback${choiceNumber}_${langCode}.vtt`,
    `${SUPABASE_BASE_URL}/${world}/${taleName}/chapter${chapterNumber}/choice${choiceNumber}/feedback${choiceNumber}.vtt`,
    `${SUPABASE_BASE_URL}/${world}/${taleName}/chapter${chapterNumber}/choice${choiceNumber}/vtt/choice${choiceNumber}_${langCode}.vtt`,
    `${SUPABASE_BASE_URL}/${world}/${taleName}/chapter${chapterNumber}/choice${choiceNumber}/choice${choiceNumber}_${langCode}.vtt`,
  ];
}

const ALL_SUPPORTED_LANGUAGES: Language[] = ['EN', 'ES', 'NL', 'IT', 'PT'];
const vttUrlCache = new Map<string, boolean>();

async function checkVttUrl(url: string): Promise<boolean> {
  if (vttUrlCache.has(url)) {
    return vttUrlCache.get(url)!;
  }
  // Fetch Priority API (Chrome/Edge): tells the browser these subtitle probes
  // matter less than the mp3/mp4 already in flight. Ignored where unsupported.
  const lowPriorityInit: RequestInit = { priority: 'low' } as RequestInit;
  try {
    const headRes = await fetch(url, { method: 'HEAD', ...lowPriorityInit });
    if (headRes.ok && headRes.status === 200) {
      vttUrlCache.set(url, true);
      return true;
    }
    if (headRes.status === 404) {
      vttUrlCache.set(url, false);
      return false;
    }
    // Fallback to GET
    const getRes = await fetch(url, lowPriorityInit);
    if (getRes.ok && getRes.status === 200) {
      const text = await getRes.text();
      const isValid = text.includes('WEBVTT') || text.includes('-->');
      vttUrlCache.set(url, isValid);
      return isValid;
    }
    vttUrlCache.set(url, false);
    return false;
  } catch {
    vttUrlCache.set(url, false);
    return false;
  }
}

/**
 * Helper to map Language to BCP-47 language tag for Web Speech
 */
function getSpeechLangTag(lang: Language): string {
  switch (lang) {
    case 'ES':
      return 'es';
    case 'IT':
      return 'it';
    case 'PT':
      return 'pt';
    case 'NL':
      return 'nl';
    case 'EN':
    default:
      return 'en';
  }
}

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

  // Audio and Subtitle language selectors
  const [selectedAudioLang, setSelectedAudioLang] = useState<Language>(currentLang);
  const [selectedVttLang, setSelectedVttLang] = useState<Language>(currentLang);
  const [availableVttLangs, setAvailableVttLangs] = useState<Language[]>(ALL_SUPPORTED_LANGUAGES);
  const [isCheckingVttLangs, setIsCheckingVttLangs] = useState<boolean>(false);

  // Synchronize audio language when parent currentLang prop updates; keep VTT independent
  useEffect(() => {
    if (currentLang) {
      setSelectedAudioLang((prev) => (prev !== currentLang ? currentLang : prev));
    }
  }, [currentLang]);

  // Video playback state
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);
  const ytMediaRef = useRef<YouTubeAdapter | null>(null);
  const ytCaptionTracksRef = useRef<any[]>([]);
  const ytCurrentTimeRef = useRef<number>(0);
  const ytInitialVttLangRef = useRef<Language>(selectedVttLang);
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
      if (!ytIframeRef.current?.contentWindow) return;
      const activeLang = langOverride || selectedAudioLang || 'EN';
      const langCode = normalizeLangCode(activeLang);
      const langName = LANGUAGE_FULL_NAMES[activeLang]?.EN || 'English';

      sendYtCommand('setAudioTrack', [{ id: `${langCode}.4`, languageCode: langCode, name: langName }]);
      sendYtCommand('setOption', ['audio', 'track', { languageCode: langCode }]);
      sendYtCommand('setOption', ['audioTrack', 'track', { languageCode: langCode }]);
    },
    [selectedAudioLang, sendYtCommand]
  );

  const syncYouTubeSubtitles = useCallback(
    (_langOverride?: Language) => {
      if (!ytIframeRef.current?.contentWindow) return;
      // Hide YouTube's built-in caption box so only the Gold Style VTT subtitle overlay is shown
      sendYtCommand('unloadModule', ['captions']);
      sendYtCommand('unloadModule', ['cc']);
    },
    [sendYtCommand]
  );

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [isYtPlaying, setIsYtPlaying] = useState<boolean>(false);
  const [isVideoFinished, setIsVideoFinished] = useState<boolean>(false);
  const [isMediaNotFound, setIsMediaNotFound] = useState<boolean>(false);
  const [candidateVideoIdx, setCandidateVideoIdx] = useState<number>(0);
  const [candidateAudioIdx, setCandidateAudioIdx] = useState<number>(0);

  // Subtitles & Comments drawer
  const [subtitles, setSubtitles] = useState<SubtitleCue[]>([]);
  const [activeSubtitle, setActiveSubtitle] = useState<string>('');
  const [showCommentsDrawer, setShowCommentsDrawer] = useState<boolean>(false);
  const canAccessComments = isUserOver16(user);

  // Choice page Star Wars crawl & Read Aloud state
  const [vttRawText, setVttRawText] = useState<string>('');
  const [feedbackParagraphs, setFeedbackParagraphs] = useState<string[]>([]);
  const [isCrawlFinished, setIsCrawlFinished] = useState<boolean>(false);
  const [feedbackFontSize, setFeedbackFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [isReadingAloud, setIsReadingAloud] = useState<boolean>(false);
  const [readTranscript, setReadTranscript] = useState<string>('');
  const [readAccuracy, setReadAccuracy] = useState<number | null>(null);
  const [hasClaimedPoints, setHasClaimedPoints] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const speechRecognitionRef = useRef<any>(null);
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

  // Track read aloud tracking per choice session
  const hasRecordedReadAloudStatRef = useRef<boolean>(false);

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

  const recordReadAloudStat = useCallback(() => {
    if (hasRecordedReadAloudStatRef.current) return;
    hasRecordedReadAloudStatRef.current = true;

    const activeSkill: SkillType = currentChapterConfig?.skill || tale?.skill || 'Plan';
    const activeLanguage: Language = selectedVttLang || currentLang || 'EN';

    if (onReadAloudChoice) {
      onReadAloudChoice(activeSkill, activeLanguage);
    } else if (onChooseBestChoice) {
      onChooseBestChoice(activeSkill, activeLanguage);
    }
  }, [currentChapterConfig?.skill, tale?.skill, selectedVttLang, currentLang, onReadAloudChoice, onChooseBestChoice]);

  const isFeedbackMode = currentStep === 'choice_feedback';
  const isFeedbackReadAloud = currentStep === 'choice_feedback' && isCrawlFinished;
  const isVideoStep = currentStep !== 'choices' && currentStep !== 'choice_feedback';

  const activeFeedbackLang = currentLang || selectedVttLang || 'EN';

  const targetLangDisplayName = useMemo(() => {
    const dict = LANGUAGE_FULL_NAMES[selectedVttLang];
    return dict?.[activeFeedbackLang] || dict?.[currentLang] || dict?.['EN'] || selectedVttLang;
  }, [selectedVttLang, activeFeedbackLang, currentLang]);

  const readAloudPromptText = useMemo(() => {
    return t('readAloudEarnPoints', activeFeedbackLang).replace('{lang}', targetLangDisplayName);
  }, [activeFeedbackLang, targetLangDisplayName]);

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
  const shuffledAvailableChoices = useMemo(() => {
    const available = (currentChapterConfig.choices || []).filter((c) => c.available);
    const array = [...available];
    // Deterministic or pseudo-random shuffle
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }, [currentChapterConfig]);

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
          videoUrl: currentWorld !== 'ElDorado' ? 'https://youtu.be/9Ozmoyei2-A' : undefined,
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

  // Construct URLs for the current act media
  const folderPath = useMemo(() => {
    return getTaleFolderPath(tale?.id || 'tale-5-crystals', tale?.realmId);
  }, [tale]);

  const videoCandidates = useMemo(() => {
    if (currentStep === 'choice_act') {
      const activeChoice = currentChapterConfig?.choices.find((c) => c.id === selectedChoiceId);
      const choiceCandidates = getChoiceMp4CandidateUrls(
        currentWorld,
        currentTaleName,
        currentChapterNumber,
        selectedChoiceId
      );
      if (activeChoice?.videoUrl && !choiceCandidates.includes(activeChoice.videoUrl)) {
        return [activeChoice.videoUrl, ...choiceCandidates];
      }
      return choiceCandidates;
    }
    const actCandidates = getActMp4CandidateUrls(currentActData, folderPath);
    if (currentChapterConfig?.act0VideoUrl && (currentStep === 'act0' || currentActData.act === 'act0') && currentWorld !== 'ElDorado') {
      if (!actCandidates.includes(currentChapterConfig.act0VideoUrl)) {
        return [currentChapterConfig.act0VideoUrl, ...actCandidates];
      }
    }
    return actCandidates;
  }, [currentStep, currentWorld, currentTaleName, currentChapterNumber, selectedChoiceId, currentActData, folderPath, currentChapterConfig]);

  const currentVideoUrl = videoCandidates[candidateVideoIdx] || videoCandidates[0];
  const currentYouTubeId = useMemo(() => {
    return extractYouTubeVideoId(currentVideoUrl);
  }, [currentVideoUrl]);

  const isComingSoon = isVideoStep && (!currentYouTubeId || isMediaNotFound);
  const isVideoPlaying = isVideoStep && !isComingSoon && isAutoPlay && !isVideoFinished;



  // Check available VTT languages for the current act
  // If a VTT file is not available for an act, remove the language from the dropdown
  useEffect(() => {
    if (currentStep === 'choices' || currentStep === 'choice_feedback') return;

    // For Chapter 0 - Act 0 using YouTube subtitles, all languages are supported via YouTube captions
    if (currentChapterNumber === 0 && (currentStep === 'act0' || currentActData.act === 'act0') && currentYouTubeId) {
      setAvailableVttLangs(ALL_SUPPORTED_LANGUAGES);
      setIsCheckingVttLangs(false);
      return;
    }

    let isMounted = true;
    setIsCheckingVttLangs(true);

    async function checkLanguages() {
      const validLangs: Language[] = [];

      await Promise.all(
        ALL_SUPPORTED_LANGUAGES.map(async (lang) => {
          const urls =
            currentStep === 'choice_act'
              ? getChoiceVttCandidateUrls(
                  currentWorld,
                  currentTaleName,
                  currentChapterNumber,
                  selectedChoiceId,
                  lang
                )
              : getActVttCandidateUrls(currentActData, lang, folderPath);

          for (const url of urls) {
            const ok = await checkVttUrl(url);
            if (ok) {
              validLangs.push(lang);
              return;
            }
          }
        })
      );

      if (isMounted) {
        const sorted = ALL_SUPPORTED_LANGUAGES.filter((l) => validLangs.includes(l));
        setAvailableVttLangs(sorted);
        setIsCheckingVttLangs(false);

        // If the current selectedVttLang is not available, switch to first available
        if (sorted.length > 0 && !sorted.includes(selectedVttLang)) {
          setSelectedVttLang(sorted[0]);
        }
      }
    }

    // Give the mp3/mp4 requests a head start on mobile's limited concurrent
    // connections before firing off up to 5 languages worth of VTT probes —
    // otherwise this competes for bandwidth right when audio most needs to
    // start loading, which reads as the audio "cutting out".
    const kickoff = setTimeout(checkLanguages, 300);

    return () => {
      isMounted = false;
      clearTimeout(kickoff);
    };
  }, [
    currentActData,
    folderPath,
    currentStep,
    currentWorld,
    currentTaleName,
    currentChapterNumber,
    selectedChoiceId,
  ]);

  // Reset media & candidates when step, chapter, or choice changes
  useEffect(() => {
    setCandidateVideoIdx(0);
    setCandidateAudioIdx(0);
    setIsMediaNotFound(false);
    setIsVideoFinished(false);
    setIsAutoPlay(true);
    setIsYtPlaying(false);
    setYtStartSeconds(0);
    ytCurrentTimeRef.current = 0;
    ytInitialVttLangRef.current = selectedVttLang;
    setActiveSubtitle('');
    setIsCrawlFinished(false);
    setReadTranscript('');
    setReadAccuracy(null);
    setHasClaimedPoints(false);
    setSpeechError(null);
  }, [currentChapterNumber, currentStep, selectedChoiceId]);

  // Fetch Subtitles (VTT) for standard act and choice videos
  useEffect(() => {
    if (currentStep === 'choices') return;
    if (currentStep === 'choice_feedback') return;

    let isMounted = true;
    setActiveSubtitle('');

    const vttCandidates =
      currentStep === 'choice_act'
        ? getChoiceVttCandidateUrls(
            currentWorld,
            currentTaleName,
            currentChapterNumber,
            selectedChoiceId,
            selectedVttLang
          )
        : getActVttCandidateUrls(currentActData, selectedVttLang, folderPath);

    async function loadStandardVtt() {
      for (const url of vttCandidates) {
        try {
          const res = await fetch(url, { priority: 'low' } as RequestInit);
          if (res.ok) {
            const text = await res.text();
            if (isMounted) {
              const cues = parseVttToCues(text);
              if (cues.length > 0) {
                setSubtitles(cues);
                return;
              }
            }
          }
        } catch {
          // Continue to next candidate
        }
      }
      if (isMounted) {
        setSubtitles([]);
      }
    }

    loadStandardVtt();

    return () => {
      isMounted = false;
    };
  }, [
    currentActData,
    folderPath,
    selectedVttLang,
    currentStep,
    currentWorld,
    currentTaleName,
    currentChapterNumber,
    selectedChoiceId,
  ]);

  // Choice Feedback: Fetch Feedback VTT from Supabase Storage
  // eg https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub/Atlantis/5crystals/chapter1/choice1/vtt/feedback_en.vtt
  // If there's no vtt file, skip feedback and go to choices page
  useEffect(() => {
    if (currentStep !== 'choice_act' && currentStep !== 'choice_feedback') return;

    let isMounted = true;
    const candidateUrls = getChoiceFeedbackVttCandidateUrls(
      currentWorld,
      currentTaleName,
      currentChapterNumber,
      selectedChoiceId,
      selectedVttLang
    );

    async function fetchFeedbackVtt() {
      for (const url of candidateUrls) {
        try {
          const res = await fetch(url, { priority: 'low' } as RequestInit);
          if (res.ok) {
            const text = await res.text();
            if (isMounted && text && text.includes('WEBVTT')) {
              const paras = extractCleanTextFromVtt(text);
              if (paras.length > 0) {
                setVttRawText(text);
                setFeedbackParagraphs(paras);
                return;
              }
            }
          }
        } catch {
          // Continue
        }
      }

      // No remote VTT file found: check built-in fallback feedback for this chapter & choice
      const fallbackParas = getFallbackChoiceFeedback(
        currentWorld,
        currentChapterNumber,
        selectedChoiceId,
        selectedVttLang
      );

      if (isMounted) {
        if (fallbackParas && fallbackParas.length > 0) {
          setVttRawText(fallbackParas.join('\n\n'));
          setFeedbackParagraphs(fallbackParas);
        } else {
          setVttRawText('');
          setFeedbackParagraphs([]);
          if (currentStep === 'choice_feedback') {
            setCurrentStep('choices');
          }
        }
      }
    }

    fetchFeedbackVtt();

    return () => {
      isMounted = false;
    };
  }, [
    currentStep,
    currentChapterNumber,
    selectedChoiceId,
    selectedVttLang,
    currentWorld,
    currentTaleName,
  ]);



  const handleTimeUpdate = (curr: number) => {
    if (!subtitles || subtitles.length === 0) {
      if (activeSubtitle) setActiveSubtitle('');
      return;
    }
    const matchingCue = subtitles.find((c) => curr >= c.start && curr <= c.end);
    const newText = matchingCue ? matchingCue.text : '';
    if (newText !== activeSubtitle) {
      setActiveSubtitle(newText);
    }
  };

  const handleVideoError = () => {
    if (currentYouTubeId) return;
    if (candidateVideoIdx + 1 < videoCandidates.length) {
      setCandidateVideoIdx((prev) => prev + 1);
    } else {
      setIsMediaNotFound(true);
    }
  };

  // Synchronize YouTube video autoplay, play/pause, mute/volume, and subtitles
  useEffect(() => {
    setIsYtPlaying(false);
    ytCaptionTracksRef.current = [];
  }, [currentYouTubeId]);

  useEffect(() => {
    if (currentYouTubeId) {
      syncYouTubeSubtitles(selectedVttLang);
    }
  }, [selectedVttLang, currentYouTubeId, syncYouTubeSubtitles]);

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
    setIsCrawlFinished(false);
    setIsAutoPlay(true);
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
    setActiveSubtitle('');
  };

  const advanceChapterOrClose = () => {
    const nextChapterId = currentChapterNumber + 1;
    const nextExists = chapterConfigs.some((cfg) => cfg.id === nextChapterId) || nextChapterId <= maxChapterId;
    if (nextExists) {
      setCurrentChapterNumber(nextChapterId);
      setCurrentStep('act0');
    } else {
      if (onClose) onClose();
    }
  };

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
        const firstAvail = currentChapterConfig.choices.find((c) => c.available) || currentChapterConfig.choices[0];
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
    // The choice video/feedback exit paths touch component state (speech
    // recognition, crawl animation) that the pure machine doesn't own, so
    // they're handled here before delegating.
    if (currentStep === 'choice_feedback') {
      setIsReadingAloud(false);
      try {
        speechRecognitionRef.current?.stop();
      } catch {}
      setIsCrawlFinished(false);
    }

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
    hasRecordedReadAloudStatRef.current = false;
    hasCelebratedFeedbackRef.current = '';
    setSelectedChoiceId(choiceId);
    setCandidateVideoIdx(0);
    setIsVideoFinished(false);
    setIsMediaNotFound(false);
    setVttRawText('');
    setFeedbackParagraphs([]);
    setIsCrawlFinished(false);
    setReadTranscript('');
    setReadAccuracy(null);
    setSpeechError(null);
    setCurrentStep('choice_act');

    // Record best choice stat callback
    if (isBestChoice(choiceId)) {
      const activeSkill: SkillType = currentChapterConfig?.skill || tale?.skill || 'Plan';
      if (onChooseBestChoice) {
        onChooseBestChoice(activeSkill, selectedVttLang || currentLang);
      }
    }
  };

  // Language selectors: audio and subtitles (VTT) are completely independent
  const handleAudioLanguageSelected = (newLang: Language) => {
    if (currentYouTubeId && ytCurrentTimeRef.current > 1 && !isVideoFinished) {
      setYtStartSeconds(Math.floor(ytCurrentTimeRef.current));
    } else {
      setYtStartSeconds(0);
    }
    ytInitialVttLangRef.current = selectedVttLang;
    setSelectedAudioLang(newLang);
    setIsAutoPlay(true);
    setIsVideoFinished(false);
    if (currentYouTubeId) {
      syncYouTubeAudioTrack(newLang);
    }
    if (onLanguageChange) onLanguageChange(newLang);
  };

  const handleVttLanguageSelected = (newLang: Language) => {
    setSelectedVttLang(newLang);
  };

  const handleVideoEnded = useCallback(() => {
    setIsVideoFinished(true);
    setActiveSubtitle('');
    if (currentStep === 'choice_act') {
      // After choice video finishes, display feedback if vtt exists, otherwise return to choices
      if (isAutoPlay) {
        setTimeout(() => {
          if (feedbackParagraphs.length > 0) {
            setCurrentStep('choice_feedback');
          } else {
            setCurrentStep('choices');
          }
        }, 1000);
      }
    } else if (isAutoPlay) {
      setTimeout(() => {
        goToNext();
      }, 3500);
    }
  }, [currentStep, isAutoPlay, feedbackParagraphs.length, goToNext]);

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

  // Speech Recognition (Read Aloud) Implementation
  const startSpeechRecognition = () => {
    recordReadAloudStat();
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setSpeechError(
        'Speech recognition is not natively supported in this browser. You can practice reading aloud, then click "Claim Language Points" below!'
      );
      setIsReadingAloud(true);
      return;
    }

    try {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
      }

      const recognition = new SpeechRec();
      speechRecognitionRef.current = recognition;
      recognition.lang = getSpeechLangTag(selectedVttLang);
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsReadingAloud(true);
        setSpeechError(null);
        setReadTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            final += res[0].transcript + ' ';
          } else {
            interim += res[0].transcript;
          }
        }
        const fullTranscript = (final + interim).trim();
        setReadTranscript(fullTranscript);
      };

      recognition.onerror = (event: any) => {
        setIsReadingAloud(false);
        if (event.error !== 'no-speech') {
          setSpeechError(`Microphone notice: ${event.error}. You can still claim points after reading aloud!`);
        }
      };

      recognition.onend = () => {
        setIsReadingAloud(false);
        evaluateReadAloudAccuracy();
      };

      recognition.start();
    } catch (err: any) {
      setIsReadingAloud(false);
      setSpeechError('Could not start microphone. Click below to verify reading.');
    }
  };

  const stopSpeechRecognition = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    setIsReadingAloud(false);
    evaluateReadAloudAccuracy();
  };

  const evaluateReadAloudAccuracy = () => {
    const allText = feedbackParagraphs.join(' ');
    if (!allText) return;

    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        .split(/\s+/)
        .filter(Boolean);

    const targetWords = normalize(allText);
    const spokenWords = normalize(readTranscript);

    if (spokenWords.length === 0) {
      setReadAccuracy(0);
      return;
    }

    let matched = 0;
    for (const w of spokenWords) {
      if (targetWords.includes(w)) {
        matched++;
      }
    }

    const score = Math.min(100, Math.round((matched / Math.max(1, Math.min(spokenWords.length, targetWords.length))) * 100));
    setReadAccuracy(score);

    // If score >= 30%, user successfully read aloud!
    if (score >= 30 && !hasClaimedPoints) {
      awardLanguagePoints();
    }
  };

  // Award Points
  const awardLanguagePoints = () => {
    recordReadAloudStat();
    setHasClaimedPoints(true);
    if (onEarnLanguagePoints) {
      onEarnLanguagePoints(selectedVttLang, 50);
    }
    const activeSkill: SkillType = currentChapterConfig?.skill || tale?.skill || 'Plan';
    if (onEarnSkillPoint) {
      onEarnSkillPoint(activeSkill);
    }
  };

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
                    setIsReadingAloud(false);
                    setIsCrawlFinished(false);
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
              {/* Autoplay Toggle */}
              <button
                id="act-autoplay-toggle"
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className={`px-2 py-1 text-[11px] sm:text-xs font-bold font-mono tracking-widest transition-all cursor-pointer bg-transparent border-0 rounded-none ${
                  darkMode
                    ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]'
                    : 'drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]'
                } ${
                  isAutoPlay
                    ? darkMode
                      ? 'text-[#ffe81f] font-black underline decoration-[#d4af37] decoration-2 underline-offset-4'
                      : 'text-amber-800 font-black underline decoration-amber-600 decoration-2 underline-offset-4'
                    : darkMode
                    ? 'text-amber-200/75 hover:text-amber-200'
                    : 'text-amber-800/75 hover:text-amber-950'
                }`}
                title="Toggle Auto Advance"
              >
                AUTO
              </button>

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

              {/* Audio Language Selector */}
              <FlagLanguageDropdown
                id="act-top-audio-selector"
                type="language"
                selectedLang={selectedAudioLang}
                onSelectLang={handleAudioLanguageSelected}
                darkMode={darkMode}
                cinematic={true}
                tooltip="Audio Voice"
              />
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
                  getChoiceImageUrl(
                    currentWorld,
                    currentTaleName,
                    currentChapterNumber,
                    choice.id
                  );

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

                  {/* Read aloud prompt row: Read aloud button placed directly next to the instruction text */}
                  <div className="mt-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
                    <button
                      id="choice-read-aloud-btn"
                      onClick={isReadingAloud ? stopSpeechRecognition : startSpeechRecognition}
                      type="button"
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${
                        isReadingAloud
                          ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-400 animate-pulse'
                          : 'bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-300'
                      } font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0`}
                      title="Read Aloud"
                    >
                      {isReadingAloud ? (
                        <>
                          <MicOff className="w-4 h-4" />
                          <span>Listening...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          <span>Read Aloud</span>
                        </>
                      )}
                    </button>

                    <p
                      id="choice-read-aloud-prompt"
                      className={`text-xs sm:text-sm leading-relaxed font-medium flex-1 ${
                        darkMode ? 'text-amber-200/90' : 'text-amber-950'
                      }`}
                    >
                      {readAloudPromptText}
                    </p>
                  </div>
                </div>

                {/* Spoken Transcript Notification */}
                {readTranscript && (
                  <div
                    className={`mb-3 p-3 rounded-xl border text-xs sm:text-sm ${
                      darkMode
                        ? 'bg-amber-950/40 border-amber-400/40 text-amber-100'
                        : 'bg-amber-50 border-amber-300 text-amber-950 font-medium'
                    }`}
                  >
                    <span className={`font-bold ${darkMode ? 'text-amber-300' : 'text-amber-900'}`}>
                      Heard you say:{' '}
                    </span>
                    <span className={`italic ${darkMode ? 'text-amber-100' : 'text-stone-900'}`}>
                      "{readTranscript}"
                    </span>
                    {readAccuracy !== null && (
                      <span
                        className={`ml-2 font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          darkMode ? 'bg-amber-400/20 text-amber-200' : 'bg-amber-200 text-amber-950'
                        }`}
                      >
                        Match: {readAccuracy}%
                      </span>
                    )}
                  </div>
                )}

                {/* Points Awarded Badge */}
                {hasClaimedPoints && (
                  <div
                    className={`mb-3 p-2.5 rounded-xl border-2 flex items-center justify-between text-xs sm:text-sm font-bold ${
                      darkMode
                        ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-200'
                        : 'bg-emerald-50 border-emerald-600/70 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Award className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`} />
                      <span>Language Mastery Verified! +50 Points Awarded in {targetLangDisplayName}</span>
                    </div>
                    <CheckCircle2 className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`} />
                  </div>
                )}

                {speechError && (
                  <div
                    className={`mb-3 p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      darkMode
                        ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
                        : 'bg-amber-50 border-amber-300 text-amber-900 font-medium'
                    }`}
                  >
                    <span>{speechError}</span>
                    {!hasClaimedPoints && (
                      <button
                        type="button"
                        onClick={() => {
                          recordReadAloudStat();
                          awardLanguagePoints();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-sm transition-all"
                      >
                        Claim Points
                      </button>
                    )}
                  </div>
                )}

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

                  {/* Bottom Right: Language Selector Dropdown, Back to Choices Button, and Next Action Button */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                    <FlagLanguageDropdown
                      id="act-feedback-bottom-vtt-selector"
                      type="vtt"
                      selectedLang={selectedVttLang}
                      onSelectLang={handleVttLanguageSelected}
                      darkMode={darkMode}
                      cinematic={true}
                      availableLangs={availableVttLangs}
                      tooltip="Subtitles / Reading Language"
                    />

                    {/* Back to Choices Button */}
                    <button
                      id="feedback-back-to-choices-btn"
                      onClick={() => {
                        setIsReadingAloud(false);
                        try {
                          speechRecognitionRef.current?.stop();
                        } catch {}
                        setIsCrawlFinished(false);
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
                  className={`absolute -top-[100%] left-0 w-full h-[300%] pointer-events-none select-none overflow-hidden transition-opacity duration-200 ${
                    isVideoFinished ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <SafeYouTubeVideo
                    instanceKey={`yt-${currentYouTubeId}`}
                    ref={ytIframeRef}
                    mediaRef={ytMediaRef}
                    src={currentVideoUrl}
                    autoplay={true}
                    defaultMuted={false}
                    muted={isMuted}
                    controls={false}
                    playsInline={true}
                    className="w-full h-full border-0 pointer-events-none select-none"
                    style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
                    source={{
                      src: currentVideoUrl,
                      engine: {
                        youtube: {
                          controls: 0,
                          modestbranding: 1,
                          showinfo: 0,
                          cc_load_policy: 0,
                          cc_lang_pref: normalizeLangCode(ytInitialVttLangRef.current),
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
                      if (isAutoPlay) {
                        try {
                          const p = e.currentTarget?.play?.();
                          if (p && typeof p.catch === 'function') p.catch(() => {});
                        } catch {}
                      } else {
                        e.currentTarget.pause();
                      }
                      syncYouTubeAudioTrack();
                      syncYouTubeSubtitles();
                    }}
                    onPlay={() => {
                      if (!isAutoPlay) {
                        setIsYtPlaying(false);
                        ytMediaRef.current?.pause();
                      } else {
                        setIsYtPlaying(true);
                        syncYouTubeAudioTrack();
                        syncYouTubeSubtitles();
                      }
                    }}
                    onPlaying={() => {
                      if (isAutoPlay) {
                        setIsYtPlaying(true);
                      }
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
                  onClick={() => setIsAutoPlay((prev) => !prev)}
                >
                  {!isVideoPlaying && (
                    <div
                      id="youtube-gold-pause-circle"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#ffe81f] via-[#d4af37] to-[#9a7209] border-2 border-[#fff6b3] shadow-[0_4px_20px_rgba(0,0,0,0.75),0_0_20px_rgba(212,175,55,0.7),inset_0_1px_4px_rgba(255,255,255,0.65)] flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95"
                    >
                      {!isAutoPlay ? (
                        <Play className="w-6 h-6 sm:w-8 sm:h-8 text-slate-950 fill-slate-950 ml-0.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]" />
                      ) : (
                        <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-slate-950 fill-slate-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]" />
                      )}
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

            {/* Star Wars Intro Style VTT Subtitle Overlay during Video Playback */}
            {activeSubtitle && !isVideoFinished && (
              <div
                id="vtt-starwars-subtitle-overlay"
                className="absolute inset-x-0 bottom-24 sm:bottom-28 z-20 flex justify-center pointer-events-none px-4 select-none [perspective:420px]"
              >
                <motion.div
                  key={activeSubtitle}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="origin-[50%_100%] [transform:rotateX(22deg)] max-w-2xl text-center font-cinzel font-black text-lg sm:text-2xl md:text-3xl tracking-wider text-[#ffe81f] drop-shadow-[0_0_15px_rgba(255,232,31,0.85)] [text-shadow:_0_2px_8px_rgb(0_0_0_/_95%),_0_0_20px_rgb(255_232_31_/_60%)] leading-snug px-3 py-1.5"
                >
                  {activeSubtitle}
                </motion.div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. CENTER LEFT: PREVIOUS `<` BUTTON (Cinematic floating chevron, no round circle, hidden while video is playing) */}
      {!isFeedbackMode && !isVideoPlaying && (
        <button
          id="act-prev-button"
          onClick={goToPrev}
          aria-label="Previous Act"
          className={`absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 transition-all hover:scale-125 active:scale-95 flex items-center justify-center cursor-pointer group bg-transparent border-0 rounded-none ${
            darkMode
              ? 'text-[#d4af37] hover:text-[#ffe81f] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]'
              : 'text-amber-800 hover:text-amber-950 drop-shadow-[0_1px_3px_rgba(255,255,255,0.8)]'
          }`}
          title="Previous"
        >
          <ChevronLeft className="w-8 h-8 sm:w-12 sm:h-12 transition-transform group-hover:-translate-x-1 stroke-[2.5]" />
        </button>
      )}

      {/* 4. CENTER RIGHT: NEXT `>` BUTTON (Cinematic floating chevron, no round circle, hidden on choices board and while video is playing) */}
      {!isFeedbackMode && currentStep !== 'choices' && !isVideoPlaying && (
        <button
          id="act-next-button"
          onClick={goToNext}
          aria-label="Next Act"
          className={`absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 transition-all hover:scale-125 active:scale-95 flex items-center justify-center cursor-pointer group bg-transparent border-0 rounded-none ${
            darkMode
              ? 'text-[#d4af37] hover:text-[#ffe81f] drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]'
              : 'text-amber-800 hover:text-amber-950 drop-shadow-[0_1px_3px_rgba(255,255,255,0.8)]'
          }`}
          title="Next"
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
                  ? (isVideoFinished ? 'Choice Finished • Continue to Feedback' : '')
                  : currentStep === 'choice_feedback'
                  ? `Language Practice: ${selectedVttLang}`
                  : !currentYouTubeId || isMediaNotFound
                  ? t('comingSoon', selectedAudioLang || currentLang)
                  : isVideoFinished
                  ? t('actCompleted', selectedAudioLang || currentLang)
                  : ''}
              </p>
            </div>

            {/* Bottom Right VTT Subtitle Language Selector (Cinematic, no circle) */}
            {currentStep !== 'choices' && (
              <div className="shrink-0 flex items-center">
                <FlagLanguageDropdown
                  id="act-bottom-vtt-selector"
                  type="vtt"
                  selectedLang={selectedVttLang}
                  onSelectLang={handleVttLanguageSelected}
                  darkMode={darkMode}
                  cinematic={true}
                  availableLangs={availableVttLangs}
                  tooltip={availableVttLangs.length === 0 ? 'No Subtitles Available for this Act' : 'Subtitles / Reading Language (VTT)'}
                />
              </div>
            )}
          </div>

          {/* Completion Action Bar: completely transparent, no skip button, no text on buttons, no round circles */}
          <div className="w-full flex items-center justify-between gap-4 pt-2 pb-1 px-2 sm:px-4 bg-transparent border-0">
            {/* Comment Drawer Button - Only visible if user is > 16 */}
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
                  setIsReadingAloud(false);
                  try {
                    speechRecognitionRef.current?.stop();
                  } catch {}
                  setIsCrawlFinished(false);
                  setCurrentStep('choices');
                }}
                className="p-2 transition-all hover:scale-125 active:scale-95 cursor-pointer flex items-center justify-center text-[#d4af37] hover:text-[#ffe81f] drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] bg-transparent border-0 rounded-none"
                title={t('backToChoices', currentLang)}
                aria-label={t('backToChoices', currentLang)}
              >
                <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-[#d4af37] hover:text-[#ffe81f] transition-colors" />
              </button>
            )}

            {/* Replay Button */}
            <button
              id="act-replay-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleReplay();
              }}
              className="p-2 transition-all hover:scale-125 active:scale-95 cursor-pointer flex items-center justify-center text-[#d4af37] hover:text-[#ffe81f] drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] bg-transparent border-0 rounded-none"
              title={t('replayBtn', currentLang)}
              aria-label={t('replayBtn', currentLang)}
            >
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-[#d4af37] hover:text-[#ffe81f] transition-colors" />
            </button>

            {/* Next Step / Continue Button (hidden on choices board) */}
            {currentStep !== 'choices' && (
              <button
                id="act-next-completion-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="p-2 transition-all hover:scale-125 active:scale-95 cursor-pointer flex items-center justify-center text-[#d4af37] hover:text-[#ffe81f] drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] bg-transparent border-0 rounded-none"
                title={
                  currentStep === 'choice_act'
                    ? (feedbackParagraphs.length > 0 ? 'View Feedback' : 'Choices')
                    : currentStep === 'choice_feedback'
                    ? (isBestChoice(selectedChoiceId) ? t('nextChapter', currentLang) : t('backToChoices', currentLang))
                    : t('nextAct', currentLang)
                }
                aria-label="Next Step"
              >
                <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8 text-[#d4af37] hover:text-[#ffe81f] transition-colors stroke-[2.5]" />
              </button>
            )}
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
