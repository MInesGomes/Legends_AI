import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, UserProfile, SkillType, ChapterComment, Tale } from '../types';
import { ActItem, getAtlantisActItems, getTaleActItems } from '../lib/taleData';
import {
  getActMp4CandidateUrls,
  getActMp3Url,
  getActVttCandidateUrls,
} from '../lib/assetRegistry';
import { CommentsDrawer } from './CommentsDrawer';
import { FlagLanguageDropdown } from './FlagLanguageDropdown';
import { t } from '../lib/i18n';
import {
  X as CloseIcon,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Film,
  FastForward,
  FileText,
  ChevronUp,
  ChevronDown,
  Copy,
  Check
} from 'lucide-react';

interface ActPageProps {
  tale?: Tale;
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
 * Cleanly extracts readable text paragraphs from a WebVTT string
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

export const ActPage: React.FC<ActPageProps> = ({
  tale,
  initialActId,
  initialChapter = 0,
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
  const userGender =
    user?.gender ||
    (user?.avatar_url?.toLowerCase().includes('male') && !user?.avatar_url?.toLowerCase().includes('female')
      ? 'male'
      : 'female');

  // Load act items for this tale (or default to Atlantis)
  const actItems: ActItem[] = useMemo(() => {
    if (tale) {
      return getTaleActItems(tale, currentLang, userGender);
    }
    return getAtlantisActItems(currentLang, userGender);
  }, [tale, currentLang, userGender]);

  // Find initial index
  const initialIdx = Math.max(
    0,
    actItems.findIndex(
      (item) => item.id === initialActId || (initialChapter !== undefined && item.chapterNumber === initialChapter)
    )
  );

  const [currentIndex, setCurrentIndex] = useState<number>(initialIdx >= 0 ? initialIdx : 0);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState<boolean>(false);

  // Video and Audio Language tracks
  const [selectedAudioLang, setSelectedAudioLang] = useState<Language>(currentLang);
  const [selectedVttLang, setSelectedVttLang] = useState<Language>(currentLang);
  const [availableVttLangs, setAvailableVttLangs] = useState<Language[]>(ALL_SUPPORTED_LANGUAGES);
  const [isCheckingVttLangs, setIsCheckingVttLangs] = useState<boolean>(false);

  // Subtitles & Video Finished State
  const [subtitles, setSubtitles] = useState<SubtitleCue[]>([]);
  const [activeSubtitle, setActiveSubtitle] = useState<string>('');
  const [isVideoFinished, setIsVideoFinished] = useState<boolean>(false);

  // Complete VTT File Text State
  const [rawVttText, setRawVttText] = useState<string>('');
  const [isVttLoading, setIsVttLoading] = useState<boolean>(false);
  const [isVttCardCollapsed, setIsVttCardCollapsed] = useState<boolean>(false);
  const [vttViewMode, setVttViewMode] = useState<'clean' | 'raw'>('clean');
  const [vttFontSize, setVttFontSize] = useState<'normal' | 'large'>('normal');
  const [copiedRawVtt, setCopiedRawVtt] = useState<boolean>(false);

  // Media loading & "Coming soon" state
  const [candidateVideoIdx, setCandidateVideoIdx] = useState<number>(0);
  const [isMediaNotFound, setIsMediaNotFound] = useState<boolean>(false);

  const currentAct = actItems[currentIndex] || actItems[0];
  const currentChapterId = tale ? `${tale.id}-ch${currentAct.chapterNumber}` : `atlantis-ch${currentAct.chapterNumber}`;

  // Synchronize audio and VTT language initially from currentLang
  useEffect(() => {
    setSelectedAudioLang(currentLang);
    setSelectedVttLang(currentLang);
  }, [currentLang]);

  // Check available VTT languages for the current act
  // "if a vtt file is not available for an act, play only the mp3 file and remove the language dropdown choice of that language. e.g if act0_en.vtt is not available remove the English in the dropdown button"
  useEffect(() => {
    let isMounted = true;
    setIsCheckingVttLangs(true);

    async function checkLanguages() {
      const validLangs: Language[] = [];

      await Promise.all(
        ALL_SUPPORTED_LANGUAGES.map(async (lang) => {
          const urls = getActVttCandidateUrls(currentAct.actData, lang, currentAct.folderPath);
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

        if (sorted.length > 0 && !sorted.includes(selectedVttLang)) {
          setSelectedVttLang(sorted[0]);
        }
      }
    }

    checkLanguages();

    return () => {
      isMounted = false;
    };
  }, [currentAct.actData, currentAct.folderPath]);

  // Record view on chapter transition
  useEffect(() => {
    if (onRecordView && currentChapterId) {
      onRecordView(currentChapterId, currentLang);
    }
  }, [currentChapterId, currentLang]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Candidate video URLs for resilient playback
  const videoCandidates = useMemo(() => {
    return getActMp4CandidateUrls(currentAct.actData, currentAct.folderPath);
  }, [currentAct.actData, currentAct.folderPath]);

  const currentVideoUrl = videoCandidates[candidateVideoIdx] || videoCandidates[0];

  // MP3 Audio Track URL based on upper button selected language
  const actAudioUrl = useMemo(() => {
    return getActMp3Url(currentAct.actData, selectedAudioLang, currentAct.folderPath);
  }, [currentAct.actData, selectedAudioLang, currentAct.folderPath]);

  // Comments for this chapter
  const currentComments: ChapterComment[] = useMemo(() => {
    const allComments = (commentsMap && commentsMap[currentChapterId]) || [];
    return allComments.filter((c) => {
      if (!user || user.user_id === 'guest_user' || user.user_id === 'guest') {
        return !c.user_id || c.user_id === 'guest' || c.user_id === 'guest_user';
      }
      return c.user_id === user.user_id;
    });
  }, [commentsMap, currentChapterId, user]);

  // Reset state when switching act index or audio language
  useEffect(() => {
    setCandidateVideoIdx(0);
    setIsMediaNotFound(false);
    setIsVideoFinished(false);
    setActiveSubtitle('');
    setRawVttText('');

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
      if (isAutoPlay && actAudioUrl) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentIndex, selectedAudioLang]);

  // Fetch VTT subtitles from candidate URLs when selectedVttLang changes (lower button)
  useEffect(() => {
    let isMounted = true;
    setActiveSubtitle('');
    setIsVttLoading(true);

    const vttCandidates = getActVttCandidateUrls(currentAct.actData, selectedVttLang, currentAct.folderPath);

    async function loadVtt() {
      for (const url of vttCandidates) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const text = await res.text();
            if (isMounted) {
              const cues = parseVttToCues(text);
              if (cues.length > 0 || text.includes('WEBVTT')) {
                setRawVttText(text);
                setSubtitles(cues);
                setIsVttLoading(false);
                return;
              }
            }
          }
        } catch {
          // Try next candidate URL
        }
      }
      if (isMounted) {
        setRawVttText('');
        setSubtitles([]);
        setIsVttLoading(false);
      }
    }

    loadVtt();

    return () => {
      isMounted = false;
    };
  }, [currentAct.actData, currentAct.folderPath, selectedVttLang]);

  // Synchronize video & audio play/pause
  useEffect(() => {
    if (videoRef.current) {
      if (isAutoPlay) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
    if (audioRef.current && actAudioUrl) {
      if (isAutoPlay) {
        if (videoRef.current && !isNaN(videoRef.current.currentTime)) {
          audioRef.current.currentTime = videoRef.current.currentTime;
        }
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isAutoPlay, actAudioUrl]);

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

  const handleReplay = () => {
    setIsVideoFinished(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (isAutoPlay && actAudioUrl) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleSkipMedia = () => {
    // 1. Pause and seek audio track to end
    if (audioRef.current) {
      audioRef.current.pause();
      try {
        if (!isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
          audioRef.current.currentTime = audioRef.current.duration;
        }
      } catch {}
    }
    // 2. Pause and seek video track to end
    if (videoRef.current) {
      videoRef.current.pause();
      try {
        if (!isNaN(videoRef.current.duration) && videoRef.current.duration > 0) {
          videoRef.current.currentTime = videoRef.current.duration;
        }
      } catch {}
    }
    // 3. Mark video as finished and clear active subtitle line
    setIsVideoFinished(true);
    setActiveSubtitle('');
  };

  const handleCopyRawVtt = async () => {
    if (!rawVttText) return;
    try {
      await navigator.clipboard.writeText(rawVttText);
      setCopiedRawVtt(true);
      setTimeout(() => setCopiedRawVtt(false), 2000);
    } catch {
      // Fallback
    }
  };

  const goToNext = () => {
    if (currentIndex < actItems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const isLastAct = currentIndex >= actItems.length - 1;

  // Upper button: MP3 Audio language handler
  const handleAudioLanguageSelected = (newLang: Language) => {
    setSelectedAudioLang(newLang);
    setIsAutoPlay(true);
    setIsVideoFinished(false);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
    const currentPlayhead = videoRef.current ? videoRef.current.currentTime : (audioRef.current ? audioRef.current.currentTime : 0);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
    if (audioRef.current) {
      audioRef.current.currentTime = currentPlayhead;
      audioRef.current.play().catch(() => {});
    }
  };

  // Lower button: VTT Subtitles language handler
  const handleVttLanguageSelected = (newLang: Language) => {
    setSelectedVttLang(newLang);
  };

  return (
    <div
      id="act-fullscreen-page"
      className={`fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] overflow-hidden ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#fcfbf9] text-slate-900'
      } flex flex-col justify-between select-none`}
    >
      {/* 1. FULLSCREEN MEDIA CONTAINER */}
      <div
        id="act-fullscreen-media-box"
        className={`absolute inset-0 z-0 overflow-hidden ${
          darkMode ? 'bg-slate-950' : 'bg-stone-900'
        } flex items-center justify-center cursor-pointer select-none`}
        onClick={() => setIsAutoPlay(!isAutoPlay)}
        title={isAutoPlay ? t('clickToPause', currentLang) : t('clickToPlay', currentLang)}
      >
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950">
          {/* Ambient backdrop poster */}

          {!isMediaNotFound ? (
            <video
              id="act-fullscreen-video"
              ref={videoRef}
              key={`${currentAct.id}-${currentVideoUrl}`}
              src={currentVideoUrl}
              muted={isMuted}
              playsInline
              crossOrigin="anonymous"
              preload="auto"
              onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
              onPlay={(e) => {
                if (audioRef.current && actAudioUrl) {
                  audioRef.current.currentTime = e.currentTarget.currentTime;
                  audioRef.current.play().catch(() => {});
                }
              }}
              onPause={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                }
              }}
              onEnded={() => {
                setIsVideoFinished(true);
                setActiveSubtitle('');
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }
                if (isAutoPlay && currentIndex < actItems.length - 1) {
                  setTimeout(() => {
                    goToNext();
                  }, 4000);
                }
              }}
              onError={handleVideoError}
              className="w-full h-full object-contain z-0"
            />
          ) : (
            /* COMING SOON BADGE IN VIDEO AREA WHEN MEDIA DOES NOT EXIST */
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center z-10 animate-fadeIn">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900/90 border-2 border-[#d4af37] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)] mb-2">
                <Film className="w-8 h-8 sm:w-10 sm:h-10 text-[#d4af37]" />
              </div>
              <div className="px-6 py-2 rounded-full border-2 border-[#d4af37] bg-slate-950 text-[#d4af37] font-bold text-base sm:text-xl tracking-wider font-cinzel shadow-2xl">
                {t('comingSoon', currentLang)}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm leading-relaxed mt-1 font-sans">
                {t('comingSoonDesc', currentLang, { title: currentAct.actTitle })}
              </p>
            </div>
          )}

          {/* Synchronized Audio Track */}
          {actAudioUrl && (
            <audio
              id="act-background-audio"
              ref={audioRef}
              key={`audio-${currentAct.id}-${actAudioUrl}`}
              src={actAudioUrl}
              muted={isMuted}
              preload="auto"
              playsInline
              onTimeUpdate={(e) => {
                if (isMediaNotFound || !videoRef.current) {
                  handleTimeUpdate(e.currentTarget.currentTime);
                }
              }}
              onEnded={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                }
                if (isMediaNotFound) {
                  setIsVideoFinished(true);
                  setActiveSubtitle('');
                  if (isAutoPlay && currentIndex < actItems.length - 1) {
                    setTimeout(() => {
                      goToNext();
                    }, 3500);
                  }
                }
              }}
            />
          )}

          {/* Play / Pause Indicator Badge overlay when paused */}
          {!isAutoPlay && !isMediaNotFound && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all">
              <div className="p-4 sm:p-5 rounded-full bg-black/80 border-2 border-[#d4af37] text-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.6)] transform hover:scale-110 transition-transform">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 text-[#d4af37] fill-[#d4af37] ml-1" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. TOP LEFT: CLOSE 'X' BUTTON */}
      <div className="absolute top-3 left-3 sm:top-6 sm:left-6 z-30 flex items-center gap-2 sm:gap-3">
        <button
          id="act-close-button"
          onClick={onClose}
          aria-label={t('closeAct', currentLang)}
          className={`p-2 sm:p-3 rounded-full border sm:border-2 border-[#d4af37] ${
            darkMode
              ? 'bg-black/70 hover:bg-[#d4af37] text-[#fce0a2] hover:text-black shadow-lg sm:shadow-2xl'
              : 'bg-white/95 hover:bg-[#d4af37] text-slate-900 hover:text-black shadow-md'
          } transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center group`}
          title={t('closeAct', currentLang)}
        >
          <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-90" />
        </button>
      </div>

      {/* 3. TOP CENTER: ACT TITLE */}
      <div className="absolute top-3 sm:top-6 inset-x-0 mx-auto z-20 flex flex-col items-center justify-center pointer-events-none px-14 sm:px-44 text-center">
        <div
          className={`backdrop-blur-md px-4 sm:px-6 py-1.5 rounded-full border ${
            darkMode
              ? 'bg-black/80 border-[#d4af37]/70 text-[#d4af37] shadow-[0_4px_20px_rgba(0,0,0,0.8)]'
              : 'bg-white/95 border-[#d4af37] text-amber-900 shadow-md'
          } max-w-full truncate flex items-center justify-center`}
        >
          <span className="text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wider font-cinzel truncate">
            {currentAct.actTitle}
          </span>
        </div>
      </div>

      {/* 4. TOP RIGHT: COMMENTS, AUTOPLAY TOGGLE, SOUND TOGGLE & MP3 AUDIO SELECTOR */}
      <div className="flex absolute top-3 right-3 sm:top-6 sm:right-6 z-30 items-center gap-2">
        {/* Comments Drawer Button */}
        <button
          id="act-top-comments-btn"
          onClick={() => setShowCommentsDrawer(true)}
          className={`p-2 sm:p-3 rounded-full border sm:border-2 border-[#d4af37]/70 ${
            darkMode
              ? 'bg-black/60 hover:bg-black/90 text-amber-200 shadow-lg sm:shadow-2xl'
              : 'bg-white/95 hover:bg-amber-50 text-slate-800 shadow-md'
          } transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center relative`}
          title={t('comments', currentLang)}
        >
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37]" />
          {currentComments.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#d4af37] text-slate-950 text-[9px] sm:text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow">
              {currentComments.length}
            </span>
          )}
        </button>

        {/* Autoplay Toggle Button */}
        <button
          id="act-autoplay-toggle"
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className={`p-2 sm:p-3 rounded-full border sm:border-2 shadow-lg sm:shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center ${
            isAutoPlay
              ? darkMode
                ? 'border-[#d4af37] bg-black/80 text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                : 'border-[#d4af37] bg-[#d4af37] text-slate-950 shadow-md'
              : darkMode
              ? 'border-[#d4af37]/50 bg-black/60 hover:bg-black/90 text-amber-200/70 hover:text-amber-200'
              : 'border-[#d4af37]/70 bg-white/95 hover:bg-amber-50 text-slate-800 shadow-md'
          }`}
          title={isAutoPlay ? t('autoplayOn', currentLang) : t('autoplayOff', currentLang)}
        >
          {isAutoPlay ? (
            <Pause
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                darkMode ? 'text-[#d4af37] fill-[#d4af37]' : 'text-slate-950 fill-slate-950'
              }`}
            />
          ) : (
            <Play
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                darkMode ? 'text-amber-200 fill-amber-200' : 'text-slate-800 fill-slate-800'
              } ml-0.5`}
            />
          )}
        </button>

        {/* Sound Mute Toggle */}
        <button
          id="act-sound-toggle"
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2 sm:p-3 rounded-full border sm:border-2 border-[#d4af37]/70 ${
            darkMode
              ? 'bg-black/60 hover:bg-black/90 text-amber-200 shadow-lg sm:shadow-2xl'
              : 'bg-white/95 hover:bg-amber-50 text-slate-800 shadow-md'
          } transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center`}
          title={isMuted ? t('unmuteAudio', currentLang) : t('muteAudio', currentLang)}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37]" />
          )}
        </button>

        {/* MP3 Audio Voice Selector */}
        <FlagLanguageDropdown
          id="act-top-mp3-selector"
          type="mp3"
          selectedLang={selectedAudioLang}
          onSelectLang={handleAudioLanguageSelected}
          darkMode={darkMode}
          tooltip={t('selectVoiceMp3', currentLang)}
        />
      </div>

      {/* 5. COMPLETE VTT FILE TEXT DISPLAY ABOVE THE VIDEO */}
      <div
        id="act-complete-vtt-box"
        className="relative z-25 w-full max-w-4xl mx-auto px-3 sm:px-6 pt-16 sm:pt-20 pb-2 select-text pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`w-full rounded-2xl border-2 transition-all duration-300 ${
            darkMode
              ? 'bg-slate-950/90 border-[#d4af37]/70 text-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.85)]'
              : 'bg-white/95 border-[#c69214] text-slate-900 shadow-[0_8px_25px_rgba(212,175,55,0.2)]'
          } backdrop-blur-xl p-3 sm:p-4`}
        >
          {/* Header of VTT Card */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#d4af37]/30 mb-2.5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#d4af37]" />
              <span
                className={`text-xs sm:text-sm font-cinzel font-bold tracking-wider uppercase ${
                  darkMode ? 'text-amber-200' : 'text-amber-900'
                }`}
              >
                Complete Story Text
              </span>
              <span
                className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold ${
                  darkMode
                    ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {selectedVttLang}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Clean Story vs Raw VTT Mode Toggle */}
              <div
                className={`flex items-center rounded-lg border p-0.5 text-xs font-semibold ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-amber-50 border-amber-200 text-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setVttViewMode('clean')}
                  className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                    vttViewMode === 'clean'
                      ? darkMode
                        ? 'bg-amber-400/25 text-amber-200 font-bold'
                        : 'bg-white text-amber-950 font-bold shadow-xs'
                      : 'hover:opacity-80'
                  }`}
                  title="View clean story text"
                >
                  Story
                </button>
                <button
                  type="button"
                  onClick={() => setVttViewMode('raw')}
                  className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                    vttViewMode === 'raw'
                      ? darkMode
                        ? 'bg-amber-400/25 text-amber-200 font-bold'
                        : 'bg-white text-amber-950 font-bold shadow-xs'
                      : 'hover:opacity-80'
                  }`}
                  title="View raw VTT file text with timecodes"
                >
                  Raw VTT
                </button>
              </div>

              {/* Font Size Toggle */}
              <button
                type="button"
                onClick={() => setVttFontSize(vttFontSize === 'normal' ? 'large' : 'normal')}
                className={`px-2 py-0.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-amber-200'
                    : 'bg-amber-50 border-amber-200 text-slate-800 hover:bg-amber-100'
                }`}
                title="Toggle Text Size"
              >
                {vttFontSize === 'normal' ? 'A+' : 'A'}
              </button>

              {/* Copy Raw Text (when in raw mode) */}
              {vttViewMode === 'raw' && rawVttText && (
                <button
                  type="button"
                  onClick={handleCopyRawVtt}
                  className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-amber-200' : 'bg-amber-50 border-amber-200 text-slate-800'
                  }`}
                  title="Copy Raw VTT Text"
                >
                  {copiedRawVtt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* Collapse / Expand Toggle */}
              <button
                type="button"
                onClick={() => setIsVttCardCollapsed(!isVttCardCollapsed)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-amber-200'
                    : 'bg-amber-50 border-amber-200 text-slate-800 hover:bg-amber-100'
                }`}
                title={isVttCardCollapsed ? 'Expand Story Text' : 'Minimize Story Text'}
              >
                {isVttCardCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Body Content */}
          {!isVttCardCollapsed && (
            <div
              className={`overflow-y-auto pr-1 transition-all ${
                vttFontSize === 'large' ? 'max-h-[26vh] sm:max-h-[30vh]' : 'max-h-[20vh] sm:max-h-[24vh]'
              }`}
            >
              {isVttLoading ? (
                <div className="py-3 text-center text-xs text-amber-300/80 animate-pulse">
                  Loading subtitles for {selectedVttLang}...
                </div>
              ) : vttViewMode === 'raw' ? (
                rawVttText ? (
                  <pre className="font-mono text-[11px] sm:text-xs leading-relaxed whitespace-pre-wrap text-amber-100/95 select-all p-2.5 rounded-lg bg-black/50 border border-slate-800">
                    {rawVttText}
                  </pre>
                ) : (
                  <p className="text-xs italic text-slate-400 py-2">No raw VTT file content available.</p>
                )
              ) : (
                /* Clean formatted story text with real-time active cue highlight */
                subtitles.length > 0 ? (
                  <div
                    className={`leading-relaxed space-y-1.5 ${
                      vttFontSize === 'large' ? 'text-base sm:text-lg' : 'text-xs sm:text-sm md:text-base'
                    }`}
                  >
                    {subtitles.map((cue, idx) => {
                      const isCurrent = activeSubtitle && cue.text.trim() === activeSubtitle.trim();
                      return (
                        <span
                          key={idx}
                          className={`inline transition-all duration-200 mr-1.5 ${
                            isCurrent
                              ? darkMode
                                ? 'bg-amber-400/25 text-amber-200 font-bold px-1.5 py-0.5 rounded shadow-sm border border-amber-400/40'
                                : 'bg-amber-200 text-amber-950 font-bold px-1.5 py-0.5 rounded shadow-sm border border-amber-400'
                              : darkMode
                              ? 'text-slate-200'
                              : 'text-stone-800'
                          }`}
                        >
                          {cue.text}{' '}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-2 text-center text-xs italic text-slate-400">
                    No subtitles available for {selectedVttLang}. You can switch subtitle language from the bottom-right menu.
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* 6. CENTER LEFT: PREVIOUS `<` BUTTON */}
      <button
        id="act-prev-button"
        onClick={goToPrev}
        disabled={currentIndex === 0}
        aria-label={t('previousAct', currentLang)}
        className={`absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-14 sm:h-14 rounded-full border sm:border-2 border-[#d4af37] ${
          darkMode
            ? 'bg-slate-900/85 hover:bg-[#d4af37] text-amber-200 hover:text-slate-950 shadow-lg sm:shadow-2xl'
            : 'bg-white/98 hover:bg-[#d4af37] text-slate-900 hover:text-slate-950 shadow-xl'
        } disabled:opacity-20 disabled:pointer-events-none transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer group`}
        title={t('previousAct', currentLang)}
      >
        <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8 transition-transform group-hover:-translate-x-0.5" />
      </button>

      {/* 6. CENTER RIGHT: NEXT `>` BUTTON */}
      <button
        id="act-next-button"
        onClick={goToNext}
        disabled={currentIndex === actItems.length - 1}
        aria-label={t('nextAct', currentLang)}
        className={`absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-14 sm:h-14 rounded-full border sm:border-2 border-[#d4af37] ${
          darkMode
            ? 'bg-slate-900/85 hover:bg-[#d4af37] text-amber-200 hover:text-slate-950 shadow-lg sm:shadow-2xl'
            : 'bg-white/98 hover:bg-[#d4af37] text-slate-900 hover:text-slate-950 shadow-xl'
        } disabled:opacity-20 disabled:pointer-events-none transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer group`}
        title={t('nextAct', currentLang)}
      >
        <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* 7. BOTTOM SUBTITLES & COMPLETION CONTROLS BAR */}
      <motion.div
        key={`bottom-bar-${currentIndex}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-30 w-full max-w-none flex flex-col justify-end mt-auto"
      >
        <div
          className={`w-full ${
            darkMode
              ? 'bg-slate-950/95 border-t-2 border-[#d4af37]/70 text-slate-100 shadow-[0_-10px_35px_rgba(0,0,0,0.85)]'
              : 'bg-white/98 border-t-2 border-[#d4af37] text-slate-900 shadow-[0_-10px_35px_rgba(212,175,55,0.15)]'
          } backdrop-blur-xl animate-fadeIn p-3 sm:px-6 sm:py-3.5 relative z-30`}
        >
          <div className="min-h-[2.75rem] sm:min-h-[3.25rem] flex items-center justify-between gap-3 px-1 sm:px-2">
            {/* Left Spacer for perfect visual centering */}
            <div className="w-8 shrink-0 hidden sm:block" />

            {/* Subtitle Text in Center */}
            <div className="flex-1 flex items-center justify-center text-center px-2">
              {activeSubtitle ? (
                <motion.p
                  key={activeSubtitle}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`font-sans text-sm sm:text-base md:text-lg font-medium leading-relaxed tracking-wide text-center max-w-4xl ${
                    darkMode
                      ? 'text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                      : 'text-amber-950 font-bold drop-shadow-none'
                  }`}
                >
                  {activeSubtitle}
                </motion.p>
              ) : (
                <p
                  className={`font-sans text-xs sm:text-sm italic text-center ${
                    darkMode ? 'text-slate-400' : 'text-slate-500 font-medium'
                  }`}
                >
                  {isMediaNotFound
                    ? t('comingSoon', currentLang)
                    : isVideoFinished
                    ? t('actCompleted', selectedVttLang)
                    : currentAct.actTitle}
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
                tooltip={availableVttLangs.length === 0 ? 'No Subtitles Available for this Act' : t('selectSubtitlesVtt', currentLang)}
              />
            </div>
          </div>

          {/* Act Completion and Media Controls Bar */}
          <div
            id="act-controls-bottom-bar"
            className={`w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pt-2.5 pb-1 px-2 sm:px-3 border-t mt-2 rounded-2xl ${
              darkMode
                ? 'bg-slate-900/95 border-[#d4af37]/60 text-slate-100 shadow-xl'
                : 'bg-amber-50/95 border-[#d4af37]/40 text-slate-900 shadow-sm'
            }`}
          >
            {/* Comment Button */}
            <button
              id="act-write-comment-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowCommentsDrawer(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-[#d4af37] ${
                darkMode
                  ? 'bg-slate-950 text-[#d4af37] hover:bg-[#d4af37] hover:text-slate-950'
                  : 'bg-white hover:bg-[#d4af37] text-amber-950 hover:text-slate-950 shadow-sm'
              } text-xs sm:text-sm font-bold shadow transition-all cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{t('commentBtn', currentLang)}</span>
            </button>

            {/* Middle Action Group: Replay and Skip MP3 & MP4 */}
            <div className="flex items-center gap-2">
              {/* Replay Button */}
              <button
                id="act-replay-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplay();
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 border-[#d4af37] ${
                  darkMode
                    ? 'bg-slate-950 text-[#d4af37] hover:bg-[#d4af37] hover:text-slate-950'
                    : 'bg-white hover:bg-[#d4af37] text-amber-950 hover:text-slate-950 shadow-sm'
                } text-xs sm:text-sm font-bold shadow transition-all cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap`}
                title={t('replayBtn', currentLang)}
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{t('replayBtn', currentLang)}</span>
              </button>

              {/* Skip Button */}
              <button
                id="act-skip-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSkipMedia();
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 border-[#d4af37] ${
                  darkMode
                    ? 'bg-slate-950 text-amber-200 hover:bg-[#d4af37] hover:text-slate-950'
                    : 'bg-white hover:bg-[#d4af37] text-amber-950 hover:text-slate-950 shadow-sm'
                } text-xs sm:text-sm font-bold shadow transition-all cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap`}
                title="Skip MP3 and MP4 playback"
              >
                <FastForward className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{t('skipBtn', currentLang)}</span>
              </button>
            </div>

            {/* Next / Finish Button */}
            {!isLastAct ? (
              <button
                id="act-next-completion-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-[#d4af37] bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                <span>{t('nextAct', currentLang)}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="act-close-completion-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-[#d4af37] bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                <span>{t('finishBtn', currentLang)}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* COMMENTS DRAWER */}
      {showCommentsDrawer && (
        <CommentsDrawer
          chapterId={currentChapterId}
          chapterTitle={currentAct.chapterTitle || 'The Heart of Atlantis'}
          comments={currentComments}
          user={user}
          currentLang={currentLang}
          onClose={() => setShowCommentsDrawer(false)}
          onAddComment={(text) => onAddComment && onAddComment(currentChapterId, text)}
          onEditComment={(cId, text) => onEditComment && onEditComment(currentChapterId, cId, text)}
          onDeleteComment={(cId) => onDeleteComment && onDeleteComment(currentChapterId, cId)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};
