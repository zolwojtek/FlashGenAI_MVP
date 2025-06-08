-- Migration: create_tables
-- Description: Creates all tables for FlashGenAI application
-- Created at: 2025-05-03 19:04:00 UTC

-- Note: auth.users is created automatically by Supabase Auth


-- Create flashcard_sets table
-- This table references auth.users
create table if not exists public.flashcard_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) <= 255 and char_length(title) > 0),
  created_at timestamp with time zone default now() not null,
  last_updated_at timestamp with time zone null,
  total_cards_count integer default 0 not null
);

-- Enable RLS for flashcard_sets
alter table public.flashcard_sets enable row level security;

-- Create flashcards table
-- This table references flashcard_sets
create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.flashcard_sets(id) on delete cascade,
  front_content text not null check (char_length(front_content) <= 500 and char_length(front_content) > 0),
  back_content text not null check (char_length(back_content) <= 1000 and char_length(back_content) > 0),
  creation_mode text not null check (creation_mode in ('manual', 'ai', 'ai_edited')) default 'manual',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() null
);

-- Enable RLS for flashcards
alter table public.flashcards enable row level security;

-- Create source_texts table
-- This table references flashcard_sets
create table if not exists public.source_texts (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null unique references public.flashcard_sets(id) on delete cascade,
  content text not null check (char_length(content) >= 1000 and char_length(content) <= 10000),
  created_at timestamp with time zone default now() not null
);

-- Enable RLS for source_texts
alter table public.source_texts enable row level security;

-- Create generation_limits table
-- This table references auth.users
create table if not exists public.generation_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  used_count integer not null default 0 check (used_count >= 0 and used_count <= 5),
  primary key (user_id, date)
);

-- Enable RLS for generation_limits
alter table public.generation_limits enable row level security;

-- Create generation_logs table
-- This table references both auth.users and flashcard_sets
create table if not exists public.generation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  set_id uuid not null references public.flashcard_sets(id) on delete cascade,
  generated_count integer not null default 0 check (generated_count >= 0),
  accepted_count integer not null default 0 check (accepted_count >= 0),
  rejected_count integer not null default 0 check (rejected_count >= 0),
  generated_at timestamp with time zone default now() not null
);

-- Enable RLS for generation_logs
alter table public.generation_logs enable row level security; 