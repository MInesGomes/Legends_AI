import avatarAlethea from '../assets/avatars/AvatarAlethea.jpg';
import avatarElion from '../assets/avatars/AvatarElion.jpg';
import avatarMen from '../assets/avatars/AvatarMen.jpg';

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
    id: 'female_scholar',
    name: 'Alethea',
    title: 'The Royal Scholar',
    role: 'Archivist',
    gender: 'female',
    url: avatarAlethea,
    description: 'Keeper of ancient lore, wisdom & grand archives.',
  },
  {
    id: 'female_wayfinder',
    name: 'Aria',
    title: 'The Wayfinder',
    role: 'Pathfinder',
    gender: 'female',
    url: avatarAlethea,
    description: 'Spirited scout & voyager of uncharted realms.',
  },
  {
    id: 'female_mystic',
    name: 'Seraphina',
    title: 'The Crystal Mystic',
    role: 'Oracle',
    gender: 'female',
    url: avatarAlethea,
    description: 'Wielder of luminous elemental energies & visions.',
  },
  {
    id: 'female_explorer',
    name: 'Maya',
    title: 'The Torchbearer',
    role: 'Explorer',
    gender: 'female',
    url: avatarAlethea,
    description: 'Fearless young adventurer lighting mysterious caves.',
    isYouthRecommended: true,
  },
];

export const MALE_AVATARS: AvatarOption[] = [
  {
    id: 'male_champion',
    name: 'Elion',
    title: 'The Palace Champion',
    role: 'Champion',
    gender: 'male',
    url: avatarElion,
    description: 'Noble guardian & defender of the high kingdoms.',
  },
  {
    id: 'male_wanderer',
    name: 'Kaelen',
    title: 'The Wanderer',
    role: 'Ranger',
    gender: 'male',
    url: avatarMen,
    description: 'Free-spirited ranger traversing the mythical wild.',
  },
  {
    id: 'male_scholar',
    name: 'Theron',
    title: 'The Sage Scholar',
    role: 'Researcher',
    gender: 'male',
    url: avatarMen,
    description: 'Grand archivist deciphering ancient lost codices.',
  },
  {
    id: 'male_explorer',
    name: 'Leo',
    title: 'The Torchbearer',
    role: 'Explorer',
    gender: 'male',
    url: avatarElion,
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
