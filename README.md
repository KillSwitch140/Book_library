# Athenaeum

A premium digital library management system with book catalog, staff-mediated circulation, member reservations, and AI-powered book insights.

## Live Demo

**URL:** https://book-library-ganesh.vercel.app

| Role | Email | Password |
|---|---|---|
| Staff (librarian) | alice@example.com | TestPass123! |
| Member | bob@example.com | TestPass123! |

## How to Run Locally

```bash
git clone https://github.com/KillSwitch140/Book_library.git
cd Book_library
npm install
```

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
```

Run the two migration files in **Supabase SQL Editor**:
1. `supabase/migrations/00001_initial_schema.sql`
2. `supabase/migrations/00002_book_ai_insights.sql`

```bash
npm run dev    # Starts on http://localhost:8080
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | shadcn/ui (Radix) + Tailwind CSS |
| Data | TanStack Query v5 + Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password + magic link) |
| AI | OpenAI GPT-4o-mini (Vercel serverless function) |
| Testing | Vitest (unit) + Playwright (E2E) |
| Hosting | Vercel |

## Core Features (Required)

### Book Management
- Add, edit, and archive books with rich metadata: title, author, ISBN, genre, year, description, cover image, and rating
- Manage multiple physical copies per book (add/remove individual copies with condition tracking)
- Archive instead of hard delete to preserve loan history

### Check-in / Check-out (Borrow & Return)
- Staff can issue borrows: search for a member, select an available copy, set loan period
- Staff can process returns with overdue detection
- Members see active loans with due dates and can request renewals
- Loan history tracked per book with borrower info and timestamps

### Search
- Full-text search on the catalog page by title, author, or ISBN
- Genre filter buttons for quick category browsing
- Search and genre filter work together

## Bonus Features

### Deployment
Deployed on Vercel with live URL (see above).

### Authentication & Roles
- Supabase Auth with email/password and magic link sign-in
- Three roles: **admin**, **librarian**, **member**
- Role-based route protection: admin/staff pages redirect unauthenticated users
- Role-based UI gating: admin sidebar section only visible to staff
- Session persists across page reloads

### AI Feature: Book Insights
On-demand, AI-generated insights for any book in the catalog. Helps borrowers make informed decisions from catalog metadata alone — solving the "should I read this?" problem without requiring reviews or ratings from other users.

**How it works:**
1. User clicks "Generate Insights" on any book detail page
2. A Vercel serverless function sends the book's metadata to GPT-4o-mini
3. The AI returns structured insights: summary, best-for audience, tone, themes, and a "why read it" recommendation
4. Results are cached in the database with a prompt hash — subsequent visits load instantly
5. If the book's metadata changes, the prompt hash changes and insights regenerate on next request

## Extra Features

- **Reservation system** — members can reserve books and join a queue with position tracking and estimated availability
- **Copy-level inventory** — each book can have multiple physical copies, each tracked individually (available/borrowed, condition)
- **Rich book detail pages** — loan history, copy availability, related books by genre, more by author, staff picks
- **Member loan dashboard** — active loans with due dates, overdue badges, renewal requests
- **Admin dashboard** — stats (total books, active loans, overdue, members), recent loan activity
- **Catalog management** — staff can add/edit/archive books and manage copies from a dedicated admin page
- **Dark premium UI** — custom design system with copper/amber accent palette, Playfair Display + DM Sans typography
- **E2E smoke tests** — 7 Playwright tests covering auth, catalog, AI insights, reservations, and circulation

## Known Limitations

- Reservation queue does not auto-transition from `waiting` to `ready` when a copy is returned
- Audit trail schema exists but is not populated
- Settings page is a placeholder
- Wishlist/save is client-side only (not persisted)
- Members page is read-only (no suspend/edit)
