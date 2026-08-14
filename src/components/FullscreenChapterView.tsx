import React, { useState, useEffect, useRef } from 'react';
import { ChapterContent, ChoiceOptionType, SkillType, UserProfile, ChapterComment, Language, Tale } from '../types';
import { getChapterById } from '../lib/chapterLoader';
import { CommentsDrawer } from './CommentsDrawer';
import { CinematicStoryVideo } from './CinematicStoryVideo';
import { X as CloseIcon, Volume2 as VolOn, VolumeX as VolOff, Heart as HeartIcon, Eye as EyeIcon, MessageSquare as MsgIcon, Mic as MicIcon, Play as PlayIcon, Pause as PauseIcon, Sparkles as SparkleIcon, CheckCircle2 as CheckIcon, AlertTriangle as AlertIcon, ArrowRight as ArrowRightIcon, RefreshCw as RefreshIcon, Trophy as TrophyIcon } from 'lucide-react';

interface FullscreenChapterViewProps {
  tale: Tale;
  user: UserProfile | null;
  currentLang: Language;
  likedChapters: string[];
  viewedChapters: string[];
  commentsMap: Record<string, ChapterComment[]>;
  onClose: () => void;
  onToggleLike: (chapterId: string) => void;
  onRecordView: (chapterId: string) => void;
  onAddComment: (chapterId: string, text: string) => void;
  onEditComment?: (chapterId: string, commentId: string, text: string) => void;
  onDeleteComment?: (chapterId: string, commentId: string) => void;
  onEarnSkillPoint: (skill: SkillType) => void;
  darkMode?: boolean;
}

export const FullscreenChapterView: React.FC<FullscreenChapterViewProps> = ({
  tale,
  user,
  currentLang,
  likedChapters,
  viewedChapters,
  commentsMap,
  onClose,
  onToggleLike,
  onRecordView,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onEarnSkillPoint,
  darkMode = false,
}) => {
  const [currentChapterNum, setCurrentChapterNum] = useState<number>(1);
  const chapterId = `atlantis-ch${currentChapterNum}`;

  // Load chapter data dynamically from JSON for active language
  const chapterData: ChapterContent = (getChapterById(chapterId, currentLang) || {
    id: chapterId,
    taleId: tale.id,
    chapterNumber: currentChapterNum,
    title: `Chapter ${currentChapterNum} — Legend Choice`,
    subtitle: tale.title,
    skill: tale.skill,
    bgMedia: { type: 'image', url: tale.coverImage },
    intro: {
      female: {
        characterName: 'Alethea',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        backgroundStory: 'Alethea guarded the ancient archives.',
        dialogue: [{ speaker: 'Alethea', text: 'Below the ocean domes, the Five Crystals keep our realm alive.' }]
      },
      male: {
        characterName: 'Elion',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        backgroundStory: 'Elion was Atlantis greatest warrior.',
        dialogue: [{ speaker: 'Elion', text: 'When every light in Atlantis went out, I knew the Heart had summoned us.' }]
      }
    }
  }) as any;

  // Active skill choice for this chapter (defaults to chapter skill)
  const [selectedSkill, setSelectedSkill] = useState<SkillType>(chapterData.skill || tale.skill);

  // Sound / Audio Ambience state
  const [isMuted, setIsMuted] = useState(true);

  // Selected option for Chapter 2+ ('Best' | 'Safe' | 'Weak' | 'Harmful')
  const [selectedChoice, setSelectedChoice] = useState<ChoiceOptionType | null>(null);

  // Speech / Read it back state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeWordIdx, setActiveWordIdx] = useState<number>(-1);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [speechRecognizedText, setSpeechRecognizedText] = useState('');
  const [hasAwardedPoint, setHasAwardedPoint] = useState(false);

  // Comments drawer state
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);

  // Shatter animation trigger
  const [showShatterAnim, setShowShatterAnim] = useState(false);

  const isLiked = likedChapters.includes(chapterId);
  const isViewed = viewedChapters.includes(chapterId);

  // Track view when opening chapter
  useEffect(() => {
    if (!isViewed) {
      onRecordView(chapterId);
    }
  }, [chapterId]);

  // Audio ambience synthesis (Web Audio API)
  useEffect(() => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, audioCtx.currentTime); // Soft ocean ambient tone
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      return () => {
        try {
          osc.stop();
          audioCtx.close();
        } catch (e) {}
      };
    } catch (e) {}
  }, [isMuted]);

  // Handle choice selection
  const handleSelectChoice = (choiceKey: ChoiceOptionType) => {
    setSelectedChoice(choiceKey);
    setHasAwardedPoint(false);
    setSpeechRecognizedText('');

    if (choiceKey !== 'Best') {
      // Trigger funny broken item shatter animation!
      setShowShatterAnim(true);
      setTimeout(() => setShowShatterAnim(false), 2200);
    }
  };

  // Read It Back Aloud with Word-by-Word Highlight using SpeechSynthesis
  const handleReadItBack = () => {
    if (!selectedChoice || !chapterData.choices) return;
    const feedbackText = chapterData.choices[selectedChoice]?.feedbackReadBack || '';
    if (!feedbackText) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(feedbackText);
      utterance.rate = 0.9;
      
      const words = feedbackText.split(' ');
      setIsSpeaking(true);
      setActiveWordIdx(0);

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const charIndex = event.charIndex;
          let count = 0;
          for (let i = 0; i < words.length; i++) {
            count += words[i].length + 1;
            if (count > charIndex) {
              setActiveWordIdx(i);
              break;
            }
          }
        }
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setActiveWordIdx(-1);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setActiveWordIdx(-1);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  // Speech Recognition for repeating feedback aloud (`SpeechRecognition` / `webkitSpeechRecognition`)
  const handleMicListen = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback simulated success if browser doesn't support Web Speech API
      setIsListeningMic(true);
      setTimeout(() => {
        setIsListeningMic(false);
        setSpeechRecognizedText('True leadership creates a Win4All outcome where everyone contributes.');
        if (!hasAwardedPoint) {
          setHasAwardedPoint(true);
          onEarnSkillPoint(selectedSkill);
        }
      }, 2000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLang === 'ES' ? 'es-ES' : currentLang === 'IT' ? 'it-IT' : currentLang === 'PT-pt' ? 'pt-PT' : currentLang === 'NL' ? 'nl-NL' : 'en-US';
      recognition.interimResults = false;

      setIsListeningMic(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpeechRecognizedText(transcript);
        setIsListeningMic(false);
        if (!hasAwardedPoint) {
          setHasAwardedPoint(true);
          onEarnSkillPoint(selectedSkill);
        }
      };

      recognition.onerror = () => {
        setIsListeningMic(false);
      };
      recognition.onend = () => {
        setIsListeningMic(false);
      };
    } catch (e) {
      setIsListeningMic(false);
    }
  };

  // Gender Intro Logic for Chapter 1
  const genderKey = user?.gender === 'male' ? 'male' : 'female';
  const introData = chapterData.intro[genderKey] || chapterData.intro.female;

  const currentComments = commentsMap[chapterId] || [];

  return (
    <div className={`fixed inset-0 z-50 flex flex-col overflow-hidden animate-fadeIn transition-colors duration-300 ${
      darkMode ? 'bg-[#0f141c] text-slate-100' : 'bg-[#fbf9f4] text-slate-900'
    }`}>
      
      {/* Background Image/Media with Adaptive Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={chapterData.bgMedia?.url || tale.coverImage}
          alt={chapterData.title}
          className={`w-full h-full object-cover ${
            darkMode ? 'filter brightness-[0.4] contrast-110' : 'filter brightness-[0.9] opacity-20'
          }`}
          referrerPolicy="no-referrer"
        />
        <div className={`absolute inset-0 ${
          darkMode
            ? 'bg-gradient-to-b from-[#0f141c]/90 via-[#0f141c]/60 to-[#0f141c]/95'
            : 'bg-gradient-to-b from-[#fbf9f4]/80 via-[#fbf9f4]/50 to-[#fbf9f4]/95'
        }`} />
      </div>

      {/* TOP HEADER BAR */}
      <header className={`relative z-20 backdrop-blur-md border-b px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl transition-colors ${
        darkMode ? 'bg-[#121824]/80 border-[#d4af37]/30 text-slate-100' : 'bg-white/95 border-[#d4af37] text-slate-900'
      }`}>
        
        {/* Left: Close button & Title */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={onClose}
            className={`p-2 rounded-full border transition-all active:scale-95 ${
              darkMode
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title="Exit Chapter"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
          
          <div>
            <p className={`text-[10px] uppercase font-bold tracking-widest font-cinzel ${
              darkMode ? 'text-[#d4af37]' : 'text-[#8a5d12]'
            }`}>
              {tale.title} · CHAPTER {currentChapterNum}
            </p>
            <h2 className={`text-sm sm:text-base font-bold font-cinzel ${
              darkMode ? 'text-[#fce0a2]' : 'text-[#0f172a]'
            }`}>
              {chapterData.title}
            </h2>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`sm:hidden p-2 rounded-full border ${
              darkMode ? 'bg-slate-800/80 border-slate-700 text-[#d4af37]' : 'bg-amber-50 border-amber-300 text-[#8a5d12]'
            }`}
          >
            {isMuted ? <VolOff className="w-4 h-4" /> : <VolOn className="w-4 h-4" />}
          </button>
        </div>

        {/* Center: SKILL CHOOSE BAR */}
        <div className={`flex items-center gap-1.5 p-1 rounded-full border shadow-inner ${
          darkMode ? 'bg-[#0f141c]/90 border-[#d4af37]/40' : 'bg-white/90 border-[#d4af37]'
        }`}>
          {(['Leader', 'Plan', 'Win4All', 'Listen', 'Recharge'] as SkillType[]).map((sk) => {
            const isActive = selectedSkill === sk;
            return (
              <button
                key={sk}
                onClick={() => setSelectedSkill(sk)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-slate-900 shadow-md scale-105'
                    : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sk}
              </button>
            );
          })}
        </div>

        {/* Right: Sound Toggle & Chapter Switcher */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-full border ${
              darkMode ? 'bg-slate-800/80 border-slate-700 text-[#d4af37] hover:bg-slate-700' : 'bg-amber-50 border-amber-300 text-[#8a5d12] hover:bg-amber-100'
            }`}
            title={isMuted ? 'Unmute ambience' : 'Mute ambience'}
          >
            {isMuted ? <VolOff className="w-4 h-4" /> : <VolOn className="w-4 h-4" />}
          </button>

          {/* Chapter Navigation Toggle (Ch 1 vs Ch 2) */}
          <div className={`flex items-center rounded-lg border p-0.5 text-xs font-semibold ${
            darkMode ? 'bg-[#121824] border-[#d4af37]/30' : 'bg-slate-100 border-[#d4af37]'
          }`}>
            <button
              onClick={() => { setCurrentChapterNum(1); setSelectedChoice(null); }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                currentChapterNum === 1 ? 'bg-[#d4af37] text-slate-900 font-bold shadow-sm' : (darkMode ? 'text-slate-400' : 'text-slate-600')
              }`}
            >
              Ch 1
            </button>
            <button
              onClick={() => { setCurrentChapterNum(2); setSelectedChoice(null); }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                currentChapterNum === 2 ? 'bg-[#d4af37] text-slate-900 font-bold shadow-sm' : (darkMode ? 'text-slate-400' : 'text-slate-600')
              }`}
            >
              Ch 2
            </button>
          </div>
        </div>

      </header>

      {/* CHAPTER CONTENT BODY */}
      <main className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        
        {/* CHAPTER 1 MODE: Story Narrative + 5 Dimensions + Characters Intro */}
        {currentChapterNum === 1 ? (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Story Overview & 5 Dimensions (if tale has story paragraphs or Atlantis tale) */}
            {chapterData.story?.paragraphs && (
              <div className={`rounded-2xl p-6 space-y-4 border-2 shadow-xl ${
                darkMode ? 'gold-card-frame bg-[#121824]/90' : 'bg-white/95 border-[#d4af37] text-slate-900'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌊</span>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest font-cinzel ${darkMode ? 'text-[#d4af37]' : 'text-[#8a5d12]'}`}>
                      Ancient Realm Chronicle
                    </span>
                    <h3 className={`text-xl font-bold font-cinzel ${darkMode ? 'text-[#fce0a2]' : 'text-[#0f172a]'}`}>
                      {chapterData.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 font-serif-display text-sm leading-relaxed">
                  <p className={darkMode ? 'text-slate-200' : 'text-slate-800'}>
                    {chapterData.story.paragraphs[0]}
                  </p>
                  <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                    {chapterData.story.paragraphs[1]}
                  </p>
                </div>

                {/* The 5 Dimensions Cards */}
                <div className="pt-2">
                  <h4 className={`text-xs font-bold uppercase tracking-wider font-cinzel mb-3 ${darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'}`}>
                    The Five Dimensions of The Heart:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {[
                      { icon: '💪', name: 'Physical', desc: 'Strength, health, and purposeful action.' },
                      { icon: '🤝', name: 'Social', desc: 'Cooperation, trust, and service.' },
                      { icon: '💖', name: 'Emotional', desc: 'Courage to feel and heal.' },
                      { icon: '📜', name: 'Intellectual', desc: 'Learning guided by truth and ethics.' },
                      { icon: '✨', name: 'Spiritual', desc: 'Meaning, humility, and connection.' }
                    ].map((dim, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs space-y-1 transition-transform hover:scale-[1.02] ${
                          darkMode ? 'bg-[#182130]/90 border-[#d4af37]/30 text-slate-200' : 'bg-[#fbf8ee] border-[#d4af37]/50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold font-cinzel text-[#d4af37]">
                          <span>{dim.icon}</span>
                          <span>{dim.name} Dimension</span>
                        </div>
                        <p className="text-[11px] opacity-90 leading-tight">{dim.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* The Change & Fissure */}
                <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                  darkMode ? 'bg-[#0f141f] border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <p className="font-semibold text-[#d4af37] font-cinzel">⚠️ The Weakening of The Light:</p>
                  <p>{chapterData.story.paragraphs[4] || "Small compromises weakened the foundation. The blue light began to flicker."}</p>
                  <p className="italic text-[11px] opacity-80">{chapterData.story.paragraphs[7] || "Neither understood that the Heart had chosen them because they represented knowledge with compassion, and strength with purpose."}</p>
                </div>
              </div>
            )}

            {/* Character Intro Card */}
            <div className={`rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5 shadow-xl border-2 ${
              darkMode ? 'gold-card-frame bg-[#121824]/90' : 'bg-white/95 border-[#d4af37] text-slate-900'
            }`}>
              <img
                src={user?.avatar_url || introData.avatarUrl}
                alt={introData.characterName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#d4af37] shadow-xl shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1.5 text-center sm:text-left">
                <span className={`text-[10px] font-bold uppercase tracking-widest font-cinzel ${darkMode ? 'text-[#d4af37]' : 'text-[#8a5d12]'}`}>
                  Guardian Spotlight
                </span>
                <h3 className={`text-xl font-bold font-cinzel ${darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'}`}>
                  {introData.characterName}
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed font-serif-display ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {introData.backgroundStory}
                </p>
              </div>
            </div>

            {/* Sequential Dialogue Bubbles */}
            <div className="space-y-4">
              <h4 className={`text-xs font-bold uppercase tracking-wider font-cinzel text-center ${darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'}`}>
                Awakening Dialogue
              </h4>
              {introData.dialogue.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${idx % 2 === 1 ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full border-2 border-[#d4af37] overflow-hidden shrink-0 shadow-md ${
                    darkMode ? 'bg-[#121824]' : 'bg-white'
                  }`}>
                    <img src={user?.avatar_url || introData.avatarUrl} alt={line.speaker} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className={`max-w-md p-4 rounded-2xl border-2 shadow-md ${
                    darkMode ? 'bg-[#121824]/90 border-[#d4af37]/40 text-slate-200' : 'bg-white/95 border-[#d4af37] text-slate-800'
                  } ${
                    idx % 2 === 1 ? 'rounded-tr-none' : 'rounded-tl-none'
                  }`}>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 font-cinzel ${
                      darkMode ? 'text-[#d4af37]' : 'text-[#8a5d12]'
                    }`}>
                      {line.speaker}
                    </p>
                    <p className={`text-xs sm:text-sm leading-relaxed font-serif-display ${
                      darkMode ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      "{line.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Go to Chapter 2 Choice Button */}
            <div className="text-center pt-4">
              <button
                onClick={() => setCurrentChapterNum(2)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#d4af37] text-slate-900 font-extrabold text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl inline-flex items-center gap-2 border border-[#b8860b]"
              >
                Proceed to Chapter 2 Choices <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          /* CHAPTER 2+ MODE: 4 Choice Options with Image Illustrations */
          <div className="space-y-6 animate-fadeIn">
            
            {/* Cinematic Story Video Player based on Chapter 2 Dilemma */}
            <CinematicStoryVideo darkMode={darkMode} />

            {/* 4 CHOICE BUTTONS (`Best` / `Safe` / `Weak` / `Harmful`) */}
            <div className="space-y-3">
              <p className={`text-xs font-semibold font-cinzel uppercase tracking-wider ${
                darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'
              }`}>
                Select Your Action Choice:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    key: 'Best',
                    defaultText: 'Protect Everyone Together',
                    badgeColor: darkMode ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' : 'bg-emerald-100 border-emerald-400 text-emerald-800'
                  },
                  {
                    key: 'Safe',
                    defaultText: 'Seal the Eastern Dome',
                    badgeColor: darkMode ? 'bg-blue-950/80 border-blue-500/50 text-blue-300' : 'bg-blue-100 border-blue-400 text-blue-800'
                  },
                  {
                    key: 'Weak',
                    defaultText: 'Wait for the Council',
                    badgeColor: darkMode ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' : 'bg-amber-100 border-amber-400 text-amber-800'
                  },
                  {
                    key: 'Harmful',
                    defaultText: 'Fight for Control',
                    badgeColor: darkMode ? 'bg-rose-950/80 border-rose-500/50 text-rose-300' : 'bg-rose-100 border-rose-400 text-rose-800'
                  }
                ].map((opt) => {
                  const choiceData = chapterData?.choices?.[opt.key as ChoiceOptionType];
                  let choiceText = choiceData?.title || opt.defaultText;
                  choiceText = choiceText.replace(/^(Best|Safe|Weak|Harmful)\s*[\*—\-:]\s*/i, '');

                  const isChosen = selectedChoice === opt.key;

                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectChoice(opt.key as ChoiceOptionType)}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                        isChosen
                          ? 'bg-[#fffdf7] border-[#d4af37] text-slate-900 ring-2 ring-[#d4af37] shadow-xl'
                          : darkMode
                          ? 'bg-[#121824]/80 border-slate-700/80 text-slate-300 hover:border-slate-500'
                          : 'bg-white/95 border-slate-200 text-slate-800 hover:border-[#d4af37] shadow-sm'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm font-bold font-cinzel">{choiceText}</span>
                          {isChosen && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${opt.badgeColor}`}>
                              {opt.key} Choice
                            </span>
                          )}
                        </div>
                        {choiceData?.description && (
                          <p className={`text-[11px] line-clamp-2 leading-relaxed opacity-80 ${isChosen ? 'text-slate-800' : ''}`}>
                            {choiceData.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CHOICE OUTCOME DISPLAY WITH PNG ARTWORK */}
            {selectedChoice && chapterData.choices && (
              <div className="space-y-4 pt-2 animate-fadeIn">
                
                {/* Visual Artwork of Choice */}
                {chapterData.choices[selectedChoice].choiceImage && (
                  <div className="rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-2xl relative">
                    <img
                      src={chapterData.choices[selectedChoice].choiceImage}
                      alt={chapterData.choices[selectedChoice].title}
                      className="w-full h-48 sm:h-64 object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex items-end p-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest font-cinzel text-[#d4af37] font-bold">
                          Outcome Illustrated
                        </span>
                        <h4 className="text-white font-bold font-cinzel text-sm sm:text-base">
                          {chapterData.choices[selectedChoice].title}
                        </h4>
                      </div>
                    </div>
                  </div>
                )}

                {/* FUNNY SHATTER ANIMATION FOR WEAK / HARMFUL / SAFE CHOICES */}
                {selectedChoice !== 'Best' && (
                  <div className={`text-center p-5 rounded-2xl relative overflow-hidden border-2 space-y-2 ${
                    darkMode ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}>
                    <div className="inline-block text-5xl my-1 animate-shatter">
                      {selectedChoice === 'Harmful' ? '💥' : selectedChoice === 'Weak' ? '💔' : '🛡️'}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider font-cinzel">
                      {selectedChoice === 'Harmful' ? 'Harmful Consequence: Mechanism Broken!' : selectedChoice === 'Weak' ? 'Weak Decision: Hesitation Caused Flooding!' : 'Safe Compromise: Southern District Isolated!'}
                    </p>
                    <p className={`text-xs leading-relaxed max-w-xl mx-auto ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {chapterData.choices[selectedChoice].description}
                    </p>
                    {chapterData.choices[selectedChoice].dialogues && (
                      <div className="space-y-2 pt-2 text-left max-w-lg mx-auto">
                        {chapterData.choices[selectedChoice].dialogues.map((dl, i) => (
                          <div key={i} className={`p-2.5 rounded-lg border text-xs ${
                            darkMode ? 'bg-[#121824]/90 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                          }`}>
                            <strong className="text-[#d4af37] font-cinzel mr-1.5">{dl.speaker}:</strong> "{dl.text}"
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] font-mono italic opacity-90 pt-1">
                      {chapterData.choices[selectedChoice].feedbackReadBack}
                    </p>
                  </div>
                )}

                {/* BEST CHOICE "READ IT BACK" & SPEECH RECOGNITION ENGINE */}
                {selectedChoice === 'Best' && (
                  <div className={`rounded-2xl p-5 space-y-4 border-2 border-emerald-500 shadow-xl ${
                    darkMode ? 'gold-card-frame bg-[#121824]/90' : 'bg-white/95 text-slate-900'
                  }`}>
                    <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider font-cinzel">
                      <CheckIcon className="w-4 h-4 text-emerald-600" /> Best Choice Selected! Win4All Mastery
                    </div>

                    {/* Outcome Dialogue */}
                    <div className="space-y-2">
                      {chapterData.choices.Best.dialogues.map((dl, i) => (
                        <div key={i} className={`p-3 rounded-xl border text-xs ${
                          darkMode ? 'bg-[#121824]/90 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}>
                          <strong className={`font-cinzel mr-2 ${darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'}`}>{dl.speaker}:</strong> "{dl.text}"
                        </div>
                      ))}
                    </div>

                    {/* READ IT BACK SPEECH SECTION */}
                    <div className={`p-4 rounded-xl border-2 space-y-3 ${
                      darkMode ? 'bg-[#182130] border-[#d4af37]/40' : 'bg-[#fcfaf2] border-[#d4af37]/60'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold font-cinzel ${darkMode ? 'text-[#fce0a2]' : 'text-[#8a5d12]'}`}>
                          🗣️ "Read It Back" Prompt
                        </span>
                        {hasAwardedPoint && (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-500 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                            <TrophyIcon className="w-3 h-3 text-emerald-600" /> +1 {selectedSkill} Point Awarded!
                          </span>
                        )}
                      </div>

                      {/* Word-by-Word Highlight Text Display */}
                      <p className={`text-sm font-serif-display leading-relaxed p-3 rounded-lg border ${
                        darkMode ? 'bg-[#121824] border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        {chapterData.choices.Best.feedbackReadBack.split(' ').map((word, wIdx) => (
                          <span
                            key={wIdx}
                            className={`transition-colors duration-150 mr-1 ${
                              activeWordIdx === wIdx
                                ? 'bg-[#d4af37] text-slate-900 font-bold px-1 rounded'
                                : darkMode ? 'text-slate-200' : 'text-slate-800'
                            }`}
                          >
                            {word}
                          </span>
                        ))}
                      </p>

                      {/* Interactive Buttons */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={handleReadItBack}
                          disabled={isSpeaking}
                          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border ${
                            darkMode
                              ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#fce0a2] hover:bg-[#d4af37]/40'
                              : 'bg-[#f4e8c1] border-[#d4af37] text-[#8a5d12] hover:bg-[#e8d7a1]'
                          }`}
                        >
                          {isSpeaking ? <PauseIcon className="w-3.5 h-3.5 animate-pulse text-amber-500" /> : <PlayIcon className="w-3.5 h-3.5 text-[#8a5d12]" />}
                          {isSpeaking ? 'Reading Aloud...' : 'Read Aloud'}
                        </button>

                        <button
                          onClick={handleMicListen}
                          disabled={isListeningMic}
                          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-md ${
                            isListeningMic
                              ? 'bg-rose-600 text-white animate-pulse'
                              : 'bg-gradient-to-r from-[#d4af37] to-[#996515] text-slate-900 hover:brightness-110'
                          }`}
                        >
                          <MicIcon className="w-3.5 h-3.5" />
                          {isListeningMic ? 'Listening...' : 'Repeat via Mic (+1 Point)'}
                        </button>
                      </div>

                      {speechRecognizedText && (
                        <p className={`text-[11px] p-2 rounded border font-mono ${
                          darkMode ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30' : 'text-emerald-800 bg-emerald-50 border-emerald-300'
                        }`}>
                          Captured Speech: "{speechRecognizedText}"
                        </p>
                      )}
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </main>

      {/* BOTTOM ACTION BAR */}
      <footer className={`relative z-20 backdrop-blur-md border-t px-6 py-3 flex items-center justify-between shadow-2xl transition-colors ${
        darkMode ? 'bg-[#121824]/90 border-[#d4af37]/30 text-[#fce0a2]' : 'bg-white/95 border-[#d4af37] text-[#9e7b0d]'
      }`}>
        
        <div className="flex items-center gap-6">
          
          {/* Likes Toggle */}
          <button
            onClick={() => onToggleLike(chapterId)}
            className={`flex items-center gap-1.5 text-xs font-semibold transition-transform active:scale-90 ${
              darkMode ? 'text-[#fce0a2]' : 'text-[#9e7b0d] '
            }`}
          >
            <HeartIcon className={`w-5 h-5 ${
              isLiked
                ? (darkMode ? 'text-[#fce0a2] fill-[#fce0a2]' : 'text-[#9e7b0d] fill-[#9e7b0d]')
                : (darkMode ? 'text-[#fce0a2]' : 'text-[#9e7b0d]') 
            }`} />
            <span className="font-bold">
              {tale.likesCount + (isLiked ? 1 : 0)}
            </span>
          </button>

          {/* Views Count */}
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${
            darkMode ? 'text-[#fce0a2]' : 'text-[#9e7b0d]'
          }`}>
            <EyeIcon className="w-5 h-5" />
            <span>{tale.viewsCount + (isViewed ? 1 : 0)}</span>
          </div>

          {/* Comments Button */}
          <button
            onClick={() => setShowCommentsDrawer(true)}
            className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              darkMode ? 'text-[#fce0a2]' : 'text-[#9e7b0d]'
            }`}
          >
            <MsgIcon className="w-5 h-5" />
            <span>{currentComments.length}</span>
          </button>

        </div>

        {/* Chapter Progress */}
        <div className={`text-xs font-mono px-3 py-1 rounded-full border font-bold ${
          darkMode ? 'bg-[#0f141c] text-[#fce0a2] border-[#d4af37]/30' : 'bg-[#f4e8c1] text-[#8a5d12] border-[#d4af37]'
        }`}>
          Chapter {currentChapterNum} / 2
        </div>

      </footer>

      {/* Comments Drawer Overlay */}
      {showCommentsDrawer && (
        <CommentsDrawer
          chapterId={chapterId}
          chapterTitle={chapterData.title}
          comments={currentComments}
          user={user}
          onClose={() => setShowCommentsDrawer(false)}
          onAddComment={(text) => onAddComment(chapterId, text)}
          onEditComment={(commentId, text) => onEditComment && onEditComment(chapterId, commentId, text)}
          onDeleteComment={(commentId) => onDeleteComment && onDeleteComment(chapterId, commentId)}
          darkMode={darkMode}
        />
      )}

    </div>
  );
};
