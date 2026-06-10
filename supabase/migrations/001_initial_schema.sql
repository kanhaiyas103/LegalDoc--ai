create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_size bigint not null check (file_size > 0),
  upload_date timestamptz not null default now(),
  storage_url text not null,
  text_content text,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'indexed', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete set null,
  user_id uuid not null references public.users(id) on delete cascade,
  tool_used text not null,
  result jsonb not null,
  markdown text,
  risk_score integer check (risk_score between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  title text not null default 'New legal chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  citations jsonb not null default '[]'::jsonb,
  confidence numeric(5,4),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  chunk_index integer not null check (chunk_index >= 0),
  content text not null,
  token_count integer not null default 0 check (token_count >= 0),
  page_number integer,
  section_title text,
  embedding vector(1536),
  search_vector tsvector generated always as (to_tsvector('english', content)) stored,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create index if not exists idx_documents_user_upload_date on public.documents(user_id, upload_date desc) where deleted_at is null;
create index if not exists idx_documents_user_file_name on public.documents using gin (to_tsvector('english', file_name));
create index if not exists idx_analyses_user_created_at on public.analyses(user_id, created_at desc);
create index if not exists idx_analyses_document_created_at on public.analyses(document_id, created_at desc);
create index if not exists idx_chat_sessions_user_updated_at on public.chat_sessions(user_id, updated_at desc);
create index if not exists idx_chat_messages_session_created_at on public.chat_messages(session_id, created_at asc);
create index if not exists idx_audit_logs_user_created_at on public.audit_logs(user_id, created_at desc);
create index if not exists idx_document_chunks_document on public.document_chunks(document_id, chunk_index);
create index if not exists idx_document_chunks_keyword on public.document_chunks using gin(search_vector);
create index if not exists idx_document_chunks_embedding on public.document_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger set_documents_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

create trigger set_chat_sessions_updated_at
before update on public.chat_sessions
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        avatar_url = excluded.avatar_url,
        updated_at = now();
  return new;
end;
$$;

create trigger on_auth_user_created
after insert or update on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.users enable row level security;
alter table public.documents enable row level security;
alter table public.analyses enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.audit_logs enable row level security;
alter table public.document_chunks enable row level security;

create policy "Users can read their own profile"
on public.users for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can manage their own documents"
on public.documents for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage their own analyses"
on public.analyses for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage their own chat sessions"
on public.chat_sessions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage their own chat messages"
on public.chat_messages for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read their own audit logs"
on public.audit_logs for select
using (auth.uid() = user_id);

create policy "Users can insert their own audit logs"
on public.audit_logs for insert
with check (auth.uid() = user_id);

create policy "Users can manage their own chunks"
on public.document_chunks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.match_document_chunks(
  query_embedding vector(1536),
  match_user_id uuid,
  match_document_id uuid default null,
  match_count integer default 8
)
returns table (
  id uuid,
  document_id uuid,
  chunk_index integer,
  content text,
  page_number integer,
  section_title text,
  similarity double precision
)
language sql
stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.chunk_index,
    dc.content,
    dc.page_number,
    dc.section_title,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  where dc.user_id = match_user_id
    and dc.embedding is not null
    and (match_document_id is null or dc.document_id = match_document_id)
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;

create or replace function public.keyword_document_chunks(
  query_text text,
  match_user_id uuid,
  match_document_id uuid default null,
  match_count integer default 8
)
returns table (
  id uuid,
  document_id uuid,
  chunk_index integer,
  content text,
  page_number integer,
  section_title text,
  rank real
)
language sql
stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.chunk_index,
    dc.content,
    dc.page_number,
    dc.section_title,
    ts_rank_cd(dc.search_vector, websearch_to_tsquery('english', query_text)) as rank
  from public.document_chunks dc
  where dc.user_id = match_user_id
    and (match_document_id is null or dc.document_id = match_document_id)
    and dc.search_vector @@ websearch_to_tsquery('english', query_text)
  order by rank desc
  limit match_count;
$$;
