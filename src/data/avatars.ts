import femaleWayfinder from '../assets/avatars/female_wayfinder_1786725010669.jpg';
import femaleScholar from '../assets/avatars/female_scholar_1786725027022.jpg';
import femaleMystic from '../assets/avatars/female_mystic_1786725039652.jpg';
import femaleExplorer from '../assets/avatars/female_explorer_1786725050427.jpg';

import maleWanderer from '../assets/avatars/male_wanderer_1786725060485.jpg';
import maleChampion from '../assets/avatars/male_champion_1786725076356.jpg';
import maleScholar from '../assets/avatars/male_scholar_1786725087685.jpg';
import maleExplorer from '../assets/avatars/male_explorer_1786725100677.jpg';

export interface AvatarOption {
  id: string;
  name: string;
  title: string;
  role: string;
  gender: 'female' | 'male';
  url: string;
  description: string;
  isYouthRecommended?: boolean;
}

export const FEMALE_AVATARS: AvatarOption[] = [
  {
    id: 'female_wayfinder',
    name: 'Aria',
    title: 'The Wayfinder',
    role: 'Pathfinder',
    gender: 'female',
    url: femaleWayfinder,
    description: 'Spirited scout & voyager of uncharted realms.',
  },
  {
    id: 'female_scholar',
    name: 'Alethea',
    title: 'The Royal Scholar',
    role: 'Archivist',
    gender: 'female',
    url: femaleScholar,
    description: 'Keeper of ancient lore, wisdom & grand archives.',
  },
  {
    id: 'female_mystic',
    name: 'Seraphina',
    title: 'The Crystal Mystic',
    role: 'Oracle',
    gender: 'female',
    url: femaleMystic,
    description: 'Wielder of luminous elemental energies & visions.',
  },
  {
    id: 'female_explorer',
    name: 'Maya',
    title: 'The Torchbearer',
    role: 'Explorer',
    gender: 'female',
    url: femaleExplorer,
    description: 'Fearless young adventurer lighting mysterious caves.',
    isYouthRecommended: true,
  },
];

export const MALE_AVATARS: AvatarOption[] = [
  {
    id: 'male_wanderer',
    name: 'Kaelen',
    title: 'The Wanderer',
    role: 'Ranger',
    gender: 'male',
    url: maleWanderer,
    description: 'Free-spirited ranger traversing the mythical wild.',
  },
  {
    id: 'male_champion',
    name: 'Elion',
    title: 'The Palace Champion',
    role: 'Champion',
    gender: 'male',
    url: maleChampion,
    description: 'Noble guardian & defender of the high kingdoms.',
  },
  {
    id: 'male_scholar',
    name: 'Theron',
    title: 'The Sage Scholar',
    role: 'Researcher',
    gender: 'male',
    url: maleScholar,
    description: 'Grand archivist deciphering ancient lost codices.',
  },
  {
    id: 'male_explorer',
    name: 'Leo',
    title: 'The Torchbearer',
    role: 'Explorer',
    gender: 'male',
    url: maleExplorer,
    description: 'Cheerful young pioneer seeking ancient treasures.',
    isYouthRecommended: true,
  },
];

export const ALL_AVATARS: AvatarOption[] = [...FEMALE_AVATARS, ...MALE_AVATARS];

export function getAvatarByUrlOrId(urlOrId: string): AvatarOption | undefined {
  return ALL_AVATARS.find((a) => a.url === urlOrId || a.id === urlOrId);
}

export const DEFAULT_FEMALE_AVATAR = FEMALE_AVATARS[0].url;
export const DEFAULT_MALE_AVATAR = MALE_AVATARS[0].url;
export const DEFAULT_YOUTH_FEMALE_AVATAR = FEMALE_AVATARS[3].url;
export const DEFAULT_YOUTH_MALE_AVATAR = MALE_AVATARS[3].url;
