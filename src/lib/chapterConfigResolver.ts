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
import { ChapterConfig } from './chapterTypes';

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
    if (isElDoradoTorch && chapterNumber === 0 && (!custom.choices || custom.choices.length === 0)) {
      return { ...custom, hasGenderActs: false, choices: [] };
    }
    return custom;
  }

  if (isElDoradoTorch) {
    return {
      id: chapterNumber,
      hasGenderActs: false,
      choices: [],
    };
  }

  return {
    id: chapterNumber,
    hasGenderActs: chapterNumber === 0,
    choices: [],
  };
}

export function chapterHasAvailableChoices(config: ChapterConfig): boolean {
  return Boolean(config.choices && config.choices.some((c) => typeof c === 'string' && c.trim().length > 0));
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
