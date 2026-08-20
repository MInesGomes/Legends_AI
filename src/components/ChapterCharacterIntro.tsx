import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, User, ArrowRight, ArrowLeft, BookOpen, Shield, Award, MessageSquare, CheckCircle2, ChevronRight, Volume2 } from 'lucide-react';
import { DialogueLine } from '../types';
import { ASSETS, resolveAssetUrl } from '../lib/assetRegistry';

export interface CharacterDetail {
  gender: 'female' | 'male';
  characterName: string;
  age: number;
  role: string;
  avatarUrl: string;
  quote: string;
  backgroundStory: string;
  strengths: string[];
  dilemma: string;
  dialogue: DialogueLine[];
}

interface ChapterCharacterIntroProps {
  userGender?: 'female' | 'male';
  taleTitle: string;
  chapterTitle: string;
  realmName?: string;
  femaleIntro?: {
    characterName: string;
    avatarUrl: string;
    backgroundStory: string;
    dialogue: DialogueLine[];
  };
  maleIntro?: {
    characterName: string;
    avatarUrl: string;
    backgroundStory: string;
    dialogue: DialogueLine[];
  };
  onProceedToChapter2: () => void;
  onBackToStory?: () => void;
  darkMode?: boolean;
}

const DEFAULT_FEMALE: CharacterDetail = {
  gender: 'female',
  characterName: 'Elena Moreau',
  age: 29,
  role: 'Educational Content Designer',
  avatarUrl: ASSETS.elenaAvatar,
  quote: 'We cannot control every event, but we can always control our response.',
  backgroundStory:
    'Elena loved helping people learn. She spent years creating training materials and educational programs, believing that knowledge could change lives. Then AI systems began producing courses automatically. Projects disappeared. Contracts ended. Her inbox became a museum of rejection letters. Despite her intelligence, Elena began questioning herself: "Perhaps I\'m not good enough anymore." Yet beneath her doubts remained a powerful strength: she believed that every problem contained a hidden opportunity.',
  strengths: ['Adaptive Learning', 'Educational Architecture', 'Empathy & Resilience', 'Proactive Leadership'],
  dilemma: 'Automated course generation displaced her department, testing her self-worth and purpose in education.',
  dialogue: [
    { speaker: 'Elena', text: 'My inbox became a museum of rejection letters after courses began generating automatically.' },
    { speaker: 'Elena', text: "Maybe we're fighting the wrong battle, Daniel. We keep trying to control things we can't control." },
    { speaker: 'Elena', text: 'We cannot control every event, but we can always control our response.' },
  ],
};

const DEFAULT_MALE: CharacterDetail = {
  gender: 'male',
  characterName: 'Daniel Carter',
  age: 31,
  role: 'Software Developer',
  avatarUrl: ASSETS.danielAvatar,
  quote: "If something breaks, I want to fix it. But uncertainty can't be debugged with logic alone.",
  backgroundStory:
    "Daniel had always loved technology. Ironically, the same technology he admired transformed his profession. Companies expected developers to master new AI tools overnight. Experience that once guaranteed employment suddenly seemed outdated. Daniel hid his fears behind humor, but every rejection damaged his confidence: 'Maybe I\'ve already become obsolete.' Unlike Elena, Daniel preferred solving problems immediately with logic. Unfortunately, not every problem could be solved with code alone.",
  strengths: ['Full-Stack Systems', 'Algorithmic Optimization', 'Rapid Tool Adoption', 'Analytical Logic'],
  dilemma: 'Rapid AI code synthesis outpaced traditional development roles, causing sudden team dissolutions.',
  dialogue: [
    { speaker: 'Daniel', text: "Companies expect us to master new AI tools overnight while yesterday's experience becomes outdated." },
    { speaker: 'Daniel', text: "We're doing everything right. Then why does everything keep falling apart?" },
    { speaker: 'Daniel', text: "If something breaks, I want to fix it. But this uncertainty can't be debugged with logic alone." },
  ],
};

export const ChapterCharacterIntro: React.FC<ChapterCharacterIntroProps> = ({
  userGender = 'female',
  taleTitle,
  chapterTitle,
  realmName = 'Work Realm',
  femaleIntro,
  maleIntro,
  onProceedToChapter2,
  onBackToStory,
  darkMode = true,
}) => {
  // Merge prop data with rich defaults
  const femaleChar: CharacterDetail = {
    ...DEFAULT_FEMALE,
    characterName: femaleIntro?.characterName || DEFAULT_FEMALE.characterName,
    avatarUrl: resolveAssetUrl(femaleIntro?.avatarUrl, DEFAULT_FEMALE.avatarUrl),
    backgroundStory: femaleIntro?.backgroundStory || DEFAULT_FEMALE.backgroundStory,
    dialogue: femaleIntro?.dialogue?.length ? femaleIntro.dialogue : DEFAULT_FEMALE.dialogue,
  };

  const maleChar: CharacterDetail = {
    ...DEFAULT_MALE,
    characterName: maleIntro?.characterName || DEFAULT_MALE.characterName,
    avatarUrl: resolveAssetUrl(maleIntro?.avatarUrl, DEFAULT_MALE.avatarUrl),
    backgroundStory: maleIntro?.backgroundStory || DEFAULT_MALE.backgroundStory,
    dialogue: maleIntro?.dialogue?.length ? maleIntro.dialogue : DEFAULT_MALE.dialogue,
  };

  // Determine appearance order based on avatar/profile gender:
  // If user is female: [Female, Male]
  // If user is male: [Male, Female]
  const isFemaleUser = userGender === 'female';
  const orderedCharacters = isFemaleUser ? [femaleChar, maleChar] : [maleChar, femaleChar];

  // Active selected character (default to 0 = matches user's gender)
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const activeChar = orderedCharacters[selectedIdx];

  const primaryChar = orderedCharacters[0];
  const companionChar = orderedCharacters[1];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. CHARACTER SELECTOR TAB BAR (Ordered by user avatar gender) */}
      <div className={`p-1.5 rounded-2xl border-2 flex items-center justify-between gap-2 shadow-lg backdrop-blur-md ${
        darkMode ? 'bg-[#101726]/90 border-[#d4af37]/40' : 'bg-white/95 border-[#d4af37]'
      }`}>
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {orderedCharacters.map((char, idx) => {
            const isActive = selectedIdx === idx;
            const isLead = idx === 0;

            return (
              <button
                key={char.characterName}
                onClick={() => setSelectedIdx(idx)}
                className={`flex-1 sm:flex-initial flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#b8860b] text-slate-950 shadow-md font-extrabold scale-[1.02]'
                    : darkMode
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-amber-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full overflow-hidden border ${
                  isActive ? 'border-slate-950' : 'border-[#d4af37]'
                }`}>
                  <img src={char.avatarUrl} alt={char.characterName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="font-cinzel tracking-wider">{char.characterName}</span>
                {isLead && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                    isActive ? 'bg-black/20 text-slate-950' : 'bg-[#d4af37]/20 text-[#d4af37]'
                  }`}>
                    Your Lead
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Back to Story button */}
        {onBackToStory && (
          <button
            onClick={onBackToStory}
            className={`hidden sm:flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              darkMode
                ? 'border-slate-700 text-slate-300 hover:border-[#d4af37] hover:text-[#d4af37]'
                : 'border-slate-300 text-slate-600 hover:border-[#d4af37] hover:text-[#8a5d12]'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Chronicle
          </button>
        )}
      </div>

      {/* 2. TOP ANIMATED CHARACTER HERO WITH TRANSPARENT OVERLAID TEXT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeChar.characterName}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Animated Hero Box */}
          <div className={`rounded-3xl overflow-hidden border-2 shadow-2xl relative ${
            darkMode ? 'border-[#d4af37]/60 bg-[#0d131f]' : 'border-[#d4af37] bg-white'
          }`}>
            <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
              
              {/* Ken Burns Animated Character Portrait */}
              <motion.img
                src={activeChar.avatarUrl}
                alt={activeChar.characterName}
                className="w-full h-full object-cover object-top filter brightness-[0.92] contrast-105"
                initial={{ scale: 1.0, y: 0 }}
                animate={{
                  scale: [1.0, 1.06, 1.02, 1.05, 1.0],
                  y: [0, -6, 4, -3, 0],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
                referrerPolicy="no-referrer"
              />

              {/* Ambient Golden Shimmer Sweep Animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/15 to-transparent pointer-events-none"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  repeatDelay: 2.5,
                }}
              />

              {/* Vignette gradients for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/60 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60 pointer-events-none" />

              {/* TOP HEADER TAGS */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#d4af37]/60 text-amber-200 text-xs font-bold font-cinzel">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>{selectedIdx === 0 ? 'Primary Character' : 'Companion Adventurer'}</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#d4af37]/40 text-[#fce0a2] text-xs font-mono font-bold">
                  Age {activeChar.age}
                </div>
              </div>

              {/* TRANSPARENT OVERLAID TEXT AT THE BOTTOM/MIDDLE */}
              <div className="absolute inset-x-4 bottom-4 sm:bottom-6 z-10">
                <div className={`p-4 sm:p-6 rounded-2xl border backdrop-blur-xl shadow-2xl space-y-2.5 transition-all ${
                  darkMode
                    ? 'bg-[#101726]/80 border-[#d4af37]/60 text-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.8)]'
                    : 'bg-white/80 border-[#d4af37]/80 text-slate-900 shadow-[0_8px_32px_rgba(212,175,55,0.3)]'
                }`}>
                  
                  {/* Name and Role */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className={`text-[11px] font-bold uppercase tracking-widest font-cinzel ${
                        darkMode ? 'text-[#d4af37]' : 'text-[#8a5d12]'
                      }`}>
                        {activeChar.gender === 'female' ? 'Female Lead Adventurer' : 'Male Lead Adventurer'}
                      </span>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        {activeChar.characterName}
                      </h2>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#d4af37]/30 to-[#b8860b]/30 border border-[#d4af37] text-amber-200 font-semibold text-xs sm:text-sm font-cinzel">
                      {activeChar.role}
                    </div>
                  </div>

                  {/* Character Quote banner */}
                  <div className="pt-2 border-t border-white/15">
                    <p className="text-sm sm:text-base md:text-lg italic font-serif leading-snug text-amber-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                      "{activeChar.quote}"
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* 3. DOSSIER & BACKGROUND STORY */}
          <div className={`rounded-2xl p-6 sm:p-8 space-y-5 border-2 shadow-xl ${
            darkMode ? 'gold-card-frame bg-[#121824]/95 text-slate-100' : 'bg-white/95 border-[#d4af37] text-slate-900'
          }`}>
            
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#d4af37]/30">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#d4af37] to-[#996515] p-0.5 flex items-center justify-center shadow-md">
                <div className={`w-full h-full rounded-[6px] flex items-center justify-center ${
                  darkMode ? 'bg-[#121824] text-[#fce0a2]' : 'bg-white text-[#8a5d12]'
                }`}>
                  <User className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className={`text-[11px] font-bold uppercase tracking-widest font-cinzel ${
                  darkMode ? 'text-[#d4af37]' : 'text-[#8a5d12]'
                }`}>
                  Character Profile
                </span>
                <h3 className={`text-lg sm:text-xl font-bold font-cinzel ${
                  darkMode ? 'text-[#fce0a2]' : 'text-[#0f172a]'
                }`}>
                  Background &amp; Motivation
                </h3>
              </div>
            </div>

            {/* Background Narrative */}
            <p className={`text-base sm:text-lg leading-relaxed font-serif-display ${
              darkMode ? 'text-slate-200' : 'text-slate-800'
            }`}>
              {activeChar.backgroundStory}
            </p>

            {/* Core Strengths & Dilemma */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className={`p-4 rounded-xl border ${
                darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-amber-50/70 border-amber-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-[#d4af37]" />
                  <span className="text-xs font-bold font-cinzel uppercase tracking-wider text-[#d4af37]">
                    Key Strengths
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeChar.strengths.map((str, sIdx) => (
                    <span
                      key={sIdx}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    >
                      {str}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${
                darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-amber-50/70 border-amber-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-[#d4af37]" />
                  <span className="text-xs font-bold font-cinzel uppercase tracking-wider text-[#d4af37]">
                    The Catalyst
                  </span>
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {activeChar.dilemma}
                </p>
              </div>
            </div>

          </div>

          {/* 4. OPENING DIALOGUE BUBBLES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className={`text-xs sm:text-sm font-bold uppercase tracking-wider font-cinzel ${
                darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
              }`}>
                Opening Dialogue · {activeChar.characterName}
              </h4>
              <span className="text-xs text-[#d4af37] font-mono">
                {activeChar.dialogue.length} Exchanges
              </span>
            </div>

            <div className="space-y-3">
              {activeChar.dialogue.map((line, dIdx) => (
                <div
                  key={dIdx}
                  className={`flex items-start gap-3.5 ${dIdx % 2 === 1 ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-2xl border-2 border-[#d4af37] overflow-hidden shrink-0 shadow-lg ${
                    darkMode ? 'bg-[#121824]' : 'bg-white'
                  }`}>
                    <img src={activeChar.avatarUrl} alt={line.speaker} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  
                  <div className={`max-w-xl p-4 sm:p-5 rounded-2xl border-2 shadow-md ${
                    darkMode
                      ? 'bg-[#121824]/90 border-[#d4af37]/40 text-slate-200'
                      : 'bg-white/95 border-[#d4af37] text-slate-800'
                  } ${
                    dIdx % 2 === 1 ? 'rounded-tr-none' : 'rounded-tl-none'
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className={`text-xs font-bold uppercase tracking-widest font-cinzel ${
                        darkMode ? 'text-[#d4af37]' : 'text-[#8a5d12]'
                      }`}>
                        {line.speaker}
                      </p>
                      <MessageSquare className="w-3.5 h-3.5 text-[#d4af37]/60" />
                    </div>
                    <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-serif-display ${
                      darkMode ? 'text-slate-100' : 'text-slate-900'
                    }`}>
                      "{line.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. SWITCH COMPANION OR PROCEED TO CHAPTER 2 */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Quick Switch to the other character */}
            <button
              onClick={() => setSelectedIdx(selectedIdx === 0 ? 1 : 0)}
              className={`w-full sm:w-auto px-5 py-3 rounded-xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                darkMode
                  ? 'bg-[#182130] border-[#d4af37]/50 text-[#fce0a2] hover:bg-[#202c40]'
                  : 'bg-amber-50 border-[#d4af37]/70 text-[#8a5d12] hover:bg-amber-100'
              }`}
            >
              <User className="w-4 h-4 text-[#d4af37]" />
              <span>
                View {selectedIdx === 0 ? companionChar.characterName : primaryChar.characterName} ({selectedIdx === 0 ? 'Companion' : 'Your Lead'})
              </span>
            </button>

            {/* Proceed to Chapter 2 */}
            <button
              onClick={onProceedToChapter2}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#d4af37] text-slate-950 font-extrabold text-sm sm:text-base hover:brightness-110 active:scale-95 transition-all shadow-xl inline-flex items-center justify-center gap-2 border border-[#b8860b] cursor-pointer"
            >
              <span>Proceed to Chapter 2 Choices</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </motion.div>
      </AnimatePresence>

    </div>
  );
};
