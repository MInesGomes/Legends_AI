// Centralized Asset Registry for ES Module asset imports (Bundled & Hashed by Vite)

// Avatars
import avatarAlethea from '../assets/avatars/AvatarAlethea.jpg';
import avatarElion from '../assets/avatars/AvatarElion.jpg';
import avatarMen from '../assets/avatars/AvatarMen.jpg';

const danielAvatar = avatarElion;
const elenaAvatar = avatarAlethea;
const femaleExplorer = avatarAlethea;
const femaleMystic = avatarAlethea;
const femaleScholar = avatarAlethea;
const femaleWayfinder = avatarAlethea;
const maleChampion = avatarElion;
const maleExplorer = avatarElion;
const maleScholar = avatarMen;
const maleWanderer = avatarMen;

// Realm Media & Videos
import realmAtlantisJpg from '../assets/realms/atlantis/realm_atlantis.jpg';
import realmAtlantisMp4 from '../assets/realms/atlantis/realm_atlantis.mp4';
import aletheaMp4 from '../assets/realms/atlantis/0Alethea.mp4';
import elionMp4 from '../assets/realms/atlantis/0Elion.mp4';
import act2Mp4 from '../assets/realms/atlantis/Act2.mp4';

// Dad & Mom
import dadMomRealmBg from '../assets/realms/dad_mom/dad_mom_realm_bg_1786616128388.jpg';
import taleBaby from '../assets/realms/dad_mom/tale_baby_1786619486118.jpg';
import taleChild from '../assets/realms/dad_mom/tale_child_1786619497253.jpg';
import taleTeens from '../assets/realms/dad_mom/tale_teens_1786619511039.jpg';

// Eldorado & Future Land
import eldoradoRealmBg from '../assets/realms/eldorado/eldorado_realm_bg_1786616150490.jpg';
import futureLandRealmBg from '../assets/realms/future_land/future_land_realm_bg_1786616159214.jpg';

// Marriage
import marriageJpeg from '../assets/realms/marriage/marriage.jpeg';
import taleOneHart from '../assets/realms/marriage/tale_one_hart_1786619538922.jpg';
import talePridePrejudice from '../assets/realms/marriage/tale_pride_prejudice_1786619522458.jpg';

// Work Realm
import workRealmBg from '../assets/realms/work/work_realm_bg_1786616108471.jpg';
import jobQuestCh1 from '../assets/realms/work/job_quest_ch1_1786784386457.jpg';
import jobQuestCover from '../assets/realms/work/job_quest_cover_1786731085641.jpg';
import officeStartupScene from '../assets/realms/work/office_startup_scene_1786656202157.jpg';
import taleJobQuest from '../assets/realms/work/tale_job_quest_1786619559433.jpg';
import taleStartupWinner from '../assets/realms/work/tale_startup_winner_1786619547804.jpg';

export const ASSETS = {
  // Avatars
  avatarAlethea,
  avatarElion,
  avatarMen,
  danielAvatar,
  elenaAvatar,
  femaleExplorer,
  femaleMystic,
  femaleScholar,
  femaleWayfinder,
  maleChampion,
  maleExplorer,
  maleScholar,
  maleWanderer,

  // Realm Images
  realmAtlantisJpg,
  dadMomRealmBg,
  eldoradoRealmBg,
  futureLandRealmBg,
  marriageJpeg,
  workRealmBg,
  jobQuestCh1,
  jobQuestCover,
  officeStartupScene,
  taleJobQuest,
  taleStartupWinner,
  taleBaby,
  taleChild,
  taleTeens,
  taleOneHart,
  talePridePrejudice,

  // Videos
  realmAtlantisMp4,
  aletheaMp4,
  elionMp4,
  act2Mp4,
};

const ASSET_LOOKUP_MAP: Record<string, string> = {
  // Avatar lookups
  '/src/assets/avatars/AvatarAlethea.jpg': avatarAlethea,
  '/assets/avatars/AvatarAlethea.jpg': avatarAlethea,
  'AvatarAlethea.jpg': avatarAlethea,

  '/src/assets/avatars/AvatarElion.jpg': avatarElion,
  '/assets/avatars/AvatarElion.jpg': avatarElion,
  'AvatarElion.jpg': avatarElion,

  '/src/assets/avatars/AvatarMen.jpg': avatarMen,
  '/assets/avatars/AvatarMen.jpg': avatarMen,
  'AvatarMen.jpg': avatarMen,

  '/src/assets/avatars/elena_character_intro_1786794191159.jpg': elenaAvatar,
  '/assets/avatars/elena_character_intro_1786794191159.jpg': elenaAvatar,
  'elena_character_intro_1786794191159.jpg': elenaAvatar,

  '/src/assets/avatars/daniel_character_intro_1786794200296.jpg': danielAvatar,
  '/assets/avatars/daniel_character_intro_1786794200296.jpg': danielAvatar,
  'daniel_character_intro_1786794200296.jpg': danielAvatar,

  '/src/assets/avatars/female_scholar_1786725027022.jpg': femaleScholar,
  '/assets/avatars/female_scholar_1786725027022.jpg': femaleScholar,
  'female_scholar_1786725027022.jpg': femaleScholar,

  '/src/assets/avatars/male_champion_1786725076356.jpg': maleChampion,
  '/assets/avatars/male_champion_1786725076356.jpg': maleChampion,
  'male_champion_1786725076356.jpg': maleChampion,

  '/src/assets/avatars/female_wayfinder_1786725010669.jpg': femaleWayfinder,
  '/assets/avatars/female_wayfinder_1786725010669.jpg': femaleWayfinder,

  '/src/assets/avatars/female_mystic_1786725039652.jpg': femaleMystic,
  '/assets/avatars/female_mystic_1786725039652.jpg': femaleMystic,

  '/src/assets/avatars/female_explorer_1786725050427.jpg': femaleExplorer,
  '/assets/avatars/female_explorer_1786725050427.jpg': femaleExplorer,

  '/src/assets/avatars/male_wanderer_1786725060485.jpg': maleWanderer,
  '/assets/avatars/male_wanderer_1786725060485.jpg': maleWanderer,

  '/src/assets/avatars/male_scholar_1786725087685.jpg': maleScholar,
  '/assets/avatars/male_scholar_1786725087685.jpg': maleScholar,

  '/src/assets/avatars/male_explorer_1786725100677.jpg': maleExplorer,
  '/assets/avatars/male_explorer_1786725100677.jpg': maleExplorer,

  // Video lookups
  '/src/assets/realms/atlantis/realm_atlantis.mp4': realmAtlantisMp4,
  '/assets/realms/atlantis/realm_atlantis.mp4': realmAtlantisMp4,
  'realm_atlantis.mp4': realmAtlantisMp4,

  '/src/assets/realms/atlantis/0Alethea.mp4': aletheaMp4,
  '/assets/realms/atlantis/0Alethea.mp4': aletheaMp4,
  '0Alethea.mp4': aletheaMp4,

  '/src/assets/realms/atlantis/0Elion.mp4': elionMp4,
  '/assets/realms/atlantis/0Elion.mp4': elionMp4,
  '0Elion.mp4': elionMp4,

  '/src/assets/realms/atlantis/Act2.mp4': act2Mp4,
  '/assets/realms/atlantis/Act2.mp4': act2Mp4,
  'Act2.mp4': act2Mp4,

  // Atlantis Images
  '/src/assets/realms/atlantis/realm_atlantis.jpg': realmAtlantisJpg,
  '/assets/realms/atlantis/realm_atlantis.jpg': realmAtlantisJpg,
  'realm_atlantis.jpg': realmAtlantisJpg,

  // Work Realm Images
  '/src/assets/realms/work/job_quest_ch1_1786784386457.jpg': jobQuestCh1,
  '/assets/realms/work/job_quest_ch1_1786784386457.jpg': jobQuestCh1,

  '/src/assets/realms/work/job_quest_cover_1786731085641.jpg': jobQuestCover,
  '/assets/realms/work/job_quest_cover_1786731085641.jpg': jobQuestCover,

  '/src/assets/realms/work/work_realm_bg_1786616108471.jpg': workRealmBg,
  '/assets/realms/work/work_realm_bg_1786616108471.jpg': workRealmBg,

  '/src/assets/realms/work/office_startup_scene_1786656202157.jpg': officeStartupScene,
  '/assets/realms/work/office_startup_scene_1786656202157.jpg': officeStartupScene,

  '/src/assets/realms/work/tale_job_quest_1786619559433.jpg': taleJobQuest,
  '/assets/realms/work/tale_job_quest_1786619559433.jpg': taleJobQuest,

  '/src/assets/realms/work/tale_startup_winner_1786619547804.jpg': taleStartupWinner,
  '/assets/realms/work/tale_startup_winner_1786619547804.jpg': taleStartupWinner,

  // Dad & Mom
  '/src/assets/realms/dad_mom/dad_mom_realm_bg_1786616128388.jpg': dadMomRealmBg,
  '/assets/realms/dad_mom/dad_mom_realm_bg_1786616128388.jpg': dadMomRealmBg,

  '/src/assets/realms/dad_mom/tale_baby_1786619486118.jpg': taleBaby,
  '/assets/realms/dad_mom/tale_baby_1786619486118.jpg': taleBaby,

  '/src/assets/realms/dad_mom/tale_child_1786619497253.jpg': taleChild,
  '/assets/realms/dad_mom/tale_child_1786619497253.jpg': taleChild,

  '/src/assets/realms/dad_mom/tale_teens_1786619511039.jpg': taleTeens,
  '/assets/realms/dad_mom/tale_teens_1786619511039.jpg': taleTeens,

  // Marriage
  '/src/assets/realms/marriage/marriage.jpeg': marriageJpeg,
  '/assets/realms/marriage/marriage.jpeg': marriageJpeg,

  '/src/assets/realms/marriage/tale_one_hart_1786619538922.jpg': taleOneHart,
  '/assets/realms/marriage/tale_one_hart_1786619538922.jpg': taleOneHart,

  '/src/assets/realms/marriage/tale_pride_prejudice_1786619522458.jpg': talePridePrejudice,
  '/assets/realms/marriage/tale_pride_prejudice_1786619522458.jpg': talePridePrejudice,

  // Eldorado & Future Land
  '/src/assets/realms/eldorado/eldorado_realm_bg_1786616150490.jpg': eldoradoRealmBg,
  '/assets/realms/eldorado/eldorado_realm_bg_1786616150490.jpg': eldoradoRealmBg,

  '/src/assets/realms/future_land/future_land_realm_bg_1786616159214.jpg': futureLandRealmBg,
  '/assets/realms/future_land/future_land_realm_bg_1786616159214.jpg': futureLandRealmBg,
};

/**
 * Resolves any asset path string (hardcoded or from JSON) to the Vite-bundled asset URL.
 */
export function resolveAssetUrl(path: string | undefined | null, fallback: string = ''): string {
  if (!path) return fallback;
  if (ASSET_LOOKUP_MAP[path]) {
    return ASSET_LOOKUP_MAP[path];
  }
  // Try matching just the filename if full path didn't hit
  const filename = path.split('/').pop();
  if (filename && ASSET_LOOKUP_MAP[filename]) {
    return ASSET_LOOKUP_MAP[filename];
  }
  return path;
}
