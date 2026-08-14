import { ChapterContent, Language } from '../types';
import enData from '../data/chapters/en.json';
import esData from '../data/chapters/es.json';
import itData from '../data/chapters/it.json';
import ptData from '../data/chapters/pt.json';
import nlData from '../data/chapters/nl.json';

const langMaps: Record<string, any> = {
  'EN': enData,
  'ES': esData,
  'IT': itData,
  'PT-pt': ptData,
  'NL': nlData
};

export function getChapterById(chapterId: string, lang: Language): ChapterContent | null {
  const currentMap = langMaps[lang] || enData;
  const raw = currentMap[chapterId] || enData[chapterId as keyof typeof enData];
  if (!raw) return null;
  return raw as unknown as ChapterContent;
}
