-- Add ISBN to the full-text search vector so users can search by ISBN
alter table public.books drop column fts;
alter table public.books add column fts tsvector generated always as (
  to_tsvector('english', coalesce(title, '') || ' ' ||
                         coalesce(author, '') || ' ' ||
                         coalesce(isbn, '') || ' ' ||
                         coalesce(description, ''))
) stored;
