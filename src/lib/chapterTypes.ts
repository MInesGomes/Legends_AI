import { SkillType } from '../types';
import { Translations } from './i18n';

export type ChoiceId = 'choice1' | 'choice2' | 'choice3' | 'choice4';

export interface ChapterChoiceConfig {
  id: ChoiceId;
  available: boolean; // some chapters only have 2 of the 4 choices
  title?: string;
  subtitle?: string;
  titleKey?: keyof Translations;
  subtitleKey?: keyof Translations;
  imageUrl?: string;
}

export interface ChapterConfig {
  id: number; // 0..N
  hasGenderActs?: boolean; // Chapter 0 optional gender acts
  skill?: SkillType;
  choices: ChapterChoiceConfig[];
}

/**
 * Which choice is "the best" one is a fixed rule rather than per-choice
 * config: choice1 always is. Call this instead of reading a `choice.isBest`
 * flag so there's exactly one place that rule lives.
 */
export function isBestChoice(choiceId: ChoiceId): boolean {
  return choiceId === 'choice1';
}

