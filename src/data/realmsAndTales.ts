import { Realm, Tale } from '../types';
import workBg from '../assets/realms/work/work_realm_bg_1786616108471.jpg';
import marriageBg from '../assets/realms/marriage/marriage.jpeg';
import dadMomBg from '../assets/realms/dad_mom/dad_mom_realm_bg_1786616128388.jpg';
import atlantisBg from '../assets/realms/atlantis/realm_atlantis_bg.png';
import eldoradoBg from '../assets/realms/eldorado/eldorado_realm_bg_1786616150490.jpg';
import futureLandBg from '../assets/realms/future_land/future_land_realm_bg_1786616159214.jpg';

import babyTaleImg from '../assets/realms/dad_mom/tale_baby_1786619486118.jpg';
import childTaleImg from '../assets/realms/dad_mom/tale_child_1786619497253.jpg';
import teensTaleImg from '../assets/realms/dad_mom/tale_teens_1786619511039.jpg';
import pridePrejudiceImg from '../assets/realms/marriage/tale_pride_prejudice_1786619522458.jpg';
import oneHartImg from '../assets/realms/marriage/tale_one_hart_1786619538922.jpg';
import startupWinnerImg from '../assets/realms/work/tale_startup_winner_1786619547804.jpg';
import jobQuestImg from '../assets/realms/work/job_quest_ch1_1786784386457.jpg';
import fiveCrystalsImg from '../assets/realms/atlantis/atlantis_heart_crystals_1786726147916.jpg';

export const REALMS: Realm[] = [
  {
    id: 'realm-work',
    key: 'work',
    title: 'WORK',
    isAdultOnly: true,
    bgImage: workBg,
    iconName: 'Briefcase'
  },
  {
    id: 'realm-marriage',
    key: 'marriage',
    title: 'MARRIAGE',
    isAdultOnly: true,
    bgImage: marriageBg,
    iconName: 'HeartHandshake'
  },
  {
    id: 'realm-dad-mom',
    key: 'dad_mom',
    title: 'DAD & MOM',
    isAdultOnly: true,
    bgImage: dadMomBg,
    iconName: 'Users'
  },
  {
    id: 'realm-atlantis',
    key: 'atlantis',
    title: 'ATLANTIS',
    isAdultOnly: false,
    bgImage: atlantisBg,
    iconName: 'Trident'
  },
  {
    id: 'realm-el-dorado',
    key: 'el_dorado',
    title: 'EL DORADO',
    isAdultOnly: false,
    bgImage: eldoradoBg,
    iconName: 'Pyramid'
  },
  {
    id: 'realm-future-land',
    key: 'future_land',
    title: 'FUTURE LAND',
    isAdultOnly: false,
    bgImage: futureLandBg,
    iconName: 'Building2'
  }
];

export const INITIAL_TALES: Tale[] = [
  // Atlantis Tales (matching 2AtlantisTales.png reference)
  {
    id: 'tale-5-crystals',
    realmId: 'realm-atlantis',
    title: '5 Crystals',
    subtitle: 'The Heart of Atlantis',
    coverImage: fiveCrystalsImg,
    skill: 'Win4All',
    viewsCount: 1420,
    likesCount: 388,
    commentsCount: 24
  },
  {
    id: 'tale-ocean-depths',
    realmId: 'realm-atlantis',
    title: 'Ocean Depths',
    subtitle: 'The Sunken Bell',
    coverImage: atlantisBg,
    skill: 'Listen',
    viewsCount: 979,
    likesCount: 211,
    commentsCount: 15
  },

  // Dad & Mom Tales (matching 2Dad&MomTales.png reference)
  {
    id: 'tale-baby',
    realmId: 'realm-dad-mom',
    title: 'Baby',
    subtitle: 'First Steps & Infinite Patience',
    coverImage: babyTaleImg,
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
    coverImage: childTaleImg,
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
    coverImage: teensTaleImg,
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
    coverImage: pridePrejudiceImg,
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
    coverImage: oneHartImg,
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
    coverImage: startupWinnerImg,
    skill: 'Leader',
    viewsCount: 3100,
    likesCount: 1120,
    commentsCount: 89
  },
  {
    id: 'tale-job-quest',
    realmId: 'realm-work',
    title: 'Job Quest',
    subtitle: 'Explore. Learn. Grow. Succeed.',
    coverImage: jobQuestImg,
    skill: 'Plan',
    viewsCount: 2450,
    likesCount: 910,
    commentsCount: 54
  },

  // El Dorado Tales
  {
    id: 'tale-golden-city',
    realmId: 'realm-el-dorado',
    title: 'The City of Gold',
    subtitle: 'Wealth of Spirit vs Greed',
    coverImage: eldoradoBg,
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
    coverImage: futureLandBg,
    skill: 'Plan',
    viewsCount: 2890,
    likesCount: 1040,
    commentsCount: 78
  }
];

