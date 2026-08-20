import { ChapterContent, Language } from '../types';
import enData from '../data/chapters/en.json';
import esData from '../data/chapters/es.json';
import itData from '../data/chapters/it.json';
import ptData from '../data/chapters/pt.json';
import nlData from '../data/chapters/nl.json';
import { resolveAssetUrl } from './assetRegistry';

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

  const chapter: ChapterContent = JSON.parse(JSON.stringify(raw));
  if (chapter.bgMedia && chapter.bgMedia.url) {
    chapter.bgMedia.url = resolveAssetUrl(chapter.bgMedia.url);
  }
  if (chapter.intro?.female?.avatarUrl) {
    chapter.intro.female.avatarUrl = resolveAssetUrl(chapter.intro.female.avatarUrl);
  }
  if (chapter.intro?.male?.avatarUrl) {
    chapter.intro.male.avatarUrl = resolveAssetUrl(chapter.intro.male.avatarUrl);
  }
  if (chapter.choices) {
    Object.values(chapter.choices).forEach((ch: any) => {
      if (ch && ch.choiceImage) {
        ch.choiceImage = resolveAssetUrl(ch.choiceImage);
      }
    });
  }
  return chapter;
}
