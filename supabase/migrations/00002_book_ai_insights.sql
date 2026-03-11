-- Book AI Insights — stores structured AI-generated insights per book.
-- Separate from the books table to keep AI content apart from curated metadata.

create table public.book_ai_insights (
  book_id       uuid primary key references public.books(id) on delete cascade,
  quick_summary text not null,
  best_for      text[] not null,
  tone          text[] not null,
  themes        text[] not null,
  why_read_it   text not null,
  model_version text not null,
  prompt_hash   text not null,
  generated_at  timestamptz not null default now()
);

alter table public.book_ai_insights enable row level security;

-- Anyone can read insights (borrower-facing content)
create policy "Anyone can view book insights"
  on public.book_ai_insights for select
  using (true);

-- No INSERT/UPDATE/DELETE policies for anon/authenticated roles.
-- Writes happen exclusively via the serverless function using the service role key.
