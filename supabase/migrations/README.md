# FlashGenAI Database Migrations

This directory contains Supabase migration files for the FlashGenAI application database.

## Migration Files

1. **20250503190300_enable_extensions.sql**  
   Enables necessary PostgreSQL extensions:
   - uuid-ossp for UUID generation
   - pgcrypto for cryptographic functions

2. **20250503190400_create_tables.sql**  
   Creates all database tables for the application including:
   - flashcard_sets
   - flashcards
   - source_texts
   - generation_limits
   - generation_logs

3. **20250503190500_create_indexes.sql**  
   Creates indexes for improved query performance.

4. **20250503190600_create_triggers_and_functions.sql**  
   Creates database triggers and functions for:
   - Automatically updating the total_cards_count in a flashcard set
   - Automatically updating the updated_at timestamp for flashcards
   - Managing generation limits (5 per day in UTC)

5. **20250503190700_create_rls_policies.sql**  
   Creates Row Level Security (RLS) policies for all tables to ensure data privacy and security.

## Database Schema

The database schema follows the plan outlined in `.ai/db-plan.md`, which includes:
- User management
- Flashcard sets and individual flashcards
- Source text storage for AI generation
- Generation limits for free tier users (5 per day, based on UTC timezone)
- Generation logs for tracking usage

## Running Migrations

Migrations are managed by the Supabase CLI. To run these migrations:

```bash
supabase migration up
```

To create new migrations:

```bash
supabase migration new <migration_name>
```

For more information, refer to the [Supabase CLI documentation](https://supabase.com/docs/reference/cli/supabase-migration). 