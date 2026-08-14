export type Language = 'EN' | 'ES' | 'IT' | 'PT-pt' | 'NL';

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
  description: string;
  dialogues: DialogueLine[];
  feedbackReadBack: string;
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

export interface DatabaseState {
  user_profile: UserProfile | null;
  user_comments: ChapterComment[];
  user_skills_points: UserSkillsPoints;
  chapters_id_Liked: string[];
  chapters_id_Views: string[];
  chapters_id_Comments: Record<string, ChapterComment[]>;
  user_tales: Tale[];
}
