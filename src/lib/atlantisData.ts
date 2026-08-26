import enData from '../data/chapters/atlantis/enFiveCrystals.json';
import { Language } from '../types';
import { ASSETS, resolveAssetUrl } from './assetRegistry';

export interface ActItem {
  id: string;
  chapterNumber: number;
  actKey: string; // e.g. 'ch1-act1', 'ch1-female', 'ch1-male', 'ch1-act2', 'ch2-act1', 'ch2-dialog', 'ch2-choice-best', etc.
  type: 'narrative' | 'character' | 'dialogue' | 'choice';
  chapterTitle: string;
  subtitle: string;
  actTitle: string;
  mp4: string;
  audio?: string;
  vtt?: string;
  vtt_es?: string;
  posterImage: string;
  text?: string;
  images?: string[];
  characterName?: string;
  role?: string;
  avatarUrl?: string;
  gender?: 'female' | 'male';
  sceneNarrative?: string;
  dialogue?: Array<{
    voice?: string;
    speaker: string;
    text: string;
  }>;
  choiceType?: 'Best' | 'Safe' | 'Weak' | 'Harmful';
  choiceTitle?: string;
  femaleAvatar?: string;
  maleAvatar?: string;
}

const DEFAULT_BG = ASSETS.realmAtlantisJpg;
const FEMALE_AVATAR = ASSETS.avatarAlethea;
const MALE_AVATAR = ASSETS.avatarElion;

export function getAtlantisActItems(lang: Language = 'EN', userGender: 'female' | 'male' | string = 'female'): ActItem[] {
  const data = enData; // Primary source
  const items: ActItem[] = [];

  if (!data || !data.chapters) return items;

  const isMaleUser = userGender === 'male' || (typeof userGender === 'string' && userGender.toLowerCase().includes('male') && !userGender.toLowerCase().includes('female'));

  data.chapters.forEach((ch: any) => {
    const chapterFemaleAvatar = resolveAssetUrl(ch.Female_Avatar, FEMALE_AVATAR);
    const chapterMaleAvatar = resolveAssetUrl(ch.Male_Avatar, MALE_AVATAR);

    // 1. Chapter 1
    if (ch.chapter === 1) {
      // Act 1 Narrative
      if (ch.act1) {
        const isSpanish = lang === 'ES';
        const primaryVtt = isSpanish
          ? (ch.act1.vtt_es || ASSETS.introEsVtt || 'https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub/Atlantis/intro_es.vtt')
          : resolveAssetUrl(ch.act1.vtt, ASSETS.introVtt);

        items.push({
          id: 'atlantis-ch1-act1',
          chapterNumber: 1,
          actKey: 'ch1-act1',
          type: 'narrative',
          chapterTitle: ch.title,
          subtitle: ch.subtitle,
          actTitle: ch.act1.title || 'The Heart of Atlantis & The Five Crystals',
          mp4: resolveAssetUrl(ch.act1.mp4, ASSETS.realmAtlantisMp4),
          audio: resolveAssetUrl(ch.act1.audio || 'https://fygcrtlqrsjzjocckkhe.supabase.co/storage/v1/object/public/LegPub/Atlantis/intro_en.mp3', ASSETS.introEnMp3),
          vtt: primaryVtt,
          vtt_es: resolveAssetUrl(ch.act1.vtt_es, ASSETS.introEsVtt),
          posterImage: DEFAULT_BG,
          text: ch.act1.text,
          femaleAvatar: chapterFemaleAvatar,
          maleAvatar: chapterMaleAvatar
        });
      }

      const femaleActItem: ActItem | null = ch.female_act ? {
        id: 'atlantis-ch1-female',
        chapterNumber: 1,
        actKey: 'ch1-female',
        type: 'character',
        chapterTitle: ch.title,
        subtitle: ch.subtitle,
        actTitle: ch.female_act.title || `Alethea — ${ch.female_act.role || 'Guardian of the Ancient Archives'}`,
        mp4: resolveAssetUrl(ch.female_act.mp4, ASSETS.aletheaMp4),
        posterImage: DEFAULT_BG,
        text: ch.female_act.description,
        characterName: ch.female_act.characterName || 'Alethea',
        role: ch.female_act.role || 'Guardian of the Ancient Archives',
        avatarUrl: chapterFemaleAvatar,
        gender: 'female',
        femaleAvatar: chapterFemaleAvatar,
        maleAvatar: chapterMaleAvatar
      } : null;

      const maleActItem: ActItem | null = ch.male_act ? {
        id: 'atlantis-ch1-male',
        chapterNumber: 1,
        actKey: 'ch1-male',
        type: 'character',
        chapterTitle: ch.title,
        subtitle: ch.subtitle,
        actTitle: ch.male_act.title || `Elion — ${ch.male_act.role || "Atlantis's Most Celebrated Warrior"}`,
        mp4: resolveAssetUrl(ch.male_act.mp4, ASSETS.elionMp4),
        posterImage: DEFAULT_BG,
        text: ch.male_act.description,
        characterName: ch.male_act.characterName || 'Elion',
        role: ch.male_act.role || "Atlantis's Most Celebrated Warrior",
        avatarUrl: chapterMaleAvatar,
        gender: 'male',
        femaleAvatar: chapterFemaleAvatar,
        maleAvatar: chapterMaleAvatar
      } : null;

      // If user is male, show male_act first; if female, show female_act first
      if (isMaleUser) {
        if (maleActItem) items.push(maleActItem);
        if (femaleActItem) items.push(femaleActItem);
      } else {
        if (femaleActItem) items.push(femaleActItem);
        if (maleActItem) items.push(maleActItem);
      }

      // Act 2 Narrative (The Beginning)
      if (ch.act2) {
        items.push({
          id: 'atlantis-ch1-act2',
          chapterNumber: 1,
          actKey: 'ch1-act2',
          type: 'narrative',
          chapterTitle: ch.title,
          subtitle: ch.subtitle,
          actTitle: ch.act2.title || 'The Beginning',
          mp4: resolveAssetUrl(ch.mp4, ASSETS.act2Mp4),
          posterImage: (ch.act2.images && ch.act2.images[0]) || DEFAULT_BG,
          images: ch.act2.images,
          text: ch.act2.text,
          femaleAvatar: chapterFemaleAvatar,
          maleAvatar: chapterMaleAvatar
        });
      }
    }

    // 2. Chapter 2
    if (ch.chapter === 2) {
      // Act 1 Narrative (The Celebration and the Darkness)
      if (ch.act1 || ch.text) {
        items.push({
          id: 'atlantis-ch2-act1',
          chapterNumber: 2,
          actKey: 'ch2-act1',
          type: 'narrative',
          chapterTitle: ch.title,
          subtitle: ch.subtitle || '',
          actTitle: ch.act1?.title || ch.title || 'The Celebration',
          mp4: resolveAssetUrl(ch.mp4, ASSETS.realmAtlantisMp4),
          posterImage: DEFAULT_BG,
          text: ch.act1?.text || ch.text,
          femaleAvatar: chapterFemaleAvatar,
          maleAvatar: chapterMaleAvatar
        });
      }

      // Opening Dialogue (Elion & Alethea)
      if (ch.dialog && ch.dialog.length > 0) {
        items.push({
          id: 'atlantis-ch2-dialog',
          chapterNumber: 2,
          actKey: 'ch2-dialog',
          type: 'dialogue',
          chapterTitle: ch.title,
          subtitle: ch.subtitle,
          actTitle: 'What do you chose',
          mp4: resolveAssetUrl(ch.mp4, ASSETS.realmAtlantisMp4),
          posterImage: DEFAULT_BG,
          sceneNarrative: ch.act1?.text || 'The Day of Founding began with music. Citizens filled the plaza. Children released glowing lanterns. The Heart of Atlantis shone brighter than ever before.',
          dialogue: ch.dialog,
          femaleAvatar: chapterFemaleAvatar,
          maleAvatar: chapterMaleAvatar
        });
      }

      // Choices
      if (ch.choices && Array.isArray(ch.choices)) {
        ch.choices.forEach((choice: any, cIdx: number) => {
          items.push({
            id: `atlantis-ch2-choice-${choice.type?.toLowerCase() || cIdx}`,
            chapterNumber: 2,
            actKey: `ch2-choice-${choice.type?.toLowerCase() || cIdx}`,
            type: 'choice',
            chapterTitle: ch.title,
            subtitle: ch.subtitle,
            actTitle: choice.title || `Choice: ${choice.type}`,
            mp4: resolveAssetUrl(ch.mp4, ASSETS.realmAtlantisMp4),
            posterImage: DEFAULT_BG,
            choiceType: choice.type,
            choiceTitle: choice.title,
            sceneNarrative: choice.narrative || `Elion and Alethea face the emergency controls under pressure.`,
            dialogue: choice.dialog,
            femaleAvatar: chapterFemaleAvatar,
            maleAvatar: chapterMaleAvatar
          });
        });
      }
    }
  });

  return items;
}
