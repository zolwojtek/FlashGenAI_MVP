-- Migration: disable_rls_policies
-- Description: Disables all Row Level Security policies for FlashGenAI application
-- Created at: 2025-05-03 19:08:00 UTC

-------------------------------------------
-- Drop RLS policies for flashcard_sets
-------------------------------------------
drop policy if exists "Users can select their own flashcard sets" on public.flashcard_sets;
drop policy if exists "Users can insert their own flashcard sets" on public.flashcard_sets;
drop policy if exists "Users can update their own flashcard sets" on public.flashcard_sets;
drop policy if exists "Users can delete their own flashcard sets" on public.flashcard_sets;
drop policy if exists "Deny anonymous users from selecting flashcard sets" on public.flashcard_sets;

-------------------------------------------
-- Drop RLS policies for flashcards
-------------------------------------------
drop policy if exists "Users can select flashcards from their own sets" on public.flashcards;
drop policy if exists "Users can insert flashcards into their own sets" on public.flashcards;
drop policy if exists "Users can update flashcards from their own sets" on public.flashcards;
drop policy if exists "Users can delete flashcards from their own sets" on public.flashcards;
drop policy if exists "Deny anonymous users from selecting flashcards" on public.flashcards;

-------------------------------------------
-- Drop RLS policies for source_texts
-------------------------------------------
drop policy if exists "Users can select source texts from their own sets" on public.source_texts;
drop policy if exists "Users can insert source texts into their own sets" on public.source_texts;
drop policy if exists "Users can update source texts from their own sets" on public.source_texts;
drop policy if exists "Users can delete source texts from their own sets" on public.source_texts;
drop policy if exists "Deny anonymous users from selecting source texts" on public.source_texts;

-------------------------------------------
-- Drop RLS policies for generation_limits
-------------------------------------------
drop policy if exists "Users can select their own generation limits" on public.generation_limits;
drop policy if exists "Users can insert their own generation limits" on public.generation_limits;
drop policy if exists "Users can update their own generation limits" on public.generation_limits;
drop policy if exists "Deny anonymous users from selecting generation limits" on public.generation_limits;

-------------------------------------------
-- Drop RLS policies for generation_logs
-------------------------------------------
drop policy if exists "Users can select their own generation logs" on public.generation_logs;
drop policy if exists "Users can insert their own generation logs" on public.generation_logs;
drop policy if exists "Users can update generation logs" on public.generation_logs;
drop policy if exists "Deny anonymous users from selecting generation logs" on public.generation_logs;

-- Disable RLS on all tables
alter table public.flashcard_sets disable row level security;
alter table public.flashcards disable row level security;
alter table public.source_texts disable row level security;
alter table public.generation_limits disable row level security;
alter table public.generation_logs disable row level security; 