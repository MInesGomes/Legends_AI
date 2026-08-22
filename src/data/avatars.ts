const AVATAR_BASE_URL = 'https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub/Avatar';

export const avatarAlethea = `${AVATAR_BASE_URL}/AvatarAlethea.jpg`;
export const avatarElion = `${AVATAR_BASE_URL}/AvatarElion.jpg`;
export const avatarMen = `${AVATAR_BASE_URL}/AvatarMen.jpg`;

// Female Avatars
export const female1 = `${AVATAR_BASE_URL}/female1.jpg`;
export const female2 = `${AVATAR_BASE_URL}/female2.jpg`;
export const female3 = `${AVATAR_BASE_URL}/female3.jpg`;
export const female4 = `${AVATAR_BASE_URL}/female4.jpg`;
export const female_13 = `${AVATAR_BASE_URL}/female_13.jpg`;
export const female_18 = `${AVATAR_BASE_URL}/female_18.jpg`;
export const female_51 = `${AVATAR_BASE_URL}/female_51.jpg`;
export const female1_13 = `${AVATAR_BASE_URL}/female1_13.jpg`;
export const female1_18 = `${AVATAR_BASE_URL}/female1_18.jpg`;
export const female50 = `${AVATAR_BASE_URL}/female50.jpg`;

// Male Avatars
export const male1 = `${AVATAR_BASE_URL}/male1.jpg`;
export const male2 = `${AVATAR_BASE_URL}/male2.jpg`;
export const male3 = `${AVATAR_BASE_URL}/male3.jpg`;
export const male4 = `${AVATAR_BASE_URL}/male4.jpg`;
export const male_13 = `${AVATAR_BASE_URL}/male_13.jpg`;
export const male_18 = `${AVATAR_BASE_URL}/male_18.jpg`;
export const male_51 = `${AVATAR_BASE_URL}/male_51.jpg`;
export const male1_13 = `${AVATAR_BASE_URL}/male1_13.jpg`;
export const male1_18 = `${AVATAR_BASE_URL}/male1_18.jpg`;
export const male50 = `${AVATAR_BASE_URL}/male50.jpg`;

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
    url: female1,
    description: 'Keeper of ancient lore, wisdom & grand archives.',
  },
  {
    id: 'female_wayfinder',
    name: 'Aria',
    title: 'The Wayfinder',
    role: 'Pathfinder',
    gender: 'female',
    url: female2,
    description: 'Spirited scout & voyager of uncharted realms.',
  },
  {
    id: 'female_mystic',
    name: 'Seraphina',
    title: 'The Crystal Mystic',
    role: 'Oracle',
    gender: 'female',
    url: female3,
    description: 'Wielder of luminous elemental energies & visions.',
  },
  {
    id: 'female_explorer',
    name: 'Maya',
    title: 'The Torchbearer',
    role: 'Explorer',
    gender: 'female',
    url: female_13,
    description: 'Fearless young adventurer lighting mysterious caves.',
    isYouthRecommended: true,
  },
  {
    id: 'female_guardian',
    name: 'Isolde',
    title: 'The Guardian Lady',
    role: 'Knight',
    gender: 'female',
    url: female4,
    description: 'Noble knight shielding ancient sanctuaries.',
  },
  {
    id: 'female_junior',
    name: 'Lyra',
    title: 'Young Adventuress',
    role: 'Apprentice',
    gender: 'female',
    url: female1_13,
    description: 'Energetic apprentice discovering magical mysteries.',
    isYouthRecommended: true,
  },
  {
    id: 'female_voyager',
    name: 'Valeria',
    title: 'The Voyager',
    role: 'Navigator',
    gender: 'female',
    url: female_18,
    description: 'Bold pioneer navigating stormy celestial seas.',
  },
  {
    id: 'female_elder',
    name: 'Morrigan',
    title: 'The High Elder',
    role: 'Sage',
    gender: 'female',
    url: female_51,
    description: 'Venerable seer guiding generations with timeless wisdom.',
  },
  {
    id: 'female_grand_matron',
    name: 'Cassandra',
    title: 'The Sovereign Matron',
    role: 'Chancellor',
    gender: 'female',
    url: female50,
    description: 'Wise ruler orchestrating diplomacy across realms.',
  },
  {
    id: 'female_noble',
    name: 'Aurelia',
    title: 'The Noble Heiress',
    role: 'Diplomat',
    gender: 'female',
    url: female1_18,
    description: 'Graceful aristocrat bridging legendary cultures.',
  },
];

export const MALE_AVATARS: AvatarOption[] = [
  {
    id: 'male_champion',
    name: 'Elion',
    title: 'The Palace Champion',
    role: 'Champion',
    gender: 'male',
    url: male1,
    description: 'Noble guardian & defender of the high kingdoms.',
  },
  {
    id: 'male_wanderer',
    name: 'Kaelen',
    title: 'The Wanderer',
    role: 'Ranger',
    gender: 'male',
    url: male2,
    description: 'Free-spirited ranger traversing the mythical wild.',
  },
  {
    id: 'male_scholar',
    name: 'Theron',
    title: 'The Sage Scholar',
    role: 'Researcher',
    gender: 'male',
    url: male3,
    description: 'Grand archivist deciphering ancient lost codices.',
  },
  {
    id: 'male_explorer',
    name: 'Leo',
    title: 'The Torchbearer',
    role: 'Explorer',
    gender: 'male',
    url: male_13,
    description: 'Cheerful young pioneer seeking ancient treasures.',
    isYouthRecommended: true,
  },
  {
    id: 'male_paladin',
    name: 'Gareth',
    title: 'The Radiant Paladin',
    role: 'Paladin',
    gender: 'male',
    url: male4,
    description: 'Holy warrior channeling celestial brilliance.',
  },
  {
    id: 'male_junior',
    name: 'Rowan',
    title: 'Young Pathfinder',
    role: 'Apprentice',
    gender: 'male',
    url: male1_13,
    description: 'Curious young traveler exploring forgotten ruins.',
    isYouthRecommended: true,
  },
  {
    id: 'male_adventurer',
    name: 'Cedric',
    title: 'The Brave Scout',
    role: 'Scout',
    gender: 'male',
    url: male_18,
    description: 'Courageous tracker charting hidden mountain passes.',
  },
  {
    id: 'male_elder_sage',
    name: 'Archibald',
    title: 'The Grand Patriarch',
    role: 'Patriarch',
    gender: 'male',
    url: male_51,
    description: 'Distinguished elder harboring secrets of the universe.',
  },
  {
    id: 'male_archmage',
    name: 'Ignatius',
    title: 'The Archmage Elder',
    role: 'Archmage',
    gender: 'male',
    url: male50,
    description: 'Ancient sorcerer commanding legendary prime magic.',
  },
  {
    id: 'male_nobleman',
    name: 'Julian',
    title: 'The Crown Envoy',
    role: 'Envoy',
    gender: 'male',
    url: male1_18,
    description: 'Distinguished ambassador uniting distant realms.',
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
