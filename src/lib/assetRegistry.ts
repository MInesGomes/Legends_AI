import { Language } from '../types';
import { video } from '../data/storyVideos';

export { video } from '../data/storyVideos';

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

export { ATLANTIS_CHOICE_TITLES, ChoiceTitles } from '../i118/ChoiceTitles';

/** 5 Crystals Tale Card image loaded from youtube Chapter0 without black letterbox bars */
export const fiveCrystalsJpg = `https://img.youtube.com/vi/${video.ATLANTIS['5 Crystals'].Chapter0.url}/mqdefault.jpg`;

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
  act?: string;
  type?: 'female' | 'male' | 'choice' | 'narrative' | 'character' | 'dialogue';
  isChoice?: boolean;
  videoID?: string;
  characterName?: string;
  gender?: 'male' | 'female';
}
