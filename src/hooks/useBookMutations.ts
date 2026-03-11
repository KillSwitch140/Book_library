import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { BookFormValues } from "@/lib/validators";
import type { CopyCondition } from "@/types";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Add book
// ---------------------------------------------------------------------------

export function useAddBook() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (values: BookFormValues) => {
      if (!supabase) throw new Error("Supabase not configured");

      const { data: book, error: bookErr } = await supabase
        .from("books")
        .insert({
          title: values.title,
          author: values.author,
          isbn: values.isbn || null,
          genre: values.genre,
          year: values.year ?? null,
          description: values.description ?? "",
          cover_url: values.coverUrl || null,
        })
        .select()
        .single();

      if (bookErr) throw bookErr;

      // Create initial copies
      const copyCount = values.initialCopies ?? 1;
      if (copyCount > 0) {
        const copies = Array.from({ length: copyCount }, () => ({
          book_id: book.id,
          condition: "new" as const,
        }));
        const { error: copyErr } = await supabase.from("book_copies").insert(copies);
        if (copyErr) throw copyErr;
      }

      return book;
    },
    onSuccess: () => {
      toast.success("Book added successfully");
      qc.invalidateQueries({ queryKey: ["books"] });
      qc.invalidateQueries({ queryKey: ["genres"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to add book: ${err.message}`);
    },
  });
}

// ---------------------------------------------------------------------------
// Update book
// ---------------------------------------------------------------------------

interface UpdateBookVars {
  id: string;
  values: Partial<BookFormValues>;
}

export function useUpdateBook() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: UpdateBookVars) => {
      if (!supabase) throw new Error("Supabase not configured");

      const { error } = await supabase
        .from("books")
        .update({
          title: values.title,
          author: values.author,
          isbn: values.isbn || null,
          genre: values.genre,
          year: values.year ?? null,
          description: values.description,
          cover_url: values.coverUrl || null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_data, { id }) => {
      toast.success("Book updated successfully");
      qc.invalidateQueries({ queryKey: ["books"] });
      qc.invalidateQueries({ queryKey: ["book", id] });
      qc.invalidateQueries({ queryKey: ["genres"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to update book: ${err.message}`);
    },
  });
}

// ---------------------------------------------------------------------------
// Archive book
// ---------------------------------------------------------------------------

export function useArchiveBook() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Supabase not configured");

      const { error } = await supabase
        .from("books")
        .update({ is_archived: true })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Book archived");
      qc.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to archive book: ${err.message}`);
    },
  });
}

// ---------------------------------------------------------------------------
// Add copy
// ---------------------------------------------------------------------------

interface AddCopyVars {
  bookId: string;
  condition?: CopyCondition;
}

export function useAddCopy() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, condition = "new" }: AddCopyVars) => {
      if (!supabase) throw new Error("Supabase not configured");

      const { error } = await supabase
        .from("book_copies")
        .insert({ book_id: bookId, condition });

      if (error) throw error;
    },
    onSuccess: (_data, { bookId }) => {
      toast.success("Copy added");
      qc.invalidateQueries({ queryKey: ["book", bookId] });
      qc.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to add copy: ${err.message}`);
    },
  });
}

// ---------------------------------------------------------------------------
// Remove copy
// ---------------------------------------------------------------------------

interface RemoveCopyVars {
  copyId: string;
  bookId: string;
}

export function useRemoveCopy() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ copyId }: RemoveCopyVars) => {
      if (!supabase) throw new Error("Supabase not configured");

      const { error } = await supabase
        .from("book_copies")
        .delete()
        .eq("id", copyId);

      if (error) throw error;
    },
    onSuccess: (_data, { bookId }) => {
      toast.success("Copy removed");
      qc.invalidateQueries({ queryKey: ["book", bookId] });
      qc.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to remove copy: ${err.message}`);
    },
  });
}
