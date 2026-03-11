-- 00001_initial_schema.sql
-- Athenaeum — initial database schema

-- ==========================================================================
-- 1. Tables
-- ==========================================================================

-- Profiles (auto-created on auth.users INSERT via trigger)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text        not null default '',
  email       text        not null,
  role        text        not null default 'member'
                          check (role in ('member', 'librarian', 'admin')),
  avatar_url  text,
  is_suspended boolean    not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Books (one row per title)
create table public.books (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  author      text        not null,
  isbn        text        unique,
  genre       text        not null default 'General',
  year        smallint,
  description text        not null default '',
  cover_url   text,
  rating      numeric(2,1) not null default 0
                          check (rating >= 0 and rating <= 5),
  ai_summary  text,
  is_archived boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- Full-text search column
  fts         tsvector generated always as (
                to_tsvector('english', coalesce(title, '') || ' ' ||
                                       coalesce(author, '') || ' ' ||
                                       coalesce(description, ''))
              ) stored
);

-- Book copies (physical items)
create table public.book_copies (
  id           uuid primary key default gen_random_uuid(),
  book_id      uuid        not null references public.books(id) on delete cascade,
  condition    text        not null default 'good'
                           check (condition in ('new', 'good', 'fair', 'poor')),
  is_available boolean     not null default true,
  created_at   timestamptz not null default now()
);

-- Loans (borrow/return events)
create table public.loans (
  id          uuid primary key default gen_random_uuid(),
  copy_id     uuid        not null references public.book_copies(id),
  member_id   uuid        not null references public.profiles(id),
  borrowed_at timestamptz not null default now(),
  due_at      timestamptz not null,
  returned_at timestamptz,
  status      text        not null default 'active'
                          check (status in ('active', 'overdue', 'returned')),
  created_at  timestamptz not null default now()
);

-- Reservations (hold queue per book)
create table public.reservations (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid        not null references public.books(id),
  member_id   uuid        not null references public.profiles(id),
  position    integer     not null,
  status      text        not null default 'waiting'
                          check (status in ('waiting', 'ready', 'fulfilled', 'cancelled', 'expired')),
  reserved_at timestamptz not null default now(),
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

-- Audit logs (append-only)
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid        references public.profiles(id),
  action      text        not null,
  entity_type text        not null,
  entity_id   uuid        not null,
  metadata    jsonb       not null default '{}',
  created_at  timestamptz not null default now()
);

-- ==========================================================================
-- 2. Indexes
-- ==========================================================================

create index idx_books_fts          on public.books using gin (fts);
create index idx_books_genre        on public.books (genre);
create index idx_books_isbn         on public.books (isbn);

create index idx_loans_member_active on public.loans (member_id)
  where status != 'returned';
create index idx_loans_copy_active   on public.loans (copy_id)
  where status != 'returned';
create index idx_loans_overdue       on public.loans (due_at)
  where status = 'active';

create index idx_reservations_queue  on public.reservations (book_id, position)
  where status = 'waiting';

-- ==========================================================================
-- 3. updated_at trigger function
-- ==========================================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_books_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

-- ==========================================================================
-- 4. Profile auto-creation trigger
-- ==========================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==========================================================================
-- 5. Row-Level Security
-- ==========================================================================

alter table public.profiles      enable row level security;
alter table public.books         enable row level security;
alter table public.book_copies   enable row level security;
alter table public.loans         enable row level security;
alter table public.reservations  enable row level security;
alter table public.audit_logs    enable row level security;

-- Helper: check if current user is staff
create or replace function public.is_staff()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('librarian', 'admin')
  );
$$ language sql security definer stable;

-- ---- profiles ----
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Staff can view all profiles"
  on public.profiles for select
  using (public.is_staff());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Staff can update any profile"
  on public.profiles for update
  using (public.is_staff());

-- ---- books ----
create policy "Anyone can view non-archived books"
  on public.books for select
  using (not is_archived);

create policy "Staff can insert books"
  on public.books for insert
  with check (public.is_staff());

create policy "Staff can update books"
  on public.books for update
  using (public.is_staff());

-- ---- book_copies ----
create policy "Anyone can view book copies"
  on public.book_copies for select
  using (true);

create policy "Staff can insert book copies"
  on public.book_copies for insert
  with check (public.is_staff());

create policy "Staff can update book copies"
  on public.book_copies for update
  using (public.is_staff());

create policy "Staff can delete book copies"
  on public.book_copies for delete
  using (public.is_staff());

-- ---- loans ----
create policy "Members can view own loans"
  on public.loans for select
  using (member_id = auth.uid());

create policy "Staff can view all loans"
  on public.loans for select
  using (public.is_staff());

create policy "Staff can insert loans"
  on public.loans for insert
  with check (public.is_staff());

create policy "Staff can update loans"
  on public.loans for update
  using (public.is_staff());

-- ---- reservations ----
create policy "Members can view own reservations"
  on public.reservations for select
  using (member_id = auth.uid());

create policy "Staff can view all reservations"
  on public.reservations for select
  using (public.is_staff());

create policy "Authenticated users can insert reservations"
  on public.reservations for insert
  with check (auth.uid() is not null);

create policy "Members can cancel own reservations"
  on public.reservations for update
  using (member_id = auth.uid())
  with check (member_id = auth.uid());

create policy "Staff can update any reservation"
  on public.reservations for update
  using (public.is_staff());

-- ---- audit_logs ----
create policy "Staff can view audit logs"
  on public.audit_logs for select
  using (public.is_staff());
-- No insert/update/delete policies — writes happen via triggers or server functions only.
