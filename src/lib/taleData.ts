import { Language, Tale } from '../types';
import {
  Act,
  ATLANTIS_STORY_ACTS,
  SUPABASE_BASE_URL,
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
  folderPath?: string;
}

export function getTaleFolderPath(taleId: string, realmId?: string): string {
  switch (taleId) {
    case 'tale-5-crystals':
      return `${SUPABASE_BASE_URL}/Atlantis/5crystals/chapter`;
    case 'tale-startup-winner':
      return `${SUPABASE_BASE_URL}/Work/startup_winner/chapter`;
    case 'tale-job-quest':
      return `${SUPABASE_BASE_URL}/Work/job_quest/chapter`;
    case 'tale-pride-prejudice':
      return `${SUPABASE_BASE_URL}/Marriage/pride_prejudice/chapter`;
    case 'tale-one-hart':
      return `${SUPABASE_BASE_URL}/Marriage/one_hart/chapter`;
    case 'tale-baby':
      return `${SUPABASE_BASE_URL}/DadMom/baby/chapter`;
    case 'tale-child':
      return `${SUPABASE_BASE_URL}/DadMom/child/chapter`;
    case 'tale-teens':
      return `${SUPABASE_BASE_URL}/DadMom/teens/chapter`;
    case 'tale-el-dorado-gold':
      return `${SUPABASE_BASE_URL}/ElDorado/city_of_gold/chapter`;
    case 'tale-ai-horizon':
      return `${SUPABASE_BASE_URL}/FutureLand/ai_horizon/chapter`;
    default:
      if (realmId === 'realm-work') return `${SUPABASE_BASE_URL}/Work/${taleId}/chapter`;
      if (realmId === 'realm-marriage') return `${SUPABASE_BASE_URL}/Marriage/${taleId}/chapter`;
      if (realmId === 'realm-dad-mom') return `${SUPABASE_BASE_URL}/DadMom/${taleId}/chapter`;
      if (realmId === 'realm-eldorado') return `${SUPABASE_BASE_URL}/ElDorado/${taleId}/chapter`;
      if (realmId === 'realm-futureland') return `${SUPABASE_BASE_URL}/FutureLand/${taleId}/chapter`;
      return `${SUPABASE_BASE_URL}/Atlantis/5crystals/chapter`;
  }
}

export function getTaleActs(tale: Tale): Act[] {
  if (tale.id === 'tale-5-crystals') {
    return ATLANTIS_STORY_ACTS;
  }

  return [
    {
      chapter: 0,
      act: 'act0',
      title: `${tale.title}: Act 1`,
      type: 'narrative',
    },
    {
      chapter: 0,
      act: 'female_act',
      title: `${tale.title}: Elena's Counsel`,
      gender: 'female',
      type: 'character',
    },
    {
      chapter: 0,
      act: 'male_act',
      title: `${tale.title}: Daniel's Vision`,
      gender: 'male',
      type: 'character',
    },
    {
      chapter: 0,
      act: 'act1',
      title: `${tale.title}: The Decision`,
      type: 'narrative',
    },
    {
      chapter: 1,
      act: 'act0',
      title: `${tale.title}: The Turning Point`,
      type: 'dialogue',
    },
    {
      chapter: 1,
      act: 'choice1',
      title: 'BEST: Strategic Resolution',
      type: 'choice',
    },
    {
      chapter: 1,
      act: 'choice2',
      title: 'SAFE: Measured Prudence',
      type: 'choice',
    },
    {
      chapter: 1,
      act: 'choice3',
      title: 'WEAK: Hesitant Delay',
      type: 'choice',
    },
    {
      chapter: 1,
      act: 'choice4',
      title: 'HARMFUL: Reckless Impatience',
      type: 'choice',
    },
  ];
}

export function getTaleActItems(
  tale: Tale,
  lang: Language = 'EN',
  userGender: 'female' | 'male' | string = 'female'
): ActItem[] {
  const acts = getTaleActs(tale);
  const folderPath = getTaleFolderPath(tale.id, tale.realmId);
  const poster = tale.coverImage || realmAtlantisJpg;

  return acts.map((actDef, idx) => {
    const actId = `${tale.id}-ch${actDef.chapter}-${actDef.act}-${idx}`;
    const mp4Url = getActMp4Url(actDef, folderPath);
    const audioUrl = getActMp3Url(actDef, lang, folderPath);
    const vttUrl = getActVttUrl(actDef, lang, folderPath);

    const chapterTitle = `Chapter ${actDef.chapter}: ${tale.title}`;
    const subtitle = tale.subtitle || '';

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
      audio_es: getActMp3Url(actDef, 'ES', folderPath),
      audio_nl: getActMp3Url(actDef, 'NL', folderPath),
      audio_it: getActMp3Url(actDef, 'IT', folderPath),
      audio_pt: getActMp3Url(actDef, 'PT', folderPath),
      vtt: vttUrl,
      vtt_en: getActVttUrl(actDef, 'EN', folderPath),
      vtt_es: getActVttUrl(actDef, 'ES', folderPath),
      vtt_nl: getActVttUrl(actDef, 'NL', folderPath),
      vtt_it: getActVttUrl(actDef, 'IT', folderPath),
      vtt_pt: getActVttUrl(actDef, 'PT', folderPath),
      posterImage: poster,
      characterName: actDef.characterName,
      gender: actDef.gender,
      actData: actDef,
      folderPath,
    };
  });
}

export function getAtlantisActItems(
  lang: Language = 'EN',
  userGender: 'female' | 'male' | string = 'female',
  customActs: Act[] = ATLANTIS_STORY_ACTS
): ActItem[] {
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
      audio_pt: getActMp3Url(actDef, 'PT'),
      vtt: vttUrl,
      vtt_en: getActVttUrl(actDef, 'EN'),
      vtt_es: getActVttUrl(actDef, 'ES'),
      vtt_nl: getActVttUrl(actDef, 'NL'),
      vtt_it: getActVttUrl(actDef, 'IT'),
      vtt_pt: getActVttUrl(actDef, 'PT'),
      posterImage: realmAtlantisJpg,
      characterName: actDef.characterName,
      gender: actDef.gender,
      actData: actDef,
    };
  });
}
