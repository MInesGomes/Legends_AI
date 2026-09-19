/**
 * choiceLocalization.ts
 *
 * All i18n lookup logic for a choice's display text lives here, separate from
 * the chapter/act navigation rules in chapterFlowMachine.ts. There is exactly
 * one lookup order, shared by title/subtitle, instead of separate copies of
 * the same four steps:
 *
 *   1. An explicit <field>Key set directly on the choice config
 *   2. A world/chapter/choice-specific i18n key, e.g. "eldorado_act0_choice1_title"
 *   3. A legacy fallback key for the original Atlantis Chapter 1 tale, e.g. "choice1_title"
 *   4. A hardcoded fallback string baked into the choice config itself
 */
import { Language } from '../types';
import { Translations, TRANSLATIONS } from './i18n';
import { ChapterChoiceConfig } from './chapterTypes';

type ChoiceTextField = 'title' | 'subtitle';

const FIELD_KEY_PROP: Record<ChoiceTextField, 'titleKey' | 'subtitleKey'> = {
  title: 'titleKey',
  subtitle: 'subtitleKey',
};

function getLocalizedChoiceText(
  field: ChoiceTextField,
  choice: ChapterChoiceConfig,
  lang: Language | string = 'EN',
  world?: string,
  chapterNumber?: number
): string | undefined {
  const dict = TRANSLATIONS[(lang as Language) || 'EN'];

  // No dictionary at all: title still falls back to the raw config value;
  // subtitle simply has nothing to show.
  if (!dict) return field === 'title' ? choice.title?.trim() || undefined : undefined;

  // 1. Explicit key set directly on this choice (e.g. choice.titleKey)
  const explicitKey = choice[FIELD_KEY_PROP[field]];
  const explicitVal = explicitKey && dict[explicitKey]?.trim();
  if (explicitVal) return explicitVal;

  // 2. World/chapter/choice-specific key, e.g. "eldorado_act0_choice1_title"
  if (world) {
    const worldActKey = `${world.toLowerCase()}_act${chapterNumber ?? 0}_${choice.id}_${field}` as keyof Translations;
    const worldVal = dict[worldActKey]?.trim();
    if (worldVal) return worldVal;
  }

  // 3. Legacy fallback for the original Atlantis Chapter 1 tale, e.g. "choice1_title"
  if ((world === 'Atlantis' || !world) && (chapterNumber === 1 || chapterNumber === undefined)) {
    const defaultKey = `${choice.id}_${field}` as keyof Translations;
    const defaultVal = dict[defaultKey]?.trim();
    if (defaultVal) return defaultVal;
  }

  // 4. Hardcoded fallback baked into the choice config
  return choice[field]?.trim() || undefined;
}

export function getChoiceLocalizedTitle(
  choice: ChapterChoiceConfig,
  lang: Language | string = 'EN',
  world?: string,
  chapterNumber?: number
): string | undefined {
  return getLocalizedChoiceText('title', choice, lang, world, chapterNumber);
}

export function getChoiceLocalizedSubtitle(
  choice: ChapterChoiceConfig,
  lang: Language | string = 'EN',
  world?: string,
  chapterNumber?: number
): string | undefined {
  return getLocalizedChoiceText('subtitle', choice, lang, world, chapterNumber);
}
