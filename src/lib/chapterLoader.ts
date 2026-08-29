import { ChapterContent, Language } from '../types';
import { resolveAssetUrl } from './assetRegistry';

export function getChapterById(chapterId: string, _lang: Language): ChapterContent | null {
  // All static chapter JSON files have been removed in favor of Supabase video/audio/vtt stream URLs
  return null;
}
