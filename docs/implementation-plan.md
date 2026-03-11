# Implementation Plan

## Phase 0 — Cleanup & Standards ✅

- [x] Replace Lovable branding with Athenaeum
- [x] Remove lovable-tagger plugin
- [x] Replace Lovable Playwright wrappers with plain @playwright/test
- [x] Delete unused `Index.tsx`
- [x] Enable TypeScript strict mode (0 errors)
- [x] Fix ESLint config (`no-unused-vars` → error with `^_` pattern)
- [x] Fix "Checked Out" → "Borrowed" terminology
- [x] Remove orphaned search state and notification badge from AppLayout
- [x] Clean up sidebar footer (Sign In link instead of hardcoded admin)
- [x] Remove unused imports and fix lint errors

## Phase 1 — Supabase Setup + Architecture Docs ✅

- [x] Create architecture docs (`docs/architecture.md`, `docs/schema.md`, `docs/implementation-plan.md`)
- [x] Install `@supabase/supabase-js`
- [x] Create `.env.example` and `.env.local`
- [x] Add typed env vars to `vite-env.d.ts`
- [x] Create `src/types/database.types.ts` (hand-written DB types)
- [x] Create `src/types/app.types.ts` (UI view types matching mock data)
- [x] Create `src/lib/supabase.ts` (singleton client, null when env missing)
- [x] Create `src/lib/queryClient.ts` (extract from App.tsx with production defaults)
- [x] Update `src/App.tsx` to import queryClient
- [x] Create `vercel.json` (SPA rewrite)
- [x] Create `supabase/migrations/00001_initial_schema.sql`

## Phase 2 — Auth (Supabase Auth + UI) ✅

- [x] `AuthContext` with session, profile, role, signOut
- [x] Login page (`/login`) — email/password + magic link
- [x] Signup page (`/signup`) — email/password with full_name
- [x] `ProtectedRoute` wrapper (redirect to /login if not authenticated)
- [x] `RoleGuard` component (show/hide based on role)
- [x] Gate admin sidebar section behind `RoleGuard`
- [x] Wire sidebar footer to show user info when logged in

## Phase 3 — Books (Live Data) ✅

- [x] `useBooks` hook — list, search (FTS), filter by genre
- [x] `useBook(id)` hook — single book with copies + availability
- [x] Migrate `CatalogPage` from mock data to `useBooks`
- [x] Migrate `BookDetailPage` from mock data to `useBook`
- [x] Migrate `HomePage` rails from mock data to `useBooks`
- [x] Admin: add/edit book form (staff only)
- [x] Admin: archive book (soft delete)
- [x] Copy management dialog (add/remove physical copies)
- [x] Migrate `CatalogManagementPage` with full CRUD wiring
- [x] Migrate `AdminPage` total books count
- [x] Loading, empty, and error states on all migrated pages
- [x] Graceful degradation (mock data fallback when Supabase not configured)

## Phase 4 — Members (Live Data) ✅

- [x] `useMembers` hook — list, search, with active loan counts
- [x] Migrate `MembersPage` from mock data
- [ ] Admin: suspend/unsuspend member (deferred — no UI yet)

## Phase 4.5 — Circulation (Loans) ✅

- [x] `useLoans` hook — list with book/member joins, status filter
- [x] `useBookLoanHistory` hook — loan history for a specific book
- [x] `useMyLoans` hook — member's active loans with book details
- [x] `useBorrow` mutation — create loan + mark copy unavailable
- [x] `useReturn` mutation — close loan + mark copy available
- [x] `useRenew` mutation — extend due date
- [x] `BorrowDialog` component — staff selects member (search) + copy + loan period
- [x] `ReturnDialog` component — staff selects active loan to return
- [x] Wire Borrow/Return buttons on BookDetailPage (staff-only borrow/return dialogs)
- [x] Replace placeholder loan history on BookDetailPage with real data
- [x] Migrate `LoansPage` — real data with status filter, loading/empty/error states
- [x] Migrate `MyBooksPage` — member's active loans with renew + book navigation
- [x] Migrate `AdminPage` — real loan counts (active, overdue) + recent loans table
- [x] Wire CatalogManagementPage Borrow/Return buttons → navigate to book detail
- [x] Overdue surfacing in MyBooksPage and ReturnDialog

## Phase 5 — Reservations (Live Data) ✅

- [x] `useReservations` hook — list with queue position
- [x] `useReserve` / `useCancelReservation` mutations
- [x] Migrate `ReservationsPage`
- [x] Wire Reserve button on `BookDetailPage`
- [x] `useMemberCount` for AdminPage (removed last mock import from pages)
- [ ] Delete `src/data/mockData.ts` (kept for hook fallback when Supabase not configured)

## Phase 6 — Production-Readiness Stabilization ✅

- [x] Replace non-functional SettingsPage form with "coming soon" placeholder
- [x] Remove hardcoded fake stats from HomePage
- [x] Add loading states for AdminPage stat cards
- [x] Add missing validation error display for 5 BookFormDialog fields
- [x] Fix borrow race condition (conditional copy update + rollback)
- [x] Add reservation query invalidation to borrow/return mutations
- [x] Remove non-functional search input from AppLayout header
- [x] Add tooltip on Reserve button for unauthenticated users
- [x] Fix mock fallbacks (honest empty arrays, fix broken bookId)
- [x] Fix overdue detection in loan queries (client-side effective status)
- [x] Prevent duplicate reservations (check before insert)
- [x] Fix terminology inconsistencies ("Checked Out" → "Borrowed")

### Known Limitations (not addressed in this pass)
- Audit trail: schema exists, zero implementation
- Reservation queue fulfillment: no auto-transition waiting→ready on return
- DB overdue trigger: no server-side auto-marking; client-side detection works
- Error boundaries: not implemented
- Notification bell: rendered but non-functional
- Copy condition editing: can't change after creation
- Member loan history: MyBooksPage shows active/overdue only, not past borrows

## Phase 7A — AI Book Insights Foundation ✅

- [x] `book_ai_insights` table (separate from books, structured fields)
- [x] Vercel serverless function: `api/generate-insights.ts` (OpenAI gpt-4o-mini)
- [x] Structured output: quick_summary, best_for[], tone[], themes[], why_read_it
- [x] Cache via prompt_hash (auto-invalidates when book metadata changes)
- [x] Minimum metadata threshold (422 if insufficient)
- [x] Auth required (any authenticated user)
- [x] Service role isolated to DB write only
- [x] Client hooks: `useBookInsights` (query) + `useGenerateInsights` (mutation)
- [x] TypeScript types for DB row + UI view

## Phase 7B — AI Insights UI (BookDetailPage) ✅

- [x] "Generate Insights" button on BookDetailPage (gated on auth)
- [x] Display cached insights (summary, best_for chips, tone chips, themes, why_read_it)
- [x] Loading/error states (skeleton while loading, metadata warning, sign-in prompt)
- [ ] Regenerate button (deferred — insights auto-refresh when book metadata changes via prompt hash)

## Phase 10 — README, Smoke Tests & Submission Packaging ✅

- [x] Playwright smoke test suite (5 tests: auth, catalog, AI insights, reservations, circulation)
- [x] Fix BorrowDialog member search bug (useEffect deps causing input reset)
- [x] Deterministic staff circulation test (finds available book dynamically)
- [x] Submission-ready README with setup, evaluation guide, and known limitations
- [x] Clean up root directory (remove Lovable/bun artifacts, improve gitignore)

## Not Implemented (Out of Scope)

- AI-powered book recommendations (`/api/recommend`)
- Error boundaries
- Responsive design audit
- Lighthouse performance audit
- Member suspend/edit functionality
- Reservation auto-fulfillment (waiting → ready on return)
