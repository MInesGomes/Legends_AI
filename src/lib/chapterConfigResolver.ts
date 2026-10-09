/**
 * chapterConfigResolver.ts
 *
 * Generic chapter configuration resolver for every world and story.
 * Single source of truth for narrative chapter configurations backed by VIDEO_IDS.
 */
import { ChapterConfig } from './chapterTypes';
import { VIDEO_IDS } from './assetRegistry';

export const DEFAULT_CHAPTER_CONFIGS: ChapterConfig[] = [
  {
    id: 0,
    skill: 'Win4All',
    hasGenderActs: true,
    act0VideoID: VIDEO_IDS['0:act0'],
    choices: [],
  },
  {
    id: 1,
    skill: 'Proactive',
    act0VideoID: VIDEO_IDS['1:act0'],
    choices: [VIDEO_IDS['1:choice1'], VIDEO_IDS['1:choice2']],
  },
  {
    id: 2,
    skill: 'Plan',
    choices: [],
  },
  {
    id: 3,
    skill: 'Win4All',
    act0VideoID: VIDEO_IDS['3:act0'],
    choices: [
      VIDEO_IDS['3:choice1'],
      VIDEO_IDS['3:choice2'],
      VIDEO_IDS['3:choice3'],
    ],
  },
];

export function chapterHasAvailableChoices(config: ChapterConfig): boolean {
  return Boolean(config.choices && config.choices.some((c) => typeof c === 'string' && c.trim().length > 0));
}

export function resolveChapterConfig(
  chapterNumber: number,
  chapterConfigs: ChapterConfig[] = DEFAULT_CHAPTER_CONFIGS
): ChapterConfig {
  const custom = chapterConfigs.find((cfg) => cfg.id === chapterNumber);
  if (custom) {
    return custom;
  }
  return {
    id: chapterNumber,
    hasGenderActs: chapterNumber === 0,
    choices: [],
  };
}

/** hasGenderActs / hasChoices for the flow machine, for an arbitrary chapter number. */
export function resolveChapterMeta(
  chapterNumber: number,
  chapterConfigs: ChapterConfig[] = DEFAULT_CHAPTER_CONFIGS
): { hasGenderActs: boolean; hasChoices: boolean } {
  const config = resolveChapterConfig(chapterNumber, chapterConfigs);
  return {
    hasGenderActs: config.hasGenderActs ?? (chapterNumber === 0),
    hasChoices: chapterHasAvailableChoices(config),
  };
}

