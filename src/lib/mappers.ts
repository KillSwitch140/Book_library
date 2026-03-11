import type { DbBook, DbBookCopy, BookView } from "@/types";

/** DB row shape returned by `select("*, book_copies(*)")` */
export type DbBookWithCopies = DbBook & { book_copies: DbBookCopy[] };

/** Convert a DB book row (with nested copies) to the UI view type. */
export function toBookView(row: DbBookWithCopies): BookView {
  const availableCopies = row.book_copies.filter((c) => c.is_available).length;
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    cover: row.cover_url ?? "",
    genre: row.genre,
    rating: Number(row.rating),
    available: availableCopies > 0,
    copies: row.book_copies.length,
    availableCopies,
    isbn: row.isbn ?? "",
    year: row.year ?? 0,
    description: row.description,
    aiSummary: row.ai_summary,
  };
}
