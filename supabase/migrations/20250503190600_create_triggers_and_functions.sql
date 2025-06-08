-- Migration: create_triggers_and_functions
-- Description: Creates triggers and functions for FlashGenAI application
-- Created at: 2025-05-03 19:06:00 UTC

-------------------------------------------
-- Update flashcard_sets.total_cards_count
-------------------------------------------

-- Function to update the total_cards_count when flashcards are added or removed
create or replace function public.update_flashcard_sets_total_cards_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.flashcard_sets
    set total_cards_count = total_cards_count + 1
    where id = new.set_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.flashcard_sets
    set total_cards_count = total_cards_count - 1
    where id = old.set_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger for updating total_cards_count when flashcards are added
create trigger flashcards_after_insert
after insert on public.flashcards
for each row
execute function public.update_flashcard_sets_total_cards_count();

-- Trigger for updating total_cards_count when flashcards are deleted
create trigger flashcards_after_delete
after delete on public.flashcards
for each row
execute function public.update_flashcard_sets_total_cards_count();

-------------------------------------------
-- Update flashcards.updated_at
-------------------------------------------

-- Function to update the updated_at timestamp when a flashcard is updated
create or replace function public.update_flashcard_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for updating updated_at timestamp
create trigger flashcards_before_update
before update on public.flashcards
for each row
execute function public.update_flashcard_updated_at();

-------------------------------------------
-- Generation limits management
-------------------------------------------

-- Function to increment the generation_used count for a user on a specific day
create or replace function public.increment_generation_used(p_user_id uuid)
returns boolean as $$
declare
  v_current_date date;
  v_current_count integer;
begin
  -- Use UTC for all date calculations
  v_current_date := (now() at time zone 'UTC')::date;
  
  -- Check if a record exists for today
  select used_count into v_current_count
  from public.generation_limits
  where user_id = p_user_id and date = v_current_date;
  
  if not found then
    -- Create a new record with used_count = 1
    insert into public.generation_limits (user_id, date, used_count)
    values (p_user_id, v_current_date, 1);
    return true;
  elsif v_current_count < 5 then
    -- Increment the existing record
    update public.generation_limits
    set used_count = used_count + 1
    where user_id = p_user_id and date = v_current_date;
    return true;
  else
    -- User has reached the limit
    return false;
  end if;
end;
$$ language plpgsql security definer;

-- Function to check the remaining generation limit for a user
create or replace function public.check_generation_limit(p_user_id uuid)
returns integer as $$
declare
  v_current_date date;
  v_current_count integer;
begin
  -- Use UTC for all date calculations
  v_current_date := (now() at time zone 'UTC')::date;
  
  -- Check if a record exists for today
  select used_count into v_current_count
  from public.generation_limits
  where user_id = p_user_id and date = v_current_date;
  
  if not found then
    -- No generations used today
    return 5;
  else
    -- Return remaining generations
    return 5 - v_current_count;
  end if;
end;
$$ language plpgsql security definer; 