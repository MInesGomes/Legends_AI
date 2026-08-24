import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, FastForward, Check, Sparkles, BookOpen, Volume2 } from 'lucide-react';

interface ChapterTypewriterStoryProps {
  taleTitle: string;
  chapterTitle: string;
  realmName?: string;
  imageUrl?: string;
  customStoryText?: string;
  darkMode?: boolean;
}

const STORY_PARAGRAPHS = [
  "The Work Realm was once a land of opportunity. People learned a profession, gained experience, and slowly built a career. Teachers taught, designers created, programmers developed software, translators translated, and writers wrote stories.",
  "Then, everything changed. Artificial intelligence arrived like a powerful tide. Tasks that once required entire teams could suddenly be completed in minutes. Companies reduced their workforces. Job descriptions changed faster than universities could update their courses. New skills became essential, but millions of people had never been trained to use them.",
  "The greatest challenge was not technology itself. It was uncertainty. How could people compete against systems that never slept? How could they gain experience if nobody offered them an opportunity? How could they continue believing in themselves after hearing the word 'No' hundreds of times?",
  "In this world, finding employment became an adventure known as the Job Quest. Some gave up. Some became angry. Some blamed themselves. Others learned a difficult lesson: 'We cannot control every event, but we can always control our response.'"
];

export const ChapterTypewriterStory: React.FC<ChapterTypewriterStoryProps> = ({
  taleTitle,
  chapterTitle,
  realmName = "Work Realm",
  imageUrl,
  customStoryText,
  darkMode = true,
}) => {
  // Use custom story text if available, else standard chronicle paragraphs
  const fullText = customStoryText && customStoryText.trim().length > 0
    ? customStoryText.trim()
    : STORY_PARAGRAPHS.join("\n\n");

  const [displayedLength, setDisplayedLength] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<'normal' | 'fast'>('normal');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Typewriter effect timer
  useEffect(() => {
    if (!isPlaying || isCompleted) return;

    const charDelay = speed === 'fast' ? 12 : 28;

    const timer = setTimeout(() => {
      if (displayedLength < fullText.length) {
        // Look at next character for punctuation pauses
        const nextChar = fullText[displayedLength];
        let extraDelay = 0;
        if (nextChar === '.' || nextChar === '?' || nextChar === '!') {
          extraDelay = speed === 'fast' ? 150 : 350;
        } else if (nextChar === ',') {
          extraDelay = speed === 'fast' ? 80 : 180;
        } else if (nextChar === '\n') {
          extraDelay = speed === 'fast' ? 200 : 450;
        }

        setDisplayedLength((prev) => prev + 1);
      } else {
        setIsCompleted(true);
        setIsPlaying(false);
      }
    }, speed === 'fast' ? 12 : 28);

    return () => clearTimeout(timer);
  }, [displayedLength, isPlaying, isCompleted, fullText, speed]);

  const handleSkip = () => {
    setDisplayedLength(fullText.length);
    setIsCompleted(true);
    setIsPlaying(false);
  };

  const handleReplay = () => {
    setDisplayedLength(0);
    setIsCompleted(false);
    setIsPlaying(true);
  };

  const currentTypedText = fullText.slice(0, displayedLength);
  const currentParagraphs = currentTypedText.split("\n\n");

  return (
    <div className="space-y-6">
      
      {/* 1. TOP ANIMATED HERO IMAGE (Ken Burns Zoom + Shimmer Overlay + Particle Glow) */}
      {imageUrl && (
        <div className={`rounded-3xl overflow-hidden border-2 shadow-2xl relative ${
          darkMode ? 'border-[#d4af37]/60 bg-[#101726]' : 'border-[#d4af37] bg-white'
        }`}>
          <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden bg-slate-950">
            
            {/* Animated Background Image with Continuous Ken Burns Pan & Zoom */}
            <motion.img
              src={imageUrl}
              alt={chapterTitle}
              className="w-full h-full object-cover object-top filter brightness-95"
              initial={{ scale: 1.0, x: 0, y: 0 }}
              animate={{
                scale: [1.0, 1.08, 1.03, 1.07, 1.0],
                x: [0, -12, 10, -8, 0],
                y: [0, -8, 6, -4, 0],
              }}
              transition={{
                duration: 24,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              referrerPolicy="no-referrer"
            />

            {/* Ambient Sunlight & Golden Light Sweep Animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/15 to-transparent pointer-events-none"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 2,
              }}
            />

            {/* Subtle Vignette & Top Title Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/80 pointer-events-none" />
            
            <div className="absolute inset-x-0 top-0 pt-6 sm:pt-8 pb-12 px-4 text-center z-10">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold font-serif text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)] tracking-wide">
                  {taleTitle}: A Novel Game in the {realmName}
                </h1>
                <p className="text-xs sm:text-sm md:text-base font-semibold text-amber-200 mt-1.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-cinzel tracking-widest uppercase">
                  {chapterTitle}
                </p>
              </motion.div>
            </div>

            {/* Floating Particle Sparkle Accents in Corner */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#d4af37]/50 text-amber-200 text-xs font-cinzel">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
              <span>Animated Realm View</span>
            </div>

          </div>
        </div>
      )}

      {/* 2. TYPEWRITER TEXT CONTAINER */}
      <div className={`rounded-2xl p-6 sm:p-8 space-y-5 border-2 shadow-xl relative overflow-hidden ${
        darkMode ? 'gold-card-frame bg-[#121824]/95 text-slate-100' : 'bg-white/95 border-[#d4af37] text-slate-900 shadow-amber-900/5'
      }`} ref={containerRef}>
        
        {/* Header Strip with Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#d4af37]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#d4af37] to-[#996515] p-0.5 flex items-center justify-center shadow-md">
              <div className={`w-full h-full rounded-[6px] flex items-center justify-center ${
                darkMode ? 'bg-[#121824] text-[#fce0a2]' : 'bg-white text-[#8a5d12]'
              }`}>
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-widest font-cinzel ${
                darkMode ? 'text-[#d4af37]' : 'text-[#8a5d12]'
              }`}>
                Chronicle Narration
              </span>
              <h3 className={`text-base sm:text-lg font-bold font-cinzel ${
                darkMode ? 'text-[#fce0a2]' : 'text-[#0f172a]'
              }`}>
                The Work Realm &amp; The Wave of AI
              </h3>
            </div>
          </div>

          {/* Controls: Skip / Speed / Replay */}
          <div className="flex items-center gap-2">
            
            {/* Speed Toggle */}
            <button
              onClick={() => setSpeed(speed === 'normal' ? 'fast' : 'normal')}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                speed === 'fast'
                  ? 'bg-[#d4af37] text-slate-950 border-[#ffe599]'
                  : darkMode
                  ? 'bg-[#1a2332] border-slate-700 text-slate-300 hover:border-[#d4af37]'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:border-[#d4af37]'
              }`}
              title="Toggle Typing Speed"
            >
              <FastForward className="w-3 h-3" />
              <span>{speed === 'fast' ? '2x Speed' : '1x Speed'}</span>
            </button>

            {/* Skip or Replay */}
            {isCompleted ? (
              <button
                onClick={handleReplay}
                className="px-3 py-1 rounded-lg border border-[#d4af37]/60 bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                title="Replay Typewriter Effect"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Replay</span>
              </button>
            ) : (
              <button
                onClick={handleSkip}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-slate-950 text-xs font-bold flex items-center gap-1 transition-all shadow-md cursor-pointer hover:brightness-110 active:scale-95"
                title="Skip Typewriter and Show All Text"
              >
                <Check className="w-3 h-3" />
                <span>Skip</span>
              </button>
            )}
          </div>
        </div>

        {/* Narrative Paragraphs with Typewriter Output */}
        <div className="space-y-4 font-serif-display text-base sm:text-lg md:text-xl leading-relaxed min-h-[180px]">
          {currentParagraphs.map((para, idx) => {
            const isLastParagraph = idx === currentParagraphs.length - 1;
            return (
              <p
                key={idx}
                className={`transition-opacity duration-300 ${
                  darkMode ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                {para}
                {/* Active Blinking Cursor on the current typing line */}
                {isLastParagraph && !isCompleted && (
                  <motion.span
                    className="inline-block w-2 sm:w-2.5 h-4 sm:h-5 ml-1 align-middle bg-[#d4af37] rounded-sm shadow-[0_0_8px_#d4af37]"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                )}
              </p>
            );
          })}
        </div>

        {/* Footer Completion Badge */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2 flex items-center justify-between border-t border-[#d4af37]/20 text-xs text-[#d4af37] font-cinzel"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Narration Complete</span>
            </div>
            <button
              onClick={handleReplay}
              className="hover:underline flex items-center gap-1 opacity-80 hover:opacity-100 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Replay narration
            </button>
          </motion.div>
        )}

      </div>

    </div>
  );
};
