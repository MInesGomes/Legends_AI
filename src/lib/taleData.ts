import { Language, Tale } from '../types';
import {
  Act,
  ATLANTIS_STORY_ACTS,
  SUPABASE_BASE_URL,
  getActMp4Url,
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
    case 'tale-the-torch':
    case 'tale-golden-city':
      return `${SUPABASE_BASE_URL}/ElDorado/the_torch/chapter`;
    case 'tale-ai-horizon':
      return `${SUPABASE_BASE_URL}/FutureLand/ai_horizon/chapter`;
    default:
      if (realmId === 'realm-work') return `${SUPABASE_BASE_URL}/Work/${taleId}/chapter`;
      if (realmId === 'realm-marriage') return `${SUPABASE_BASE_URL}/Marriage/${taleId}/chapter`;
      if (realmId === 'realm-dad-mom') return `${SUPABASE_BASE_URL}/DadMom/${taleId}/chapter`;
      if (realmId === 'realm-eldorado' || realmId === 'realm-el-dorado' || realmId?.includes('dorado')) return `${SUPABASE_BASE_URL}/ElDorado/the_torch/chapter`;
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
      type: 'narrative',
    },
    {
      chapter: 0,
      act: 'female_act',
      gender: 'female',
      type: 'character',
    },
    {
      chapter: 0,
      act: 'male_act',
      gender: 'male',
      type: 'character',
    },
    {
      chapter: 1,
      act: 'act0',
      type: 'dialogue',
    },
    {
      chapter: 1,
      act: 'choice1',
      type: 'choice',
    },
    {
      chapter: 1,
      act: 'choice2',
      type: 'choice',
    },
    {
      chapter: 1,
      act: 'choice3',
      type: 'choice',
    },
    {
      chapter: 1,
      act: 'choice4',
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
    const vttUrl = getActVttUrl(actDef, lang, folderPath);

    return {
      id: actId,
      chapterNumber: actDef.chapter,
      actKey: `ch${actDef.chapter}-${actDef.act}`,
      type: actDef.type || 'narrative',
      chapterTitle: '',
      subtitle: '',
      actTitle: '',
      mp4: mp4Url,
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
    const vttUrl = getActVttUrl(actDef, lang);

    return {
      id: actId,
      chapterNumber: actDef.chapter,
      actKey: `ch${actDef.chapter}-${actDef.act}`,
      type: actDef.type || 'narrative',
      chapterTitle: '',
      subtitle: '',
      actTitle: '',
      mp4: mp4Url,
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
