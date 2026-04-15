-- ===============================================================
-- OMNI-AI SUPABASE BLUEPRINT
-- ===============================================================
-- This SQL file defines the equivalent schema for Supabase (PostgreSQL).
-- Run these commands in the Supabase SQL Editor.

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  uid UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  credits NUMERIC DEFAULT 100 NOT NULL,
  role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Chats Table
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID REFERENCES public.users(uid) ON DELETE CASCADE NOT NULL,
  messages JSONB DEFAULT '[]'::JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Videos Table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID REFERENCES public.users(uid) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Map Nodes Table
CREATE TABLE IF NOT EXISTS public.map_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID REFERENCES public.users(uid) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  uri TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_nodes ENABLE ROW LEVEL SECURITY;

-- Policies (Owner only access)
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = uid);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = uid);

CREATE POLICY "Users can manage their own chats" ON public.chats FOR ALL USING (auth.uid() = uid);
CREATE POLICY "Users can manage their own videos" ON public.videos FOR ALL USING (auth.uid() = uid);
CREATE POLICY "Users can manage their own map nodes" ON public.map_nodes FOR ALL USING (auth.uid() = uid);
