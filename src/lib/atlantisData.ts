import { Language } from '../types';
import {
  Act,
  ATLANTIS_STORY_ACTS,
  getActMp4Url,
  getActMp3Url,
  getActVttUrl,
  realmAtlantisJpg,
} from './assetRegistry';

export interface ActItem {
  id: string;
  chapterNumber: number;
  actKey: string;
  type: 'narrative' | 'character' | 'dialogue' | 'choice';
  chapterTitle: string;
  subtitle: string;
  actTitle: string;
  mp4: string;
  audio?: string;
  audio_es?: string;
  audio_nl?: string;
  audio_it?: string;
  audio_pt?: string;
  vtt?: string;
  vtt_en?: string;
  vtt_es?: string;
  vtt_nl?: string;
  vtt_it?: string;
  vtt_pt?: string;
  posterImage: string;
  text?: string;
  characterName?: string;
  role?: string;
  gender?: 'female' | 'male';
  femaleAvatar?: string;
  maleAvatar?: string;
  actData: Act;
}

export function getAtlantisActItems(
  lang: Language = 'EN',
  userGender: 'female' | 'male' | string = 'female',
  customActs: Act[] = ATLANTIS_STORY_ACTS
): ActItem[] {
  const isMaleUser =
    userGender === 'male' ||
    (typeof userGender === 'string' &&
      userGender.toLowerCase().includes('male') &&
      !userGender.toLowerCase().includes('female'));

  return customActs.map((actDef, idx) => {
    const actId = `atlantis-ch${actDef.chapter}-${actDef.act}-${idx}`;
    const mp4Url = getActMp4Url(actDef);
    const audioUrl = getActMp3Url(actDef, lang);
    const vttUrl = getActVttUrl(actDef, lang);

    const chapterTitle = `Chapter ${actDef.chapter}: Atlantis`;
    const subtitle = 'The Five Crystals';

    return {
      id: actId,
      chapterNumber: actDef.chapter,
      actKey: `ch${actDef.chapter}-${actDef.act}`,
      type: actDef.type || 'narrative',
      chapterTitle,
      subtitle,
      actTitle: actDef.title || `${actDef.act.replace(/_/g, ' ').toUpperCase()}`,
      mp4: mp4Url,
      audio: audioUrl,
      audio_es: getActMp3Url(actDef, 'ES'),
      audio_nl: getActMp3Url(actDef, 'NL'),
      audio_it: getActMp3Url(actDef, 'IT'),
      audio_pt: getActMp3Url(actDef, 'PT-pt'),
      vtt: vttUrl,
      vtt_en: getActVttUrl(actDef, 'EN'),
      vtt_es: getActVttUrl(actDef, 'ES'),
      vtt_nl: getActVttUrl(actDef, 'NL'),
      vtt_it: getActVttUrl(actDef, 'IT'),
      vtt_pt: getActVttUrl(actDef, 'PT-pt'),
      posterImage: realmAtlantisJpg,
      characterName: actDef.characterName,
      gender: actDef.gender,
      actData: actDef,
    };
  });
}
