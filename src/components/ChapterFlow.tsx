import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Language,
  UserProfile,
  SkillType,
  ChapterComment,
  Tale,
} from '../types';
import { ActItem, getTaleActItems, getAtlantisActItems, getTaleFolderPath } from '../lib/taleData';
import {
  Act,
  SUPABASE_BASE_URL,
  getActMp4CandidateUrls,
  getActMp3Url,
  getActMp3CandidateUrls,
  getActVttCandidateUrls,
  getChoiceImageUrl,
  getChoiceMp4CandidateUrls,
  getChoiceMp3CandidateUrls,
  getChoiceVttCandidateUrls,
  getChoiceFeedbackVttCandidateUrls,
  normalizeLangCode,
  realmAtlantisJpg,
} from '../lib/assetRegistry';
import { CommentsDrawer } from './CommentsDrawer';
import { FlagLanguageDropdown } from './FlagLanguageDropdown';
import { t, Translations, TRANSLATIONS } from '../lib/i18n';
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

export type ChoiceId = 'choice1' | 'choice2' | 'choice3' | 'choice4';

export interface ChapterChoiceConfig {
  id: ChoiceId;
  available: boolean; // some chapters only have 2 of the 4 choices
  title?: string;
  subtitle?: string;
  titleKey?: keyof Translations;
  subtitleKey?: keyof Translations;
  descriptionKey?: keyof Translations;
  description?: string;
  imageUrl?: string;
}

export function getChoiceLocalizedTitle(
  choice: ChapterChoiceConfig,
  lang: Language | string = 'EN',
  fallbackIndex = 0,
  world?: string,
  taleName?: string,
  chapterNumber?: number
): string | undefined {
  const normalizedLang = (lang as Language) || 'EN';
  const dict = TRANSLATIONS[normalizedLang];
  if (!dict) return choice.title || undefined;

  // 1. Explicit titleKey on choice
  if (choice.titleKey && dict[choice.titleKey]) {
    const val = dict[choice.titleKey]?.trim();
    if (val) return val;
  }

  // 2. World / act specific key in i18n
  if (world) {
    const worldActKey = `${world.toLowerCase()}_act${chapterNumber ?? 0}_${choice.id}_title` as keyof Translations;
    if (dict[worldActKey]) {
      const val = dict[worldActKey]?.trim();
      if (val) return val;
    }
  }

  // 3. Fallback for Atlantis Chapter 1
  if ((world === 'Atlantis' || !world) && (chapterNumber === 1 || chapterNumber === undefined)) {
    const defaultKey = `${choice.id}_title` as keyof Translations;
    if (dict[defaultKey]) {
      return dict[defaultKey]?.trim() || undefined;
    }
  }

  if (choice.title && choice.title.trim()) {
    return choice.title.trim();
  }

  return undefined;
}

export function getChoiceLocalizedSubtitle(
  choice: ChapterChoiceConfig,
  lang: Language | string = 'EN',
  world?: string,
  taleName?: string,
  chapterNumber?: number
): string | undefined {
  const normalizedLang = (lang as Language) || 'EN';
  const dict = TRANSLATIONS[normalizedLang];
  if (!dict) return undefined;

  // 1. Explicit subtitleKey on choice
  if (choice.subtitleKey && dict[choice.subtitleKey]) {
    const val = dict[choice.subtitleKey]?.trim();
    if (val) return val;
  }

  // 2. World / act specific key in i18n
  if (world) {
    const worldActKey = `${world.toLowerCase()}_act${chapterNumber ?? 0}_${choice.id}_subtitle` as keyof Translations;
    if (dict[worldActKey]) {
      const val = dict[worldActKey]?.trim();
      if (val) return val;
    }
  }

  // 3. Fallback for Atlantis Chapter 1
  if ((world === 'Atlantis' || !world) && (chapterNumber === 1 || chapterNumber === undefined)) {
    const defaultKey = `${choice.id}_subtitle` as keyof Translations;
    if (dict[defaultKey]) {
      return dict[defaultKey]?.trim() || undefined;
    }
  }

  if (choice.subtitle && choice.subtitle.trim()) {
    return choice.subtitle.trim();
  }

  // If there's no subtitle in i18n, don't show
  return undefined;
}

export function getChoiceLocalizedDescription(
  choice: ChapterChoiceConfig,
  lang: Language | string = 'EN',
  world?: string,
  taleName?: string,
  chapterNumber?: number
): string | undefined {
  const normalizedLang = (lang as Language) || 'EN';
  const dict = TRANSLATIONS[normalizedLang];
  if (!dict) return undefined;

  // 1. Explicit descriptionKey on choice
  if (choice.descriptionKey && dict[choice.descriptionKey]) {
    const val = dict[choice.descriptionKey]?.trim();
    if (val) return val;
  }

  // 2. World / act specific key in i18n (e.g. eldorado_act0_choice1_description)
  if (world) {
    const worldActKey = `${world.toLowerCase()}_act${chapterNumber ?? 0}_${choice.id}_description` as keyof Translations;
    if (dict[worldActKey]) {
      const val = dict[worldActKey]?.trim();
      if (val) return val;
    }
  }

  // 3. Fallback for Atlantis Chapter 1
  if ((world === 'Atlantis' || !world) && (chapterNumber === 1 || chapterNumber === undefined)) {
    const defaultKey = `${choice.id}_description` as keyof Translations;
    if (dict[defaultKey]) {
      return dict[defaultKey]?.trim() || undefined;
    }
  }

  if (choice.description && choice.description.trim()) {
    return choice.description.trim();
  }

  // If there's no description in i18n, don't show
  return undefined;
}

export interface ChapterConfig {
  id: number; // 0..N
  hasAct1?: boolean; // Chapter optional act1
  hasGenderActs?: boolean; // Chapter 0 optional gender acts
  choices: ChapterChoiceConfig[];
}

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
    hasAct1: true,
    choices: [],
  },
  {
    id: 1,
    choices: [
      {
        id: 'choice1',
        subtitle: 'Community Leadership',
        description: "Don’t ask for permission and risk losing everything.",
        available: true,
      },
      {
        id: 'choice2',
        title: 'Try to Solve Everything Alone',
        subtitle: 'Cautious Heroism',
        description: 'Attempt to stabilize the central reactor yourself before alarming the public.',
        available: true,
      },
      {
        id: 'choice3',
        title: 'Wait for the Council',
        subtitle: 'Passive Compliance',
        description: 'Delay action until the High Council issues formal evacuation orders.',
        available: true,
      },
      {
        id: 'choice4',
        title: 'Force the System',
        subtitle: 'Aggressive Intervention',
        description: 'Override security safeguards by force, so all can be saved quickly.',
        available: true,
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
    `${SUPABASE_BASE_URL}/${world}/${taleName}/chapter${chapterNumber}/choice${choiceNumber}/feedback_${langCode}.vtt`,
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
  try {
    const headRes = await fetch(url, { method: 'HEAD' });
    if (headRes.ok && headRes.status === 200) {
      vttUrlCache.set(url, true);
      return true;
    }
    if (headRes.status === 404) {
      vttUrlCache.set(url, false);
      return false;
    }
    // Fallback to GET
    const getRes = await fetch(url);
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

  // Active step within the chapter:
  // Chapter 0: 'act0' -> 'avatar gender' -> 'not avatar gender' -> 'act1' (if hasAct1) -> 'CHOICES' (if hasChoices) -> Chapter 1
  // Chapters 1..N: 'act0' -> CHOICES -> Chapter n+1
  // 'CHOICES': Choices screen -> 'choice_act' (video & audio) -> 'choice_feedback' (if hasFeedback crawl & read)
  type FlowStep =
    | 'act0'
    | 'male_act'
    | 'female_act'
    | 'act1'
    | 'choices'
    | 'choice_act'
    | 'choice_feedback';

  const [currentStep, setCurrentStep] = useState<FlowStep>('act0');
  const [selectedChoiceId, setSelectedChoiceId] = useState<ChoiceId>('choice1');

  // Audio and Subtitle language selectors
  const [selectedAudioLang, setSelectedAudioLang] = useState<Language>(currentLang);
  const [selectedVttLang, setSelectedVttLang] = useState<Language>(currentLang);
  const [availableVttLangs, setAvailableVttLangs] = useState<Language[]>(ALL_SUPPORTED_LANGUAGES);
  const [isCheckingVttLangs, setIsCheckingVttLangs] = useState<boolean>(false);

  // Synchronize audio and subtitle languages when parent currentLang prop updates
  useEffect(() => {
    if (currentLang) {
      setSelectedAudioLang((prev) => (prev !== currentLang ? currentLang : prev));
      setSelectedVttLang((prev) => (prev !== currentLang ? currentLang : prev));
      setCandidateAudioIdx(0);
    }
  }, [currentLang]);

  // Video & audio playback state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [isVideoFinished, setIsVideoFinished] = useState<boolean>(false);
  const [isMediaNotFound, setIsMediaNotFound] = useState<boolean>(false);
  const [candidateVideoIdx, setCandidateVideoIdx] = useState<number>(0);
  const [candidateAudioIdx, setCandidateAudioIdx] = useState<number>(0);

  // Subtitles & Comments drawer
  const [subtitles, setSubtitles] = useState<SubtitleCue[]>([]);
  const [activeSubtitle, setActiveSubtitle] = useState<string>('');
  const [showCommentsDrawer, setShowCommentsDrawer] = useState<boolean>(false);

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
  const crawlContainerRef = useRef<HTMLDivElement | null>(null);
  const crawlSentinelRef = useRef<HTMLDivElement | null>(null);

  // Derive world and tale name for Supabase storage paths
  const { world: currentWorld, taleName: currentTaleName } = useMemo(() => {
    return getTaleWorldAndName(tale);
  }, [tale]);

  // Find the active chapter configuration
  const currentChapterConfig = useMemo(() => {
    const isElDoradoTorch = currentWorld === 'ElDorado' && currentTaleName === 'the_torch';
    const custom = chapterConfigs.find((cfg) => cfg.id === currentChapterNumber);

    if (custom) {
      if (isElDoradoTorch && currentChapterNumber === 0 && (!custom.choices || custom.choices.length === 0)) {
        return {
          ...custom,
          hasAct1: false,
          hasGenderActs: false,
          choices: [
            {
              id: 'choice1' as ChoiceId,
              descriptionKey: 'eldorado_act0_choice1_description' as keyof Translations,
              description: 'Give his light',
              available: true,
            },
            {
              id: 'choice2' as ChoiceId,
              descriptionKey: 'eldorado_act0_choice2_description' as keyof Translations,
              description: 'Afraid to lose his light',
              available: true,
            },
            { id: 'choice3' as ChoiceId, available: false },
            { id: 'choice4' as ChoiceId, available: false },
          ],
        };
      }
      return custom;
    }

    if (isElDoradoTorch) {
      return {
        id: currentChapterNumber,
        hasAct1: false,
        hasGenderActs: false,
        choices: currentChapterNumber === 0 ? [
          {
            id: 'choice1' as ChoiceId,
            descriptionKey: 'eldorado_act0_choice1_description' as keyof Translations,
            description: 'Give his light',
            available: true,
          },
          {
            id: 'choice2' as ChoiceId,
            descriptionKey: 'eldorado_act0_choice2_description' as keyof Translations,
            description: 'Afraid to lose his light',
            available: true,
          },
          { id: 'choice3' as ChoiceId, available: false },
          { id: 'choice4' as ChoiceId, available: false },
        ] : [],
      };
    }

    return {
      id: currentChapterNumber,
      hasAct1: currentChapterNumber === 0,
      hasGenderActs: currentChapterNumber === 0,
      choices: currentChapterNumber === 0 ? [] : [
        { id: 'choice1', available: true },
        { id: 'choice2', available: true },
        { id: 'choice3', available: true },
        { id: 'choice4', available: true },
      ],
    };
  }, [chapterConfigs, currentChapterNumber, currentWorld, currentTaleName]);

  const maxChapterId = useMemo(() => {
    if (!chapterConfigs || chapterConfigs.length === 0) return 1;
    return Math.max(...chapterConfigs.map((c) => c.id));
  }, [chapterConfigs]);

  const isFeedbackMode = currentStep === 'choice_feedback';
  const isFeedbackReadAloud = currentStep === 'choice_feedback' && isCrawlFinished;

  const currentChoiceConfig = useMemo(() => {
    return currentChapterConfig.choices?.find((c) => c.id === selectedChoiceId);
  }, [currentChapterConfig, selectedChoiceId]);

  const currentChoiceNum = useMemo(() => {
    return parseInt(selectedChoiceId.replace('choice', '') || '1', 10);
  }, [selectedChoiceId]);

  const currentChoiceTitle = useMemo(() => {
    if (!currentChoiceConfig) return `Choice ${currentChoiceNum}`;
    return (
      getChoiceLocalizedTitle(
        currentChoiceConfig,
        currentLang,
        currentChoiceNum - 1,
        currentWorld,
        currentTaleName,
        currentChapterNumber
      ) ||
      getChoiceLocalizedDescription(
        currentChoiceConfig,
        currentLang,
        currentWorld,
        currentTaleName,
        currentChapterNumber
      ) ||
      currentChoiceConfig.title ||
      `Choice ${currentChoiceNum}`
    );
  }, [
    currentChoiceConfig,
    currentLang,
    currentChoiceNum,
    currentWorld,
    currentTaleName,
    currentChapterNumber,
  ]);

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
      if (currentStep === 'gender_branch') {
        return effectiveGender === 'male'
          ? {
              chapter: 0,
              act: 'male_act',
              characterName: 'Elion',
              gender: 'male',
              type: 'character',
            }
          : {
              chapter: 0,
              act: 'female_act',
              characterName: 'Alethea',
              gender: 'female',
              type: 'character',
            };
      }
      if (currentStep === 'act1') {
        return {
          chapter: 0,
          act: 'act1',
          type: 'narrative',
        };
      }
    }

    if (currentStep === 'choice_act' || currentStep === 'choice_feedback') {
      const choiceCfg = currentChapterConfig.choices.find((c) => c.id === selectedChoiceId);
      const choiceNum = selectedChoiceId.replace('choice', '') || '1';
      const choiceTitle = choiceCfg
        ? (getChoiceLocalizedTitle(choiceCfg, currentLang, parseInt(choiceNum, 10) - 1, currentWorld, currentTaleName, currentChapterNumber)
           || getChoiceLocalizedDescription(choiceCfg, currentLang, currentWorld, currentTaleName, currentChapterNumber)
           || `Chapter ${currentChapterNumber} • Choice ${choiceNum}`)
        : `Chapter ${currentChapterNumber} • Choice ${choiceNum}`;
      return {
        chapter: currentChapterNumber,
        act: `choice${choiceNum}`,
        title: choiceTitle,
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
      return getChoiceMp4CandidateUrls(
        currentWorld,
        currentTaleName,
        currentChapterNumber,
        selectedChoiceId
      );
    }
    return getActMp4CandidateUrls(currentActData, folderPath);
  }, [currentStep, currentWorld, currentTaleName, currentChapterNumber, selectedChoiceId, currentActData, folderPath]);

  const audioCandidates = useMemo(() => {
    if (currentStep === 'choice_act') {
      return getChoiceMp3CandidateUrls(
        currentWorld,
        currentTaleName,
        currentChapterNumber,
        selectedChoiceId,
        selectedAudioLang
      );
    }
    return getActMp3CandidateUrls(currentActData, selectedAudioLang, folderPath);
  }, [currentStep, currentWorld, currentTaleName, currentChapterNumber, selectedChoiceId, selectedAudioLang, currentActData, folderPath]);

  const currentVideoUrl = videoCandidates[candidateVideoIdx] || videoCandidates[0];
  const currentAudioUrl = audioCandidates[candidateAudioIdx] || audioCandidates[0];

  const handleAudioError = () => {
    if (candidateAudioIdx + 1 < audioCandidates.length) {
      setCandidateAudioIdx((prev) => prev + 1);
    }
  };

  // Check available VTT languages for the current act
  // "if a vtt file is not available for an act, play the mp3 and mp4 file and remove the language dropdown choice of that specific language. e.g if act0_en.vtt is not available remove the English in the dropdown button"
  useEffect(() => {
    if (currentStep === 'choices' || currentStep === 'choice_feedback') return;

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

    checkLanguages();

    return () => {
      isMounted = false;
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
    setActiveSubtitle('');
    setIsCrawlFinished(false);
    setReadTranscript('');
    setReadAccuracy(null);
    setHasClaimedPoints(false);
    setSpeechError(null);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isAutoPlay) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (isAutoPlay && currentAudioUrl) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
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
          const res = await fetch(url);
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
          const res = await fetch(url);
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

      // No VTT file found: skip feedback and return to choices page
      if (isMounted) {
        setVttRawText('');
        setFeedbackParagraphs([]);
        if (currentStep === 'choice_feedback') {
          setCurrentStep('choices');
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

  // Synchronize audio loading and playback with video
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAudioUrl) return;

    try {
      audio.load();
    } catch {}

    const syncAndPlay = () => {
      if (videoRef.current && !isNaN(videoRef.current.currentTime) && videoRef.current.currentTime > 0) {
        try {
          audio.currentTime = videoRef.current.currentTime;
        } catch {}
      }
      if (isAutoPlay && !isMuted) {
        audio.play().catch(() => {});
      }
    };

    if (audio.readyState >= 2) {
      syncAndPlay();
    } else {
      audio.addEventListener('canplay', syncAndPlay, { once: true });
    }

    return () => {
      audio.removeEventListener('canplay', syncAndPlay);
    };
  }, [currentAudioUrl, isAutoPlay, isMuted]);

  // Synchronize video auto-play
  useEffect(() => {
    if (videoRef.current) {
      if (isAutoPlay) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isAutoPlay]);

  // Synchronize mute:
  // Crucial: video is ALWAYS muted when an MP3 audio track is present so the baked-in English audio from the MP4 doesn't play over the selected MP3 language!
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
    if (videoRef.current) {
      videoRef.current.muted = Boolean(currentAudioUrl) || isMuted;
    }
  }, [isMuted, currentAudioUrl]);

  const handleTimeUpdate = (curr: number) => {
    if (audioRef.current && videoRef.current && !audioRef.current.paused && Math.abs(audioRef.current.currentTime - curr) > 0.3) {
      audioRef.current.currentTime = curr;
    }

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
    if (candidateVideoIdx + 1 < videoCandidates.length) {
      setCandidateVideoIdx((prev) => prev + 1);
    } else {
      setIsMediaNotFound(true);
    }
  };

  // Replay
  const handleReplay = () => {
    setIsVideoFinished(false);
    setIsCrawlFinished(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (isAutoPlay && currentAudioUrl) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  };

  // Skip MP3 and MP4 playback
  const handleSkipMedia = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      try {
        if (!isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
          audioRef.current.currentTime = audioRef.current.duration;
        }
      } catch {}
    }
    if (videoRef.current) {
      videoRef.current.pause();
      try {
        if (!isNaN(videoRef.current.duration) && videoRef.current.duration > 0) {
          videoRef.current.currentTime = videoRef.current.duration;
        }
      } catch {}
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
   * Primary FLOW TRANSITION LOGIC
   *
   * Chapter 0: 'act0' -> 'avatar gender' -> 'not avatar gender' -> 'act1' (if hasAct1) -> 'CHOICES' (if hasChoices) -> Chapter 1
   *   1- male_act then female_act or female_act then male_act according to avatar gender
   *   e.g.: If avatar male:
   *   'act0' -> male_act -> female_act -> 'act1' (if hasAct1) -> 'CHOICES' (if hasChoices) -> Chapter 1
   *   e.g.: If avatar female:
   *   'act0' -> female_act -> male_act -> 'act1' (if hasAct1) -> 'CHOICES' (if hasChoices) -> Chapter 1
   *
   * Chapters 1..N: 'act0' -> CHOICES -> Chapter n+1
   *
   * 'CHOICES': Choices screen -> 'choice_act' (video & audio) -> 'choice_feedback' (if hasFeedback crawl & read)
   */
  const goToNext = () => {
    // 1. If currently playing a choice act video, advance to its feedback screen if vtt exists, else advance to next chapter
    if (currentStep === 'choice_act') {
      if (feedbackParagraphs.length > 0) {
        setCurrentStep('choice_feedback');
      } else {
        advanceChapterOrClose();
      }
      return;
    }

    // 2. If on choice feedback screen, advance to the next chapter or finish
    if (currentStep === 'choice_feedback') {
      advanceChapterOrClose();
      return;
    }

    // 3. Chapter 0 Flow:
    if (currentChapterNumber === 0) {
      const isElDorado = currentWorld === 'ElDorado';
      const hasGenderActs = currentChapterConfig.hasGenderActs ?? (!isElDorado);
      const hasAct1 = currentChapterConfig.hasAct1 ?? (!isElDorado);
      const avatarGenderAct: FlowStep = effectiveGender === 'male' ? 'male_act' : 'female_act';
      const notAvatarGenderAct: FlowStep = effectiveGender === 'male' ? 'female_act' : 'male_act';
      const hasChoices = Boolean(currentChapterConfig.choices && currentChapterConfig.choices.some((c) => c.available));

      if (currentStep === 'act0') {
        if (hasGenderActs) {
          setCurrentStep(avatarGenderAct);
          return;
        }
        if (hasAct1) {
          setCurrentStep('act1');
          return;
        }
        if (hasChoices) {
          setCurrentStep('choices');
          return;
        }
        // Advance to Chapter 1
        setCurrentChapterNumber(1);
        setCurrentStep('act0');
        return;
      }

      if (currentStep === avatarGenderAct || currentStep === 'gender_branch') {
        setCurrentStep(notAvatarGenderAct);
        return;
      }

      if (currentStep === notAvatarGenderAct) {
        if (hasAct1) {
          setCurrentStep('act1');
          return;
        }
        if (hasChoices) {
          setCurrentStep('choices');
          return;
        }
        // Advance to Chapter 1
        setCurrentChapterNumber(1);
        setCurrentStep('act0');
        return;
      }

      if (currentStep === 'act1') {
        if (hasChoices) {
          setCurrentStep('choices');
          return;
        }
        // Advance to Chapter 1
        setCurrentChapterNumber(1);
        setCurrentStep('act0');
        return;
      }

      if (currentStep === 'choices') {
        const firstAvail = currentChapterConfig.choices.find((c) => c.available) || currentChapterConfig.choices[0];
        if (firstAvail) {
          handleSelectChoice(firstAvail.id);
        }
        return;
      }
    }

    // 4. Chapters 1..N Flow:
    // 'act0' -> CHOICES -> Chapter n+1
    if (currentChapterNumber >= 1) {
      const hasChoices = Boolean(currentChapterConfig.choices && currentChapterConfig.choices.some((c) => c.available));

      if (currentStep === 'act0') {
        if (hasChoices) {
          setCurrentStep('choices');
        } else {
          advanceChapterOrClose();
        }
        return;
      }

      if (currentStep === 'choices') {
        const firstAvail = currentChapterConfig.choices.find((c) => c.available) || currentChapterConfig.choices[0];
        if (firstAvail) {
          handleSelectChoice(firstAvail.id);
        }
        return;
      }
    }
  };

  const goToPrev = () => {
    if (currentStep === 'choice_feedback') {
      setCurrentStep('choice_act');
      return;
    }

    if (currentStep === 'choice_act') {
      setCurrentStep('choices');
      return;
    }

    // Chapter 0 Flow Prev:
    if (currentChapterNumber === 0) {
      const isElDorado = currentWorld === 'ElDorado';
      const hasGenderActs = currentChapterConfig.hasGenderActs ?? (!isElDorado);
      const hasAct1 = currentChapterConfig.hasAct1 ?? (!isElDorado);
      const avatarGenderAct: FlowStep = effectiveGender === 'male' ? 'male_act' : 'female_act';
      const notAvatarGenderAct: FlowStep = effectiveGender === 'male' ? 'female_act' : 'male_act';

      if (currentStep === 'choices') {
        if (hasAct1) {
          setCurrentStep('act1');
        } else if (hasGenderActs) {
          setCurrentStep(notAvatarGenderAct);
        } else {
          setCurrentStep('act0');
        }
        return;
      }

      if (currentStep === 'act1') {
        setCurrentStep(notAvatarGenderAct);
        return;
      }

      if (currentStep === notAvatarGenderAct) {
        setCurrentStep(avatarGenderAct);
        return;
      }

      if (currentStep === avatarGenderAct || currentStep === 'gender_branch') {
        setCurrentStep('act0');
        return;
      }

      if (currentStep === 'act0') {
        if (onClose) onClose();
        return;
      }
    }

    // Chapters 1..N Flow Prev:
    if (currentChapterNumber >= 1) {
      if (currentStep === 'choices') {
        setCurrentStep('act0');
        return;
      }

      if (currentStep === 'act0') {
        // Go back to previous chapter
        const prevChapterId = currentChapterNumber - 1;
        setCurrentChapterNumber(prevChapterId);

        if (prevChapterId === 0) {
          const ch0Config = chapterConfigs.find((c) => c.id === 0);
          const hasChoices = Boolean(ch0Config?.choices && ch0Config.choices.some((c) => c.available));
          if (hasChoices) {
            setCurrentStep('choices');
          } else if (ch0Config?.hasAct1 ?? true) {
            setCurrentStep('act1');
          } else {
            const notAvatarGenderAct: FlowStep = effectiveGender === 'male' ? 'female_act' : 'male_act';
            setCurrentStep(notAvatarGenderAct);
          }
        } else {
          const prevConfig = chapterConfigs.find((c) => c.id === prevChapterId);
          if (prevConfig?.choices && prevConfig.choices.some((c) => c.available)) {
            setCurrentStep('choices');
          } else {
            setCurrentStep('act0');
          }
        }
        return;
      }
    }
  };

  // Choice selection handler: plays the chosen act video and audio
  const handleSelectChoice = (choiceId: ChoiceId) => {
    setSelectedChoiceId(choiceId);
    setCandidateVideoIdx(0);
    setCandidateAudioIdx(0);
    setIsVideoFinished(false);
    setIsMediaNotFound(false);
    setVttRawText('');
    setFeedbackParagraphs([]);
    setCurrentStep('choice_act');
  };

  // Language selectors
  const handleAudioLanguageSelected = (newLang: Language) => {
    setSelectedAudioLang(newLang);
    setCandidateAudioIdx(0);
    setIsAutoPlay(true);
    setIsVideoFinished(false);
    if (availableVttLangs.includes(newLang)) {
      setSelectedVttLang(newLang);
    }
    if (onLanguageChange) onLanguageChange(newLang);
  };

  const handleVttLanguageSelected = (newLang: Language) => {
    setSelectedVttLang(newLang);
    if (onLanguageChange) onLanguageChange(newLang);
  };

  // Speech Recognition (Read Aloud) Implementation
  const startSpeechRecognition = () => {
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
    setHasClaimedPoints(true);
    if (onEarnLanguagePoints) {
      onEarnLanguagePoints(selectedVttLang, 50);
    }
    if (onEarnSkillPoint) {
      onEarnSkillPoint(tale?.skill || 'Leader');
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
      {/* 1. TOP HEADER OVERLAY: Completely transparent background, cinematic buttons */}
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

          <div
            className={`hidden sm:flex items-center gap-2 px-2 py-1 text-xs font-semibold font-cinzel tracking-wider bg-transparent border-0 ${
              darkMode
                ? 'text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]'
                : 'text-amber-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]'
            }`}
          >
            <Compass className={`w-3.5 h-3.5 ${darkMode ? 'text-[#d4af37]' : 'text-amber-700'}`} />
            <span> {tale?.title || ''}</span>
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

            {/* Audio Voice MP3 Language Selector */}
            <FlagLanguageDropdown
              id="act-top-mp3-selector"
              type="mp3"
              selectedLang={selectedAudioLang}
              onSelectLang={handleAudioLanguageSelected}
              darkMode={darkMode}
              cinematic={true}
              tooltip="Voice Audio (MP3)"
            />
          </div>
        )}
      </div>

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

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className={`w-5 h-5 ${darkMode ? 'text-[#d4af37]' : 'text-amber-600'} animate-pulse`} />
              <span
                className={`text-xs uppercase tracking-widest font-bold ${
                  darkMode ? 'text-[#d4af37]' : 'text-amber-800'
                }`}
              >
                {tale?.title || currentTaleName}
              </span>
              <Sparkles className={`w-5 h-5 ${darkMode ? 'text-[#d4af37]' : 'text-amber-600'} animate-pulse`} />
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
                const choiceTitle = getChoiceLocalizedTitle(choice, currentLang, idx, currentWorld, currentTaleName, currentChapterNumber);
                const choiceSubtitle = getChoiceLocalizedSubtitle(choice, currentLang, currentWorld, currentTaleName, currentChapterNumber);
                const choiceDescription = getChoiceLocalizedDescription(choice, currentLang, currentWorld, currentTaleName, currentChapterNumber);

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
                        alt={choiceTitle || choiceDescription || `Choice ${idx + 1}`}
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

                      {/* Bottom Info overlay: Localized Title, Subtitle, and Description */}
                      {(choiceTitle || choiceSubtitle || choiceDescription) && (
                        <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 right-2.5 sm:right-3 z-10 pointer-events-none">
                          {choiceTitle && choiceTitle.trim() !== '' && (
                            <h4 className="text-sm sm:text-base font-cinzel font-bold text-amber-200 group-hover:text-[#ffe81f] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-1">
                              {choiceTitle}
                            </h4>
                          )}
                          {choiceSubtitle && choiceSubtitle.trim() !== '' && (
                            <div className="text-[11px] sm:text-xs text-[#d4af37] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] italic line-clamp-1">
                              {choiceSubtitle}
                            </div>
                          )}
                          {choiceDescription && choiceDescription.trim() !== '' && (
                            <p
                              className={`text-slate-200 line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-sans mt-0.5 ${
                                !choiceTitle && !choiceSubtitle
                                  ? 'text-xs sm:text-sm font-semibold text-amber-100 font-cinzel tracking-wide'
                                  : 'text-[11px] sm:text-xs'
                              }`}
                            >
                              {choiceDescription}
                            </p>
                          )}
                        </div>
                      )}
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
                  <div className="mb-6">
                    <p
                      className={`text-sm sm:text-base font-cinzel font-bold tracking-widest uppercase mb-1 ${
                        darkMode
                          ? 'text-[#ffe81f] drop-shadow-[0_0_10px_rgba(255,232,31,0.6)]'
                          : 'text-amber-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]'
                      }`}
                    >
                      Chapter {currentChapterNumber} • Feedback
                    </p>
                    <h2
                      className={`text-2xl sm:text-4xl font-cinzel font-black uppercase tracking-wider ${
                        darkMode
                          ? 'text-[#ffe81f] drop-shadow-[0_0_15px_rgba(255,232,31,0.6)]'
                          : 'text-amber-950 drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]'
                      }`}
                    >
                      {currentChoiceTitle}
                    </h2>
                  </div>

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
                {/* Header: Choice Title + Read Aloud prompt with Read Aloud button near text */}
                <div className="mb-4">
                  <h2
                    className={`text-xl sm:text-3xl font-cinzel font-bold tracking-wide ${
                      darkMode ? 'text-amber-200' : 'text-amber-950 font-black'
                    }`}
                  >
                    {currentChoiceTitle}
                  </h2>

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
                    className={`mb-3 p-2.5 rounded-xl border text-xs ${
                      darkMode
                        ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
                        : 'bg-amber-50 border-amber-300 text-amber-900 font-medium'
                    }`}
                  >
                    {speechError}
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

                  {/* Bottom Right: Language Selector Dropdown and `>` Chevron Icon Button */}
                  <div className="flex items-center gap-2 sm:gap-3">
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

                    <button
                      id="feedback-next-chapter-action-btn"
                      onClick={goToNext}
                      type="button"
                      className={`p-2 transition-all hover:scale-125 active:scale-95 cursor-pointer flex items-center justify-center bg-transparent border-0 rounded-none ${
                        darkMode
                          ? 'text-[#d4af37] hover:text-[#ffe81f] drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]'
                          : 'text-amber-800 hover:text-amber-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]'
                      }`}
                      title="Next"
                      aria-label="Next"
                    >
                      <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 transition-colors stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* C. ACT VIDEO MEDIA (Chapter 1 acts, Chapter 2..N act0, and Choice Acts) */}
        {currentStep !== 'choices' && currentStep !== 'choice_feedback' && (
          <div className="relative w-full h-full flex items-start sm:items-center justify-center overflow-hidden bg-black">
            {!isMediaNotFound ? (
              <video
                id="act-fullscreen-video"
                ref={videoRef}
                key={`${currentActData.chapter}-${currentActData.act}-${currentVideoUrl}`}
                src={currentVideoUrl}
                muted={Boolean(currentAudioUrl) || isMuted}
                playsInline
                crossOrigin="anonymous"
                preload="auto"
                onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
                onPlay={() => {
                  if (audioRef.current && isAutoPlay && !isMuted) {
                    if (videoRef.current && !isNaN(videoRef.current.currentTime)) {
                      audioRef.current.currentTime = videoRef.current.currentTime;
                    }
                    audioRef.current.play().catch(() => {});
                  }
                }}
                onPause={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                  }
                }}
                onSeeked={(e) => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = e.currentTarget.currentTime;
                  }
                }}
                onEnded={() => {
                  setIsVideoFinished(true);
                  setActiveSubtitle('');
                  if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                  }
                  if (currentStep === 'choice_act') {
                    // After choice video finishes, display feedback if vtt exists, otherwise advance to next chapter
                    if (isAutoPlay) {
                      setTimeout(() => {
                        if (feedbackParagraphs.length > 0) {
                          setCurrentStep('choice_feedback');
                        } else {
                          advanceChapterOrClose();
                        }
                      }, 1000);
                    }
                  } else if (isAutoPlay) {
                    setTimeout(() => {
                      goToNext();
                    }, 3500);
                  }
                }}
                onError={handleVideoError}
                className="w-[calc(100%+80px)] max-w-none -ml-[40px] -mr-[40px] h-full object-cover object-top sm:w-full sm:h-full sm:ml-0 sm:mr-0 sm:object-cover sm:object-center z-0"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 p-6 text-center z-10">
                <div className="w-16 h-16 rounded-full bg-slate-900/90 border-2 border-[#d4af37] flex items-center justify-center mb-2">
                  <Film className="w-8 h-8 text-[#d4af37]" />
                </div>
                <div className="px-6 py-2 rounded-full border-2 border-[#d4af37] bg-slate-950 text-[#d4af37] font-bold text-base sm:text-xl font-cinzel">
                  {t('comingSoon', currentLang)}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-sm">
                  {currentActData.title}
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

            {/* Audio Track */}
            {currentAudioUrl && (
              <audio
                key={`${currentAudioUrl}-${selectedAudioLang}`}
                id="act-background-audio"
                ref={audioRef}
                src={currentAudioUrl}
                muted={isMuted}
                preload="auto"
                playsInline
                onError={handleAudioError}
                onEnded={() => {
                  if (isMediaNotFound) {
                    setIsVideoFinished(true);
                    setActiveSubtitle('');
                    if (currentStep === 'choice_act') {
                      if (isAutoPlay) {
                        setTimeout(() => {
                          if (feedbackParagraphs.length > 0) {
                            setCurrentStep('choice_feedback');
                          } else {
                            advanceChapterOrClose();
                          }
                        }, 1000);
                      }
                    } else if (isAutoPlay) {
                      setTimeout(() => {
                        goToNext();
                      }, 2500);
                    }
                  }
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* 3. CENTER LEFT: PREVIOUS `<` BUTTON (Cinematic floating chevron, no round circle) */}
      {!isFeedbackMode && (
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

      {/* 4. CENTER RIGHT: NEXT `>` BUTTON (Cinematic floating chevron, no round circle) */}
      {!isFeedbackMode && (
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

      {/* 5. BOTTOM AREA: Always visible throughout the act, transparent background, no skip button, no text on buttons, no round circles */}
      {!isFeedbackMode && (
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
                  ? (isVideoFinished ? 'Choice Finished • Continue to Feedback' : currentActData.title)
                  : currentStep === 'choice_feedback'
                  ? `Language Practice: ${selectedVttLang}`
                  : isVideoFinished
                  ? t('actCompleted', currentLang)
                  : currentActData.title}
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
            {/* Comment Drawer Button */}
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

            {/* Next Step / Continue Button */}
            <button
              id="act-next-completion-btn"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="p-2 transition-all hover:scale-125 active:scale-95 cursor-pointer flex items-center justify-center text-[#d4af37] hover:text-[#ffe81f] drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] bg-transparent border-0 rounded-none"
              title={
                currentStep === 'choices'
                  ? 'Choose Below'
                  : currentStep === 'choice_act'
                  ? (feedbackParagraphs.length > 0 ? 'View Feedback' : 'Choices')
                  : currentStep === 'choice_feedback' && currentChapterNumber >= chapterConfigs.length
                  ? t('finishBtn', currentLang)
                  : currentStep === 'choice_feedback'
                  ? 'Next Chapter'
                  : t('nextAct', currentLang)
              }
              aria-label="Next Step"
            >
              <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8 text-[#d4af37] hover:text-[#ffe81f] transition-colors stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* COMMENTS DRAWER */}
      {showCommentsDrawer && (
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
