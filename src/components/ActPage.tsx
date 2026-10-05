import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { SafeYouTubeVideo, type YouTubeAdapter } from './SafeYouTubeVideo';
import { Language, UserProfile, SkillType, ChapterComment, Tale } from '../types';
import { ActItem, getAtlantisActItems, getTaleActItems } from '../lib/taleData';
import {
  getActMp4CandidateUrls,
  extractYouTubeVideoId,
  normalizeLangCode,
  getYouTubeAudioLangCode,
} from '../lib/assetRegistry';
import { CommentsDrawer } from './CommentsDrawer';
import { FlagLanguageDropdown } from './FlagLanguageDropdown';
import { isUserOver16 } from '../lib/googleAgeSignals';
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
  CheckCircle2,
  RotateCcw,
  Film,
  FastForward,
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

const YT_ORIGINS = ['https://www.youtube.com', 'https://www.youtube-nocookie.com'];
const AUTONEXT_DELAY_MS = 3500;

// YouTube player states
const YT_ENDED = 0;
const YT_PLAYING = 1;
const YT_INACTIVE_STATES = [2, -1, 5]; // paused, unstarted, cued

const getYtPlayerState = (data: any): number | undefined => {
  if (data?.event === 'onStateChange') return data.info;
  if (data?.event === 'infoDelivery') return data.info?.playerState;
  return undefined;
};

// Shared style helpers (previously repeated inline for every button)
const topIconBtn = (darkMode: boolean) =>
  `p-2 sm:p-3 rounded-full border sm:border-2 border-[#d4af37]/70 ${
    darkMode
      ? 'bg-black/60 hover:bg-black/90 text-amber-200 shadow-lg sm:shadow-2xl'
      : 'bg-white/95 hover:bg-amber-50 text-slate-800 shadow-md'
  } transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center`;

const navBtn = (darkMode: boolean) =>
  `absolute top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-14 sm:h-14 rounded-full border sm:border-2 border-[#d4af37] ${
    darkMode
      ? 'bg-slate-900/85 hover:bg-[#d4af37] text-amber-200 hover:text-slate-950 shadow-lg sm:shadow-2xl'
      : 'bg-white/98 hover:bg-[#d4af37] text-slate-900 hover:text-slate-950 shadow-xl'
  } disabled:opacity-20 disabled:pointer-events-none transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer group`;

const pillBtn = (darkMode: boolean, textDark = 'text-[#d4af37]') =>
  `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 border-[#d4af37] ${
    darkMode
      ? `bg-slate-950 ${textDark} hover:bg-[#d4af37] hover:text-slate-950`
      : 'bg-white hover:bg-[#d4af37] text-amber-950 hover:text-slate-950 shadow-sm'
  } text-xs sm:text-sm font-bold shadow transition-all cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap`;

const primaryBtn =
  'flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-[#d4af37] bg-[#d4af37] hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap';

export const ActPage: React.FC<ActPageProps> = ({
  tale,
  initialActId,
  initialChapter = 0,
  user,
  currentLang,
  onLanguageChange,
  onClose,
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
  const actItems: ActItem[] = useMemo(
    () => (tale ? getTaleActItems(tale, currentLang, userGender) : getAtlantisActItems(currentLang, userGender)),
    [tale, currentLang, userGender]
  );

  const initialIdx = Math.max(
    0,
    actItems.findIndex(
      (item) => item.id === initialActId || (initialChapter !== undefined && item.chapterNumber === initialChapter)
    )
  );

  const [currentIndex, setCurrentIndex] = useState<number>(initialIdx);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [isYtPlaying, setIsYtPlaying] = useState<boolean>(false);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState<boolean>(false);
  const canAccessComments = isUserOver16(user);

  const [selectedAudioLang, setSelectedAudioLang] = useState<Language>(currentLang);
  const [isVideoFinished, setIsVideoFinished] = useState<boolean>(false);

  // Media loading & "Coming soon" state
  const [candidateVideoIdx, setCandidateVideoIdx] = useState<number>(0);
  const [isMediaNotFound, setIsMediaNotFound] = useState<boolean>(false);

  const currentAct = actItems[currentIndex] || actItems[0];
  const currentChapterId = tale ? `${tale.id}-ch${currentAct.chapterNumber}` : `atlantis-ch${currentAct.chapterNumber}`;
  const isLastAct = currentIndex >= actItems.length - 1;

  const ytIframeRef = useRef<HTMLIFrameElement>(null);
  const ytMediaRef = useRef<YouTubeAdapter>(null);

  // Candidate video URLs for resilient playback
  const videoCandidates = useMemo(
    () => getActMp4CandidateUrls(currentAct.actData, currentAct.folderPath),
    [currentAct.actData, currentAct.folderPath]
  );
  const currentVideoUrl = videoCandidates[candidateVideoIdx] || videoCandidates[0];
  const currentYouTubeId = useMemo(() => extractYouTubeVideoId(currentVideoUrl), [currentVideoUrl]);

  // ---- YouTube helpers -------------------------------------------------------
  const postToYt = useCallback((payload: object) => {
    try {
      const iframe = ytIframeRef.current;
      if (!iframe?.contentWindow) return;
      const targetOrigin = iframe.src ? new URL(iframe.src).origin : YT_ORIGINS[0];
      iframe.contentWindow.postMessage(JSON.stringify(payload), targetOrigin);
    } catch {}
  }, []);

  const sendYtCommand = useCallback(
    (func: string, args: any[] = []) => postToYt({ event: 'command', func, args }),
    [postToYt]
  );

  const applyAudioState = useCallback(() => {
    if (isMuted) {
      sendYtCommand('mute');
      sendYtCommand('setVolume', [0]);
    } else {
      sendYtCommand('unMute');
      sendYtCommand('setVolume', [100]);
    }
  }, [isMuted, sendYtCommand]);

  const applyPlayState = useCallback(() => {
    if (isAutoPlay) {
      sendYtCommand('playVideo');
    } else {
      setIsYtPlaying(false);
      sendYtCommand('pauseVideo');
    }
  }, [isAutoPlay, sendYtCommand]);

  const hideYtCaptions = useCallback(() => {
    sendYtCommand('unloadModule', ['captions']);
    sendYtCommand('unloadModule', ['cc']);
  }, [sendYtCommand]);

  // ---- Navigation ------------------------------------------------------------
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < actItems.length - 1 ? prev + 1 : prev));
  }, [actItems.length]);

  const goToPrev = () => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));

  // Single handler for "video ended" (was duplicated for iframe messages and the player's onEnded)
  const handleVideoEnded = useCallback(() => {
    setIsYtPlaying(false);
    setIsVideoFinished(true);
    if (isAutoPlay && !isLastAct) {
      setTimeout(goToNext, AUTONEXT_DELAY_MS);
    }
  }, [isAutoPlay, isLastAct, goToNext]);

  // Single handler for play/pause toggling from the video overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAutoPlay || !isYtPlaying) {
      setIsAutoPlay(true);
      try {
        const p = ytMediaRef.current?.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch {}
      sendYtCommand('playVideo');
      if (!isMuted) {
        if (ytMediaRef.current) {
          ytMediaRef.current.muted = false;
          ytMediaRef.current.volume = 1;
        }
        sendYtCommand('unMute');
        sendYtCommand('setVolume', [100]);
      }
    } else {
      setIsAutoPlay(false);
      ytMediaRef.current?.pause();
      sendYtCommand('pauseVideo');
    }
  };

  const handleReplay = () => {
    setIsVideoFinished(false);
    if (currentYouTubeId) {
      sendYtCommand('seekTo', [0, true]);
      if (isAutoPlay) sendYtCommand('playVideo');
    }
  };

  const handleSkipMedia = () => {
    if (currentYouTubeId) {
      sendYtCommand('pauseVideo');
      sendYtCommand('seekTo', [9999, true]);
    }
    setIsVideoFinished(true);
  };

  const handleVideoError = () => {
    if (currentYouTubeId) return;
    if (candidateVideoIdx + 1 < videoCandidates.length) {
      setCandidateVideoIdx((prev) => prev + 1);
    } else {
      setIsMediaNotFound(true);
    }
  };
  void handleVideoError;

  const handleAudioLanguageSelected = (newLang: Language) => {
    setSelectedAudioLang(newLang);
    setIsAutoPlay(true);
    setIsVideoFinished(false);
    onLanguageChange?.(newLang);
  };

  // ---- Effects ---------------------------------------------------------------
  // Sync audio language when the parent prop changes
  useEffect(() => {
    if (currentLang && currentLang !== selectedAudioLang) {
      setSelectedAudioLang(currentLang);
      setIsAutoPlay(true);
      setIsVideoFinished(false);
    }
  }, [currentLang, selectedAudioLang]);

  // Record view on chapter transition
  useEffect(() => {
    if (onRecordView && currentChapterId) {
      onRecordView(currentChapterId, currentLang);
    }
  }, [currentChapterId, currentLang]);

  // Reset state when switching act or audio language
  useEffect(() => {
    setCandidateVideoIdx(0);
    setIsMediaNotFound(false);
    setIsVideoFinished(false);
  }, [currentIndex, selectedAudioLang]);

  useEffect(() => {
    setIsYtPlaying(false);
  }, [currentYouTubeId]);

  // Sync play/pause and mute state to the YouTube player
  useEffect(() => {
    if (currentYouTubeId) applyPlayState();
  }, [currentYouTubeId, applyPlayState]);

  useEffect(() => {
    if (currentYouTubeId) applyAudioState();
  }, [currentYouTubeId, applyAudioState]);

  // Listen to YouTube iframe messages
  useEffect(() => {
    if (!currentYouTubeId) return;

    const handleMessage = (event: MessageEvent) => {
      if (!YT_ORIGINS.includes(event.origin)) return;
      try {
        const raw = event.data;
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!data) return;

        if (data.event === 'onReady') {
          applyPlayState();
          applyAudioState();
          return;
        }

        const state = getYtPlayerState(data);
        if (state === YT_ENDED) {
          handleVideoEnded();
        } else if (state === YT_PLAYING) {
          if (isAutoPlay) {
            setIsYtPlaying(true);
          } else {
            setIsYtPlaying(false);
            sendYtCommand('pauseVideo');
          }
        } else if (state !== undefined && YT_INACTIVE_STATES.includes(state)) {
          setIsYtPlaying(false);
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    const interval = setInterval(() => postToYt({ event: 'listening' }), 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
  }, [currentYouTubeId, isAutoPlay, applyPlayState, applyAudioState, handleVideoEnded, sendYtCommand, postToYt]);

  // ---- Comments --------------------------------------------------------------
  const currentComments: ChapterComment[] = useMemo(() => {
    const allComments = (commentsMap && commentsMap[currentChapterId]) || [];
    const isGuest = !user || user.user_id === 'guest_user' || user.user_id === 'guest';
    return allComments.filter((c) =>
      isGuest ? !c.user_id || c.user_id === 'guest' || c.user_id === 'guest_user' : c.user_id === user!.user_id
    );
  }, [commentsMap, currentChapterId, user]);

  const showPlayOverlay = !isAutoPlay || !isYtPlaying;
  const statusText =
    !currentYouTubeId || isMediaNotFound
      ? t('comingSoon', selectedAudioLang || currentLang)
      : isVideoFinished
      ? t('actCompleted', selectedAudioLang)
      : '';

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
        role="button"
        tabIndex={0}
        className={`absolute inset-0 z-0 overflow-hidden ${
          darkMode ? 'bg-slate-950' : 'bg-stone-900'
        } flex items-center justify-center cursor-pointer select-none`}
        onClick={() => setIsAutoPlay(!isAutoPlay)}
        title={isAutoPlay ? t('clickToPause', currentLang) : t('clickToPlay', currentLang)}
      >
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950">
          {currentYouTubeId ? (
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
                        cc_lang_pref: normalizeLangCode(selectedAudioLang),
                        hl: getYouTubeAudioLangCode(selectedAudioLang),
                        disablekb: 1,
                        fs: 0,
                        rel: 0,
                        iv_load_policy: 3,
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
                    hideYtCaptions();
                  }}
                  onPlay={() => {
                    if (!isAutoPlay) {
                      setIsYtPlaying(false);
                      ytMediaRef.current?.pause();
                    } else {
                      setIsYtPlaying(true);
                      hideYtCaptions();
                    }
                  }}
                  onPlaying={() => {
                    if (isAutoPlay) setIsYtPlaying(true);
                  }}
                  onPause={() => setIsYtPlaying(false)}
                  onEnded={handleVideoEnded}
                />
              </div>

              <div
                className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center"
                role="button"
                tabIndex={0}
                onClick={handleOverlayClick}
                title={showPlayOverlay ? t('clickToPlay', currentLang) : t('clickToPause', currentLang)}
              >
                {showPlayOverlay && (
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
            /* COMING SOON BADGE WHEN MEDIA DOES NOT EXIST */
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center z-10 animate-fadeIn">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900/90 border-2 border-[#d4af37] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)] mb-2">
                <Film className="w-8 h-8 sm:w-10 sm:h-10 text-[#d4af37]" />
              </div>
              <div className="px-6 py-2 rounded-full border-2 border-[#d4af37] bg-slate-950 text-[#d4af37] font-bold text-base sm:text-xl tracking-wider font-cinzel shadow-2xl">
                {t('comingSoon', selectedAudioLang || currentLang)}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm leading-relaxed mt-1 font-sans">
                {t('comingSoonDesc', selectedAudioLang || currentLang, { title: currentAct.actTitle })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. TOP LEFT: CLOSE BUTTON */}
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
      {currentAct.actTitle && (
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
      )}

      {/* 4. TOP RIGHT: COMMENTS, AUTOPLAY, SOUND & AUDIO LANGUAGE */}
      <div className="flex absolute top-3 right-3 sm:top-6 sm:right-6 z-30 items-center gap-2">
        {canAccessComments && (
          <button
            id="act-top-comments-btn"
            onClick={() => setShowCommentsDrawer(true)}
            className={`${topIconBtn(darkMode)} relative`}
            title={t('comments', currentLang)}
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37]" />
            {currentComments.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#d4af37] text-slate-950 text-[9px] sm:text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow">
                {currentComments.length}
              </span>
            )}
          </button>
        )}

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

        <button
          id="act-sound-toggle"
          onClick={() => setIsMuted(!isMuted)}
          className={topIconBtn(darkMode)}
          title={isMuted ? t('unmuteAudio', currentLang) : t('muteAudio', currentLang)}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37]" />
          )}
        </button>

        <FlagLanguageDropdown
          id="act-top-audio-selector"
          type="language"
          selectedLang={selectedAudioLang}
          onSelectLang={handleAudioLanguageSelected}
          darkMode={darkMode}
          tooltip={t('selectLanguage', currentLang)}
        />
      </div>

      {/* 5. PREVIOUS / NEXT ARROWS */}
      <button
        id="act-prev-button"
        onClick={goToPrev}
        disabled={currentIndex === 0}
        aria-label={t('previousAct', currentLang)}
        className={`${navBtn(darkMode)} left-3 sm:left-6`}
        title={t('previousAct', currentLang)}
      >
        <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8 transition-transform group-hover:-translate-x-0.5" />
      </button>

      <button
        id="act-next-button"
        onClick={goToNext}
        disabled={isLastAct}
        aria-label={t('nextAct', currentLang)}
        className={`${navBtn(darkMode)} right-3 sm:right-6`}
        title={t('nextAct', currentLang)}
      >
        <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* 6. BOTTOM STATUS & CONTROLS BAR */}
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
          {statusText && (
            <div className="min-h-[2.75rem] sm:min-h-[3.25rem] flex items-center justify-center text-center px-2">
              <p
                className={`font-sans text-xs sm:text-sm italic text-center ${
                  darkMode ? 'text-slate-400' : 'text-slate-500 font-medium'
                }`}
              >
                {statusText}
              </p>
            </div>
          )}

          <div
            id="act-controls-bottom-bar"
            className={`w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pt-2.5 pb-1 px-2 sm:px-3 border-t mt-2 rounded-2xl ${
              darkMode
                ? 'bg-slate-900/95 border-[#d4af37]/60 text-slate-100 shadow-xl'
                : 'bg-amber-50/95 border-[#d4af37]/40 text-slate-900 shadow-sm'
            }`}
          >
            {canAccessComments && (
              <button
                id="act-write-comment-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCommentsDrawer(true);
                }}
                className={pillBtn(darkMode)}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{t('commentBtn', currentLang)}</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                id="act-replay-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplay();
                }}
                className={pillBtn(darkMode)}
                title={t('replayBtn', currentLang)}
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{t('replayBtn', currentLang)}</span>
              </button>

              <button
                id="act-skip-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSkipMedia();
                }}
                className={pillBtn(darkMode, 'text-amber-200')}
                title={t('skipMediaBtn', currentLang)}
              >
                <FastForward className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{t('skipBtn', currentLang)}</span>
              </button>
            </div>

            <button
              id={isLastAct ? 'act-close-completion-btn' : 'act-next-completion-btn'}
              onClick={(e) => {
                e.stopPropagation();
                if (isLastAct) onClose();
                else goToNext();
              }}
              className={primaryBtn}
            >
              {isLastAct ? (
                <>
                  <span>{t('finishBtn', currentLang)}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>{t('nextAct', currentLang)}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* COMMENTS DRAWER */}
      {showCommentsDrawer && canAccessComments && (
        <CommentsDrawer
          chapterId={currentChapterId}
          chapterTitle={currentAct.chapterTitle || 'The Heart of Atlantis'}
          comments={currentComments}
          user={user}
          currentLang={currentLang}
          onClose={() => setShowCommentsDrawer(false)}
          onAddComment={(text) => onAddComment?.(currentChapterId, text)}
          onEditComment={(cId, text) => onEditComment?.(currentChapterId, cId, text)}
          onDeleteComment={(cId) => onDeleteComment?.(currentChapterId, cId)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};
