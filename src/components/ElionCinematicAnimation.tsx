import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  Award,
  Flame,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { epicAudio } from '../lib/epicAudioEngine';

export interface ElionScene {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  duration: number; // in seconds
  caption: string;
  quote?: string;
  themeColor: string;
  motionType: 'zoom-in' | 'pan-left' | 'pan-right' | 'zoom-out' | 'tilt-up' | 'earthquake';
  icon: React.ReactNode;
}

export const ELION_CINEMATIC_SCENES: ElionScene[] = [
  {
    id: 1,
    title: 'The Celebrated Champion',
    subtitle: 'Act I — Pride of the Sunken Empire',
    image: '/src/assets/images/elion_celebrated_warrior_1787037691144.jpg',
    duration: 6.5,
    caption: 'Elion was Atlantis’s most celebrated warrior.',
    quote: '“Strength is the shield between our people and the abyss.”',
    themeColor: '#d4af37',
    motionType: 'zoom-in',
    icon: <Shield className="w-4 h-4 text-amber-300" />,
  },
  {
    id: 2,
    title: 'Undefeated in Battle',
    subtitle: 'Act II — The Grand Tournament Arena',
    image: '/src/assets/images/elion_tournament_arena_1787037709045.jpg',
    duration: 6.5,
    caption: 'He had won every major tournament, defeated every champion, and protected the city during several dangerous incursions from the deep.',
    quote: '“No blade has touched my guard; no rival has shaken my stance.”',
    themeColor: '#38bdf8',
    motionType: 'pan-left',
    icon: <Flame className="w-4 h-4 text-sky-400" />,
  },
  {
    id: 3,
    title: 'The Price of Solitude',
    subtitle: 'Act III — Relentless Training',
    image: '/src/assets/images/elion_exhausted_training_1787037728689.jpg',
    duration: 6.5,
    caption: 'He trained until his muscles trembled and refused help even when injured. Elion believed that needing others was a form of weakness.',
    quote: '“If I stop being the strongest in the room, who am I?”',
    themeColor: '#f59e0b',
    motionType: 'tilt-up',
    icon: <Award className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 4,
    title: 'Carved in Stone & Gold',
    subtitle: 'Act IV — Hall of Medals & Murals',
    image: '/src/assets/images/elion_mural_medals_1787037746708.jpg',
    duration: 6.5,
    caption: 'His strength was legendary. His name was painted on training halls and carved into medals across the capital.',
    quote: '“A thousand cheers echo my name, yet none know the man within the armor.”',
    themeColor: '#eab308',
    motionType: 'pan-right',
    icon: <Sparkles className="w-4 h-4 text-yellow-300" />,
  },
  {
    id: 5,
    title: 'The Burden of Isolation',
    subtitle: 'Act V — Silent Courtyards',
    image: '/src/assets/images/elion_lonely_palace_1787037765233.jpg',
    duration: 6.5,
    caption: 'But his victories had made him lonely. Behind his confidence lived a fear he never admitted.',
    quote: '“Victory is hollow when there is no one left to share the dawn.”',
    themeColor: '#818cf8',
    motionType: 'zoom-out',
    icon: <Shield className="w-4 h-4 text-indigo-400" />,
  },
  {
    id: 6,
    title: 'The Cataclysmic Dream',
    subtitle: 'Act VI — Vision of the Cracking City',
    image: '/src/assets/images/elion_nightmare_atlantis_1787037783968.jpg',
    duration: 7.5,
    caption: 'In his dreams he saw Atlantis cracking beneath the sea, crowds running through flooded streets, standing in the disaster powerful enough to fight—but unable to save anyone.',
    quote: '“A warrior’s true test is not conquering alone, but uniting all to survive.”',
    themeColor: '#ef4444',
    motionType: 'earthquake',
    icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
  },
];

const TOTAL_ANIMATION_TIME = ELION_CINEMATIC_SCENES.reduce((acc, s) => acc + s.duration, 0);

interface ElionCinematicAnimationProps {
  isMuted?: boolean;
  onToggleMute?: () => void;
  onAnimationComplete?: () => void;
  onSkip?: () => void;
  autoPlay?: boolean;
}

export const ElionCinematicAnimation: React.FC<ElionCinematicAnimationProps> = ({
  isMuted = false,
  onToggleMute,
  onAnimationComplete,
  onSkip,
  autoPlay = true,
}) => {
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [localMuted, setLocalMuted] = useState<boolean>(isMuted);
  const [sceneProgress, setSceneProgress] = useState<number>(0); // 0 to 100%
  const [isNarrating, setIsNarrating] = useState<boolean>(false);

  const sceneTimerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const currentScene = ELION_CINEMATIC_SCENES[currentSceneIdx];

  // Sync external mute state
  useEffect(() => {
    setLocalMuted(isMuted);
    epicAudio.setMuted(isMuted);
  }, [isMuted]);

  // Audio Engine Lifecycle
  useEffect(() => {
    if (isPlaying) {
      epicAudio.start();
      epicAudio.setScene(currentSceneIdx);
      epicAudio.setMuted(localMuted);
    } else {
      epicAudio.stop();
    }
    return () => {
      epicAudio.stop();
    };
  }, [isPlaying, currentSceneIdx, localMuted]);

  // Handle Scene Transitions & Timer Loop
  useEffect(() => {
    if (!isPlaying) {
      if (sceneTimerRef.current) clearTimeout(sceneTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    setSceneProgress(0);
    epicAudio.setScene(currentSceneIdx);

    // Speak caption if narration is turned on
    if (isNarrating && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentScene.caption);
      utterance.rate = 0.95;
      utterance.pitch = 0.95;
      utterance.volume = localMuted ? 0 : 1;
      window.speechSynthesis.speak(utterance);
    }

    const sceneDurationMs = (currentScene.duration * 1000) / playbackSpeed;

    // Progress updater interval (every 50ms)
    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / sceneDurationMs) * 100);
      setSceneProgress(pct);
    }, 50);

    // Scene transition timer
    sceneTimerRef.current = window.setTimeout(() => {
      if (currentSceneIdx < ELION_CINEMATIC_SCENES.length - 1) {
        setCurrentSceneIdx((prev) => prev + 1);
      } else {
        // Animation finished
        setIsPlaying(false);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    }, sceneDurationMs);

    return () => {
      if (sceneTimerRef.current) clearTimeout(sceneTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentSceneIdx, isPlaying, playbackSpeed, isNarrating, localMuted, onAnimationComplete]);

  // Jump to specific scene
  const goToScene = (index: number) => {
    if (index >= 0 && index < ELION_CINEMATIC_SCENES.length) {
      setCurrentSceneIdx(index);
      setSceneProgress(0);
    }
  };

  const handleNext = () => {
    if (currentSceneIdx < ELION_CINEMATIC_SCENES.length - 1) {
      goToScene(currentSceneIdx + 1);
    } else {
      if (onAnimationComplete) onAnimationComplete();
    }
  };

  const handlePrev = () => {
    if (currentSceneIdx > 0) {
      goToScene(currentSceneIdx - 1);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const toggleSound = () => {
    const nextMuted = !localMuted;
    setLocalMuted(nextMuted);
    epicAudio.setMuted(nextMuted);
    if (onToggleMute) {
      onToggleMute();
    }
  };

  const handleRestart = () => {
    setCurrentSceneIdx(0);
    setSceneProgress(0);
    setIsPlaying(true);
  };

  // Motion animation parameters for Ken Burns styling
  const getMotionAnimation = (type: ElionScene['motionType']) => {
    switch (type) {
      case 'zoom-in':
        return { scale: [1, 1.15], x: [0, -15], y: [0, -10] };
      case 'pan-left':
        return { scale: [1.12, 1.18], x: [25, -25], y: [0, 5] };
      case 'tilt-up':
        return { scale: [1.1, 1.2], x: [0, 0], y: [30, -25] };
      case 'pan-right':
        return { scale: [1.15, 1.08], x: [-30, 20], y: [5, -5] };
      case 'zoom-out':
        return { scale: [1.22, 1.04], x: [10, -10], y: [15, 0] };
      case 'earthquake':
        return {
          scale: [1.08, 1.2],
          x: [0, -4, 4, -3, 3, -2, 2, 0],
          y: [0, 4, -4, 3, -3, 2, -2, 0],
        };
      default:
        return { scale: [1, 1.1] };
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 select-none flex flex-col justify-between">
      {/* 1. CINEMATIC BACKGROUND CANVAS (Layered Images with Ken-Burns Motion & Ambient Glow) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Ken-Burns Animated Art Scene */}
            <motion.img
              src={currentScene.image}
              alt={currentScene.title}
              animate={isPlaying ? getMotionAnimation(currentScene.motionType) : { scale: 1.08 }}
              transition={{
                duration: currentScene.duration / playbackSpeed,
                ease: 'linear',
              }}
              className="w-full h-full object-cover object-center transform-gpu filter brightness-[0.9] contrast-[1.05]"
            />

            {/* Cinematic Gradient Vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />

            {/* Subtle atmospheric gold and ocean caustics overlay */}
            <div
              className="absolute inset-0 mix-blend-overlay opacity-35"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${currentScene.themeColor}33, transparent 70%)`,
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Water Caustic / Particle Sparkles */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#d4af37]/10 via-transparent to-transparent animate-pulse" />
      </div>

      {/* 2. TOP HEADER HUD: ACT INDICATOR & EPIC SOUND TOGGLE */}
      <div className="relative z-20 flex items-center justify-between px-3 sm:px-6 pt-3 sm:pt-5 w-full">
        {/* Left: Act Chapter Title & Theme Badge */}
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-[#d4af37]/80 bg-black/80 backdrop-blur-md flex items-center gap-2 shadow-lg">
            {currentScene.icon}
            <span className="font-cinzel text-xs sm:text-sm font-bold text-[#fce0a2] tracking-wider uppercase">
              {currentScene.subtitle}
            </span>
          </div>
          <span className="hidden md:inline-block text-xs font-mono text-amber-200/70 bg-black/50 px-2.5 py-1 rounded-md border border-amber-500/30">
            Scene {currentSceneIdx + 1} / {ELION_CINEMATIC_SCENES.length}
          </span>
        </div>

        {/* Right: Audio Visualizer, Sound & Narration Controls */}
        <div className="flex items-center gap-2">
          {/* Animated Equalizer Waveform */}
          {!localMuted && isPlaying && (
            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/70 border border-[#d4af37]/40">
              <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" />
              <span className="w-1 h-5 bg-amber-300 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1 h-4 bg-amber-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              <span className="w-1 h-6 bg-yellow-300 rounded-full animate-bounce [animation-delay:0.45s]" />
              <span className="text-[10px] font-mono font-bold text-[#fce0a2] ml-1 uppercase">Epic Score</span>
            </div>
          )}

          {/* Sound Mute Toggle */}
          <button
            id="elion-epic-music-toggle"
            onClick={toggleSound}
            aria-label={localMuted ? 'Unmute Epic Music' : 'Mute Epic Music'}
            className={`p-2 sm:p-2.5 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-lg active:scale-95 ${
              localMuted
                ? 'bg-black/70 border-red-500/60 text-red-300 hover:bg-red-950/50'
                : 'bg-black/80 border-[#d4af37] text-amber-300 hover:bg-[#d4af37] hover:text-black shadow-[0_0_12px_rgba(212,175,55,0.3)]'
            }`}
            title={localMuted ? 'Enable Epic Music' : 'Mute Sound'}
          >
            {localMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
          </button>

          {/* Skip Animation Action */}
          {onSkip && (
            <button
              id="elion-cinematic-skip-btn"
              onClick={onSkip}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#d4af37] bg-black/80 hover:bg-[#d4af37] text-[#fce0a2] hover:text-black font-cinzel font-bold text-xs sm:text-sm tracking-wider flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xl backdrop-blur-md"
            >
              <span>Skip Animation</span>
              <FastForward className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. CENTER / BOTTOM: FLOATING CINEMATIC STORY CARD */}
      <div className="relative z-20 px-4 sm:px-8 md:px-16 max-w-4xl mx-auto w-full my-auto text-center pointer-events-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl border-2 border-[#d4af37]/80 bg-black/85 backdrop-blur-md shadow-[0_16px_48px_rgba(0,0,0,0.8),0_0_24px_rgba(212,175,55,0.25)] relative overflow-hidden"
          >
            {/* Top Ornamental Gold Accent Bar */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

            {/* Scene Subtitle Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#d4af37]/60 bg-amber-950/40 text-[#fce0a2] font-cinzel text-xs font-semibold tracking-widest uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{currentScene.title}</span>
            </div>

            {/* Primary Story Text */}
            <h2 className="font-cinzel text-lg sm:text-2xl md:text-3xl font-bold text-slate-50 leading-relaxed sm:leading-snug tracking-wide drop-shadow-md text-balance mb-4">
              “{currentScene.caption}”
            </h2>

            {/* Character Inner Voice / Reflection Quote */}
            {currentScene.quote && (
              <p className="font-serif italic text-sm sm:text-base md:text-lg text-amber-200/90 max-w-2xl mx-auto drop-shadow border-t border-[#d4af37]/30 pt-3">
                {currentScene.quote}
              </p>
            )}

            {/* Bottom Ornamental Corner Highlights */}
            <div className="absolute bottom-2 left-3 text-[#d4af37]/40 text-xs font-cinzel tracking-widest">ATLANTIS</div>
            <div className="absolute bottom-2 right-3 text-[#d4af37]/40 text-xs font-cinzel tracking-widest">ELION</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. BOTTOM HUD: TIMELINE SCRUBBER & PLAYBACK CONTROLS */}
      <div className="relative z-20 pb-4 sm:pb-6 px-3 sm:px-6 w-full max-w-5xl mx-auto flex flex-col gap-3">
        {/* Timeline Act Navigation Track */}
        <div className="w-full flex items-center gap-1.5 sm:gap-2">
          {ELION_CINEMATIC_SCENES.map((scene, idx) => {
            const isPast = idx < currentSceneIdx;
            const isCurrent = idx === currentSceneIdx;
            return (
              <button
                key={scene.id}
                onClick={() => goToScene(idx)}
                aria-label={`Jump to scene ${idx + 1}: ${scene.title}`}
                className="group flex-1 h-2 sm:h-2.5 rounded-full bg-slate-800/80 overflow-hidden cursor-pointer relative transition-all hover:h-3.5"
                title={`${idx + 1}. ${scene.title}`}
              >
                {/* Fill bar */}
                <div
                  className={`h-full transition-all duration-100 rounded-full ${
                    isPast
                      ? 'w-full bg-[#d4af37]'
                      : isCurrent
                      ? 'bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#b8860b]'
                      : 'w-0'
                  }`}
                  style={{ width: isCurrent ? `${sceneProgress}%` : isPast ? '100%' : '0%' }}
                />
              </button>
            );
          })}
        </div>

        {/* Playback Controls & Scene Jumper */}
        <div className="flex items-center justify-between gap-2 px-1">
          {/* Previous Scene Button */}
          <button
            onClick={handlePrev}
            disabled={currentSceneIdx === 0}
            aria-label="Previous scene"
            className="p-2 sm:p-2.5 rounded-xl border border-slate-700 bg-black/70 hover:bg-black text-slate-300 hover:text-[#fce0a2] disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Center: Play/Pause, Replay & Speed Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Restart Button */}
            <button
              onClick={handleRestart}
              aria-label="Restart from Scene 1"
              className="p-2 sm:p-2.5 rounded-xl border border-[#d4af37]/40 bg-black/70 hover:bg-[#d4af37]/20 text-[#fce0a2] cursor-pointer transition-all active:scale-95"
              title="Restart Animation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause Animation' : 'Play Animation'}
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border-2 border-[#d4af37] bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#b8860b] text-slate-950 font-cinzel font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 cursor-pointer transition-all"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play</span>
                </>
              )}
            </button>

            {/* Playback Speed Cycle (1x, 1.5x, 2x) */}
            <button
              onClick={() => {
                const nextSpeed = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
                setPlaybackSpeed(nextSpeed);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-black/70 text-slate-300 hover:text-amber-300 text-xs font-mono font-bold transition-all cursor-pointer"
              title="Change Animation Speed"
            >
              {playbackSpeed}x
            </button>
          </div>

          {/* Next Scene Button */}
          <button
            onClick={handleNext}
            aria-label="Next scene"
            className="p-2 sm:p-2.5 rounded-xl border border-slate-700 bg-black/70 hover:bg-black text-slate-300 hover:text-[#fce0a2] cursor-pointer transition-all active:scale-95"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
