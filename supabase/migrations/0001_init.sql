-- English Tracker schema
-- Run this once in Supabase: Dashboard > SQL Editor > New query > paste > Run.
-- Every table is owned by the signed-in user and protected by Row Level Security.

create extension if not exists "pgcrypto";

-- Enums --------------------------------------------------------------------
do $$ begin
  create type grammar_status as enum ('red', 'yellow', 'green');
exception when duplicate_object then null; end $$;

do $$ begin
  create type resource_status as enum ('queue', 'active', 'done');
exception when duplicate_object then null; end $$;

-- Daily log: one row per user per day -------------------------------------
create table if not exists day_logs (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  day date not null,
  anki boolean not null default false,
  main boolean not null default false,
  steps boolean[] not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- Phrases I couldn't say ----------------------------------------------------
create table if not exists phrases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  tr text not null,
  en text not null default '',
  example text not null default '',
  source text not null default '',
  in_anki boolean not null default false,
  created_at timestamptz not null default now()
);

-- Vocabulary in three groups ------------------------------------------------
create table if not exists vocab (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  word text not null,
  meaning text not null default '',
  sentence text not null default '',
  "group" smallint not null default 1 check ("group" between 1 and 3),
  in_anki boolean not null default false,
  created_at timestamptz not null default now()
);

-- Grammar topics ------------------------------------------------------------
create table if not exists grammar_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  status grammar_status not null default 'red',
  note text not null default '',
  auto boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists grammar_topics_user_name_idx
  on grammar_topics (user_id, lower(name));

-- Writing log ---------------------------------------------------------------
create table if not exists writing_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  day date not null default current_date,
  level text not null default '',
  task text not null default '',
  errors text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Weekly note: one row per user per week (keyed by Monday) ----------------
create table if not exists weekly_notes (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  week_start date not null,
  learned text not null default '',
  hard text not null default '',
  next_focus text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, week_start)
);

-- Level tests ---------------------------------------------------------------
create table if not exists level_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  day date not null default current_date,
  bc_grammar text not null default '',
  bc_vocab text not null default '',
  bc_level text not null default '',
  ef_reading text not null default '',
  ef_listening text not null default '',
  ef_total text not null default '',
  cefr text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);

-- Resources: books, podcasts, channels... ----------------------------------
create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  type text not null default '',
  author text not null default '',
  url text not null default '',
  status resource_status not null default 'active',
  skills text[] not null default '{}',
  progress text not null default '',
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security: each user only sees and writes their own rows -------
do $$
declare t text;
begin
  foreach t in array array[
    'day_logs','phrases','vocab','grammar_topics',
    'writing_logs','weekly_notes','level_tests','resources'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "own rows" on %I', t);
    execute format(
      'create policy "own rows" on %I for all to authenticated
         using (user_id = (select auth.uid()))
         with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;
