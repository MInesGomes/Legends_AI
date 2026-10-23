import { SkillType } from '../types';

export type ChoiceId = 'choice1' | 'choice2' | 'choice3' | 'choice4';

export interface ChapterChoiceConfig {
  id: ChoiceId;
  available: boolean;
  videoID?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface ChapterConfig {
  id: number; // 0..N
  hasGenderActs?: boolean; // Chapter 0 optional gender acts
  skill?: SkillType;
  act0VideoID?: string;
  act0VideoUrl?: string;
  choices: string[];
}

/**
 * Which choice is "the best" one is a fixed rule rather than per-choice
 * config: choice1 (choices[0]) always is. Choice 1 is the best.
 */
export function isBestChoice(choiceId: ChoiceId): boolean {
  return choiceId === 'choice1';
}

/**
 * Resolves an array of choice video IDs into ChapterChoiceConfig objects.
 * choices[0] is choice1 (the best choice), choices[1] is choice2, etc.
 * When there is no YouTube link, url is "" and the UI shows "Coming Soon".
 * YouTube URL is obtained via "https://youtu.be/" + url.
 */
export function resolveChapterChoices(config?: ChapterConfig | null): ChapterChoiceConfig[] {
  if (!config || !config.choices) return [];
  const choiceIds: ChoiceId[] = ['choice1', 'choice2', 'choice3', 'choice4'];

  return config.choices.map((choiceEntry, index) => {
    const choiceId = (choiceIds[index] || `choice${index + 1}`) as ChoiceId;
    if (typeof choiceEntry === 'string') {
      const videoID = choiceEntry.trim();
      const hasUrl = videoID.length > 0;
      return {
        id: choiceId,
        available: true,
        videoID: videoID,
        imageUrl: hasUrl ? `https://img.youtube.com/vi/${videoID}/hqdefault.jpg` : '',
        videoUrl: hasUrl ? `https://youtu.be/${videoID}` : '',
      };
    }
    const obj = choiceEntry as any;
    const rawVideoId = String(obj.videoID || (obj.videoUrl ? obj.videoUrl.split('/').pop() : '') || '').trim();
    const hasUrl = rawVideoId.length > 0;
    return {
      id: obj.id || choiceId,
      available: true,
      videoID: rawVideoId,
      imageUrl: obj.imageUrl || (hasUrl ? `https://img.youtube.com/vi/${rawVideoId}/hqdefault.jpg` : ''),
      videoUrl: obj.videoUrl || (hasUrl ? `https://youtu.be/${rawVideoId}` : ''),
    };
  });
}
