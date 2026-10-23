/**
 * chapterConfigResolver.ts
 *
 * Single source of truth for narrative chapter configurations backed by the video database.
 * Every story for every world has chapters 0 until 5 with variable number of choices.
 * Choice 1 is always the best choice.
 * When there is no YouTube link, url is "" and the UI shows "Coming Soon".
 */
import { ChapterConfig } from './chapterTypes';
import { video } from '../data/storyVideos';

const atlantis5Crystals = video.ATLANTIS['5 Crystals'];

export const DEFAULT_CHAPTER_CONFIGS: ChapterConfig[] = [
  {
    id: 0,
    skill: 'Win4All',
    hasGenderActs: true,
    act0VideoID: atlantis5Crystals.Chapter0.url,
    act0VideoUrl: atlantis5Crystals.Chapter0.url ? `https://youtu.be/${atlantis5Crystals.Chapter0.url}` : '',
    choices: [],
  },
  {
    id: 1,
    skill: 'Proactive',
    hasGenderActs: false,
    act0VideoID: atlantis5Crystals.Chapter1.url,
    act0VideoUrl: atlantis5Crystals.Chapter1.url ? `https://youtu.be/${atlantis5Crystals.Chapter1.url}` : '',
    choices: [
      atlantis5Crystals.Chapter1Choice1?.url || '',
      atlantis5Crystals.Chapter1Choice2?.url || '',
      atlantis5Crystals.Chapter1Choice3?.url || '',
    ],
  },
  {
    id: 2,
    skill: 'Plan',
    hasGenderActs: false,
    act0VideoID: atlantis5Crystals.Chapter2.url,
    act0VideoUrl: atlantis5Crystals.Chapter2.url ? `https://youtu.be/${atlantis5Crystals.Chapter2.url}` : '',
    choices: [
      atlantis5Crystals.Chapter2Choice1.url,
      atlantis5Crystals.Chapter2Choice2.url,
      atlantis5Crystals.Chapter2Choice3.url,
    ],
  },
  {
    id: 3,
    skill: 'Win4All',
    hasGenderActs: false,
    act0VideoID: atlantis5Crystals.Chapter3.url,
    act0VideoUrl: atlantis5Crystals.Chapter3.url ? `https://youtu.be/${atlantis5Crystals.Chapter3.url}` : '',
    choices: [
      atlantis5Crystals.Chapter3Choice1.url,
      atlantis5Crystals.Chapter3Choice2.url,
      atlantis5Crystals.Chapter3Choice3.url,
    ],
  },
  {
    id: 4,
    skill: 'Plan',
    hasGenderActs: false,
    act0VideoID: atlantis5Crystals.Chapter4.url,
    act0VideoUrl: atlantis5Crystals.Chapter4.url ? `https://youtu.be/${atlantis5Crystals.Chapter4.url}` : '',
    choices: [
      atlantis5Crystals.Chapter4Choice1.url,
      atlantis5Crystals.Chapter4Choice2.url,
      atlantis5Crystals.Chapter4Choice3.url,
    ],
  },
  {
    id: 5,
    skill: 'Proactive',
    hasGenderActs: false,
    act0VideoID: atlantis5Crystals.Chapter5.url,
    act0VideoUrl: atlantis5Crystals.Chapter5.url ? `https://youtu.be/${atlantis5Crystals.Chapter5.url}` : '',
    choices: [
      atlantis5Crystals.Chapter5Choice1.url,
      atlantis5Crystals.Chapter5Choice2.url,
      atlantis5Crystals.Chapter5Choice3.url,
    ],
  },
];

export function chapterHasAvailableChoices(config: ChapterConfig): boolean {
  return Boolean(config.choices && config.choices.length > 0);
}

export function resolveChapterConfig(
  chapterNumber: number,
  chapterConfigs: ChapterConfig[] = DEFAULT_CHAPTER_CONFIGS,
  _world?: string,
  _story?: string
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
  chapterConfigs: ChapterConfig[] = DEFAULT_CHAPTER_CONFIGS,
  _world?: string,
  _story?: string
): { hasGenderActs: boolean; hasChoices: boolean } {
  const config = resolveChapterConfig(chapterNumber, chapterConfigs, _world, _story);
  return {
    hasGenderActs: config.hasGenderActs ?? (chapterNumber === 0),
    hasChoices: chapterHasAvailableChoices(config),
  };
}
