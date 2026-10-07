import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Mic, MicOff, Award, CheckCircle2 } from 'lucide-react';
import { Language, SkillType } from '../types';
import { t } from '../lib/i18n';
import { LANGUAGE_FULL_NAMES } from './ChapterFlow';

export interface ReadAloudPromptTextProps {
  feedbackParagraphs: string[];
  activeSkill?: SkillType;
  selectedAudioLang: Language;
  currentLang: Language;
  darkMode?: boolean;
  onReadAloudChoice?: (skill: SkillType, lang: Language, accuracy?: number) => void;
  onChooseBestChoice?: (skill: SkillType, lang?: Language) => void;
  onEarnLanguagePoints?: (lang: Language, points: number) => void;
  onEarnSkillPoint?: (skill: SkillType) => void;
}

/**
 * Helper to map Language to BCP-47 language tag for Web Speech
 */
export function getSpeechLangTag(lang: Language): string {
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

export const ReadAloudPromptText: React.FC<ReadAloudPromptTextProps> = ({
  feedbackParagraphs,
  activeSkill = 'Plan',
  selectedAudioLang,
  currentLang,
  darkMode = true,
  onReadAloudChoice,
  onChooseBestChoice,
  onEarnLanguagePoints,
  onEarnSkillPoint,
}) => {
  const [isReadingAloud, setIsReadingAloud] = useState<boolean>(false);
  const [readTranscript, setReadTranscript] = useState<string>('');
  const [readAccuracy, setReadAccuracy] = useState<number | null>(null);
  const [hasClaimedPoints, setHasClaimedPoints] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const speechRecognitionRef = useRef<any>(null);
  const hasRecordedReadAloudStatRef = useRef<boolean>(false);

  // Clean up any ongoing speech recognition on unmount
  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const activeFeedbackLang = currentLang || selectedAudioLang || 'EN';

  const targetLangDisplayName = useMemo(() => {
    const dict = LANGUAGE_FULL_NAMES[selectedAudioLang || currentLang];
    return dict?.[activeFeedbackLang] || dict?.[currentLang] || dict?.['EN'] || selectedAudioLang || currentLang;
  }, [selectedAudioLang, activeFeedbackLang, currentLang]);

  const readAloudPromptText = useMemo(() => {
    return t('readAloudEarnPoints', activeFeedbackLang).replace('{lang}', targetLangDisplayName);
  }, [activeFeedbackLang, targetLangDisplayName]);

  const recordReadAloudStat = useCallback(() => {
    if (hasRecordedReadAloudStatRef.current) return;
    hasRecordedReadAloudStatRef.current = true;

    const activeLanguage: Language = selectedAudioLang || currentLang || 'EN';

    if (onReadAloudChoice) {
      onReadAloudChoice(activeSkill, activeLanguage);
    } else if (onChooseBestChoice) {
      onChooseBestChoice(activeSkill, activeLanguage);
    }
  }, [activeSkill, selectedAudioLang, currentLang, onReadAloudChoice, onChooseBestChoice]);

  // Award Points
  const awardLanguagePoints = useCallback(() => {
    recordReadAloudStat();
    setHasClaimedPoints(true);
    if (onEarnLanguagePoints) {
      onEarnLanguagePoints(selectedAudioLang || currentLang, 50);
    }
    if (onEarnSkillPoint) {
      onEarnSkillPoint(activeSkill);
    }
  }, [recordReadAloudStat, selectedAudioLang, currentLang, activeSkill, onEarnLanguagePoints, onEarnSkillPoint]);

  const evaluateReadAloudAccuracy = useCallback(() => {
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
  }, [feedbackParagraphs, readTranscript, hasClaimedPoints, awardLanguagePoints]);

  const startSpeechRecognition = () => {
    recordReadAloudStat();
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
      recognition.lang = getSpeechLangTag(selectedAudioLang || currentLang);
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
    } catch {
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

  return (
    <>
      {/* Read aloud prompt row: Read aloud button placed directly next to the instruction text */}
      <div className="mt-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
        <button
          id="choice-read-aloud-btn"
          onClick={isReadingAloud ? stopSpeechRecognition : startSpeechRecognition}
          type="button"
          className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${
            isReadingAloud
              ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-400 animate-pulse'
              : 'bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-300'
          } font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0`}
          title="Read Aloud"
        >
          {isReadingAloud ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Listening...</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Read Aloud</span>
            </>
          )}
        </button>

        <p
          id="choice-read-aloud-prompt"
          className={`text-xs sm:text-sm leading-relaxed font-medium flex-1 ${
            darkMode ? 'text-amber-200/90' : 'text-amber-950'
          }`}
        >
          {readAloudPromptText}
        </p>
      </div>

      {/* Spoken Transcript Notification */}
      {readTranscript && (
        <div
          className={`mt-3 p-3 rounded-xl border text-xs sm:text-sm ${
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

      {/* Points Awarded Badge */}
      {hasClaimedPoints && (
        <div
          className={`mt-3 p-2.5 rounded-xl border-2 flex items-center justify-between text-xs sm:text-sm font-bold ${
            darkMode
              ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-200'
              : 'bg-emerald-50 border-emerald-600/70 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Award className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`} />
            <span>Language Mastery Verified! +50 Points Awarded in {targetLangDisplayName}</span>
          </div>
          <CheckCircle2 className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`} />
        </div>
      )}

      {/* Speech Error Notification / Manual Claim */}
      {speechError && (
        <div
          className={`mt-3 p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            darkMode
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              : 'bg-amber-50 border-amber-300 text-amber-900 font-medium'
          }`}
        >
          <span>{speechError}</span>
          {!hasClaimedPoints && (
            <button
              type="button"
              onClick={() => {
                recordReadAloudStat();
                awardLanguagePoints();
              }}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-sm transition-all"
            >
              Claim Points
            </button>
          )}
        </div>
      )}
    </>
  );
};
