import { Language } from '../types';

export const SUPABASE_BASE_URL = 'https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub';
export const SUPABASE_AVATAR = `${SUPABASE_BASE_URL}/avatar`;

// Core Avatars and Realm Images
export const realmAtlantisJpg = `${SUPABASE_BASE_URL}/Atlantis/realm_atlantis.jpg`;
export const realmLeaderJpg = `${SUPABASE_BASE_URL}/Leader/realm_work.jpg`;
export const realmWorkJpg = realmLeaderJpg;
export const realmElDoradoJpg = `${SUPABASE_BASE_URL}/ElDorado/realm_eldorado.jpg`;
export const realmDadMomJpg = `${SUPABASE_BASE_URL}/DadMom/realm_dadmom.jpg`;
export const realmMarriageJpg = `${SUPABASE_BASE_URL}/Marriage/realm_marriage.jpg`;
export const realmFutureLandJpg = `${SUPABASE_BASE_URL}/FutureLand/realm_futureland.jpg`;

// Tales Cover Images
export const taleBabyJpg = `${SUPABASE_BASE_URL}/DadMom/tale_baby.jpg`;
export const taleChildJpg = `${SUPABASE_BASE_URL}/DadMom/tale_child.jpg`;
export const taleTeensJpg = `${SUPABASE_BASE_URL}/DadMom/tale_teens.jpg`;
export const talePridePrejudiceJpg = `${SUPABASE_BASE_URL}/Marriage/tale_pride_prejudice.jpg`;
export const taleOneHartJpg = `${SUPABASE_BASE_URL}/Marriage/tale_one_hart.jpg`;
export const taleStartupWinnerJpg = `${SUPABASE_BASE_URL}/Leader/tale_startup_winner.jpg`;
export const taleJobQuestJpg = `${SUPABASE_BASE_URL}/Leader/tale_job_quest.jpg`;

/** Helper to convert YouTube video ID to full URL */
export function getYouTubeVideoUrl(id?: string | null): string | undefined {
  if (!id) return undefined;
  const trimmed = id.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://youtu.be/${trimmed}`;
}

/** Helper to convert YouTube video ID to thumbnail URL */
export function getYouTubeImageUrl(id?: string | null): string | undefined {
  if (!id) return undefined;
  const trimmed = id.trim();
  if (!trimmed) return undefined;
  return `https://img.youtube.com/vi/${trimmed}/hqdefault.jpg`;
}

/**
 * Single source of truth for video IDs across all worlds and chapters.
 */
export const ATLANTIS_VIDEO_IDS: Record<string, string> = {
  '0:': '-B_vlZaUDDc',
  '0:male_act': '-xAxX2RIFYI',
  '0:female_act': 'Z8Znh2LUwus',
  '1:': 'X1O57PjE7MY',
  '1:choice1': 'f5-jQw-id5w',
  '1:choice2': 'oflXgBK4LDs',
  '1:choice3': 'mWvBf77_3KA',
  '2:': '6FuKHVh3uGo',
  '2:choice1': 'f5-jQw-id5w',
  '2:choice2': 'oflXgBK4LDs',
  '2:choice3': 'mWvBf77_3KA',
  '3:': '-64kwqW5q6k',
  '3:choice1': '7DEPbiuRvuU',
  '3:choice2': 'B4bsJHLc7V0',
  '3:choice3': 'TP1-nip4GiM',
};

// Aliased for backwards compatibility
export const VIDEO_IDS = ATLANTIS_VIDEO_IDS;

export { ATLANTIS_CHOICE_TITLES } from '../i118/Atlantis';

/** 5 Crystals Tale Card image loaded from youtube act0 */
export const fiveCrystalsJpg = getYouTubeImageUrl(ATLANTIS_VIDEO_IDS['0:']) || '';

/**
 * Normalizes Language code ('EN' | 'ES' | 'IT' | 'PT' | 'NL') to lowercase string ('en', 'es', 'it', 'pt', 'nl')
 */
export function normalizeLangCode(lang: Language | string = 'EN'): string {
  const l = String(lang).toLowerCase();
  if (l.includes('es')) return 'es';
  if (l.includes('nl')) return 'nl';
  if (l.includes('it')) return 'it';
  if (l.includes('pt')) return 'pt';
  return 'en';
}

export interface Act {
  chapter: number;
  type?: 'female' | 'male' | 'choice';
  isChoice: boolean;
  videoID?: string;
}
