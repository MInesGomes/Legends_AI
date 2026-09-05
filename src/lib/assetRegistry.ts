import { Language } from '../types';

export interface Act {
  chapter: number; // e.g. values 0, 1, 2
  act: 'female_act' | 'male_act' | 'act0' | 'act1'| 'choice1' | 'choice2'| 'choice3' | 'choice4';
  title?: string;
  characterName?: string;
  gender?: 'female' | 'male';
  type?: 'narrative' | 'character' | 'dialogue' | 'choice';
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
export const elenaAvatar = `${SUPABASE_AVATAR}/female.jpg`
export const danielAvatar = `${SUPABASE_AVATAR}/male.jpg`

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

/**
 * Constructs the base folder path for an Act.
 * e.g. folderPath + chapter + "/" + act
 * => "https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub/Atlantis/5crystals/chapter0/female_act"
 */
export function getActBaseFolder(act: Act, customFolder: string = ATLANTIS_5CRYSTALS_FOLDER_PATH): string {
  const folder = customFolder.replace(/\/+$/, '');
  const actName = act.act.replace(/^\/+|\/+$/g, '');
  return `${folder}${act.chapter}/${actName}`;
}

/**
 * Constructs MP3 URL for an Act and Language.
 * e.g. folderPath + chapter + "/" + act + "/" + act + "_" + langCode + ".mp3"
 * => ".../chapter0/female_act/female_act_en.mp3"
 */
export function getActMp3Url(act: Act, lang: Language | string = 'EN', customFolder?: string): string {
  const base = getActBaseFolder(act, customFolder);
  const langCode = normalizeLangCode(lang);
  return `${base}/${act.act}_${langCode}.mp3`;
}

/**
 * Constructs MP4 video URL for an Act.
 * e.g. folderPath + chapter + "/" + act + "/" + act + ".mp4"
 * => ".../chapter0/female_act/female_act.mp4"
 */
export function getActMp4Url(act: Act, customFolder?: string): string {
  const base = getActBaseFolder(act, customFolder);
  return `${base}/${act.act}.mp4`;
}

/**
 * Candidate MP4 URLs for playback resilience
 */
export function getActMp4CandidateUrls(act: Act, customFolder?: string): string[] {
  const base = getActBaseFolder(act, customFolder);
  const candidates = [
    `${base}/${act.act}.mp4`,
    `${base}/${act.act}_en.mp4`,
  ];
  return Array.from(new Set(candidates));
}

/**
 * Constructs VTT subtitle URL for an Act and Language.
 * e.g. folderPath + chapter + "/" + act + "/" + act + "_" + langCode + ".vtt"
 * => ".../chapter0/female_act/female_act_en.vtt"
 */
export function getActVttUrl(act: Act, lang: Language | string = 'EN', customFolder?: string): string {
  const base = getActBaseFolder(act, customFolder);
  const langCode = normalizeLangCode(lang);
  return `${base}/${act.act}_${langCode}.vtt`;
}

/**
 * Candidate VTT URLs for subtitle fetching resilience
 * (checks direct root, /vtt/ folder, and /vvt/ folder)
 */
export function getActVttCandidateUrls(act: Act, lang: Language | string = 'EN', customFolder?: string): string[] {
  const base = getActBaseFolder(act, customFolder);
  const langCode = normalizeLangCode(lang);
  const actName = act.act;

  const candidates = [
    `${base}/${actName}_${langCode}.vtt`,
    `${base}/vtt/${actName}_${langCode}.vtt`,
    `${base}/vvt/${actName}_${langCode}.vtt`,
  ];

  return Array.from(new Set(candidates));
}

/**
 * Default list of Atlantis story acts
 */
export const ATLANTIS_STORY_ACTS: Act[] = [
  {
    chapter: 0,
    act: 'act0',
    title: 'The Heart of Atlantis',
    type: 'narrative',
  },
  {
    chapter: 0,
    act: 'female_act',
    title: 'Alethea, Guardian of Archives',
    characterName: 'Alethea',
    gender: 'female',
    type: 'character',
  },
  {
    chapter: 0,
    act: 'male_act',
    title: 'Elion, Keeper of Machines',
    characterName: 'Elion',
    gender: 'male',
    type: 'character',
  },
  {
    chapter: 0,
    act: 'act1',
    title: 'The Heart Choice',
    type: 'narrative',
  },
  {
    chapter: 1,
    act: 'act0',
    title: 'The Celebration',
    type: 'dialogue',
  },
  {
    chapter: 1,
    act: 'choice1',
    title: 'BEST: Organize the Evacuation',
    type: 'choice',
  },
  {
    chapter: 1,
    act: 'choice2',
    title: 'SAFE: Try to Solve Everything Alone',
    type: 'choice',
  },
  {
    chapter: 1,
    act: 'choice3',
    title: 'WEAK: Wait for the Council',
    type: 'choice',
  },
  {
    chapter: 1,
    act: 'choice4',
    title: 'HARMFUL: Force the System and Blame Others',
    type: 'choice',
  },
];

/**
 * Choice Media Helpers
 * URL Pattern requested:
 * eg https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub/Atlantis/5crystals/chapter1/choice1/choice1.mp4 , mp3 vtt/choice1.vtt
 * After choices finishes feedback:
 * eg https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub/Atlantis/5crystals/chapter1/choice1/vtt/feedback_en.vtt
 */

export function getChoiceBaseFolder(
  world = 'Atlantis',
  taleName = '5crystals',
  chapterNumber = 1,
  choiceId = 'choice1'
): string {
  const choiceNum = choiceId.replace('choice', '') || '1';
  return `${SUPABASE_BASE_URL}/${world}/${taleName}/chapter${chapterNumber}/choice${choiceNum}`;
}

export function getChoiceMp4CandidateUrls(
  world = 'Atlantis',
  taleName = '5crystals',
  chapterNumber = 1,
  choiceId = 'choice1'
): string[] {
  const choiceNum = choiceId.replace('choice', '') || '1';
  const cName = `choice${choiceNum}`;
  const base = getChoiceBaseFolder(world, taleName, chapterNumber, choiceId);
  const altBase = `${SUPABASE_BASE_URL}/${world}/5Ctrystals/chapter${chapterNumber}/choice${choiceNum}`;

  return Array.from(
    new Set([
      `${base}/${cName}.mp4`,
      `${base}/${cName}_en.mp4`,
      `${base}/video.mp4`,
      `${altBase}/${cName}.mp4`,
    ])
  );
}

export function getChoiceMp3CandidateUrls(
  world = 'Atlantis',
  taleName = '5crystals',
  chapterNumber = 1,
  choiceId = 'choice1',
  lang: Language | string = 'EN'
): string[] {
  const choiceNum = choiceId.replace('choice', '') || '1';
  const cName = `choice${choiceNum}`;
  const langCode = normalizeLangCode(lang);
  const base = getChoiceBaseFolder(world, taleName, chapterNumber, choiceId);
  const altBase = `${SUPABASE_BASE_URL}/${world}/5Ctrystals/chapter${chapterNumber}/choice${choiceNum}`;

  return Array.from(
    new Set([
      `${base}/${cName}_${langCode}.mp3`,
      `${base}/${cName}.mp3`,
      `${base}/mp3/${cName}_${langCode}.mp3`,
      `${base}/mp3/${cName}.mp3`,
      `${base}/${cName}_en.mp3`,
      `${altBase}/${cName}_${langCode}.mp3`,
      `${altBase}/${cName}.mp3`,
    ])
  );
}

export function getChoiceVttCandidateUrls(
  world = 'Atlantis',
  taleName = '5crystals',
  chapterNumber = 1,
  choiceId = 'choice1',
  lang: Language | string = 'EN'
): string[] {
  const choiceNum = choiceId.replace('choice', '') || '1';
  const cName = `choice${choiceNum}`;
  const langCode = normalizeLangCode(lang);
  const base = getChoiceBaseFolder(world, taleName, chapterNumber, choiceId);
  const altBase = `${SUPABASE_BASE_URL}/${world}/5Ctrystals/chapter${chapterNumber}/choice${choiceNum}`;

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
  const langCode = normalizeLangCode(lang);
  const base = getChoiceBaseFolder(world, taleName, chapterNumber, choiceId);

  return Array.from(
    new Set([
      `${base}/vtt/feedback_${langCode}.vtt`
    ])
  );
}

