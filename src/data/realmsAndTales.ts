import { Realm, Tale } from '../types';
import {
  realmAtlantisJpg,
  realmWorkJpg,
  realmElDoradoJpg,
  realmDadMomJpg,
  realmMarriageJpg,
  realmFutureLandJpg,
  fiveCrystalsJpg,
  taleBabyJpg,
  taleChildJpg,
  taleTeensJpg,
  talePridePrejudiceJpg,
  taleOneHartJpg,
  taleStartupWinnerJpg,
  taleJobQuestJpg,
} from '../lib/assetRegistry';

export const REALMS: Realm[] = [
  {
    id: 'realm-work',
    key: 'work',
    title: 'WORK',
    isAdultOnly: true,
    bgImage: realmWorkJpg,
    iconName: 'Briefcase'
  },
  {
    id: 'realm-marriage',
    key: 'marriage',
    title: 'MARRIAGE',
    isAdultOnly: true,
    bgImage: realmMarriageJpg,
    iconName: 'HeartHandshake',
    isComingSoon: true,
  },
  {
    id: 'realm-dad-mom',
    key: 'dad_mom',
    title: 'DAD & MOM',
    isAdultOnly: true,
    bgImage: realmDadMomJpg,
    iconName: 'Users',
    isComingSoon: true,
  },
  {
    id: 'realm-atlantis',
    key: 'atlantis',
    title: 'ATLANTIS',
    isAdultOnly: false,
    bgImage: realmAtlantisJpg,
    iconName: 'Trident'
  },
  {
    id: 'realm-el-dorado',
    key: 'el_dorado',
    title: 'EL DORADO',
    isAdultOnly: false,
    bgImage: realmElDoradoJpg,
    iconName: 'Pyramid',
    audienceLabel: {
      EN: 'Child',
      ES: 'Infantil',
      IT: 'Bambini',
      PT: 'Infantil',
      NL: 'Kind',
    },
  },
  {
    id: 'realm-future-land',
    key: 'future_land',
    title: 'FUTURE LAND',
    isAdultOnly: false,
    bgImage: realmFutureLandJpg,
    iconName: 'Building2',
    isComingSoon: true,
  }
];

export const INITIAL_TALES: Tale[] = [
  // Atlantis Tales 
  {
    id: 'tale-5-crystals',
    realmId: 'realm-atlantis',
    title: '5 Crystals',
    subtitle: 'The Heart of Atlantis',
    coverImage: fiveCrystalsJpg,
    skill: 'Win4All',
    viewsCount: 1420,
    likesCount: 388,
    commentsCount: 24
  },

  // Dad & Mom Tales
  {
    id: 'tale-baby',
    realmId: 'realm-dad-mom',
    title: 'Baby',
    subtitle: 'First Steps & Infinite Patience',
    coverImage: taleBabyJpg,
    skill: 'Recharge',
    viewsCount: 1102,
    likesCount: 412,
    commentsCount: 31
  },
  {
    id: 'tale-child',
    realmId: 'realm-dad-mom',
    title: 'Child',
    subtitle: 'Curiosity & Playful Wisdom',
    coverImage: taleChildJpg,
    skill: 'Listen',
    viewsCount: 885,
    likesCount: 290,
    commentsCount: 19
  },
  {
    id: 'tale-teens',
    realmId: 'realm-dad-mom',
    title: 'Teens',
    subtitle: 'Navigating Identity & Trust',
    coverImage: taleTeensJpg,
    skill: 'Plan',
    viewsCount: 1350,
    likesCount: 510,
    commentsCount: 42
  },

  // Marriage Tales (matching 2MarriageTales.png reference)
  {
    id: 'tale-pride-prejudice',
    realmId: 'realm-marriage',
    title: 'Pride & Prejudice',
    subtitle: 'Overcoming Assumptions',
    coverImage: talePridePrejudiceJpg,
    skill: 'Listen',
    viewsCount: 2100,
    likesCount: 840,
    commentsCount: 65
  },
  {
    id: 'tale-one-hart',
    realmId: 'realm-marriage',
    title: 'One Hart',
    subtitle: 'Shared Horizons',
    coverImage: taleOneHartJpg,
    skill: 'Win4All',
    viewsCount: 1780,
    likesCount: 620,
    commentsCount: 29
  },

  // Work Tales (matching 2WorkTales.png reference)
  {
    id: 'tale-startup-winner',
    realmId: 'realm-work',
    title: 'Startup Winner',
    subtitle: 'Leadership Under Pressure',
    coverImage: taleStartupWinnerJpg,
    skill: 'Leader',
    viewsCount: 3100,
    likesCount: 1120,
    commentsCount: 89,
    isComingSoon: true,
  },
  {
    id: 'tale-job-quest',
    realmId: 'realm-work',
    title: 'Job Quest',
    subtitle: 'Explore. Learn. Grow. Succeed.',
    coverImage: taleJobQuestJpg,
    skill: 'Plan',
    viewsCount: 2450,
    likesCount: 910,
    commentsCount: 54
  },

  // El Dorado Tales
  {
    id: 'tale-the-torch',
    realmId: 'realm-el-dorado',
    title: 'The Torch',
    subtitle: 'Wealth of Spirit vs Greed',
    coverImage: 'https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub/ElDorado/the_torch.jpg',
    skill: 'Leader',
    viewsCount: 1640,
    likesCount: 450,
    commentsCount: 33
  },

  // Future Land Tales
  {
    id: 'tale-ai-horizon',
    realmId: 'realm-future-land',
    title: 'AI Horizon',
    subtitle: 'Co-creating with Tomorrow',
    coverImage: realmFutureLandJpg,
    skill: 'Plan',
    viewsCount: 2890,
    likesCount: 1040,
    commentsCount: 78
  }
];

