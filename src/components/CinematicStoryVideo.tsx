import React, { useState, useEffect, useRef } from 'react';
import {
  PlayIcon,
  PauseIcon,
  RotateCcwIcon,
  Volume2Icon,
  VolumeXIcon,
  Maximize2Icon,
  Minimize2Icon,
  SparklesIcon,
  FilmIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react';

interface CinematicStoryVideoProps {
  darkMode?: boolean;
}

interface VideoScene {
  id: number;
  title: string;
  duration: number; // in seconds
  image: string;
  panDirection: 'zoom-in' | 'pan-left' | 'pan-right' | 'zoom-out' | 'pulse';
  caption: string;
  soundType: 'festival' | 'radiant' | 'pulse' | 'alarm' | 'emergency';
}

const SCENES: VideoScene[] = [
  {
    id: 1,
    title: 'Act I: The Day of Founding',
    duration: 6,
    image: '/src/assets/images/atlantis_day_founding_celebration_1786727989016.jpg',
    panDirection: 'zoom-in',
    caption: 'The Day of Founding had begun with music. Citizens filled the central plaza, children released glowing fish-shaped lanterns, and fountains rose in spirals above the crowd.',
    soundType: 'festival'
  },
  {
    id: 2,
    title: 'Act II: The Heart & Alethea',
    duration: 7,
    image: '/src/assets/images/atlantis_alethea_heart_shining_1786728006230.jpg',
    panDirection: 'pan-left',
    caption: 'For the first time in generations, the Heart of Atlantis shone brighter than anyone had ever seen. Alethea stood beneath the central tower, watching the blue light spread through the city. For one perfect moment, she believed the crisis was over.',
    soundType: 'radiant'
  },
  {
    id: 3,
    title: 'Act III: The Pulse & Sudden Blackout',
    duration: 6,
    image: '/src/assets/images/atlantis_blackout_freeze_pulse_1786728018506.jpg',
    panDirection: 'pulse',
    caption: 'Then the Heart pulsed. The music stopped. The fountains froze in midair. The city’s lights vanished. A deep vibration rolled through the plaza.',
    soundType: 'pulse'
  },
  {
    id: 4,
    title: 'Act IV: The Dome Buckles',
    duration: 5,
    image: '/src/assets/images/atlantis_dome_cracking_emergency_1786728030532.jpg',
    panDirection: 'pan-right',
    caption: 'Glass cracked in the upper towers, and a section of the eastern dome began to buckle.',
    soundType: 'alarm'
  },
  {
    id: 5,
    title: 'Act V: Race to the Controls',
    duration: 6,
    image: '/src/assets/images/atlantis_elion_alethea_emergency_controls_1786728046167.jpg',
    panDirection: 'zoom-out',
    caption: 'Alethea ran toward the emergency controls. Elion reached them first.',
    soundType: 'emergency'
  }
];

const TOTAL_DURATION = SCENES.reduce((acc, s) => acc + s.duration, 0);

export const CinematicStoryVideo: React.FC<CinematicStoryVideoProps> = ({ darkMode = true }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [sceneProgress, setSceneProgress] = useState<number>(0); // 0 to 1 inside current scene
  const [totalProgress, setTotalProgress] = useState<number>(0); // 0 to 1 over whole video
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const currentSceneTimeRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeScene = SCENES[currentSceneIndex];

  // Sound generator for cinematic feel
  const playSoundEffect = (type: VideoScene['soundType']) => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'festival') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.3); // E5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
      } else if (type === 'radiant') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.5);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.start(now);
        osc.stop(now + 1.2);
      } else if (type === 'pulse') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        osc.start(now);
        osc.stop(now + 1.5);
      } else if (type === 'alarm') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(400, now + 0.2);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'emergency') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(500, now + 0.4);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.start(now);
        osc.stop(now + 0.7);
      }
    } catch {
      // AudioContext might fail on uninitiated interaction
    }
  };

  // Voice narration using SpeechSynthesis
  const speakCaption = (text: string) => {
    if (!isNarrating || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = isMuted ? 0 : 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Trigger narration & sound when scene changes
  useEffect(() => {
    playSoundEffect(activeScene.soundType);
    if (isNarrating) {
      speakCaption(activeScene.caption);
    }
  }, [currentSceneIndex, isNarrating, isMuted]);

  // Main animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = null;
      return;
    }

    const step = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      currentSceneTimeRef.current += delta;
      const currentDuration = SCENES[currentSceneIndex].duration;

      if (currentSceneTimeRef.current >= currentDuration) {
        // Next scene
        if (currentSceneIndex < SCENES.length - 1) {
          setCurrentSceneIndex((prev) => prev + 1);
          currentSceneTimeRef.current = 0;
          setSceneProgress(0);
        } else {
          // Reached end of video
          setIsPlaying(false);
          setCurrentSceneIndex(0);
          currentSceneTimeRef.current = 0;
          setSceneProgress(0);
          setTotalProgress(1);
          return;
        }
      } else {
        const curSceneProg = currentSceneTimeRef.current / currentDuration;
        setSceneProgress(curSceneProg);

        // Calculate total progress
        const pastDuration = SCENES.slice(0, currentSceneIndex).reduce((sum, s) => sum + s.duration, 0);
        const overall = (pastDuration + currentSceneTimeRef.current) / TOTAL_DURATION;
        setTotalProgress(Math.min(1, Math.max(0, overall)));
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, currentSceneIndex]);

  const handlePlayPause = () => {
    if (!isPlaying && totalProgress >= 0.99) {
      // Replay from start
      setCurrentSceneIndex(0);
      currentSceneTimeRef.current = 0;
      setSceneProgress(0);
      setTotalProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentSceneIndex(0);
    currentSceneTimeRef.current = 0;
    setSceneProgress(0);
    setTotalProgress(0);
    setIsPlaying(true);
  };

  const handleSelectScene = (index: number) => {
    setCurrentSceneIndex(index);
    currentSceneTimeRef.current = 0;
    setSceneProgress(0);
    const pastDuration = SCENES.slice(0, index).reduce((sum, s) => sum + s.duration, 0);
    setTotalProgress(pastDuration / TOTAL_DURATION);
  };

  const handleTimelineScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = ratio * TOTAL_DURATION;

    let accum = 0;
    for (let i = 0; i < SCENES.length; i++) {
      if (targetSeconds <= accum + SCENES[i].duration || i === SCENES.length - 1) {
        setCurrentSceneIndex(i);
        currentSceneTimeRef.current = targetSeconds - accum;
        setSceneProgress((targetSeconds - accum) / SCENES[i].duration);
        setTotalProgress(ratio);
        break;
      }
      accum += SCENES[i].duration;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  // Get Ken-Burns animation styling based on scene
  const getCameraMotionStyle = () => {
    const scale = 1 + sceneProgress * 0.08;
    switch (activeScene.panDirection) {
      case 'zoom-in':
        return { transform: `scale(${scale})`, transformOrigin: 'center center' };
      case 'zoom-out':
        return { transform: `scale(${1.08 - sceneProgress * 0.08})`, transformOrigin: 'center center' };
      case 'pan-left':
        return { transform: `scale(1.06) translateX(${-sceneProgress * 4}%)`, transformOrigin: 'center left' };
      case 'pan-right':
        return { transform: `scale(1.06) translateX(${sceneProgress * 4}%)`, transformOrigin: 'center right' };
      case 'pulse':
        return {
          transform: `scale(${scale}) ${sceneProgress < 0.2 ? 'translateY(1px)' : ''}`,
          filter: sceneProgress < 0.15 ? 'brightness(1.5) contrast(1.2)' : 'brightness(0.95)'
        };
      default:
        return { transform: `scale(${scale})` };
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentElapsedSeconds = SCENES.slice(0, currentSceneIndex).reduce((acc, s) => acc + s.duration, 0) + (activeScene.duration * sceneProgress);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      id="cinematic-video-player"
      className={`relative w-full rounded-2xl overflow-hidden border-2 shadow-2xl transition-all duration-300 ${
        darkMode
          ? 'gold-card-frame bg-black border-[#d4af37]'
          : 'bg-slate-950 border-[#d4af37] shadow-xl'
      } ${isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[360px] sm:h-[440px] md:h-[480px]'}`}
    >
      {/* VIDEO STAGE / BACKGROUND IMAGE WITH CAMERA MOTION */}
      <div className="absolute inset-0 overflow-hidden bg-slate-950">
        <img
          key={activeScene.id}
          src={activeScene.image}
          alt={activeScene.title}
          className="w-full h-full object-cover transition-transform duration-300 ease-out select-none"
          style={getCameraMotionStyle()}
          referrerPolicy="no-referrer"
        />

        {/* Dramatic cinematic vignette and gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />

        {/* Special effects for Blackout / Emergency */}
        {activeScene.id === 3 && sceneProgress < 0.25 && (
          <div className="absolute inset-0 bg-cyan-400/20 animate-ping pointer-events-none" />
        )}
        {activeScene.id === 4 && (
          <div className="absolute inset-0 border-4 border-rose-500/30 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* TOP OVERLAY HEADER */}
      <div
        className={`absolute top-0 inset-x-0 p-4 sm:p-5 flex items-center justify-between z-20 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#d4af37]/40 shadow-lg">
          <FilmIcon className="w-4 h-4 text-[#d4af37] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest font-cinzel text-[#fce0a2]">
            Cinematic Chronicle • Chapter 2
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Narrator Voice Button */}
          <button
            onClick={() => {
              const next = !isNarrating;
              setIsNarrating(next);
              if (next) speakCaption(activeScene.caption);
              else if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
            }}
            title="Toggle Voice Narration"
            className={`px-3 py-1.5 rounded-full text-xs font-cinzel font-bold flex items-center gap-1.5 backdrop-blur-md border transition-all ${
              isNarrating
                ? 'bg-[#d4af37] text-slate-950 border-[#d4af37] shadow-lg shadow-[#d4af37]/30'
                : 'bg-black/60 text-slate-200 border-[#d4af37]/40 hover:border-[#d4af37]'
            }`}
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>{isNarrating ? 'Narrator ON' : 'Narrator Voice'}</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md text-slate-200 border border-[#d4af37]/40 hover:text-[#fce0a2] transition-colors"
          >
            {isMuted ? <VolumeXIcon className="w-4 h-4 text-rose-400" /> : <Volume2Icon className="w-4 h-4 text-[#d4af37]" />}
          </button>
        </div>
      </div>

      {/* CENTER PLAY/PAUSE BIG OVERLAY BUTTON (When Paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <button
            onClick={handlePlayPause}
            className="pointer-events-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#d4af37]/90 hover:bg-[#d4af37] text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 ring-4 ring-black/50"
          >
            {totalProgress >= 0.99 ? (
              <RotateCcwIcon className="w-8 h-8 sm:w-10 sm:h-10 ml-0.5" />
            ) : (
              <PlayIcon className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-current" />
            )}
          </button>
        </div>
      )}

      {/* SCENE INDICATOR PILLS (Clickable timeline markers) */}
      <div
        className={`absolute bottom-28 sm:bottom-24 inset-x-4 sm:inset-x-6 flex items-center justify-center gap-1.5 sm:gap-2 z-20 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {SCENES.map((scene, idx) => (
          <button
            key={scene.id}
            onClick={() => handleSelectScene(idx)}
            className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-cinzel font-semibold backdrop-blur-md border transition-all ${
              idx === currentSceneIndex
                ? 'bg-[#d4af37] text-slate-950 border-[#d4af37] shadow-lg scale-105'
                : idx < currentSceneIndex
                ? 'bg-slate-900/80 text-[#d4af37] border-[#d4af37]/40'
                : 'bg-black/50 text-slate-400 border-white/10 hover:border-[#d4af37]/40'
            }`}
          >
            Act {idx + 1}
          </button>
        ))}
      </div>

      {/* SUBTITLE / CAPTION DISPLAY (The exact requested story text) */}
      <div className="absolute bottom-14 sm:bottom-12 inset-x-4 sm:inset-x-8 z-20 text-center pointer-events-none">
        <div className="inline-block max-w-2xl bg-black/80 backdrop-blur-md px-4 py-2.5 sm:py-3 rounded-2xl border border-[#d4af37]/40 shadow-2xl">
          <p className="text-[11px] font-cinzel font-bold text-[#fce0a2] uppercase tracking-wider mb-0.5 opacity-90">
            {activeScene.title}
          </p>
          <p className="text-xs sm:text-sm md:text-base font-serif-display text-white leading-relaxed tracking-wide drop-shadow-md">
            "{activeScene.caption}"
          </p>
        </div>
      </div>

      {/* BOTTOM CONTROL BAR */}
      <div
        className={`absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-20 space-y-2 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* TIMELINE PROGRESS SCRUBBER */}
        <div
          onClick={handleTimelineScrub}
          className="relative w-full h-2 bg-white/20 hover:h-3 rounded-full cursor-pointer overflow-hidden transition-all duration-200 group"
        >
          <div
            className="h-full bg-gradient-to-r from-[#d4af37] via-[#f7d774] to-[#d4af37] rounded-full relative"
            style={{ width: `${totalProgress * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="p-1.5 rounded-lg text-[#fce0a2] hover:text-white transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5 fill-current" />
              ) : (
                <PlayIcon className="w-5 h-5 fill-current" />
              )}
            </button>

            <button
              onClick={handleRestart}
              title="Restart Video"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcwIcon className="w-4 h-4" />
            </button>

            {/* Prev / Next Scene Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleSelectScene(Math.max(0, currentSceneIndex - 1))}
                disabled={currentSceneIndex === 0}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSelectScene(Math.min(SCENES.length - 1, currentSceneIndex + 1))}
                disabled={currentSceneIndex === SCENES.length - 1}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>

            <span className="font-mono text-[11px] text-slate-400 select-none">
              {formatTime(currentElapsedSeconds)} / {formatTime(TOTAL_DURATION)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2Icon className="w-4 h-4" /> : <Maximize2Icon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
