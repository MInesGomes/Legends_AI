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
export const realmWorkJpg = `${SUPABASE_BASE_URL}/Work/realm_work.jpg`;
export const realmElDoradoJpg = `${SUPABASE_BASE_URL}/ElDorado/realm_eldorado.jpg`;
export const realmDadMomJpg = `${SUPABASE_BASE_URL}/DadMom/realm_dadmom.jpg`;
export const realmMarriageJpg = `${SUPABASE_BASE_URL}/Marriage/realm_marriage.jpg`;
export const realmFutureLandJpg = `${SUPABASE_BASE_URL}/FutureLand/realm_futureland.jpg`;

export const fiveCrystalsJpg = `${SUPABASE_BASE_URL}/Atlantis/5crystals.jpg`;

// Tales Cover Images
export const taleBabyJpg = `${SUPABASE_BASE_URL}/DadMom/tale_baby.jpg`;
export const taleChildJpg = `${SUPABASE_BASE_URL}/DadMom/tale_child.jpg`;
export const taleTeensJpg = `${SUPABASE_BASE_URL}/DadMom/tale_teens.jpg`;
export const talePridePrejudiceJpg = `${SUPABASE_BASE_URL}/Marriage/tale_pride_prejudice.jpg`;
export const taleOneHartJpg = `${SUPABASE_BASE_URL}/Marriage/tale_one_hart.jpg`;
export const taleStartupWinnerJpg = `${SUPABASE_BASE_URL}/Work/tale_startup_winner.jpg`;
export const taleJobQuestJpg = `${SUPABASE_BASE_URL}/Work/tale_job_quest.jpg`;

//TODO: DELETE
export const elenaAvatar = `${SUPABASE_AVATAR}/female.jpg`;
export const danielAvatar = `${SUPABASE_AVATAR}/male.jpg`;

export const ASSETS = {
  realmAtlantisJpg,
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
/* YouTube sources (single source of truth)                                   */
/* -------------------------------------------------------------------------- */

/** Atlantis videos keyed by `${chapter}:${act}`. */
export const ATLANTIS_VIDEO_URLS: Record<string, string> = {
  '0:act0': 'https://youtu.be/-B_vlZaUDDc',
  '0:male_act': 'https://youtu.be/9Ozmoyei2-A',
  '1:act0': 'https://youtu.be/LBCpY7bI638',
  '3:act0': 'https://youtu.be/-64kwqW5q6k',
  '3:choice1': 'https://youtu.be/7DEPbiuRvuU',
  '3:choice2': 'https://youtu.be/B4bsJHLc7V0',
  '3:choice3': 'https://youtu.be/TP1-nip4GiM',
};

/**
 * Loaded Video Sources for Chapter 3
 */
export const CHAPTER_3_MEDIA_URLS = {
  act0: ATLANTIS_VIDEO_URLS['3:act0'],
  choice1: ATLANTIS_VIDEO_URLS['3:choice1'],
  choice2: ATLANTIS_VIDEO_URLS['3:choice2'],
  choice3: ATLANTIS_VIDEO_URLS['3:choice3'],
};

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
 * e.g. folderPath + chapter + "/" + act
 * => "https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub/Atlantis/5crystals/chapter0/female_act"
 */
export function getActBaseFolder(act: Act, customFolder: string = ATLANTIS_5CRYSTALS_FOLDER_PATH): string {
  return `${stripTrailingSlashes(customFolder)}${act.chapter}/${trimSlashes(act.act)}`;
}

/**
 * Constructs MP3 URL for an Act and Language.
 * (Supabase MP3 retrieval removed - only YouTube audio is used).
 */
export function getActMp3Url(_act: Act, _lang: Language | string = 'EN', _customFolder?: string): string {
  return '';
}

/**
 * Candidate MP3 URLs for act voiceover.
 * (Supabase MP3 retrieval removed - only YouTube audio is used).
 */
export function getActMp3CandidateUrls(_act: Act, _lang: Language | string = 'EN', _customFolder?: string): string[] {
  return [];
}

/**
 * Constructs MP4 video URL for an Act. Only returns YouTube video URLs.
 */
export function getActMp4Url(act: Act, customFolder?: string): string {
  return getActMp4CandidateUrls(act, customFolder)[0] || '';
}

/**
 * Candidate video URLs for playback. ONLY returns valid YouTube video URLs.
 * If no YouTube video exists, returns an empty array.
 */
export function getActMp4CandidateUrls(act: Act, customFolder?: string): string[] {
  const folder = (customFolder || '').toLowerCase();
  const useAtlantisVideos = !folder.includes('eldorado') || folder.includes('atlantis');

  return uniqueYouTubeUrls([
    // Custom video URL configured on the act
    act.videoUrl,
    // Built-in Atlantis sources (chapters 0, 1 and 3)
    useAtlantisVideos ? getAtlantisVideoUrl(act.chapter, getActName(act)) : undefined,
  ]);
}

/**
 * Constructs VTT subtitle URL for an Act and Language.
 * e.g. folderPath + chapter + "/" + act + "/" + act + "_" + langCode + ".vtt"
 * or for ElDorado: folderPath + chapter + "/vtt/" + act + "_" + langCode + ".vtt"
 */
export function getActVttUrl(act: Act, lang: Language | string = 'EN', customFolder?: string): string {
  return getActVttCandidateUrls(act, lang, customFolder)[0];
}

/**
 * Candidate VTT URLs for subtitle fetching resilience
 * (checks direct chapter/vtt/, chapter root, act/vtt/, and act root).
 */
export function getActVttCandidateUrls(act: Act, lang: Language | string = 'EN', customFolder?: string): string[] {
  const folder = stripTrailingSlashes(customFolder || ATLANTIS_5CRYSTALS_FOLDER_PATH);
  const chapterFolder = `${folder}${act.chapter}`;
  const actName = getActName(act);
  const langCode = normalizeLangCode(lang);
  const isElDorado = folder.toLowerCase().includes('eldorado');

  const actFolder = `${chapterFolder}/${actName}`;
  const file = `${actName}_${langCode}.vtt`;

  const candidates: string[] = isElDorado
    ? [
        `${chapterFolder}/vtt/${file}`,
        `${chapterFolder}/${file}`,
        `${chapterFolder}/vvt/${file}`,
        `${actFolder}/vtt/${file}`,
        `${actFolder}/${file}`,
        `${chapterFolder}/vtt/${actName}.vtt`,
        `${chapterFolder}/${actName}.vtt`,
      ]
    : [
        `${actFolder}/${file}`,
        `${actFolder}/vtt/${file}`,
        `${actFolder}/vvt/${file}`,
        `${chapterFolder}/vtt/${file}`,
        `${chapterFolder}/vvt/${file}`,
        `${chapterFolder}/${file}`,
      ];

  const ytId = extractYouTubeVideoId(act.videoUrl);
  if (ytId) {
    candidates.push(`/api/youtube/vtt?videoId=${encodeURIComponent(ytId)}&lang=${encodeURIComponent(langCode)}`);
  }

  return Array.from(new Set(candidates));
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
  { chapter: 1, act: 'choice1', type: 'choice' },
  { chapter: 1, act: 'choice2', type: 'choice' },
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
/* URL Pattern for choice assets (thumbnails, images, VTT subtitles).         */
/* Feedback VTTs e.g.                                                         */
/* .../Atlantis/5crystals/chapter1/choice1/vtt/feedback_en.vtt                */
/* -------------------------------------------------------------------------- */

function getChoiceNumber(choiceId: string): string {
  return choiceId.replace('choice', '') || '1';
}

export function getChoiceBaseFolder(
  world = 'Atlantis',
  taleName = '5crystals',
  chapterNumber = 1,
  choiceId = 'choice1'
): string {
  return `${SUPABASE_BASE_URL}/${world}/${taleName}/chapter${chapterNumber}/choice${getChoiceNumber(choiceId)}`;
}

/** Alternate (legacy, misspelled) folder used as a fallback. */
function getChoiceAltBaseFolder(world: string, chapterNumber: number, choiceId: string): string {
  return `${SUPABASE_BASE_URL}/${world}/5Ctrystals/chapter${chapterNumber}/choice${getChoiceNumber(choiceId)}`;
}

/** Built-in YouTube video for an Atlantis chapter 3 choice, if any. */
function getChoiceVideoUrl(world: string, chapterNumber: number, choiceId: string): string | undefined {
  if (chapterNumber !== 3 || !isAtlantisWorld(world)) return undefined;
  return getAtlantisVideoUrl(chapterNumber, `choice${getChoiceNumber(choiceId)}`);
}

/**
 * Constructs the primary image URL for a choice button,
 * e.g. .../Atlantis/5crystals/chapter1/choice1/choice1.jpg
 */
export function getChoiceImageUrl(
  world = 'Atlantis',
  taleName = '5crystals',
  chapterNumber = 1,
  choiceId = 'choice1'
): string {
  const cName = `choice${getChoiceNumber(choiceId)}`;
  return `${getChoiceBaseFolder(world, taleName, chapterNumber, choiceId)}/${cName}.jpg`;
}

export function getChoiceImageCandidateUrls(
  world = 'Atlantis',
  taleName = '5crystals',
  chapterNumber = 1,
  choiceId = 'choice1'
): string[] {
  const cName = `choice${getChoiceNumber(choiceId)}`;
  const base = getChoiceBaseFolder(world, taleName, chapterNumber, choiceId);
  const altBase = getChoiceAltBaseFolder(world, chapterNumber, choiceId);

  // For Atlantis Chapter 3 choices, include the YouTube video thumbnail first
  const ytId = extractYouTubeVideoId(getChoiceVideoUrl(world, chapterNumber, choiceId));
  const candidates: string[] = ytId ? [`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`] : [];

  candidates.push(
    `${base}/${cName}.jpg`,
    `${base}/${cName}.png`,
    `${base}/${cName}.webp`,
    `${base}.jpg`,
    `${SUPABASE_BASE_URL}/${world}/${taleName}/${cName}.jpg`,
    `${SUPABASE_BASE_URL}/${world}/${taleName}.jpg`,
    `${SUPABASE_BASE_URL}/${world}/realm_${world.toLowerCase()}.jpg`,
    `${altBase}/${cName}.jpg`
  );

  return Array.from(new Set(candidates));
}

export function getChoiceMp4CandidateUrls(
  world = 'Atlantis',
  _taleName = '5crystals',
  chapterNumber = 1,
  choiceId = 'choice1'
): string[] {
  // Only valid YouTube video URLs
  return uniqueYouTubeUrls([getChoiceVideoUrl(world, chapterNumber, choiceId)]);
}

export function getChoiceMp3CandidateUrls(
  _world = 'Atlantis',
  _taleName = '5crystals',
  _chapterNumber = 1,
  _choiceId = 'choice1',
  _lang: Language | string = 'EN'
): string[] {
  return [];
}

export function getChoiceVttCandidateUrls(
  world = 'Atlantis',
  taleName = '5crystals',
  chapterNumber = 1,
  choiceId = 'choice1',
  lang: Language | string = 'EN'
): string[] {
  const cName = `choice${getChoiceNumber(choiceId)}`;
  const langCode = normalizeLangCode(lang);
  const base = getChoiceBaseFolder(world, taleName, chapterNumber, choiceId);
  const altBase = getChoiceAltBaseFolder(world, chapterNumber, choiceId);

  return Array.from(
    new Set([
      `${base}/vtt/${cName}.vtt`,
      `${base}/vtt/${cName}_${langCode}.vtt`,
      `${base}/${cName}_${langCode}.vtt`,
      `${base}/${cName}.vtt`,
      `${base}/vvt/${cName}.vtt`,
      `${altBase}/vtt/${cName}.vtt`,
    ])
  );
}

export function getChoiceFeedbackVttCandidateUrls(
  world = 'Atlantis',
  taleName = '5crystals',
  chapterNumber = 1,
  choiceId = 'choice1',
  lang: Language | string = 'EN'
): string[] {
  const choiceNum = getChoiceNumber(choiceId);
  const langCode = normalizeLangCode(lang);
  const base = getChoiceBaseFolder(world, taleName, chapterNumber, choiceId);
  const altBase = getChoiceAltBaseFolder(world, chapterNumber, choiceId);

  const candidates: string[] = [
    `${base}/vtt/feedback_${langCode}.vtt`,
    `${base}/vtt/feedback${choiceNum}_${langCode}.vtt`,
    `${base}/vtt/feedback${choiceNum}.vtt`,
    `${base}/vtt/feedback.vtt`,
    `${base}/feedback_${langCode}.vtt`,
    `${base}/feedback${choiceNum}_${langCode}.vtt`,
    `${base}/feedback${choiceNum}.vtt`,
    `${base}/feedback.vtt`,
    `${base}/vvt/feedback_${langCode}.vtt`,
    `${base}/vvt/feedback${choiceNum}_${langCode}.vtt`,
    `${altBase}/vtt/feedback_${langCode}.vtt`,
    `${altBase}/vtt/feedback${choiceNum}_${langCode}.vtt`,
    `${altBase}/vtt/feedback${choiceNum}.vtt`,
    `${altBase}/vtt/feedback.vtt`,
  ];

  // Fall back to English feedback when another language is requested
  if (langCode !== 'en') {
    candidates.push(
      `${base}/vtt/feedback_en.vtt`,
      `${base}/vtt/feedback${choiceNum}_en.vtt`,
      `${base}/feedback_en.vtt`,
      `${base}/feedback${choiceNum}_en.vtt`,
      `${altBase}/vtt/feedback_en.vtt`,
      `${altBase}/vtt/feedback${choiceNum}_en.vtt`
    );
  }

  return Array.from(new Set(candidates));
}