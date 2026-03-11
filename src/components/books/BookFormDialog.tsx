import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { bookSchema, type BookFormValues } from "@/lib/validators";
import { useGenres } from "@/hooks/useBooks";
import { useAddBook, useUpdateBook } from "@/hooks/useBookMutations";
import type { BookView } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  book?: BookView | null;
}

export default function BookFormDialog({
  open,
  onOpenChange,
  mode,
  book,
}: BookFormDialogProps) {
  const { data: genres = [] } = useGenres();
  const addBook = useAddBook();
  const updateBook = useUpdateBook();
  const isPending = addBook.isPending || updateBook.isPending;

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      genre: "General",
      year: undefined,
      description: "",
      coverUrl: "",
      initialCopies: 1,
    },
  });

  // Reset form when dialog opens with book data (edit) or empty (add)
  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && book) {
      form.reset({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        genre: book.genre,
        year: book.year || undefined,
        description: book.description,
        coverUrl: book.cover,
        initialCopies: 1,
      });
    } else {
      form.reset({
        title: "",
        author: "",
        isbn: "",
        genre: "General",
        year: undefined,
        description: "",
        coverUrl: "",
        initialCopies: 1,
      });
    }
  }, [open, mode, book, form]);

  async function onSubmit(values: BookFormValues) {
    if (mode === "edit" && book) {
      await updateBook.mutateAsync({ id: book.id, values });
    } else {
      await addBook.mutateAsync(values);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {mode === "add" ? "Add New Book" : "Edit Book"}
          </DialogTitle>
          <DialogDescription className="font-body">
            {mode === "add"
              ? "Add a new title to the catalog."
              : `Editing "${book?.title}".`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="font-body text-sm">
              Title *
            </Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Book title"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Author */}
          <div className="space-y-1.5">
            <Label htmlFor="author" className="font-body text-sm">
              Author *
            </Label>
            <Input
              id="author"
              {...form.register("author")}
              placeholder="Author name"
            />
            {form.formState.errors.author && (
              <p className="text-xs text-destructive">
                {form.formState.errors.author.message}
              </p>
            )}
          </div>

          {/* ISBN + Genre row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="isbn" className="font-body text-sm">
                ISBN
              </Label>
              <Input
                id="isbn"
                {...form.register("isbn")}
                placeholder="978-..."
              />
              {form.formState.errors.isbn && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.isbn.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="font-body text-sm">Genre *</Label>
              <Select
                value={form.watch("genre")}
                onValueChange={(v) => form.setValue("genre", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                  {/* Allow typing a new genre */}
                  {form.watch("genre") &&
                    !genres.includes(form.watch("genre")) && (
                      <SelectItem value={form.watch("genre")}>
                        {form.watch("genre")}
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
              {form.formState.errors.genre && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.genre.message}
                </p>
              )}
            </div>
          </div>

          {/* Year + Cover URL row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="year" className="font-body text-sm">
                Year
              </Label>
              <Input
                id="year"
                type="number"
                {...form.register("year")}
                placeholder="2024"
              />
              {form.formState.errors.year && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.year.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="coverUrl" className="font-body text-sm">
                Cover URL
              </Label>
              <Input
                id="coverUrl"
                {...form.register("coverUrl")}
                placeholder="https://..."
              />
              {form.formState.errors.coverUrl && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.coverUrl.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="font-body text-sm">
              Description
            </Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Brief synopsis..."
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Initial copies (add only) */}
          {mode === "add" && (
            <div className="space-y-1.5">
              <Label htmlFor="initialCopies" className="font-body text-sm">
                Initial Copies
              </Label>
              <Input
                id="initialCopies"
                type="number"
                {...form.register("initialCopies")}
                min={0}
                max={100}
              />
              {form.formState.errors.initialCopies && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.initialCopies.message}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === "add" ? "Add Book" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
