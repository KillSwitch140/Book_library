import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
export type MagicLinkFormValues = z.infer<typeof magicLinkSchema>;

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .max(100, "Name is too long"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type SignupFormValues = z.infer<typeof signupSchema>;

// ---------------------------------------------------------------------------
// Books
// ---------------------------------------------------------------------------

export const bookSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  author: z.string().min(1, "Author is required").max(300),
  isbn: z.string().max(20).optional().or(z.literal("")),
  genre: z.string().min(1, "Genre is required"),
  year: z.coerce
    .number()
    .int()
    .min(1000)
    .max(new Date().getFullYear() + 1)
    .optional(),
  description: z.string().max(5000).optional().default(""),
  coverUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  initialCopies: z.coerce.number().int().min(0).max(100).default(1),
});
export type BookFormValues = z.infer<typeof bookSchema>;
