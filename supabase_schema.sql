-- ========================================================
-- LEARN WITH LEGENDS - SUPABASE DATABASE SCHEMA
-- ========================================================

-- 1. USER PROFILES TABLE
-- Stores traveler profiles including gender (female/male) and date of birth
CREATE TABLE IF NOT EXISTS public.user_profile (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    gender TEXT CHECK (gender IN ('female', 'male')) DEFAULT 'female',
    date_of_birth DATE NOT NULL DEFAULT '1998-05-15',
    age INTEGER DEFAULT 20,
    language TEXT DEFAULT 'EN',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER SKILL POINTS TABLE
-- Stores accumulated points for Leader, Plan, Win4All, Listen, Recharge
CREATE TABLE IF NOT EXISTS public.user_skills_points (
    user_id TEXT PRIMARY KEY REFERENCES public.user_profile(user_id) ON DELETE CASCADE,
    leader_points INTEGER DEFAULT 0,
    plan_points INTEGER DEFAULT 0,
    win4all_points INTEGER DEFAULT 0,
    listen_points INTEGER DEFAULT 0,
    recharge_points INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CHAPTERS LIKED TABLE (chapters_id_Liked)
-- Tracks liked chapter IDs per user
CREATE TABLE IF NOT EXISTS public.chapters_id_liked (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, chapter_id)
);

-- 4. CHAPTER COMMENTS TABLE (chapters_id_Comments & user_comments)
-- Stores comments left on chapter legends
CREATE TABLE IF NOT EXISTS public.user_comments (
    id TEXT PRIMARY KEY,
    chapter_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TALES TEXTS TABLE (Custom User Tales & Story Content)
-- Stores user-submitted custom tales and story texts
CREATE TABLE IF NOT EXISTS public.tales_texts (
    id TEXT PRIMARY KEY,
    realm_id TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    cover_image TEXT,
    skill TEXT DEFAULT 'Win4All',
    views_count INTEGER DEFAULT 1,
    likes_count INTEGER DEFAULT 1,
    comments_count INTEGER DEFAULT 0,
    is_custom_user_tale BOOLEAN DEFAULT TRUE,
    story_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. USER STATS TABLE (user_stats)
-- Tracks the number of views for each language and skill combination
CREATE TABLE IF NOT EXISTS public.user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    language TEXT NOT NULL,
    skill TEXT NOT NULL,
    views_count INTEGER NOT NULL DEFAULT 0,
    count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, language, skill)
);

-- Enable Row Level Security (RLS) for public access
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters_id_liked ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tales_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write access policies
CREATE POLICY "Allow public select user_profile" ON public.user_profile FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_profile" ON public.user_profile FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update user_profile" ON public.user_profile FOR UPDATE USING (true);

CREATE POLICY "Allow public select user_skills_points" ON public.user_skills_points FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update user_skills_points" ON public.user_skills_points FOR ALL USING (true);

CREATE POLICY "Allow public select chapters_id_liked" ON public.chapters_id_liked FOR SELECT USING (true);
CREATE POLICY "Allow public insert chapters_id_liked" ON public.chapters_id_liked FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete chapters_id_liked" ON public.chapters_id_liked FOR DELETE USING (true);

CREATE POLICY "Allow public select user_comments" ON public.user_comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_comments" ON public.user_comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select tales_texts" ON public.tales_texts FOR SELECT USING (true);
CREATE POLICY "Allow public insert tales_texts" ON public.tales_texts FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select user_stats" ON public.user_stats FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_stats" ON public.user_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update user_stats" ON public.user_stats FOR UPDATE USING (true);
