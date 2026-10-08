import { Language } from '../types';

export interface Act {
  chapter: number; // e.g. values 0, 1, 2, 3
  act: 'female_act' | 'male_act' | 'act0' | 'choice1' | 'choice2' | 'choice3' | 'choice4' | string;
  title?: string;
  characterName?: string;
  gender?: 'female' | 'male';
  type?: 'narrative' | 'character' | 'dialogue' | 'choice';
  videoUrl?: string;
}

export const SUPABASE_BASE_URL = 'https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub';

export const SUPABASE_AVATAR = `${SUPABASE_BASE_URL}/avatar`;
export const ATLANTIS_5CRYSTALS_FOLDER_PATH = `${SUPABASE_BASE_URL}/Atlantis/5crystals/chapter`;

// Core Avatars and Realm Images
export const realmAtlantisJpg = `${SUPABASE_BASE_URL}/Atlantis/realm_atlantis.jpg`;
export const realmLeaderJpg = `${SUPABASE_BASE_URL}/Leader/realm_work.jpg`;
export const realmWorkJpg = realmLeaderJpg;
export const realmElDoradoJpg = `${SUPABASE_BASE_URL}/ElDorado/realm_eldorado.jpg`;
export const realmDadMomJpg = `${SUPABASE_BASE_URL}/DadMom/realm_dadmom.jpg`;
export const realmMarriageJpg = `${SUPABASE_BASE_URL}/Marriage/realm_marriage.jpg`;
export const realmFutureLandJpg = `${SUPABASE_BASE_URL}/FutureLand/realm_futureland.jpg`;

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

/** Atlantis video IDs keyed by `${chapter}:${act}`. */
export const ATLANTIS_VIDEO_IDS: Record<string, string> = {
  '0:act0': '-B_vlZaUDDc',
  '0:male_act': '9Ozmoyei2-A',
  '1:act0': 'X1O57PjE7MY',
  '1:choice1': 'f5-jQw-id5w',
  '1:choice2': 'oflXgBK4LDs',
  '3:act0': '-64kwqW5q6k',
  '3:choice1': '7DEPbiuRvuU',
  '3:choice2': 'B4bsJHLc7V0',
  '3:choice3': 'TP1-nip4GiM',
};

/** Full YouTube URLs dynamically generated from IDs when necessary */
export const ATLANTIS_VIDEO_URLS: Record<string, string> = Object.fromEntries(
  Object.entries(ATLANTIS_VIDEO_IDS).map(([actKey, videoId]) => [actKey, `https://youtu.be/${videoId}`])
);

/** 5 Crystals Tale Card image loaded from youtube act0 '0:act0': '-B_vlZaUDDc' */
export const fiveCrystalsJpg = getYouTubeImageUrl(ATLANTIS_VIDEO_IDS['0:act0']) || '';

// Tales Cover Images
export const taleBabyJpg = `${SUPABASE_BASE_URL}/DadMom/tale_baby.jpg`;
export const taleChildJpg = `${SUPABASE_BASE_URL}/DadMom/tale_child.jpg`;
export const taleTeensJpg = `${SUPABASE_BASE_URL}/DadMom/tale_teens.jpg`;
export const talePridePrejudiceJpg = `${SUPABASE_BASE_URL}/Marriage/tale_pride_prejudice.jpg`;
export const taleOneHartJpg = `${SUPABASE_BASE_URL}/Marriage/tale_one_hart.jpg`;
export const taleStartupWinnerJpg = `${SUPABASE_BASE_URL}/Leader/tale_startup_winner.jpg`;
export const taleJobQuestJpg = `${SUPABASE_BASE_URL}/Leader/tale_job_quest.jpg`;

//TODO: DELETE
export const elenaAvatar = `${SUPABASE_AVATAR}/female.jpg`;
export const danielAvatar = `${SUPABASE_AVATAR}/male.jpg`;

export const ASSETS = {
  realmAtlantisJpg,
  realmLeaderJpg,
  realmWorkJpg,
  realmElDoradoJpg,
  realmDadMomJpg,
  realmMarriageJpg,
  realmFutureLandJpg,
  fiveCrystalsJpg,
  elenaAvatar,
  danielAvatar,
};

/* -------------------------------------------------------------------------- */
/* Small string helpers (loop-based: no regex, so no backtracking risk)       */
/* -------------------------------------------------------------------------- */

function stripTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === '/') end--;
  return value.slice(0, end);
}

function trimSlashes(value: string): string {
  let start = 0;
  let end = value.length;
  while (start < end && value[start] === '/') start++;
  while (end > start && value[end - 1] === '/') end--;
  return value.slice(start, end);
}

function getActName(act: Act): string {
  return trimSlashes(act.act || 'act0');
}

/* -------------------------------------------------------------------------- */
/* YouTube sources (single source of truth: ATLANTIS_VIDEO_IDS)              */
/* -------------------------------------------------------------------------- */

const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;
const YOUTUBE_HOSTS = new Set(['youtube.com', 'm.youtube.com', 'youtube-nocookie.com']);

/**
 * Extracts YouTube video ID from various YouTube URL formats or raw ID.
 * Uses URL parsing instead of a backtracking-prone regex.
 */
export function extractYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (YOUTUBE_ID_PATTERN.test(trimmed)) return trimmed;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  const host = parsed.hostname.startsWith('www.') ? parsed.hostname.slice(4) : parsed.hostname;
  const [, first, second] = parsed.pathname.split('/');
  let id: string | null | undefined = null;

  if (host === 'youtu.be') {
    id = first;
  } else if (YOUTUBE_HOSTS.has(host)) {
    if (first === 'watch') id = parsed.searchParams.get('v');
    else if (first === 'embed' || first === 'v') id = second;
  }

  return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
}

function getAtlantisVideoUrl(chapter: number, actName: string): string | undefined {
  return ATLANTIS_VIDEO_URLS[`${chapter}:${actName}`];
}

function uniqueYouTubeUrls(candidates: Array<string | undefined>): string[] {
  return Array.from(new Set(candidates.filter((u): u is string => Boolean(extractYouTubeVideoId(u)))));
}

function isAtlantisWorld(world: string): boolean {
  return !world || world.toLowerCase().includes('atlantis');
}

export function resolveAssetUrl(url?: string | null, fallback: string = realmAtlantisJpg): string {
  if (!url) return fallback;
  return url;
}

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

export function getYouTubeAudioLangCode(lang: Language | string = 'EN'): string {
  return normalizeLangCode(lang);
}

/* -------------------------------------------------------------------------- */
/* Act helpers                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Constructs the base folder path for an Act.
 */
export function getActBaseFolder(act: Act, customFolder: string = ATLANTIS_5CRYSTALS_FOLDER_PATH): string {
  return `${stripTrailingSlashes(customFolder)}${act.chapter}/${trimSlashes(act.act)}`;
}

/**
 * Constructs MP4 video URL for an Act using the single source of truth (ATLANTIS_VIDEO_URLS).
 */
export function getActMp4Url(act: Act, _customFolder?: string): string {
  return act.videoUrl || ATLANTIS_VIDEO_URLS[`${act.chapter}:${getActName(act)}`] || '';
}

export function getActMp4CandidateUrls(act: Act, _customFolder?: string): string[] {
  const url = getActMp4Url(act);
  return url ? [url] : [];
}

/**
 * Default list of Atlantis story acts
 */
export const ATLANTIS_STORY_ACTS: Act[] = [
  { chapter: 0, act: 'act0', type: 'narrative', videoUrl: ATLANTIS_VIDEO_URLS['0:act0'] },
  { chapter: 0, act: 'female_act', characterName: 'Alethea', gender: 'female', type: 'character' },
  {
    chapter: 0,
    act: 'male_act',
    characterName: 'Elion',
    gender: 'male',
    type: 'character',
    videoUrl: ATLANTIS_VIDEO_URLS['0:male_act'],
  },
  { chapter: 1, act: 'act0', type: 'dialogue', videoUrl: ATLANTIS_VIDEO_URLS['1:act0'] },
  { chapter: 1, act: 'choice1', type: 'choice', videoUrl: ATLANTIS_VIDEO_URLS['1:choice1'] },
  { chapter: 1, act: 'choice2', type: 'choice', videoUrl: ATLANTIS_VIDEO_URLS['1:choice2'] },
  { chapter: 1, act: 'choice3', type: 'choice' },
  { chapter: 1, act: 'choice4', type: 'choice' },
  { chapter: 2, act: 'act0', type: 'narrative' },
  { chapter: 2, act: 'choice1', type: 'choice' },
  { chapter: 2, act: 'choice2', type: 'choice' },
  { chapter: 2, act: 'choice3', type: 'choice' },
  { chapter: 3, act: 'act0', type: 'narrative', videoUrl: ATLANTIS_VIDEO_URLS['3:act0'] },
  { chapter: 3, act: 'choice1', type: 'choice', videoUrl: ATLANTIS_VIDEO_URLS['3:choice1'] },
  { chapter: 3, act: 'choice2', type: 'choice', videoUrl: ATLANTIS_VIDEO_URLS['3:choice2'] },
  { chapter: 3, act: 'choice3', type: 'choice', videoUrl: ATLANTIS_VIDEO_URLS['3:choice3'] },
];

/* -------------------------------------------------------------------------- */
/* Choice media helpers                                                       */
/* -------------------------------------------------------------------------- */

/** Built-in YouTube video for an Atlantis choice. */
export function getChoiceVideoUrl(_world: string | number, chapterNumber: number, choiceId: string): string | undefined {
  return ATLANTIS_VIDEO_URLS[`${chapterNumber}:${choiceId}`];
}

/**
 * Constructs the primary image URL for a choice button using its YouTube thumbnail.
 */
export function getChoiceImageUrl(
  _world = 'Atlantis',
  _taleName = '5crystals',
  chapterNumber = 1,
  choiceId = 'choice1'
): string {
  const ytId = ATLANTIS_VIDEO_IDS[`${chapterNumber}:${choiceId}`];
  return ytId ? getYouTubeImageUrl(ytId) || realmAtlantisJpg : realmAtlantisJpg;
}

export function getChoiceMp4CandidateUrls(
  _world = 'Atlantis',
  _taleName = '5crystals',
  chapterNumber = 1,
  choiceId = 'choice1'
): string[] {
  const url = ATLANTIS_VIDEO_URLS[`${chapterNumber}:${choiceId}`];
  return url ? [url] : [];
}