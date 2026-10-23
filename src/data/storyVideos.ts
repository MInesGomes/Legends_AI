export interface VideoItem {
  url: string;
}

export type StoryVideoMap = Record<string, VideoItem>;
export type WorldStoryMap = Record<string, StoryVideoMap>;
export type VideoDatabase = Record<string, WorldStoryMap>;

/**
 * Story video database structure.
 * Every story for every world has chapters 0 until 5 with variable number of choices.
 * Choice 1 is always the best choice.
 * When there is no YouTube link, url is "" and the UI shows "Coming Soon".
 * YouTube URL is obtained via "https://youtu.be/" + video[WORLD[STORY]].url
 */
export const video: VideoDatabase = {
  ATLANTIS: {
    '5 Crystals': {
      Chapter0: { url: '-B_vlZaUDDc' },
      female_act: { url: 'Z8Znh2LUwus' },
      male_act: { url: '-xAxX2RIFYI' },
      Chapter1: { url: 'X1O57PjE7MY' },
      Chapter1Choice1: { url: 'f5-jQw-id5w' },
      Chapter1Choice2: { url: 'oflXgBK4LDs' },
      Chapter1Choice3: { url: 'mWvBf77_3KA' },
      Chapter2: { url: '4RozT_rWzj4' },
      Chapter2Choice1: { url: 'iXHVa2wjEJo' },
      Chapter2Choice2: { url: 'mWvBf77_3KA' },
      Chapter2Choice3: { url: 'iXHVa2wjEJo' },
      Chapter3: { url: '' },
      Chapter3Choice1: { url: '' },
      Chapter3Choice2: { url: '' },
      Chapter3Choice3: { url: '' },
      Chapter4: { url: '' },
      Chapter4Choice1: { url: '' },
      Chapter4Choice2: { url: '' },
      Chapter4Choice3: { url: '' },
      Chapter5: { url: '' },
      Chapter5Choice1: { url: '' },
      Chapter5Choice2: { url: '' },
      Chapter5Choice3: { url: '' },
    },
  },
};

// Aliases for convenient case-insensitive lookups
video['Atlantis'] = video.ATLANTIS;
video['atlantis'] = video.ATLANTIS;
video.ATLANTIS['5crystals'] = video.ATLANTIS['5 Crystals'];
