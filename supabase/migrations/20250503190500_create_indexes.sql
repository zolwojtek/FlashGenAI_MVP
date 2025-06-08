-- Migration: create_indexes
-- Description: Creates indexes for FlashGenAI application
-- Created at: 2025-05-03 19:05:00 UTC

-- Create index for flashcard_sets.user_id
-- Improves performance when retrieving sets belonging to a specific user
create index if not exists flashcard_sets_user_id_idx on public.flashcard_sets(user_id);

-- Create index for flashcards.set_id
-- Improves performance when retrieving flashcards belonging to a specific set
create index if not exists flashcards_set_id_idx on public.flashcards(set_id);

-- Create index for source_texts.set_id
-- Improves performance when retrieving the source text for a specific set
create index if not exists source_texts_set_id_idx on public.source_texts(set_id);

-- Create index for generation_logs.user_id
-- Improves performance when retrieving generation logs for a specific user
create index if not exists generation_logs_user_id_idx on public.generation_logs(user_id);

-- Create index for generation_logs.set_id
-- Improves performance when retrieving generation logs for a specific set
create index if not exists generation_logs_set_id_idx on public.generation_logs(set_id); 