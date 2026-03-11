-- Ranked full-text search function for books
-- Returns books ordered by relevance (title/author matches weighted higher)
create or replace function public.search_books(search_query text, genre_filter text default null)
returns setof public.books
language sql stable
as $$
  select b.*
  from public.books b
  where b.is_archived = false
    and b.fts @@ websearch_to_tsquery('english', search_query)
    and (genre_filter is null or b.genre = genre_filter)
  order by
    -- Boost: exact title or author match ranks highest
    ts_rank_cd(
      setweight(to_tsvector('english', coalesce(b.title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(b.author, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(b.description, '')), 'D'),
      websearch_to_tsquery('english', search_query)
    ) desc,
    b.title asc
  limit 100;
$$;
