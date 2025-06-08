-- Migration: create_rls_policies
-- Description: Creates Row Level Security policies for FlashGenAI application
-- Created at: 2025-05-03 19:07:00 UTC

-------------------------------------------
-- RLS policies for flashcard_sets
-------------------------------------------

-- Policies for authenticated users

-- Policy for selecting flashcard sets (users can only read their own sets)
create policy "Users can select their own flashcard sets"
on public.flashcard_sets
for select
to authenticated
using (auth.uid() = user_id);

-- Policy for inserting flashcard sets (users can only insert their own sets)
create policy "Users can insert their own flashcard sets"
on public.flashcard_sets
for insert
to authenticated
with check (auth.uid() = user_id);

-- Policy for updating flashcard sets (users can only update their own sets)
create policy "Users can update their own flashcard sets"
on public.flashcard_sets
for update
to authenticated
using (auth.uid() = user_id);

-- Policy for deleting flashcard sets (users can only delete their own sets)
create policy "Users can delete their own flashcard sets"
on public.flashcard_sets
for delete
to authenticated
using (auth.uid() = user_id);

-- Policies for anonymous users (deny all)
create policy "Deny anonymous users from selecting flashcard sets"
on public.flashcard_sets
for select
to anon
using (false);

-------------------------------------------
-- RLS policies for flashcards
-------------------------------------------

-- Policies for authenticated users

-- Policy for selecting flashcards (users can only read flashcards from their own sets)
create policy "Users can select flashcards from their own sets"
on public.flashcards
for select
to authenticated
using (exists (
  select 1 from public.flashcard_sets
  where id = flashcards.set_id and user_id = auth.uid()
));

-- Policy for inserting flashcards (users can only insert flashcards into their own sets)
create policy "Users can insert flashcards into their own sets"
on public.flashcards
for insert
to authenticated
with check (exists (
  select 1 from public.flashcard_sets
  where id = set_id and user_id = auth.uid()
));

-- Policy for updating flashcards (users can only update flashcards from their own sets)
create policy "Users can update flashcards from their own sets"
on public.flashcards
for update
to authenticated
using (exists (
  select 1 from public.flashcard_sets
  where id = flashcards.set_id and user_id = auth.uid()
));

-- Policy for deleting flashcards (users can only delete flashcards from their own sets)
create policy "Users can delete flashcards from their own sets"
on public.flashcards
for delete
to authenticated
using (exists (
  select 1 from public.flashcard_sets
  where id = flashcards.set_id and user_id = auth.uid()
));

-- Policies for anonymous users (deny all)
create policy "Deny anonymous users from selecting flashcards"
on public.flashcards
for select
to anon
using (false);

-------------------------------------------
-- RLS policies for source_texts
-------------------------------------------

-- Policies for authenticated users

-- Policy for selecting source texts (users can only read source texts from their own sets)
create policy "Users can select source texts from their own sets"
on public.source_texts
for select
to authenticated
using (exists (
  select 1 from public.flashcard_sets
  where id = source_texts.set_id and user_id = auth.uid()
));

-- Policy for inserting source texts (users can only insert source texts into their own sets)
create policy "Users can insert source texts into their own sets"
on public.source_texts
for insert
to authenticated
with check (exists (
  select 1 from public.flashcard_sets
  where id = set_id and user_id = auth.uid()
));

-- Policy for updating source texts (users can only update source texts from their own sets)
create policy "Users can update source texts from their own sets"
on public.source_texts
for update
to authenticated
using (exists (
  select 1 from public.flashcard_sets
  where id = source_texts.set_id and user_id = auth.uid()
));

-- Policy for deleting source texts (users can only delete source texts from their own sets)
create policy "Users can delete source texts from their own sets"
on public.source_texts
for delete
to authenticated
using (exists (
  select 1 from public.flashcard_sets
  where id = source_texts.set_id and user_id = auth.uid()
));

-- Policies for anonymous users (deny all)
create policy "Deny anonymous users from selecting source texts"
on public.source_texts
for select
to anon
using (false);

-------------------------------------------
-- RLS policies for generation_limits
-------------------------------------------

-- Policies for authenticated users

-- Policy for selecting generation limits (users can only read their own limits)
create policy "Users can select their own generation limits"
on public.generation_limits
for select
to authenticated
using (auth.uid() = user_id);

-- Policy for inserting generation limits (users can only insert their own limits)
create policy "Users can insert their own generation limits"
on public.generation_limits
for insert
to authenticated
with check (auth.uid() = user_id);

-- Policy for updating generation limits (users can only update their own limits)
create policy "Users can update their own generation limits"
on public.generation_limits
for update
to authenticated
using (auth.uid() = user_id);

-- Policies for anonymous users (deny all)
create policy "Deny anonymous users from selecting generation limits"
on public.generation_limits
for select
to anon
using (false);

-------------------------------------------
-- RLS policies for generation_logs
-------------------------------------------

-- Policies for authenticated users

-- Policy for selecting generation logs (users can only read their own logs)
create policy "Users can select their own generation logs"
on public.generation_logs
for select
to authenticated
using (auth.uid() = user_id);

-- Policy for inserting generation logs (users can only insert their own logs)
create policy "Users can insert their own generation logs"
on public.generation_logs
for insert
to authenticated
with check (auth.uid() = user_id);

-- Policy for updating generation logs (users can only update their own logs)
create policy "Users can update generation logs"
on public.generation_logs
for update
to authenticated
using (auth.uid() = user_id);

-- Policies for anonymous users (deny all)
create policy "Deny anonymous users from selecting generation logs"
on public.generation_logs
for select
to anon
using (false); 