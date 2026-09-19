/**
 * chapterConfigResolver.ts
 *
 * Resolves the effective ChapterConfig (choices, hasGenderActs) for a given
 * chapter number, world and tale — including the built-in defaults for
 * "ElDorado / the_torch" and the generic four-choice fallback used by every
 * other tale that doesn't define its own chapterConfigs.
 *
 * This used to be inlined as a `useMemo` inside ChapterFlow.tsx and only
 * ever looked at the *current* chapter. Navigating to a neighbouring chapter
 * (e.g. going "back" from Chapter 1 into Chapter 0) needs the exact same
 * resolution for a chapter that isn't the current one, so it's pulled out
 * here as a plain function both call sites can share.
 */
import { ChapterChoiceConfig, ChapterConfig } from './chapterTypes';
import { Translations } from './i18n';

const ELDORADO_TORCH_CHAPTER0_CHOICES: ChapterChoiceConfig[] = [
  {
    id: 'choice1',
    titleKey: 'eldorado_act0_choice1_title' as keyof Translations,
    title: 'Give his light',
    available: true,
  },
  {
    id: 'choice2',
    titleKey: 'eldorado_act0_choice2_title' as keyof Translations,
    title: 'Afraid to lose his light',
    available: true,
  },
  { id: 'choice3', available: false },
  { id: 'choice4', available: false },
];

const DEFAULT_FOUR_CHOICES: ChapterChoiceConfig[] = [
  { id: 'choice1', available: true },
  { id: 'choice2', available: true },
  { id: 'choice3', available: true },
  { id: 'choice4', available: true },
];

export function isElDoradoTorchTale(world: string, taleName: string): boolean {
  return world === 'ElDorado' && taleName === 'the_torch';
}

export function resolveChapterConfig(
  chapterNumber: number,
  chapterConfigs: ChapterConfig[],
  world: string,
  taleName: string
): ChapterConfig {
  const isElDoradoTorch = isElDoradoTorchTale(world, taleName);
  const custom = chapterConfigs.find((cfg) => cfg.id === chapterNumber);

  if (custom) {
    const customHasNoChoices = !custom.choices || custom.choices.length === 0;
    if (isElDoradoTorch && chapterNumber === 0 && customHasNoChoices) {
      return { ...custom, hasGenderActs: false, choices: ELDORADO_TORCH_CHAPTER0_CHOICES };
    }
    return custom;
  }

  if (isElDoradoTorch) {
    return {
      id: chapterNumber,
      hasGenderActs: false,
      choices: chapterNumber === 0 ? ELDORADO_TORCH_CHAPTER0_CHOICES : [],
    };
  }

  return {
    id: chapterNumber,
    hasGenderActs: chapterNumber === 0,
    choices: chapterNumber === 0 ? [] : DEFAULT_FOUR_CHOICES,
  };
}

export function chapterHasAvailableChoices(config: ChapterConfig): boolean {
  return Boolean(config.choices && config.choices.some((c) => c.available));
}

/** hasGenderActs / hasChoices for the flow machine, for an arbitrary chapter number. */
export function resolveChapterMeta(
  chapterNumber: number,
  chapterConfigs: ChapterConfig[],
  world: string,
  taleName: string
): { hasGenderActs: boolean; hasChoices: boolean } {
  const config = resolveChapterConfig(chapterNumber, chapterConfigs, world, taleName);
  const isElDorado = world === 'ElDorado';
  return {
    hasGenderActs: config.hasGenderActs ?? (chapterNumber === 0 && !isElDorado),
    hasChoices: chapterHasAvailableChoices(config),
  };
}
