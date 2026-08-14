import { createClient } from '@supabase/supabase-js';
import { DatabaseState, UserProfile, ChapterComment, UserSkillsPoints, Tale } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fygcrtlqrsjzjocckkhe.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_SCec_Ofgz4bGHaZYjWgqsA_piUHfmfA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const STORAGE_KEY = 'learn_with_legends_db_v1';

// Initial local fallback state
const defaultState: DatabaseState = {
  user_profile: null,
  user_comments: [],
  user_skills_points: {
    Leader: 3,
    Plan: 2,
    Win4All: 5,
    Listen: 4,
    Recharge: 2,
  },
  chapters_id_Liked: ['atlantis-ch1'],
  chapters_id_Views: ['atlantis-ch1', 'atlantis-ch2'],
  chapters_id_Comments: {
    'atlantis-ch1': [
      {
        id: 'c1',
        chapter_id: 'atlantis-ch1',
        user_id: 'u_demo1',
        user_name: 'Aria Vale',
        user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        text: 'The line about the wind knowing the way home gave me actual chills. This is why I open this app every morning.',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'c2',
        chapter_id: 'atlantis-ch1',
        user_id: 'u_demo2',
        user_name: 'Demo Reader',
        user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        text: 'Reading this with the forest ambience on — the gate appearing between the oaks felt real.',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'c3',
        chapter_id: 'atlantis-ch1',
        user_id: 'u_demo3',
        user_name: 'Rowan Oak',
        user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        text: 'Elowen is always right and Rowan never listens. Classic. Five stars.',
        created_at: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ]
  },
  user_tales: []
};

export function getLocalDb(): DatabaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

export function saveLocalDb(state: DatabaseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('LocalStorage save warning:', e);
  }
}

export function calculateAge(dobString: string): number {
  if (!dobString) return 20; // Default adult if missing
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Comments Daily Limit (Max 10 per day)
export function getDailyCommentsCount(userId: string): number {
  const db = getLocalDb();
  const todayStr = new Date().toISOString().split('T')[0];
  const count = db.user_comments.filter(
    (c) => c.user_id === userId && c.created_at.startsWith(todayStr)
  ).length;
  return count;
}

// ========================================================
// SUPABASE API INTEGRATION METHODS
// ========================================================

/**
 * Sync user_profile to Supabase table
 */
export async function syncUserProfileToSupabase(profile: UserProfile): Promise<void> {
  try {
    const { error } = await supabase.from('user_profile').upsert({
      user_id: profile.user_id,
      name: profile.name,
      email: profile.email,
      gender: profile.gender,
      date_of_birth: profile.date_of_birth,
      age: profile.age,
      language: profile.language,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
    });
    if (error) console.warn('Supabase user_profile sync warning:', error.message);
  } catch (e) {
    console.warn('Supabase profile sync offline/fallback:', e);
  }
}

/**
 * Sync user_skills_points to Supabase table
 */
export async function syncSkillPointsToSupabase(userId: string, points: UserSkillsPoints): Promise<void> {
  try {
    const { error } = await supabase.from('user_skills_points').upsert({
      user_id: userId,
      leader_points: points.Leader,
      plan_points: points.Plan,
      win4all_points: points.Win4All,
      listen_points: points.Listen,
      recharge_points: points.Recharge,
      updated_at: new Date().toISOString(),
    });
    if (error) console.warn('Supabase skills sync warning:', error.message);
  } catch (e) {
    console.warn('Supabase skills sync fallback:', e);
  }
}

/**
 * Add chapter like to chapters_id_liked table
 */
export async function syncChapterLikeToSupabase(userId: string, chapterId: string, isLiked: boolean): Promise<void> {
  try {
    if (isLiked) {
      await supabase.from('chapters_id_liked').upsert({
        user_id: userId,
        chapter_id: chapterId,
      });
    } else {
      await supabase.from('chapters_id_liked').delete().match({ user_id: userId, chapter_id: chapterId });
    }
  } catch (e) {
    console.warn('Supabase likes sync fallback:', e);
  }
}

/**
 * Record chapter view in chapters_id_views table
 */
export async function syncChapterViewToSupabase(userId: string, chapterId: string): Promise<void> {
  try {
    await supabase.from('chapters_id_views').insert({
      user_id: userId,
      chapter_id: chapterId,
    });
  } catch (e) {
    console.warn('Supabase views sync fallback:', e);
  }
}

/**
 * Sync comment to user_comments table
 */
export async function syncCommentToSupabase(comment: ChapterComment): Promise<void> {
  try {
    await supabase.from('user_comments').insert({
      id: comment.id,
      chapter_id: comment.chapter_id,
      user_id: comment.user_id,
      user_name: comment.user_name,
      user_avatar: comment.user_avatar,
      text: comment.text,
      created_at: comment.created_at,
    });
  } catch (e) {
    console.warn('Supabase comments sync fallback:', e);
  }
}

/**
 * Update/Edit an existing comment
 */
export async function syncUpdateCommentToSupabase(commentId: string, newText: string): Promise<void> {
  try {
    await supabase.from('user_comments').update({ text: newText }).eq('id', commentId);
  } catch (e) {
    console.warn('Supabase update comment fallback:', e);
  }
}

/**
 * Delete a comment
 */
export async function syncDeleteCommentToSupabase(commentId: string): Promise<void> {
  try {
    await supabase.from('user_comments').delete().eq('id', commentId);
  } catch (e) {
    console.warn('Supabase delete comment fallback:', e);
  }
}

/**
 * Sync custom tale to tales_texts table
 */
export async function syncTaleToSupabase(tale: Tale): Promise<void> {
  try {
    await supabase.from('tales_texts').insert({
      id: tale.id,
      realm_id: tale.realmId,
      title: tale.title,
      subtitle: tale.subtitle,
      cover_image: tale.coverImage,
      skill: tale.skill,
      views_count: tale.viewsCount,
      likes_count: tale.likesCount,
      comments_count: tale.commentsCount,
      is_custom_user_tale: tale.isCustomUserTale,
      story_content: tale.storyContent || '',
    });
  } catch (e) {
    console.warn('Supabase tale sync fallback:', e);
  }
}

