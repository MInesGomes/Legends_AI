export type Language = 'EN' | 'ES' | 'IT' | 'PT-pt' | 'NL';

export const SUPPORTED_LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'ES', label: 'Español', flag: '🇪🇸' },
  { code: 'IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'PT-pt', label: 'Português', flag: '🇵🇹' },
  { code: 'NL', label: 'Nederlands', flag: '🇳🇱' },
];

export type SkillType = 'Leader' | 'Plan' | 'Win4All' | 'Listen' | 'Recharge';

export type ChoiceOptionType = 'Best' | 'Safe' | 'Weak' | 'Harmful';

export interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  gender: 'female' | 'male';
  date_of_birth: string; // YYYY-MM-DD
  age: number;
  language: Language;
  avatar_url: string;
  created_at: string;
  daily_tale_limit?: number; // Configurable daily limit (max 5 for 18+, max 2 for under 18)
}

export interface UserSkillsPoints {
  Leader: number;
  Plan: number;
  Win4All: number;
  Listen: number;
  Recharge: number;
}

export interface Realm {
  id: string;
  title: string;
  key: 'work' | 'marriage' | 'dad_mom' | 'atlantis' | 'el_dorado' | 'future_land';
  isAdultOnly: boolean;
  bgImage: string;
  iconName: string;
}

export interface Tale {
  id: string;
  realmId: string;
  title: string;
  subtitle?: string;
  coverImage: string;
  skill: SkillType;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  isCustomUserTale?: boolean;
  storyContent?: string;
}

export interface DialogueLine {
  speaker: string;
  avatarUrl?: string;
  text: string;
}

export interface ChapterChoice {
  title: string;
  subtitle?: string;
  description: string;
  choiceImage?: string;
  dialogues: DialogueLine[];
  feedbackReadBack: string;
  crystalOutcome?: string;
}

export interface ChapterStory {
  paragraphs?: string[];
  dimensions?: { dimension: string; meaning: string }[];
  theChange?: string;
  theBeginning?: string;
}

export interface ChapterContent {
  id: string;
  taleId: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  skill: SkillType;
  bgMedia: {
    type: 'image' | 'video';
    url: string;
  };
  story?: ChapterStory;
  sceneText?: string;
  intro: {
    female: {
      characterName: string;
      avatarUrl: string;
      backgroundStory: string;
      dialogue: DialogueLine[];
    };
    male: {
      characterName: string;
      avatarUrl: string;
      backgroundStory: string;
      dialogue: DialogueLine[];
    };
  };
  choices?: Record<ChoiceOptionType, ChapterChoice>;
}

export interface ChapterComment {
  id: string;
  chapter_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  text: string;
  created_at: string;
}

export interface DailyTaleLog {
  tale_id: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
}

export interface DatabaseState {
  user_profile: UserProfile | null;
  user_comments: ChapterComment[];
  user_skills_points: UserSkillsPoints;
  chapters_id_Liked: string[];
  chapters_id_Views: string[];
  language_chapters_viewed?: Record<Language, string[]>;
  chapters_id_Comments: Record<string, ChapterComment[]>;
  user_tales: Tale[];
  daily_tales_log?: DailyTaleLog[];
}
