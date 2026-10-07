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
 * config: choice1 (choices[0]) always is. Call this instead of reading a `choice.isBest`
 * flag so there's exactly one place that rule lives.
 */
export function isBestChoice(choiceId: ChoiceId): boolean {
  return choiceId === 'choice1';
}

/**
 * Resolves an array of choice video IDs into ChapterChoiceConfig objects.
 * choices[0] is choice1 (the best choice), choices[1] is choice2, etc.
 * imageUrl: https://img.youtube.com/vi/${choice[n]}/hqdefault.jpg
 * videoUrl: https://youtu.be/${choice[n]}
 * where n is the number of the choice 0..n.
 * A choice is available if the videoID is non-empty.
 */
export function resolveChapterChoices(config?: ChapterConfig | null): ChapterChoiceConfig[] {
  if (!config || !config.choices) return [];
  const choiceIds: ChoiceId[] = ['choice1', 'choice2', 'choice3', 'choice4'];

  return config.choices.map((choiceEntry, index) => {
    const choiceId = (choiceIds[index] || `choice${index + 1}`) as ChoiceId;
    if (typeof choiceEntry === 'string') {
      const videoID = choiceEntry.trim();
      const available = videoID.length > 0;
      return {
        id: choiceId,
        available,
        videoID: available ? videoID : undefined,
        imageUrl: available ? `https://img.youtube.com/vi/${videoID}/hqdefault.jpg` : undefined,
        videoUrl: available ? `https://youtu.be/${videoID}` : undefined,
      };
    }
    const obj = choiceEntry as any;
    const rawVideoId = String(obj.videoID || (obj.videoUrl ? obj.videoUrl.split('/').pop() : '') || '').trim();
    const available = Boolean(obj.available ?? (rawVideoId.length > 0));
    return {
      id: obj.id || choiceId,
      available,
      videoID: rawVideoId || undefined,
      imageUrl: obj.imageUrl || (rawVideoId ? `https://img.youtube.com/vi/${rawVideoId}/hqdefault.jpg` : undefined),
      videoUrl: obj.videoUrl || (rawVideoId ? `https://youtu.be/${rawVideoId}` : undefined),
    };
  });
}

