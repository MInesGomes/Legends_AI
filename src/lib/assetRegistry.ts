import { Language } from '../types';

export interface Act {
  chapter: number; // e.g. values 0, 1, 2, 3
  act: 'female_act' | 'male_act' | 'act0' | 'choice1' | 'choice2'| 'choice3' | 'choice4' | string;
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

/**
 * Loaded Video Sources for Chapter 3
 */
export const CHAPTER_3_MEDIA_URLS = {
  act0: 'https://youtu.be/-64kwqW5q6k',
  choice1: 'https://youtu.be/7DEPbiuRvuU',
  choice2: 'https://youtu.be/B4bsJHLc7V0',
  choice3: 'https://youtu.be/TP1-nip4GiM',
};

/**
 * Extracts YouTube video ID from various YouTube URL formats or raw ID.
 */
export function extractYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const regExp = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }
  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
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
 * or for ElDorado: folderPath + chapter + "/" + act + "_" + langCode + ".mp3"
 */
export function getActMp3Url(act: Act, lang: Language | string = 'EN', customFolder?: string): string {
  const candidates = getActMp3CandidateUrls(act, lang, customFolder);
  return candidates[0];
}

/**
 * Candidate MP3 URLs for act voiceover resilience.
 */
export function getActMp3CandidateUrls(act: Act, lang: Language | string = 'EN', customFolder?: string): string[] {
  const folder = (customFolder || ATLANTIS_5CRYSTALS_FOLDER_PATH).replace(/\/+$/, '');
  const chapterFolder = `${folder}${act.chapter}`;
  const actName = (act.act || 'act0').replace(/^\/+|\/+$/g, '');
  const langCode = normalizeLangCode(lang);
  const isElDorado = folder.toLowerCase().includes('eldorado');

  const candidates: string[] = [];

  if (isElDorado) {
    // For ElDorado (files live directly in chapterFolder: e.g. chapter0/act0_pt.mp3)
    candidates.push(
      `${chapterFolder}/${actName}_${langCode}.mp3`,
      `${chapterFolder}/${actName}.mp3`,
      `${chapterFolder}/${actName}/${actName}_${langCode}.mp3`,
      `${chapterFolder}/${actName}/${actName}.mp3`,
      `${chapterFolder}/mp3/${actName}_${langCode}.mp3`,
      `${chapterFolder}/mp3/${actName}.mp3`,
      `${chapterFolder}/${actName}/mp3/${actName}_${langCode}.mp3`
    );
    if (langCode !== 'en') {
      candidates.push(
        `${chapterFolder}/${actName}_en.mp3`,
        `${chapterFolder}/${actName}/${actName}_en.mp3`
      );
    }
  } else {
    // For Atlantis and other realms (files live in act subfolder: e.g. chapter0/act0/act0_pt.mp3)
    candidates.push(
      `${chapterFolder}/${actName}/${actName}_${langCode}.mp3`,
      `${chapterFolder}/${actName}/${actName}.mp3`,
      `${chapterFolder}/${actName}/mp3/${actName}_${langCode}.mp3`,
      `${chapterFolder}/${actName}/mp3/${actName}.mp3`,
      `${chapterFolder}/${actName}_${langCode}.mp3`,
      `${chapterFolder}/${actName}.mp3`
    );
    if (langCode !== 'en') {
      candidates.push(
        `${chapterFolder}/${actName}/${actName}_en.mp3`,
        `${chapterFolder}/${actName}_en.mp3`
      );
    }
  }
  return Array.from(new Set(candidates));
}

/**
 * Constructs MP4 video URL for an Act.
 * e.g. folderPath + chapter + "/" + act + "/" + act + ".mp4"
 * or for ElDorado: folderPath + chapter + "/" + act + ".mp4"
 */
export function getActMp4Url(act: Act, customFolder?: string): string {
  const candidates = getActMp4CandidateUrls(act, customFolder);
  return candidates[0];
}

/**
 * Candidate MP4 URLs for playback resilience.
 */
export function getActMp4CandidateUrls(act: Act, customFolder?: string): string[] {
  const folder = (customFolder || ATLANTIS_5CRYSTALS_FOLDER_PATH).replace(/\/+$/, '');
  const chapterFolder = `${folder}${act.chapter}`;
  const actName = (act.act || 'act0').replace(/^\/+|\/+$/g, '');
  const isElDorado = folder.toLowerCase().includes('eldorado');

  const candidates: string[] = [];

  // Custom video URL configured on act if any
  if (act.videoUrl) {
    candidates.push(act.videoUrl);
  }

  // Atlantis Chapter 3 acts video sources
  if (act.chapter === 3 && (!customFolder || customFolder.toLowerCase().includes('atlantis') || !isElDorado)) {
    if (actName === 'act0' || !act.act) {
      candidates.push('https://youtu.be/-64kwqW5q6k');
    } else if (actName === 'choice1') {
      candidates.push('https://youtu.be/7DEPbiuRvuU');
    } else if (actName === 'choice2') {
      candidates.push('https://youtu.be/B4bsJHLc7V0');
    } else if (actName === 'choice3') {
      candidates.push('https://youtu.be/TP1-nip4GiM');
    }
  }

  if (isElDorado) {
    candidates.push(
      `${chapterFolder}/${actName}.mp4`,
      `${chapterFolder}/${actName}_en.mp4`,
      `${chapterFolder}/${actName}/${actName}.mp4`,
      `${chapterFolder}/${actName}/${actName}_en.mp4`
    );
  } else {
    candidates.push(
      `${chapterFolder}/${actName}/${actName}.mp4`,
      `${chapterFolder}/${actName}.mp4`,
      `${chapterFolder}/${actName}_en.mp4`,
      `${chapterFolder}/${actName}/${actName}_en.mp4`
    );
  }
  return Array.from(new Set(candidates));
}

/**
 * Constructs VTT subtitle URL for an Act and Language.
 * e.g. folderPath + chapter + "/" + act + "/" + act + "_" + langCode + ".vtt"
 * or for ElDorado: folderPath + chapter + "/vtt/" + act + "_" + langCode + ".vtt"
 */
export function getActVttUrl(act: Act, lang: Language | string = 'EN', customFolder?: string): string {
  const candidates = getActVttCandidateUrls(act, lang, customFolder);
  return candidates[0];
}

/**
 * Candidate VTT URLs for subtitle fetching resilience
 * (checks direct chapter/vtt/, chapter root, act/vtt/, and act root).
 */
export function getActVttCandidateUrls(act: Act, lang: Language | string = 'EN', customFolder?: string): string[] {
  const folder = (customFolder || ATLANTIS_5CRYSTALS_FOLDER_PATH).replace(/\/+$/, '');
  const chapterFolder = `${folder}${act.chapter}`;
  const actName = (act.act || 'act0').replace(/^\/+|\/+$/g, '');
  const langCode = normalizeLangCode(lang);
  const isElDorado = folder.toLowerCase().includes('eldorado');

  const candidates: string[] = [];
  if (isElDorado) {
    candidates.push(
      `${chapterFolder}/vtt/${actName}_${langCode}.vtt`,
      `${chapterFolder}/${actName}_${langCode}.vtt`,
      `${chapterFolder}/vvt/${actName}_${langCode}.vtt`,
      `${chapterFolder}/${actName}/vtt/${actName}_${langCode}.vtt`,
      `${chapterFolder}/${actName}/${actName}_${langCode}.vtt`,
      `${chapterFolder}/vtt/${actName}.vtt`,
      `${chapterFolder}/${actName}.vtt`
    );
  } else {
    candidates.push(
      `${chapterFolder}/${actName}/${actName}_${langCode}.vtt`,
      `${chapterFolder}/${actName}/vtt/${actName}_${langCode}.vtt`,
      `${chapterFolder}/${actName}/vvt/${actName}_${langCode}.vtt`,
      `${chapterFolder}/vtt/${actName}_${langCode}.vtt`,
      `${chapterFolder}/${actName}_${langCode}.vtt`
    );
  }
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
  {
    chapter: 2,
    act: 'act0',
    title: 'Plan to Atlantis Flow',
    type: 'narrative',
  },
  {
    chapter: 2,
    act: 'choice1',
    title: 'BEST: Many Hands',
    type: 'choice',
  },
  {
    chapter: 2,
    act: 'choice2',
    title: 'Into the Flood',
    type: 'choice',
  },
  {
    chapter: 2,
    act: 'choice3',
    title: 'The Difficult Choice',
    type: 'choice',
  },
  {
    chapter: 3,
    act: 'act0',
    title: 'Win4All in Atlantis Flow',
    type: 'narrative',
    videoUrl: 'https://youtu.be/-64kwqW5q6k',
  },
  {
    chapter: 3,
    act: 'choice1',
    title: 'BEST: Shift the Ground',
    type: 'choice',
    videoUrl: 'https://youtu.be/7DEPbiuRvuU',
  },
  {
    chapter: 3,
    act: 'choice2',
    title: 'Keep the Flow',
    type: 'choice',
    videoUrl: 'https://youtu.be/B4bsJHLc7V0',
  },
  {
    chapter: 3,
    act: 'choice3',
    title: 'Draw the Line',
    type: 'choice',
    videoUrl: 'https://youtu.be/TP1-nip4GiM',
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

/**
 * Constructs the primary image URL for a choice button,
 * e.g. https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub/Atlantis/5crystals/chapter1/choice1/choice1.jpg
 */
export function getChoiceImageUrl(
  world = 'Atlantis',
  taleName = '5crystals',
  chapterNumber = 1,
  choiceId = 'choice1'
): string {
  const choiceNum = choiceId.replace('choice', '') || '1';
  const cName = `choice${choiceNum}`;
  const base = getChoiceBaseFolder(world, taleName, chapterNumber, choiceId);
  return `${base}/${cName}.jpg`;
}

export function getChoiceImageCandidateUrls(
  world = 'Atlantis',
  taleName = '5crystals',
  chapterNumber = 1,
  choiceId = 'choice1'
): string[] {
  const choiceNum = choiceId.replace('choice', '') || '1';
  const cName = `choice${choiceNum}`;
  const base = getChoiceBaseFolder(world, taleName, chapterNumber, choiceId);
  const altBase = `${SUPABASE_BASE_URL}/${world}/5Ctrystals/chapter${chapterNumber}/choice${choiceNum}`;

  const candidates: string[] = [];

  // For Atlantis Chapter 3 choices, include YouTube video thumbnails
  if (chapterNumber === 3 && (world.toLowerCase().includes('atlantis') || !world)) {
    if (choiceId === 'choice1' || choiceNum === '1') {
      candidates.push('https://img.youtube.com/vi/7DEPbiuRvuU/hqdefault.jpg');
    } else if (choiceId === 'choice2' || choiceNum === '2') {
      candidates.push('https://img.youtube.com/vi/B4bsJHLc7V0/hqdefault.jpg');
    } else if (choiceId === 'choice3' || choiceNum === '3') {
      candidates.push('https://img.youtube.com/vi/TP1-nip4GiM/hqdefault.jpg');
    }
  }

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
  taleName = '5crystals',
  chapterNumber = 1,
  choiceId = 'choice1'
): string[] {
  const choiceNum = choiceId.replace('choice', '') || '1';
  const cName = `choice${choiceNum}`;
  const base = getChoiceBaseFolder(world, taleName, chapterNumber, choiceId);
  const altBase = `${SUPABASE_BASE_URL}/${world}/5Ctrystals/chapter${chapterNumber}/choice${choiceNum}`;

  const candidates: string[] = [];

  // For Atlantis Chapter 3 choices, load YouTube video sources
  if (chapterNumber === 3 && (world.toLowerCase().includes('atlantis') || !world)) {
    if (choiceId === 'choice1' || choiceNum === '1') {
      candidates.push('https://youtu.be/7DEPbiuRvuU');
    } else if (choiceId === 'choice2' || choiceNum === '2') {
      candidates.push('https://youtu.be/B4bsJHLc7V0');
    } else if (choiceId === 'choice3' || choiceNum === '3') {
      candidates.push('https://youtu.be/TP1-nip4GiM');
    }
  }

  candidates.push(
    `${base}/${cName}.mp4`,
    `${base}/${cName}_en.mp4`,
    `${base}/video.mp4`,
    `${altBase}/${cName}.mp4`
  );

  return Array.from(new Set(candidates));
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
  const choiceNum = choiceId.replace('choice', '') || '1';
  const langCode = normalizeLangCode(lang);
  const base = getChoiceBaseFolder(world, taleName, chapterNumber, choiceId);
  const altBase = `${SUPABASE_BASE_URL}/${world}/5Ctrystals/chapter${chapterNumber}/choice${choiceNum}`;

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

