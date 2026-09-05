import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Language,
  UserProfile,
  SkillType,
  ChapterComment,
  Tale,
} from '../types';
import { ActItem, getTaleActItems, getAtlantisActItems } from '../lib/taleData';
import {
  Act,
  SUPABASE_BASE_URL,
  getActMp4CandidateUrls,
  getActMp3Url,
  getActVttCandidateUrls,
  getChoiceMp4CandidateUrls,
  getChoiceMp3CandidateUrls,
  getChoiceVttCandidateUrls,
  getChoiceFeedbackVttCandidateUrls,
  normalizeLangCode,
  realmAtlantisJpg,
} from '../lib/assetRegistry';
import { CommentsDrawer } from './CommentsDrawer';
import { FlagLanguageDropdown } from './FlagLanguageDropdown';
import { t } from '../lib/i18n';
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
  description?: string;
  skillOutcome?: SkillType;
}

export interface ChapterConfig {
  id: number; // 1..N
  title?: string;
  subtitle?: string;
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

// Default 4-chapter narrative configuration
export const DEFAULT_CHAPTER_CONFIGS: ChapterConfig[] = [
  {
    id: 1,
    title: 'The Awakening Call',
    subtitle: 'Destiny Beckons',
    hasAct1: true,
    choices: [
      {
        id: 'choice1',
        available: true,
        title: 'Heed the Crystal Harmonic',
        subtitle: 'Path of Harmonic Wisdom',
        description: 'Attune yourself to the elder tides and harmonize the crystalline matrix.',
        skillOutcome: 'Leader',
      },
      {
        id: 'choice2',
        available: true,
        title: 'Consult the Elder Archives',
        subtitle: 'Path of Prudence',
        description: 'Delve into the ancestral logs before stepping beyond the coral threshold.',
        skillOutcome: 'Plan',
      },
      {
        id: 'choice3',
        available: true,
        title: 'Probe the Sunken Chasm',
        subtitle: 'Path of Discovery',
        description: 'Descend with courage into the luminous crevasse to investigate ancient tremors.',
        skillOutcome: 'Listen',
      },
      {
        id: 'choice4',
        available: true,
        title: 'Assemble the Coral Vanguard',
        subtitle: 'Path of Unity',
        description: 'Unite the kingdom sentinels into an unbreakable defensive formation.',
        skillOutcome: 'Win4All',
      },
    ],
  },
  {
    id: 2,
    title: 'The Resonance of Atlantis',
    subtitle: 'The Crystalline Trials',
    hasAct1: false,
    choices: [
      {
        id: 'choice1',
        available: true,
        title: 'Align the Azure Crystal',
        subtitle: 'Path of Harmonic Wisdom',
        description: 'Attune yourself to the elder tides and harmonize the crystalline matrix.',
        skillOutcome: 'Leader',
      },
      {
        id: 'choice2',
        available: true,
        title: 'Fortify the Submerged Barrier',
        subtitle: 'Path of Prudence',
        description: 'Reinforce the outer gates against the impending oceanic tremor.',
        skillOutcome: 'Plan',
      },
      {
        id: 'choice3',
        available: true,
        title: 'Probe the Abyssal Rift',
        subtitle: 'Path of Curiosity',
        description: 'Descend cautiously into the fissure to uncover ancient titan artifacts.',
        skillOutcome: 'Listen',
      },
      {
        id: 'choice4',
        available: true,
        title: 'Surge the Core Generators',
        subtitle: 'Path of Bold Action',
        description: 'Unleash full reactor power to dispel the surrounding shadow vortex.',
        skillOutcome: 'Win4All',
      },
    ],
  },
  {
    id: 3,
    title: 'The Guardians of the Reef',
    subtitle: 'Testing of Resolve',
    hasAct1: false,
    // Chapter 3 defines only choice1 and choice2 as available
    choices: [
      {
        id: 'choice1',
        available: true,
        title: 'Commune with the Coral Ancients',
        subtitle: 'Symbiotic Communion',
        description: 'Speak in the ancient oceanic tongue to win the favor of the reef protectors.',
        skillOutcome: 'Win4All',
      },
      {
        id: 'choice2',
        available: true,
        title: 'Navigate the Sonic Labyrinth',
        subtitle: 'Tactical Navigation',
        description: 'Deploy acoustic probes to chart a safe passage around hostile vortexes.',
        skillOutcome: 'Plan',
      },
      {
        id: 'choice3',
        available: false, // Omitted
        title: 'Force the Coral Gates',
        description: 'Unavailable in this timeline.',
      },
      {
        id: 'choice4',
        available: false, // Omitted
        title: 'Retreat to the Shallows',
        description: 'Unavailable in this timeline.',
      },
    ],
  },
  {
    id: 4,
    title: 'The Five Crystals Ascendance',
    subtitle: 'The Pinnacle Outcome',
    hasAct1: false,
    choices: [
      {
        id: 'choice1',
        available: true,
        title: 'Unite the Five Crystals',
        subtitle: 'The Grand Synthesis',
        description: 'Bring together all celestial shards to illuminate the forgotten kingdom forever.',
        skillOutcome: 'Leader',
      },
      {
        id: 'choice2',
        available: true,
        title: 'Entrust the Legacy to the Keepers',
        subtitle: 'Enduring Stewardship',
        description: 'Seal the inner sanctum so future generations may inherit peace.',
        skillOutcome: 'Recharge',
      },
      {
        id: 'choice3',
        available: true,
        title: 'Broadcast the Light Beyond the Seas',
        subtitle: 'Global Beacon',
        description: 'Project the golden frequency to every continent across the globe.',
        skillOutcome: 'Win4All',
      },
      {
        id: 'choice4',
        available: false, // Omitted
        title: 'Disperse the Shards to the Depths',
        description: 'Unavailable in this timeline.',
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
    `${SUPABASE_BASE_URL}/${world}/${taleName}/chapter${chapterNumber}/choice${choiceNumber}/choice${choiceNumber}_${langCode}.vtt`
  ];
}

const ALL_SUPPORTED_LANGUAGES: Language[] = ['EN', 'ES', 'NL', 'IT', 'PT-pt'];
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
      return 'es-ES';
    case 'IT':
      return 'it-IT';
    case 'PT-pt':
      return 'pt-PT';
    case 'NL':
      return 'nl-NL';
    case 'EN':
    default:
      return 'en-US';
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
  initialChapterId = 1,
}) => {
  // Resolve effective avatar gender ('male' or 'female')
  const effectiveGender: 'male' | 'female' =
    userGender ||
    user?.gender ||
    (user?.avatar_url?.toLowerCase().includes('male') && !user?.avatar_url?.toLowerCase().includes('female')
      ? 'male'
      : 'female');

  // Chapter tracking (1..N)
  const [currentChapterNumber, setCurrentChapterNumber] = useState<number>(initialChapterId);

  // Active step within the chapter:
  // Chapter 1: 'act0' -> 'gender_branch' -> 'act1' (if hasAct1) -> choices (or Chapter 2)
  // Chapters 2..N: 'act0' -> 'choices' -> 'choice_act' (video & audio) -> 'choice_feedback' (crawl & read)
  type FlowStep = 'act0' | 'gender_branch' | 'act1' | 'choices' | 'choice_act' | 'choice_feedback';
  const [currentStep, setCurrentStep] = useState<FlowStep>('act0');
  const [selectedChoiceId, setSelectedChoiceId] = useState<ChoiceId>('choice1');

  // Audio and Subtitle language selectors
  const [selectedAudioLang, setSelectedAudioLang] = useState<Language>(currentLang);
  const [selectedVttLang, setSelectedVttLang] = useState<Language>(currentLang);
  const [availableVttLangs, setAvailableVttLangs] = useState<Language[]>(ALL_SUPPORTED_LANGUAGES);
  const [isCheckingVttLangs, setIsCheckingVttLangs] = useState<boolean>(false);

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
        title: `Chapter ${currentChapterNumber}`,
        hasAct1: currentChapterNumber === 1,
        choices: [],
      }
    );
  }, [chapterConfigs, currentChapterNumber]);

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
    const chIdx = currentChapterNumber - 1;

    if (currentChapterNumber === 1) {
      if (currentStep === 'act0') {
        return { chapter: 0, act: 'act0', title: 'Chapter 1: The Call', type: 'narrative' };
      }
      if (currentStep === 'gender_branch') {
        return effectiveGender === 'male'
          ? { chapter: 0, act: 'male_act', title: "Daniel's Vision", gender: 'male', type: 'character' }
          : { chapter: 0, act: 'female_act', title: "Elena's Counsel", gender: 'female', type: 'character' };
      }
      if (currentStep === 'act1') {
        return { chapter: 0, act: 'act1', title: 'Chapter 1: The Decision', type: 'narrative' };
      }
    }

    if (currentStep === 'choice_act' || currentStep === 'choice_feedback') {
      const choiceCfg = currentChapterConfig.choices.find((c) => c.id === selectedChoiceId);
      const choiceNum = selectedChoiceId.replace('choice', '') || '1';
      return {
        chapter: chIdx,
        act: `choice${choiceNum}`,
        title: choiceCfg?.title || `Chapter ${currentChapterNumber} • Choice ${choiceNum}`,
        type: 'choice',
      };
    }

    // Standard acts (act0)
    return {
      chapter: chIdx,
      act: 'act0',
      title: `Chapter ${currentChapterNumber}: The Turning Point`,
      type: 'dialogue',
    };
  }, [currentChapterNumber, currentStep, effectiveGender, currentChapterConfig, selectedChoiceId]);

  // Construct URLs for the current act media
  const folderPath = useMemo(() => {
    return `${SUPABASE_BASE_URL}/Atlantis/5crystals/chapter`;
  }, []);

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
    const standardUrl = getActMp3Url(currentActData, selectedAudioLang, folderPath);
    return standardUrl ? [standardUrl] : [];
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
  }, [currentChapterNumber, currentStep, selectedChoiceId, selectedAudioLang]);

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

  // Synchronize audio and video playback
  useEffect(() => {
    if (videoRef.current) {
      if (isAutoPlay) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
    if (audioRef.current && currentAudioUrl) {
      if (isAutoPlay) {
        if (videoRef.current && !isNaN(videoRef.current.currentTime)) {
          audioRef.current.currentTime = videoRef.current.currentTime;
        }
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isAutoPlay, currentAudioUrl]);

  // Synchronize mute
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

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

  /**
   * Primary FLOW TRANSITION LOGIC
   *
   * 1. Chapter 1 flow:
   *    act0 -> (branch by userGender) -> act1 (if hasAct1 true) -> act0 of Chapter 2
   *
   * 2. Chapters 2..N flow:
   *    act0 -> render buttons for each AVAILABLE choice (in shuffle order choice1..choice4)
   *    -> clicking a choice navigates to that choice's page
   *    -> choice page completed -> act0 of Chapter N+1 (or finish story)
   */
  const goToNext = () => {
    // 1. If currently playing a choice act video, advance to its feedback screen if vtt exists, else skip to choices
    if (currentStep === 'choice_act') {
      if (feedbackParagraphs.length > 0) {
        setCurrentStep('choice_feedback');
      } else {
        setCurrentStep('choices');
      }
      return;
    }

    // 2. If on choice feedback screen, advance to the next chapter or finish
    if (currentStep === 'choice_feedback') {
      const nextChapterId = currentChapterNumber + 1;
      const nextExists = chapterConfigs.some((cfg) => cfg.id === nextChapterId);
      if (nextExists) {
        setCurrentChapterNumber(nextChapterId);
        setCurrentStep('act0');
      } else {
        if (onClose) onClose();
      }
      return;
    }

    // Chapter 1 Flow:
    // act0 -> gender_branch -> act1 (if hasAct1) -> choices (if available) -> Chapter 2 act0
    if (currentChapterNumber === 1) {
      if (currentStep === 'act0') {
        setCurrentStep('gender_branch');
        return;
      }
      if (currentStep === 'gender_branch') {
        if (currentChapterConfig.hasAct1) {
          setCurrentStep('act1');
          return;
        }
        if (currentChapterConfig.choices && currentChapterConfig.choices.some((c) => c.available)) {
          setCurrentStep('choices');
          return;
        }
        setCurrentChapterNumber(2);
        setCurrentStep('act0');
        return;
      }
      if (currentStep === 'act1') {
        if (currentChapterConfig.choices && currentChapterConfig.choices.some((c) => c.available)) {
          setCurrentStep('choices');
          return;
        }
        setCurrentChapterNumber(2);
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

    // Chapters 2..N Flow:
    // act0 -> choices -> choice_act -> choice_feedback -> Chapter N+1 act0
    if (currentChapterNumber >= 2) {
      if (currentStep === 'act0') {
        setCurrentStep('choices');
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

    if (currentChapterNumber === 1) {
      if (currentStep === 'choices') {
        setCurrentStep(currentChapterConfig.hasAct1 ? 'act1' : 'gender_branch');
        return;
      }
      if (currentStep === 'act1') {
        setCurrentStep('gender_branch');
        return;
      }
      if (currentStep === 'gender_branch') {
        setCurrentStep('act0');
        return;
      }
      if (currentStep === 'act0') {
        if (onClose) onClose();
        return;
      }
    }

    // Chapters 2..N
    if (currentChapterNumber >= 2) {
      if (currentStep === 'choices') {
        setCurrentStep('act0');
        return;
      }
      if (currentStep === 'act0') {
        // Go back to previous chapter
        const prevChapterId = currentChapterNumber - 1;
        setCurrentChapterNumber(prevChapterId);
        const prevConfig = chapterConfigs.find((c) => c.id === prevChapterId);
        if (prevConfig?.choices && prevConfig.choices.some((c) => c.available)) {
          setCurrentStep('choices');
        } else if (prevChapterId === 1) {
          setCurrentStep(prevConfig?.hasAct1 ? 'act1' : 'gender_branch');
        } else {
          setCurrentStep('act0');
        }
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
    setIsAutoPlay(true);
    setIsVideoFinished(false);
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
      const choiceCfg = currentChapterConfig.choices.find((c) => c.id === selectedChoiceId);
      onEarnSkillPoint(choiceCfg?.skillOutcome || 'Leader');
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
      className={`fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] overflow-hidden ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#fcfbf9] text-slate-900'
      } flex flex-col justify-between select-none`}
    >
      {/* 1. TOP HEADER OVERLAY */}
      <div className="relative z-30 w-full px-3 sm:px-6 pt-3 sm:pt-4 pb-2 flex items-center justify-between pointer-events-auto">
        {/* Left: Close Button & Story Plaque */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="act-close-button"
            onClick={onClose}
            className={`p-2 sm:p-2.5 rounded-full border sm:border-2 border-[#d4af37]/70 ${
              darkMode
                ? 'bg-black/60 hover:bg-black/90 text-amber-200 shadow-lg sm:shadow-2xl'
                : 'bg-white/95 hover:bg-amber-50 text-slate-800 shadow-md'
            } transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center`}
            title={t('closeAct', currentLang)}
          >
            <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37]" />
          </button>

          <div
            className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#d4af37]/60 ${
              darkMode ? 'bg-slate-900/80 text-amber-200' : 'bg-white/95 text-slate-900'
            } backdrop-blur-md shadow-lg text-xs font-semibold`}
          >
            <Compass className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Chapter {currentChapterNumber}: {currentChapterConfig.title || tale?.title || 'Atlantis'}</span>
            <span className="text-[#d4af37] font-bold">|</span>
            <span className="opacity-80">
              {currentStep === 'act0'
                ? 'Intro (Act 0)'
                : currentStep === 'gender_branch'
                ? `Branch: ${effectiveGender === 'male' ? 'Daniel' : 'Elena'}`
                : currentStep === 'act1'
                ? 'The Decision (Act 1)'
                : currentStep === 'choices'
                ? 'Decision Nexus'
                : currentStep === 'choice_act'
                ? `Choice: ${selectedChoiceId.toUpperCase()}`
                : `Feedback: ${selectedChoiceId.toUpperCase()}`}
            </span>
          </div>
        </div>

        {/* Right: Audio / Voice & Sound Controls */}
        <div className="flex items-center gap-2">
          {/* Autoplay Toggle */}
          <button
            id="act-autoplay-toggle"
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-[#d4af37]/60 text-[11px] font-bold transition-all ${
              isAutoPlay
                ? 'bg-[#d4af37] text-slate-950 shadow-md'
                : darkMode
                ? 'bg-black/60 text-amber-200/80 hover:text-amber-200'
                : 'bg-white/90 text-slate-700'
            }`}
            title="Toggle Auto Advance"
          >
            AUTO
          </button>

          {/* Sound Toggle */}
          <button
            id="act-sound-toggle"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 sm:p-2.5 rounded-full border sm:border-2 border-[#d4af37]/70 ${
              darkMode
                ? 'bg-black/60 hover:bg-black/90 text-amber-200 shadow-lg sm:shadow-2xl'
                : 'bg-white/95 hover:bg-amber-50 text-slate-800 shadow-md'
            } transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#d4af37]" />}
          </button>

          {/* Audio Voice MP3 Language Selector */}
          <FlagLanguageDropdown
            id="act-top-mp3-selector"
            type="mp3"
            selectedLang={selectedAudioLang}
            onSelectLang={handleAudioLanguageSelected}
            darkMode={darkMode}
            tooltip="Voice Audio (MP3)"
          />
        </div>
      </div>

      {/* 2. MAIN VIEWPORT AREA */}
      <div
        id="act-fullscreen-media-box"
        className="relative flex-1 w-full overflow-hidden flex items-center justify-center"
      >
        {/* A. CHAPTERS 2..N: CHOICES SELECTION SCREEN */}
        {currentStep === 'choices' && (
          <div
            id="chapter-choices-container"
            className="relative z-20 w-full max-w-4xl px-4 py-8 flex flex-col items-center justify-center animate-in fade-in duration-300"
          >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 -z-10 bg-radial from-amber-500/10 via-transparent to-transparent blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#d4af37] animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-bold">
                Chapter {currentChapterNumber} Crossroads
              </span>
              <Sparkles className="w-5 h-5 text-[#d4af37] animate-pulse" />
            </div>

            <h2 className="text-xl sm:text-3xl md:text-4xl font-cinzel font-bold text-center mb-2 gold-gradient-text drop-shadow-md">
              {currentChapterConfig.title || 'Choose Your Path'}
            </h2>
            <p className="text-xs sm:text-sm text-center text-slate-300 max-w-xl mb-6 sm:mb-8 font-sans">
              Only available paths appear for this chapter. Make your decision to guide the fate of the realm.
            </p>

            {/* Shuffled Available Choice Buttons */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {shuffledAvailableChoices.map((choice, idx) => (
                <button
                  key={choice.id}
                  id={`choice-btn-${choice.id}`}
                  onClick={() => handleSelectChoice(choice.id)}
                  type="button"
                  className={`group relative p-4 sm:p-5 rounded-2xl border-2 border-[#d4af37]/60 ${
                    darkMode
                      ? 'bg-slate-900/90 hover:bg-slate-800/95 text-slate-100 hover:border-[#d4af37]'
                      : 'bg-white/95 hover:bg-amber-50 text-slate-900 hover:border-[#d4af37]'
                  } shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left cursor-pointer flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40">
                      Option {idx + 1} ({choice.id.toUpperCase()})
                    </span>
                    <span className="text-xs text-[#d4af37] font-mono group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-cinzel font-bold text-amber-200 group-hover:text-amber-300 mb-1">
                    {choice.title || `Choice ${idx + 1}`}
                  </h4>
                  {choice.subtitle && (
                    <div className="text-xs text-[#d4af37] font-medium mb-1.5 italic">
                      {choice.subtitle}
                    </div>
                  )}
                  {choice.description && (
                    <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-2">
                      {choice.description}
                    </p>
                  )}
                </button>
              ))}
            </div>

          </div>
        )}

        {/* B. CHOICE FEEDBACK: STAR WARS INTRO EFFECT & READ ALOUD SCREEN */}
        {currentStep === 'choice_feedback' && feedbackParagraphs.length > 0 && (
          <div
            id="choice-feedback-starwars-view"
            className="relative z-20 w-full h-full flex flex-col items-center justify-center p-4 sm:p-6"
          >
            {/* Deep Cosmic Backdrop */}
            <div className="absolute inset-0 bg-black/95 bg-radial from-slate-900/40 via-black to-black -z-10" />

            {!isCrawlFinished ? (
              /* STAR WARS 3D PERSPECTIVE INTRO EFFECT */
              <div className="relative w-full h-[70vh] sm:h-[76vh] flex flex-col items-center justify-center overflow-hidden [perspective:420px] select-none">
                {/* Skip / Fast Forward Button */}
                <button
                  id="starwars-skip-crawl-btn"
                  onClick={() => setIsCrawlFinished(true)}
                  className="absolute top-2 right-3 sm:right-6 z-40 px-3 py-1.5 rounded-full border border-[#d4af37]/60 bg-black/80 hover:bg-[#d4af37] text-amber-200 hover:text-slate-950 text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
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
                    <p className="text-[#ffe81f] text-sm sm:text-base font-cinzel font-bold tracking-widest uppercase mb-1">
                      Chapter {currentChapterNumber} • Feedback
                    </p>
                    <h2 className="text-[#ffe81f] text-2xl sm:text-4xl font-cinzel font-extrabold uppercase tracking-wider drop-shadow-[0_0_15px_rgba(255,232,31,0.6)]">
                      {currentChapterConfig.choices.find((c) => c.id === selectedChoiceId)?.title ||
                        `Choice ${selectedChoiceId.replace('choice', '')}`}
                    </h2>
                  </div>

                  <div className="space-y-6 text-[#ffe81f] text-base sm:text-xl font-cinzel font-semibold leading-relaxed drop-shadow-[0_0_8px_rgba(255,232,31,0.5)]">
                    {feedbackParagraphs.map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* AT THE END OF STAR WARS INTRO:
                 - ALL THE TEXT ON SCREEN
                 - READ ALOUD BUTTON WITH SPEECH RECOGNITION & SCORE POINTS */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={`relative z-30 w-full max-w-3xl max-h-[75vh] sm:max-h-[78vh] flex flex-col rounded-3xl border-2 border-[#d4af37] ${
                  darkMode ? 'bg-slate-950/95 text-slate-100' : 'bg-white/98 text-slate-900'
                } backdrop-blur-2xl shadow-[0_12px_45px_rgba(0,0,0,0.85)] p-4 sm:p-7 overflow-hidden`}
              >
                {/* Header with target reading language */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#d4af37]/40 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <Scroll className="w-5 h-5 text-[#d4af37]" />
                    <h3 className="text-base sm:text-xl font-cinzel font-bold text-amber-200">
                      Feedback: {selectedChoiceId.toUpperCase()}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-xs text-amber-200 font-medium">
                    <span>Language:</span>
                    <span className="font-bold text-[#d4af37]">{selectedVttLang}</span>
                  </div>
                </div>

                {/* All Text Displayed on Screen */}
                <div
                  id="choice-feedback-full-text"
                  className="flex-1 overflow-y-auto pr-2 space-y-3 sm:space-y-4 font-sans text-sm sm:text-base leading-relaxed text-slate-200 max-h-[36vh] sm:max-h-[42vh]"
                >
                  {feedbackParagraphs.map((para, i) => (
                    <p
                      key={i}
                      className="p-3 rounded-xl bg-slate-900/60 border border-[#d4af37]/20 text-amber-100/95 font-medium leading-relaxed"
                    >
                      {para}
                    </p>
                  ))}
                </div>

                {/* Read Aloud & Score Points Verification Hub */}
                <div className="mt-4 pt-3 border-t border-[#d4af37]/40 flex flex-col gap-2.5">
                  {/* Realtime Spoken Transcript Display */}
                  {readTranscript && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-[#d4af37]/40 text-xs text-amber-200">
                      <span className="font-bold text-[#d4af37]">Heard you say: </span>
                      <span className="italic">"{readTranscript}"</span>
                      {readAccuracy !== null && (
                        <span className="ml-2 font-mono font-bold text-amber-300">
                          (Match: {readAccuracy}%)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Success / Points Awarded Badge */}
                  {hasClaimedPoints && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/80 border-2 border-emerald-500/70 text-emerald-200 flex items-center justify-between text-xs font-bold animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span>Language Mastery Verified! +50 Points Awarded in {selectedVttLang}</span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}

                  {speechError && (
                    <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-[11px] text-amber-300">
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#d4af37] ${
                          isReadingAloud
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-[#d4af37] text-slate-950 hover:bg-amber-400'
                        } font-bold text-xs sm:text-sm shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer`}
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
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#d4af37]/60 bg-slate-900/80 hover:bg-[#d4af37]/20 text-amber-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                        title="Listen to native voice pronunciation"
                      >
                        <Volume1 className="w-4 h-4 text-[#d4af37]" />
                        <span className="hidden sm:inline">Listen Pronunciation</span>
                      </button>
                    </div>

                    {/* Manual Claim fallback if microphone not supported */}
                    {!hasClaimedPoints && (
                      <button
                        id="choice-claim-points-btn"
                        onClick={awardLanguagePoints}
                        type="button"
                        className="text-xs text-amber-300 hover:text-amber-200 underline cursor-pointer"
                      >
                        I have read it aloud (Claim Points)
                      </button>
                    )}

                    {/* Direct Next Chapter / Continue Button */}
                    <button
                      id="feedback-next-chapter-action-btn"
                      onClick={goToNext}
                      type="button"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-[#d4af37] bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                    >
                      <span>
                        {currentChapterNumber >= chapterConfigs.length
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
          <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
            {!isMediaNotFound ? (
              <video
                id="act-fullscreen-video"
                ref={videoRef}
                key={`${currentActData.chapter}-${currentActData.act}-${currentVideoUrl}`}
                src={currentVideoUrl}
                muted={isMuted}
                playsInline
                crossOrigin="anonymous"
                preload="auto"
                onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
                onEnded={() => {
                  setIsVideoFinished(true);
                  setActiveSubtitle('');
                  if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                  }
                  if (currentStep === 'choice_act') {
                    // After choice video finishes, display feedback if vtt exists, otherwise go to choices
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
                }}
                onError={handleVideoError}
                className="w-full h-full object-contain z-0"
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

            {/* Audio Track */}
            {currentAudioUrl && (
              <audio
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
                            setCurrentStep('choices');
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

      {/* 3. CENTER LEFT: PREVIOUS `<` BUTTON */}
      <button
        id="act-prev-button"
        onClick={goToPrev}
        aria-label="Previous Act"
        className={`absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-14 sm:h-14 rounded-full border sm:border-2 border-[#d4af37] ${
          darkMode
            ? 'bg-slate-900/85 hover:bg-[#d4af37] text-amber-200 hover:text-slate-950 shadow-2xl'
            : 'bg-white/98 hover:bg-[#d4af37] text-slate-900 hover:text-slate-950 shadow-xl'
        } transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer group`}
        title="Previous"
      >
        <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8 transition-transform group-hover:-translate-x-0.5" />
      </button>

      {/* 4. CENTER RIGHT: NEXT `>` BUTTON */}
      <button
        id="act-next-button"
        onClick={goToNext}
        aria-label="Next Act"
        className={`absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-14 sm:h-14 rounded-full border sm:border-2 border-[#d4af37] ${
          darkMode
            ? 'bg-slate-900/85 hover:bg-[#d4af37] text-amber-200 hover:text-slate-950 shadow-2xl'
            : 'bg-white/98 hover:bg-[#d4af37] text-slate-900 hover:text-slate-950 shadow-xl'
        } transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer group`}
        title="Next"
      >
        <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* 5. BOTTOM SUBTITLES & COMPLETION CONTROLS BAR */}
      <motion.div
        key={`bottom-bar-${currentChapterNumber}-${currentStep}-${selectedChoiceId}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-30 w-full flex flex-col justify-end mt-auto"
      >
        <div
          className={`w-full ${
            darkMode
              ? 'bg-slate-950/95 border-t-2 border-[#d4af37]/70 text-slate-100 shadow-[0_-10px_35px_rgba(0,0,0,0.85)]'
              : 'bg-white/98 border-t-2 border-[#d4af37] text-slate-900 shadow-[0_-10px_35px_rgba(212,175,55,0.15)]'
          } backdrop-blur-xl p-3 sm:px-6 sm:py-3.5 relative z-30`}
        >
          <div className="min-h-[2.75rem] flex items-center justify-between gap-3 px-1 sm:px-2">
            <div className="w-8 shrink-0 hidden sm:block" />

            {/* Subtitle / Status Display in Center */}
            <div className="flex-1 flex items-center justify-center text-center px-2">
              {activeSubtitle ? (
                <p
                  className={`font-sans text-sm sm:text-base md:text-lg font-medium leading-relaxed tracking-wide text-center max-w-4xl ${
                    darkMode ? 'text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-amber-950 font-bold'
                  }`}
                >
                  {activeSubtitle}
                </p>
              ) : (
                <p className="font-sans text-xs sm:text-sm italic text-center text-slate-400">
                  {currentStep === 'choices'
                    ? 'Select an available path to proceed'
                    : currentStep === 'choice_act'
                    ? (isVideoFinished ? 'Choice Finished • Continue to Feedback' : currentActData.title)
                    : currentStep === 'choice_feedback'
                    ? `Language Practice: ${selectedVttLang}`
                    : isVideoFinished
                    ? 'Act Completed'
                    : currentActData.title}
                </p>
              )}
            </div>

            {/* Bottom Right VTT Subtitle Language Selector */}
            <div className="shrink-0 flex items-center">
              <FlagLanguageDropdown
                id="act-bottom-vtt-selector"
                type="vtt"
                selectedLang={selectedVttLang}
                onSelectLang={handleVttLanguageSelected}
                darkMode={darkMode}
                availableLangs={availableVttLangs}
                tooltip={availableVttLangs.length === 0 ? 'No Subtitles Available for this Act' : 'Subtitles / Reading Language (VTT)'}
              />
            </div>
          </div>

          {/* Completion Action Bar */}
          <div
            className={`w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pt-2.5 pb-1 px-2 sm:px-3 border-t mt-2 rounded-2xl ${
              darkMode
                ? 'bg-slate-900/95 border-[#d4af37]/60 text-slate-100'
                : 'bg-amber-50/95 border-[#d4af37]/40 text-slate-900'
            }`}
          >
            {/* Comment Drawer Button */}
            <button
              id="act-write-comment-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowCommentsDrawer(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-[#d4af37] ${
                darkMode
                  ? 'bg-slate-950 text-[#d4af37] hover:bg-[#d4af37] hover:text-slate-950'
                  : 'bg-white hover:bg-[#d4af37] text-amber-950 hover:text-slate-950'
              } text-xs sm:text-sm font-bold transition-all cursor-pointer hover:scale-105 active:scale-95`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{t('commentBtn', currentLang)}</span>
            </button>

            {/* Replay */}
            <button
              id="act-replay-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleReplay();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 border-[#d4af37] ${
                darkMode
                  ? 'bg-slate-950 text-[#d4af37] hover:bg-[#d4af37] hover:text-slate-950'
                  : 'bg-white hover:bg-[#d4af37] text-amber-950 hover:text-slate-950'
              } text-xs sm:text-sm font-bold transition-all cursor-pointer hover:scale-105 active:scale-95`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{t('replayBtn', currentLang)}</span>
            </button>

            {/* Next Step / Continue Button */}
            <button
              id="act-next-completion-btn"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-[#d4af37] bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>
                {currentStep === 'choices'
                  ? 'Choose Below'
                  : currentStep === 'choice_act'
                  ? (feedbackParagraphs.length > 0 ? 'View Feedback' : 'Choices')
                  : currentStep === 'choice_feedback' && currentChapterNumber >= chapterConfigs.length
                  ? t('finishBtn', currentLang)
                  : currentStep === 'choice_feedback'
                  ? 'Next Chapter'
                  : t('nextAct', currentLang)}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* COMMENTS DRAWER */}
      {showCommentsDrawer && (
        <CommentsDrawer
          chapterId={chapterCommentId}
          chapterTitle={`Chapter ${currentChapterNumber}: ${currentChapterConfig.title || 'Atlantis'}`}
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
