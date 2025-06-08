-- Migration: enable_extensions
-- Description: Enables necessary PostgreSQL extensions for FlashGenAI application
-- Created at: 2025-05-03 19:03:00 UTC

-- Enable UUID extension for generating UUIDs
create extension if not exists "uuid-ossp";

-- Enable pgcrypto for additional cryptographic functions
create extension if not exists "pgcrypto"; 