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
  Volume1,
  Award,
  FastForward,
  Shuffle,
  Compass,
  Scroll,
  Play,
  Pause,
} from 'lucide-react';

export function getTaleWorldAndName(tale: Tale | undefined): { world: string; taleName: string } {
  if (!tale) return { world: 'Atlantis', taleName: '5crystals' };
  if (tale.realmId === 'realm-work') {
    return { world: 'Work', taleName: tale.id === 'tale-job-quest' ? 'job_quest' : 'startup_winner' };
  }
  if (tale.realmId === 'realm-marriage') {
    return { world: 'Marriage', taleName: tale.id === 'tale-one-hart' ? 'one_hart' : 'pride_prejudice' };
  }
  if (tale.realmId === 'realm-dad-mom') {
    return { world: 'DadMom', taleName: tale.id === 'tale-baby' ? 'baby' : tale.id === 'tale-teens' ? 'teens' : 'child' };
  }
  if (tale.realmId === 'realm-eldorado') {
    return { world: 'ElDorado', taleName: 'city_of_gold' };
  }
  if (tale.realmId === 'realm-futureland') {
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
  fallbackIndex = 0
): string {
  const normalizedLang = (lang as Language) || 'EN';
  if (choice.titleKey && TRANSLATIONS[normalizedLang]?.[choice.titleKey]) {
    return t(choice.titleKey, normalizedLang);
  }
  const defaultKey = `${choice.id}_title` as keyof Translations;
  if (TRANSLATIONS[normalizedLang]?.[defaultKey]) {
    return t(defaultKey, normalizedLang);
  }
  return choice.title || `Choice ${fallbackIndex + 1}`;
}

export function getChoiceLocalizedSubtitle(
  choice: ChapterChoiceConfig,
  lang: Language | string = 'EN'
): string | undefined {
  const normalizedLang = (lang as Language) || 'EN';
  if (choice.subtitleKey && TRANSLATIONS[normalizedLang]?.[choice.subtitleKey]) {
    return t(choice.subtitleKey, normalizedLang);
  }
  const defaultKey = `${choice.id}_subtitle` as keyof Translations;
  if (TRANSLATIONS[normalizedLang]?.[defaultKey]) {
    return t(defaultKey, normalizedLang);
  }
  return choice.subtitle;
}

export function getChoiceLocalizedDescription(
  choice: ChapterChoiceConfig,
  lang: Language | string = 'EN'
): string | undefined {
  const normalizedLang = (lang as Language) || 'EN';
  if (choice.descriptionKey && TRANSLATIONS[normalizedLang]?.[choice.descriptionKey]) {
    return t(choice.descriptionKey, normalizedLang);
  }
  const defaultKey = `${choice.id}_description` as keyof Translations;
  if (TRANSLATIONS[normalizedLang]?.[defaultKey]) {
    return t(defaultKey, normalizedLang);
  }
  return choice.description;
}

export interface ChapterConfig {
  id: number; // 1..N
  hasAct1?: boolean; // Chapter 1 optional act1
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

  let world = 'Atlantis';
  let taleName = '5Ctrystals';

  if (tale) {
    if (tale.realmId === 'realm-work') {
      world = 'Work';
      taleName = tale.id === 'tale-job-quest' ? 'job_quest' : 'startup_winner';
    } else if (tale.realmId === 'realm-marriage') {
      world = 'Marriage';
      taleName = tale.id === 'tale-one-hart' ? 'one_hart' : 'pride_prejudice';
    } else if (tale.realmId === 'realm-dad-mom') {
      world = 'DadMom';
      taleName = tale.id === 'tale-baby' ? 'baby' : tale.id === 'tale-teens' ? 'teens' : 'child';
    } else if (tale.realmId === 'realm-eldorado') {
      world = 'ElDorado';
      taleName = 'city_of_gold';
    } else if (tale.realmId === 'realm-futureland') {
      world = 'FutureLand';
      taleName = 'ai_horizon';
    } else {
      world = 'Atlantis';
      taleName = '5Ctrystals';
    }
  }

  return [
    // Standard pattern requested with language suffix
    `${SUPABASE_BASE_URL}/${world}/${taleName}/chapter${chapterNumber}/choice${choiceNumber}/vtt/choice${choiceNumber}_${langCode}.vtt`
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

  // Find the active chapter configuration
  const currentChapterConfig = useMemo(() => {
    return (
      chapterConfigs.find((cfg) => cfg.id === currentChapterNumber) || {
        id: currentChapterNumber,
        hasAct1: currentChapterNumber === 0,
        choices: currentChapterNumber === 0 ? [] : [
          { id: 'choice1', available: true },
          { id: 'choice2', available: true },
          { id: 'choice3', available: true },
          { id: 'choice4', available: true },
        ],
      }
    );
  }, [chapterConfigs, currentChapterNumber]);

  const maxChapterId = useMemo(() => {
    if (!chapterConfigs || chapterConfigs.length === 0) return 1;
    return Math.max(...chapterConfigs.map((c) => c.id));
  }, [chapterConfigs]);

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

  // Derive world and tale name for Supabase storage paths
  const { world: currentWorld, taleName: currentTaleName } = useMemo(() => {
    return getTaleWorldAndName(tale);
  }, [tale]);

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
        ? getChoiceLocalizedTitle(choiceCfg, currentLang, parseInt(choiceNum, 10) - 1)
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
      const avatarGenderAct: FlowStep = effectiveGender === 'male' ? 'male_act' : 'female_act';
      const notAvatarGenderAct: FlowStep = effectiveGender === 'male' ? 'female_act' : 'male_act';
      const hasChoices = Boolean(currentChapterConfig.choices && currentChapterConfig.choices.some((c) => c.available));

      if (currentStep === 'act0') {
        setCurrentStep(avatarGenderAct);
        return;
      }

      if (currentStep === avatarGenderAct || currentStep === 'gender_branch') {
        setCurrentStep(notAvatarGenderAct);
        return;
      }

      if (currentStep === notAvatarGenderAct) {
        if (currentChapterConfig.hasAct1) {
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
      const avatarGenderAct: FlowStep = effectiveGender === 'male' ? 'male_act' : 'female_act';
      const notAvatarGenderAct: FlowStep = effectiveGender === 'male' ? 'female_act' : 'male_act';

      if (currentStep === 'choices') {
        if (currentChapterConfig.hasAct1) {
          setCurrentStep('act1');
        } else {
          setCurrentStep(notAvatarGenderAct);
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

  // Native Text-to-Speech (Listen Pronunciation)
  const speakPassageNative = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const textToSpeak = feedbackParagraphs.join('. ');
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = getSpeechLangTag(selectedVttLang);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
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
                const choiceTitle = getChoiceLocalizedTitle(choice, currentLang, idx);
                const choiceSubtitle = getChoiceLocalizedSubtitle(choice, currentLang);
                const choiceDescription = getChoiceLocalizedDescription(choice, currentLang);

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
                        alt={choiceTitle}
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
                          {choiceTitle && (
                            <h4 className="text-sm sm:text-base font-cinzel font-bold text-amber-200 group-hover:text-[#ffe81f] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-1">
                              {choiceTitle}
                            </h4>
                          )}
                          {choiceSubtitle && (
                            <div className="text-[11px] sm:text-xs text-[#d4af37] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] italic line-clamp-1">
                              {choiceSubtitle}
                            </div>
                          )}
                          {choiceDescription && (
                            <p className="text-[11px] sm:text-xs text-slate-200 line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-sans mt-0.5">
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
              <div className="relative w-full h-[70vh] sm:h-[76vh] flex flex-col items-center justify-center overflow-hidden [perspective:420px] select-none">
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
                      {currentChapterConfig.choices.find((c) => c.id === selectedChoiceId)?.title ||
                        `Choice ${selectedChoiceId.replace('choice', '')}`}
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
                  </div>
                </div>
              </div>
            ) : (
              /* AT THE END OF STAR WARS INTRO:
                 - ALL THE TEXT ON SCREEN WITH HIGH-CONTRAST LIGHT & DARK READABILITY
                 - FONT SIZING CONTROLS
                 - NUMBERED PARAGRAPH BLOCKS WITH GOLD ACCENTS
                 - READ ALOUD BUTTON WITH SPEECH RECOGNITION & SCORE POINTS */
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className={`relative z-30 w-full max-w-3xl max-h-[78vh] sm:max-h-[82vh] flex flex-col rounded-3xl border-2 ${
                  darkMode
                    ? 'border-[#d4af37]/70 bg-slate-950/95 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.9)]'
                    : 'border-[#c69214] bg-white/98 text-slate-900 shadow-[0_20px_50px_rgba(180,130,20,0.18)]'
                } backdrop-blur-2xl p-4 sm:p-7 overflow-hidden`}
              >
                {/* Header with target reading language & font size adjustment */}
                <div
                  className={`flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b mb-3 sm:mb-4 ${
                    darkMode ? 'border-[#d4af37]/30' : 'border-amber-200/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl ${
                        darkMode ? 'bg-amber-400/15 text-[#d4af37]' : 'bg-amber-100 text-[#8a5d12]'
                      }`}
                    >
                      <Scroll className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-base sm:text-xl font-cinzel font-bold tracking-wide ${
                          darkMode ? 'text-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-amber-950 font-black'
                        }`}
                      >
                        Feedback: {selectedChoiceId.toUpperCase()}
                      </h3>
                      <p
                        className={`text-[11px] font-sans ${
                          darkMode ? 'text-slate-400' : 'text-slate-600 font-medium'
                        }`}
                      >
                        Read the passage aloud to earn Language Mastery points
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Replay Crawl Button */}
                    <button
                      type="button"
                      onClick={() => setIsCrawlFinished(false)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                        darkMode
                          ? 'bg-slate-900/90 border-slate-700 hover:border-amber-400/50 text-slate-300 hover:text-amber-200'
                          : 'bg-amber-50 border-amber-200 hover:border-amber-400 text-amber-900 hover:bg-amber-100'
                      }`}
                      title="Watch the 3D Intro Crawl again"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="hidden sm:inline">Intro Crawl</span>
                    </button>

                    {/* Font size control */}
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
                        className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
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
                        className={`px-2 py-0.5 rounded text-sm transition-colors cursor-pointer ${
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
                        className={`px-2 py-0.5 rounded text-base transition-colors cursor-pointer ${
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

                    {/* Language Badge */}
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${
                        darkMode
                          ? 'bg-amber-400/10 border-amber-400/30 text-amber-200'
                          : 'bg-amber-100/90 border-amber-300 text-amber-900'
                      }`}
                    >
                      <span className={darkMode ? 'text-amber-300/70' : 'text-amber-700'}>Lang:</span>
                      <span className={`font-bold ${darkMode ? 'text-amber-200' : 'text-amber-950'}`}>
                        {selectedVttLang}
                      </span>
                    </div>
                  </div>
                </div>

                {/* All Text Displayed on Screen */}
                <div
                  id="choice-feedback-full-text"
                  className="flex-1 overflow-y-auto pr-2 space-y-3.5 sm:space-y-4 max-h-[38vh] sm:max-h-[44vh] custom-scrollbar"
                >
                  {feedbackParagraphs.map((para, i) => (
                    <div
                      key={i}
                      className={`p-4 sm:p-5 rounded-2xl border-l-4 transition-all ${
                        darkMode
                          ? 'bg-slate-900/85 border border-slate-800/80 border-l-[#d4af37] text-slate-100 shadow-sm'
                          : 'bg-amber-50/40 hover:bg-amber-50/70 border border-amber-200/70 border-l-[#b8860b] text-stone-900 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono mt-0.5 ${
                            darkMode
                              ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {i + 1}
                        </span>
                        <p
                          className={`${
                            feedbackFontSize === 'normal'
                              ? 'text-sm sm:text-base leading-relaxed'
                              : feedbackFontSize === 'large'
                              ? 'text-base sm:text-lg leading-relaxed sm:leading-loose'
                              : 'text-lg sm:text-xl leading-relaxed sm:leading-loose font-medium'
                          } ${darkMode ? 'text-slate-100' : 'text-stone-900 font-normal sm:font-medium'}`}
                        >
                          {para}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Read Aloud & Score Points Verification Hub */}
                <div
                  className={`mt-3.5 pt-3 border-t flex flex-col gap-2.5 ${
                    darkMode ? 'border-[#d4af37]/30' : 'border-amber-200/90'
                  }`}
                >
                  {/* Realtime Spoken Transcript Display */}
                  {readTranscript && (
                    <div
                      className={`p-3 rounded-xl border text-xs sm:text-sm ${
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

                  {/* Success / Points Awarded Badge */}
                  {hasClaimedPoints && (
                    <div
                      className={`p-3 rounded-xl border-2 flex items-center justify-between text-xs sm:text-sm font-bold animate-in fade-in ${
                        darkMode
                          ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-200'
                          : 'bg-emerald-50 border-emerald-600/70 text-emerald-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Award className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`} />
                        <span>Language Mastery Verified! +50 Points Awarded in {selectedVttLang}</span>
                      </div>
                      <CheckCircle2 className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`} />
                    </div>
                  )}

                  {speechError && (
                    <div
                      className={`p-2.5 rounded-xl border text-xs ${
                        darkMode
                          ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
                          : 'bg-amber-50 border-amber-300 text-amber-900 font-medium'
                      }`}
                    >
                      {speechError}
                    </div>
                  )}

                  {/* Action Buttons: Read Aloud + Listen Pronunciation + Next */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      {/* Read Aloud Button */}
                      <button
                        id="choice-read-aloud-btn"
                        onClick={isReadingAloud ? stopSpeechRecognition : startSpeechRecognition}
                        type="button"
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${
                          isReadingAloud
                            ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-400 animate-pulse'
                            : 'bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-300'
                        } font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer`}
                      >
                        {isReadingAloud ? (
                          <>
                            <MicOff className="w-4 h-4" />
                            <span>Listening... Press to Finish</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4" />
                            <span>Read Aloud</span>
                          </>
                        )}
                      </button>

                      {/* Listen Native Pronunciation */}
                      <button
                        id="choice-listen-tts-btn"
                        onClick={speakPassageNative}
                        type="button"
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                          darkMode
                            ? 'bg-slate-900/90 hover:bg-[#d4af37]/20 border-[#d4af37]/60 text-amber-200'
                            : 'bg-white hover:bg-amber-50 border-amber-400 text-amber-950 shadow-xs'
                        }`}
                        title="Listen to native voice pronunciation"
                      >
                        <Volume1 className={`w-4 h-4 ${darkMode ? 'text-[#d4af37]' : 'text-[#8a5d12]'}`} />
                        <span className="hidden sm:inline">Listen Pronunciation</span>
                      </button>
                    </div>

                    {/* Manual Claim fallback if microphone not supported */}
                    {!hasClaimedPoints && (
                      <button
                        id="choice-claim-points-btn"
                        onClick={awardLanguagePoints}
                        type="button"
                        className={`text-xs underline cursor-pointer font-medium ${
                          darkMode
                            ? 'text-amber-300 hover:text-amber-200'
                            : 'text-amber-800 hover:text-amber-950 font-semibold'
                        }`}
                      >
                        I have read it aloud (Claim Points)
                      </button>
                    )}

                    {/* Direct Next Chapter / Continue Button */}
                    <button
                      id="feedback-next-chapter-action-btn"
                      onClick={goToNext}
                      type="button"
                      className="flex items-center gap-1.5 px-4.5 py-2 rounded-full border-2 border-amber-400 bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <span>
                        {currentChapterNumber >= maxChapterId
                          ? t('finishBtn', currentLang)
                          : 'Next Chapter'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
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

      {/* 4. CENTER RIGHT: NEXT `>` BUTTON (Cinematic floating chevron, no round circle) */}
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

      {/* 5. BOTTOM AREA: Always visible throughout the act, transparent background, no skip button, no text on buttons, no round circles */}
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
