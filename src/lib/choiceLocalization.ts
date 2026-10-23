/**
 * choiceLocalization.ts
 *
 * All i18n lookup logic for a choice's display text lives here, reading from
 * the localized ChoiceTitles file.
 */
import { Language } from '../types';
import { ChapterChoiceConfig } from './chapterTypes';
import { getLocalizedChoiceTitle } from '../i118/ChoiceTitles';

export function getChoiceLocalizedTitle(
  choice: ChapterChoiceConfig,
  lang: Language | string = 'EN',
  world: string = 'ATLANTIS',
  chapterNumber?: number
): string | undefined {
  if (!choice) return undefined;
  const chNum = chapterNumber !== undefined ? chapterNumber : 2;
  const choiceNum = choice.id ? choice.id.replace(/\D/g, '') : '1';
  const key = `Chapter${chNum}Choice${choiceNum}`;
  return getLocalizedChoiceTitle(world, '5 Crystals', key, lang);
}

export function getChoiceLocalizedSubtitle(
  _choice: ChapterChoiceConfig,
  _lang: Language | string = 'EN',
  _world?: string,
  _chapterNumber?: number
): string | undefined {
  return undefined;
}
