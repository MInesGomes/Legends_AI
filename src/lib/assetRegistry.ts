import { Language } from '../types';

export interface Act {
  chapter: number; // e.g. values 0, 1, 2
  act: string; // e.g. values female_act, male_act, act1, act2
  folderPath: string; // e.g. "https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub/Atlantis/5crystals/chapter"
  title?: string;
  characterName?: string;
  role?: string;
  gender?: 'female' | 'male';
  type?: 'narrative' | 'character' | 'dialogue' | 'choice';
}

export const ATLANTIS_FOLDER_PATH = 'https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub/Atlantis/5crystals/chapter';

export const SUPABASE_BASE_URL = 'https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub';

// Core Avatars and Realm Images
export const realmAtlantisJpg = `${SUPABASE_BASE_URL}/Atlantis/5crystals/chapter0/realm_atlantis.jpg`;
export const fiveCrystalsJpg = `${SUPABASE_BASE_URL}/Atlantis/5crystals/chapter0/5crystals.jpg`;
export const avatarAlethea = `${SUPABASE_BASE_URL}/Avatar/Atlantis/0Alethea.jpg`;
export const avatarElion = `${SUPABASE_BASE_URL}/Avatar/Atlantis/0Elion.jpg`;
export const avatarMen = `${SUPABASE_BASE_URL}/Avatar/Atlantis/AvatarMen.jpg`;
export const elenaAvatar = avatarAlethea;
export const danielAvatar = avatarElion;

/**
 * Normalizes Language code ('EN' | 'ES' | 'IT' | 'PT-pt' | 'NL') to lowercase string ('en', 'es', 'it', 'pt', 'nl')
 */
export function normalizeLangCode(lang: Language | string = 'EN'): string {
  const l = String(lang).toLowerCase();
  if (l.includes('es')) return 'es';
  if (l.includes('nl')) return 'nl';
  if (l.includes('it')) return 'it';
  if (l.includes('pt')) return 'pt';
  return 'en';
}

/**
 * Constructs the base folder path for an Act.
 * e.g. folderPath + chapter + "/" + act
 * => "https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub/Atlantis/5crystals/chapter0/female_act"
 */
export function getActBaseFolder(act: Act): string {
  const folder = act.folderPath.replace(/\/+$/, '');
  const actName = act.act.replace(/^\/+|\/+$/g, '');
  return `${folder}${act.chapter}/${actName}`;
}

/**
 * Constructs MP3 URL for an Act and Language.
 * e.g. folderPath + chapter + "/" + act + "/" + act + "_" + langCode + ".mp3"
 * => ".../chapter0/female_act/female_act_en.mp3"
 */
export function getActMp3Url(act: Act, lang: Language | string = 'EN'): string {
  const base = getActBaseFolder(act);
  const langCode = normalizeLangCode(lang);
  return `${base}/${act.act}_${langCode}.mp3`;
}

/**
 * Constructs MP4 video URL for an Act.
 * e.g. folderPath + chapter + "/" + act + "/" + act + ".mp4"
 * => ".../chapter0/female_act/female_act.mp4"
 */
export function getActMp4Url(act: Act): string {
  const base = getActBaseFolder(act);
  // Special case for 0intro if stored as intro_no_voice.mp4
  if (act.act === '0intro' || act.act === 'intro') {
    return `${base}/intro_no_voice.mp4`;
  }
  return `${base}/${act.act}.mp4`;
}

/**
 * Candidate MP4 URLs for playback resilience
 */
export function getActMp4CandidateUrls(act: Act): string[] {
  const base = getActBaseFolder(act);
  const candidates = [
    `${base}/${act.act}.mp4`,
    `${base}/${act.act}_en.mp4`,
  ];
  if (act.act === '0intro' || act.act === 'intro') {
    candidates.unshift(`${base}/intro_no_voice.mp4`);
  }
  if (act.act === 'act1') {
    candidates.push(`${base}/intro_no_voice.mp4`);
  }
  return Array.from(new Set(candidates));
}

/**
 * Constructs VTT subtitle URL for an Act and Language.
 * e.g. folderPath + chapter + "/" + act + "/" + act + "_" + langCode + ".vtt"
 * => ".../chapter0/female_act/female_act_en.vtt"
 */
export function getActVttUrl(act: Act, lang: Language | string = 'EN'): string {
  const base = getActBaseFolder(act);
  const langCode = normalizeLangCode(lang);
  return `${base}/${act.act}_${langCode}.vtt`;
}

/**
 * Candidate VTT URLs for subtitle fetching resilience
 * (checks direct root, /vtt/ folder, and /vvt/ folder)
 */
export function getActVttCandidateUrls(act: Act, lang: Language | string = 'EN'): string[] {
  const base = getActBaseFolder(act);
  const langCode = normalizeLangCode(lang);
  const actName = act.act;

  const candidates = [
    `${base}/${actName}_${langCode}.vtt`,
    `${base}/vtt/${actName}_${langCode}.vtt`,
    `${base}/vvt/${actName}_${langCode}.vtt`,
  ];

  if (actName === '0intro' || actName === 'intro') {
    candidates.push(`${base}/vtt/intro_${langCode}.vtt`);
    candidates.push(`${base}/vvt/intro_${langCode}.vtt`);
    candidates.push(`${base}/intro_${langCode}.vtt`);
  }

  return Array.from(new Set(candidates));
}

/**
 * Default list of Atlantis story acts
 */
export const ATLANTIS_STORY_ACTS: Act[] = [
  {
    chapter: 0,
    act: 'act1',
    folderPath: ATLANTIS_FOLDER_PATH,
    title: 'The Heart of Atlantis',
    type: 'narrative',
  },
  {
    chapter: 0,
    act: 'female_act',
    folderPath: ATLANTIS_FOLDER_PATH,
    title: 'Alethea, Guardian of Archives',
    characterName: 'Alethea',
    role: 'Guardian of the Ancient Archives',
    gender: 'female',
    type: 'character',
  },
  {
    chapter: 0,
    act: 'male_act',
    folderPath: ATLANTIS_FOLDER_PATH,
    title: 'Elion, Keeper of Machines',
    characterName: 'Elion',
    role: 'Keeper of Machines & Deep Aqueducts',
    gender: 'male',
    type: 'character',
  },
  {
    chapter: 0,
    act: 'act2',
    folderPath: ATLANTIS_FOLDER_PATH,
    title: 'The First Crystal Awakens',
    type: 'narrative',
  },
  {
    chapter: 1,
    act: 'act1',
    folderPath: ATLANTIS_FOLDER_PATH,
    title: 'Chapter 1: The Deep Awakening',
    type: 'narrative',
  },
  {
    chapter: 1,
    act: 'female_act',
    folderPath: ATLANTIS_FOLDER_PATH,
    title: 'Chapter 1: Alethea’s Counsel',
    characterName: 'Alethea',
    role: 'Guardian of the Ancient Archives',
    gender: 'female',
    type: 'character',
  },
  {
    chapter: 1,
    act: 'male_act',
    folderPath: ATLANTIS_FOLDER_PATH,
    title: 'Chapter 1: Elion’s Workshop',
    characterName: 'Elion',
    role: 'Keeper of Machines & Deep Aqueducts',
    gender: 'male',
    type: 'character',
  },
];

export const ASSETS = {
  realmAtlantisJpg,
  fiveCrystalsJpg,
  avatarAlethea,
  avatarElion,
  avatarMen,
  elenaAvatar,
  danielAvatar,
};

export function resolveAssetUrl(url?: string | null, fallback: string = realmAtlantisJpg): string {
  if (!url) return fallback;
  return url;
}
