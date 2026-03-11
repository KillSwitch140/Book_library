import type { Database } from "./database.types";

// ---------------------------------------------------------------------------
// Row-type aliases (shorthand for use in hooks / mappers)
// ---------------------------------------------------------------------------

export type DbBook = Database["public"]["Tables"]["books"]["Row"];
export type DbBookCopy = Database["public"]["Tables"]["book_copies"]["Row"];
export type DbProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type DbLoan = Database["public"]["Tables"]["loans"]["Row"];
export type DbReservation = Database["public"]["Tables"]["reservations"]["Row"];
export type DbAuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
export type DbBookAiInsights = Database["public"]["Tables"]["book_ai_insights"]["Row"];

// ---------------------------------------------------------------------------
// Enum aliases
// ---------------------------------------------------------------------------

export type UserRole = DbProfile["role"];
export type LoanStatus = DbLoan["status"];
export type ReservationStatus = DbReservation["status"];
export type CopyCondition = DbBookCopy["condition"];

// ---------------------------------------------------------------------------
// AI Insights view type
// ---------------------------------------------------------------------------

export interface BookInsightsView {
  bookId: string;
  quickSummary: string;
  bestFor: string[];
  tone: string[];
  themes: string[];
  whyReadIt: string;
  modelVersion: string;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// UI view types — structurally match the mock-data interfaces so pages don't
// need to change when we swap from mock data to Supabase.
// ---------------------------------------------------------------------------

/** Matches the `Book` interface from `src/data/mockData.ts`. */
export interface BookView {
  id: string;
  title: string;
  author: string;
  cover: string;
  genre: string;
  rating: number;
  available: boolean;
  copies: number;
  availableCopies: number;
  isbn: string;
  year: number;
  description: string;
  aiSummary?: string | null;
}

/** Matches the `Member` interface from `src/data/mockData.ts`. */
export interface MemberView {
  id: string;
  name: string;
  email: string;
  role: "member" | "librarian" | "admin";
  memberSince: string;
  activeLoans: number;
  status: "active" | "suspended" | "expired";
}

/** Matches the `Loan` interface from `src/data/mockData.ts`. */
export interface LoanView {
  id: string;
  bookId: string;
  copyId: string;
  bookTitle: string;
  memberName: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: "active" | "overdue" | "returned";
}

/** Matches the `Reservation` interface from `src/data/mockData.ts`. */
export interface ReservationView {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  reservedDate: string;
  position: number;
  estimatedAvailable: string;
  status: "waiting" | "ready" | "fulfilled" | "cancelled" | "expired";
}
