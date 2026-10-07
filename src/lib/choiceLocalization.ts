/**
 * choiceLocalization.ts
 *
 * All i18n lookup logic for a choice's display text lives here, separate from
 * the chapter/act navigation rules in chapterFlowMachine.ts.
 */
import { Language } from '../types';
import { ChapterChoiceConfig } from './chapterTypes';

export function getChoiceLocalizedTitle(
  _choice: ChapterChoiceConfig,
  _lang: Language | string = 'EN',
  _world?: string,
  _chapterNumber?: number
): string | undefined {
  return undefined;
}

export function getChoiceLocalizedSubtitle(
  _choice: ChapterChoiceConfig,
  _lang: Language | string = 'EN',
  _world?: string,
  _chapterNumber?: number
): string | undefined {
  return undefined;
}
