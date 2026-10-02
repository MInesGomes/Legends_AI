import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Realm, SkillType, Tale, UserProfile } from '../types';
import { X, Sparkles, Feather, AlertCircle, Mic, MicOff, RotateCcw, Volume2, Type, ShieldAlert, Check } from 'lucide-react';

interface AddTaleModalProps {
  realm: Realm;
  user?: UserProfile | null;
  onClose: () => void;
  onSubmitTale: (newTale: Tale) => void;
  darkMode?: boolean;
}

// Banned swear words / inappropriate terms list (case-insensitive word boundary check)
const PROFANITY_LIST = [
  'fuck', 'fucking', 'fucked', 'fucker', 'fuckin',
  'shit', 'shitty', 'bullshit', 'dipshit',
  'bitch', 'bitches', 'bitching',
  'asshole', 'assholes', 'dumbass', 'jackass',
  'bastard', 'bastards',
  'cunt', 'cunts',
  'dick', 'dicks', 'dickhead',
  'cock', 'cocks', 'cocksucker',
  'piss', 'pissed', 'pissing',
  'slut', 'sluts',
  'whore', 'whores',
  'twat', 'wanker', 'prick',
  'pussy', 'pussies',
  'nigger', 'nigga', 'fag', 'faggot', 'retard',
  'motherfucker', 'motherfucking',
  'porn', 'porno', 'pornography', 'xxx', 'hentai',
  'nude', 'nudes', 'naked', 'dildo'
];

// Regex for email address detection
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i;

// Regex for phone number detection (matches standard 7-15 digit phone patterns with common separators, parentheses, or international +)
const PHONE_REGEX = /(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b|\b\d{10,13}\b)/;

interface ValidationResult {
  hasEmail: boolean;
  hasPhone: boolean;
  hasProfanity: boolean;
  detectedBadWord?: string;
  errorMessage?: string;
}

export const AddTaleModal: React.FC<AddTaleModalProps> = ({
  realm,
  user,
  onClose,
  onSubmitTale,
  darkMode = false,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [skill, setSkill] = useState<SkillType>('Win4All');
  const [storyContent, setStoryContent] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_CHARS = 1000;

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Validate text content against phone numbers, emails, and swear words
  const validateContent = (text: string, titleText: string = ''): ValidationResult => {
    const combined = `${titleText} ${text}`;

    // 1. Check Email
    if (EMAIL_REGEX.test(combined)) {
      return {
        hasEmail: true,
        hasPhone: false,
        hasProfanity: false,
        errorMessage: 'Email addresses are not allowed in tales for privacy.',
      };
    }

    // 2. Check Phone number
    if (PHONE_REGEX.test(combined)) {
      return {
        hasEmail: false,
        hasPhone: true,
        hasProfanity: false,
        errorMessage: 'Phone numbers are not allowed in tales for privacy.',
      };
    }

    // 3. Check Swear words
    const lower = combined.toLowerCase();
    for (const badWord of PROFANITY_LIST) {
      const regex = new RegExp(`\\b${badWord}\\b`, 'i');
      if (regex.test(lower)) {
        return {
          hasEmail: false,
          hasPhone: false,
          hasProfanity: true,
          detectedBadWord: badWord,
          errorMessage: 'Inappropriate language and swear words are not allowed.',
        };
      }
    }

    return {
      hasEmail: false,
      hasPhone: false,
      hasProfanity: false,
    };
  };

  const validation = useMemo(() => {
    return validateContent(storyContent, title);
  }, [storyContent, title]);

  const hasValidationError = validation.hasEmail || validation.hasPhone || validation.hasProfanity;

  // Toggle Speech Recognition
  const toggleSpeechRecognition = () => {
    setSpeechError(null);

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      setInterimTranscript('');
      return;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let finalTrans = '';
        let interimTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTrans += transcriptChunk;
          } else {
            interimTrans += transcriptChunk;
          }
        }

        setInterimTranscript(interimTrans);

        if (finalTrans) {
          setStoryContent((prev) => {
            const separator = prev.length > 0 && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '';
            const updated = prev + separator + finalTrans;
            return updated.slice(0, MAX_CHARS);
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in your browser.');
        } else if (event.error === 'no-speech') {
          // Keep listening
        } else {
          setSpeechError(`Speech recognition notice: ${event.error}`);
        }
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setSpeechError('Unable to start microphone recording.');
      setIsListening(false);
    }
  };

  const handleClearStory = () => {
    if (window.confirm('Clear story content?')) {
      setStoryContent('');
      setInterimTranscript('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyContent.trim() || hasValidationError) return;

    // Determine fallback title if empty
    const resolvedTitle =
      title.trim() ||
      storyContent
        .trim()
        .split(/[.\n]/)[0]
        .slice(0, 45) ||
      `Legend of ${realm.title}`;

    const newTale: Tale = {
      id: `custom-tale-${Date.now()}`,
      realmId: realm.id,
      title: resolvedTitle,
      subtitle: subtitle.trim() || `Tale shared for the ${realm.title} Realm`,
      coverImage: realm.bgImage,
      skill,
      viewsCount: 1,
      likesCount: 1,
      commentsCount: 0,
      isCustomUserTale: true,
      storyContent: storyContent.trim(),
      authorId: user?.user_id || 'guest',
      authorName: user?.name || 'Traveler',
      isApproved: false, // Hidden from all other users until reviewed & approved
      createdAt: new Date().toISOString(),
    };

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    onSubmitTale(newTale);
  };

  return (
    <div
      id="add-tale-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 animate-fadeIn bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="add-tale-modal-container"
        className={`w-full max-w-lg rounded-2xl p-3.5 sm:p-5 relative shadow-2xl flex flex-col border-2 transition-all my-auto max-h-[94vh] ${
          darkMode
            ? 'bg-[#0f172a] text-slate-50 border-[#d4af37]'
            : 'bg-[#ffffff] text-slate-900 border-[#b8860b] shadow-[0_20px_50px_rgba(0,0,0,0.3)]'
        }`}
      >
        {/* Header - Compact */}
        <div
          className={`flex items-center justify-between pb-2.5 border-b ${
            darkMode ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-1.5 sm:p-2 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                darkMode
                  ? 'bg-amber-500/10 border-amber-500/30 text-[#fce0a2]'
                  : 'bg-amber-100 border-amber-300 text-[#8a5d12]'
              }`}
            >
              <Feather className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3
                className={`text-base sm:text-lg font-bold font-cinzel tracking-wide truncate ${
                  darkMode ? 'text-[#fce0a2]' : 'text-[#78350f]'
                }`}
              >
                Tell Us Your Story
              </h3>
              <p
                className={`text-[11px] sm:text-xs font-medium truncate ${
                  darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Tell us your tale for the{' '}
                <span className="font-bold text-[#d4af37]">{realm.title}</span> Realm
              </p>
            </div>
          </div>
          <button
            id="close-add-tale-modal-btn"
            onClick={onClose}
            aria-label="Close modal"
            className={`p-1.5 rounded-full transition-colors flex-shrink-0 ml-2 ${
              darkMode
                ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Compact for Mobile Fit */}
        <form onSubmit={handleSubmit} className="space-y-2.5 pt-2.5 overflow-y-auto pr-0.5 flex-1">
          {/* Tale Title (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="tale-title-input"
                className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider font-cinzel flex items-center gap-1 ${
                  darkMode ? 'text-[#fce0a2]' : 'text-[#78350f]'
                }`}
              >
                <Type className="w-3 h-3" /> Story Title
              </label>
              <span className={`text-[10px] font-sans ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                (Optional)
              </span>
            </div>
            <input
              id="tale-title-input"
              type="text"
              maxLength={80}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Startup Breakthrough"
              className={`w-full border-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium focus:outline-none transition-all ${
                darkMode
                  ? 'bg-[#1e293b] border-slate-700 text-slate-50 placeholder-slate-400 focus:border-[#d4af37]'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-[#b8860b]'
              }`}
            />
          </div>

          {/* Primary Skill Focus */}
          <div>
            <label
              className={`block text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 font-cinzel ${
                darkMode ? 'text-[#fce0a2]' : 'text-[#78350f]'
              }`}
            >
              Primary Skill Focus
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['Proactive', 'Plan', 'Win4All', 'Listen', 'Recharge'] as SkillType[]).map((sk) => {
                const isSelected = skill === sk;
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => setSkill(sk)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? darkMode
                          ? 'bg-[#d4af37] text-slate-950 border-[#fce0a2] shadow-sm scale-105'
                          : 'bg-[#b8860b] text-white border-[#78350f] shadow-sm scale-105'
                        : darkMode
                        ? 'bg-[#1e293b] text-slate-200 border-slate-700 hover:border-slate-500 hover:text-white'
                        : 'bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {sk}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Story Text Area with Speech Recognition and Safety Guards */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-1.5">
              <label
                htmlFor="tale-story-textarea"
                className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider font-cinzel flex items-center gap-1 ${
                  darkMode ? 'text-[#fce0a2]' : 'text-[#78350f]'
                }`}
              >
                <span>Your Story Text *</span>
              </label>

              {/* Speech Recognition & Clear Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  id="speech-recognition-dictation-btn"
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all flex items-center gap-1 shadow-sm ${
                    isListening
                      ? 'bg-red-600 text-white border-red-400 animate-pulse ring-2 ring-red-400'
                      : darkMode
                      ? 'bg-amber-500/20 text-[#fce0a2] border-[#d4af37]/50 hover:bg-amber-500/30'
                      : 'bg-amber-100 text-amber-900 border-amber-400 hover:bg-amber-200'
                  }`}
                  title={isListening ? 'Stop listening' : 'Voice dictation'}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3 h-3" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3 text-[#d4af37]" />
                      <span>Voice Dictation</span>
                    </>
                  )}
                </button>

                {storyContent.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearStory}
                    className={`p-1 rounded-md border text-[11px] transition-colors ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                        : 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
                    }`}
                    title="Clear text"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}

                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    storyContent.length >= MAX_CHARS
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : storyContent.length > MAX_CHARS * 0.85
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : darkMode
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {storyContent.length}/{MAX_CHARS}
                </span>
              </div>
            </div>

            {/* Speech Recognition Active Feedback */}
            {isListening && (
              <div
                className={`p-2 rounded-lg border flex items-center justify-between gap-1.5 text-[11px] animate-pulse ${
                  darkMode
                    ? 'bg-red-950/60 border-red-500/60 text-red-200'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping flex-shrink-0" />
                  <span className="font-bold">Listening:</span>
                  <span className="italic truncate">
                    {interimTranscript ? `"${interimTranscript}"` : 'Speak into your mic...'}
                  </span>
                </div>
                <Volume2 className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              </div>
            )}

            {/* Speech Error Warning */}
            {speechError && (
              <div
                className={`p-2 rounded-lg border flex items-center gap-1.5 text-[11px] ${
                  darkMode
                    ? 'bg-amber-950/70 border-amber-500/50 text-amber-200'
                    : 'bg-amber-50 border-amber-400 text-amber-900'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                <span className="truncate">{speechError}</span>
              </div>
            )}

            {/* Story Textarea */}
            <div className="relative">
              <textarea
                id="tale-story-textarea"
                ref={textareaRef}
                required
                rows={8}
                maxLength={MAX_CHARS}
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                placeholder="Share your story... Tell us about a recent triumph, a funny mishap, or an adventure that stayed with you."
                className={`w-full border-2 rounded-xl p-3 text-xs sm:text-sm leading-relaxed font-sans focus:outline-none transition-all resize-y min-h-[100px] sm:min-h-[140px] max-h-[220px] ${
                  hasValidationError
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : darkMode
                    ? 'bg-[#1e293b] border-slate-700 text-slate-50 placeholder-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-[#b8860b] focus:ring-1 focus:ring-[#b8860b]'
                }`}
              />
            </div>

            {/* Safety & Content Filter Alert */}
            {hasValidationError && (
              <div
                className="p-2 rounded-lg border border-red-500/70 bg-red-950/80 text-red-200 text-xs flex items-center gap-2 animate-fadeIn shadow-sm"
              >
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span className="font-semibold text-[11px] sm:text-xs">
                  {validation.errorMessage}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-1 flex gap-2.5">
            <button
              type="button"
              id="cancel-add-tale-btn"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                darkMode
                  ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-tale-btn"
              disabled={!storyContent.trim() || storyContent.length > MAX_CHARS || hasValidationError}
              className="flex-1 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#fce0a2] to-[#d4af37] text-slate-950 font-black text-xs sm:text-sm rounded-xl border border-[#b8860b] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>Submit Your Tale</span>
            </button>
          </div>

          {/* Privacy Notice */}
          <div
            className={`p-2.5 rounded-lg border text-[11px] leading-snug ${
              darkMode
                ? 'bg-[#1e293b]/80 border-slate-700 text-slate-300'
                : 'bg-amber-50/90 border-amber-300 text-slate-700'
            }`}
          >
            Your tale will remain strictly private to your account and hidden from other travelers.
          </div>
        </form>
      </div>
    </div>
  );
};
