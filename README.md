# Athenaeum

Athenaeum is a digital library system for managing a catalog, circulation, and reservations. It supports both **staff workflows** (catalog management and lending) and **member workflows** (browsing, reserving, and tracking borrowed books).




## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | shadcn/ui (Radix) + Tailwind CSS |
| Data | TanStack Query v5 + Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password + magic link) |
| AI | OpenAI GPT-4o-mini (Vercel serverless function) |
| Hosting | Vercel |
| Dataset | https://www.kaggle.com/datasets/pooriamst/best-books-ever-dataset |

## Running Locally

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

## Core Features

### Catalog Management

Staff can manage the book catalog with structured metadata.

- Add, edit, and archive books with title, author, ISBN, genre, description, rating, and cover image.
- Books can have **multiple physical copies**, each tracked individually with condition and availability.
- Archive instead of hard delete to preserve loan history.

### Borrow / Return (Circulation)

Borrowing is **staff-mediated**, which mirrors how many real libraries operate.

- Staff issue loans by selecting a member and an available copy.
- The system tracks borrow date, due date, return date, and overdue status.
- Members can view their current loans and renewal options from their dashboard.

### Search

The catalog supports browsing and discovery.

- Full-text search by title, author, or ISBN.
- Genre filters to quickly narrow down results.
- Search and genre filter work together.

## Roles and Permissions

The system has three roles with a clear privilege hierarchy.

### Member

- Browse the catalog and view book details.
- Reserve books and track queue position.
- View their own active loans, due dates, and request renewals.
- Generate AI insights for any book.

### Librarian

- Everything a member can do, plus:
- Issue borrows and process returns.
- Add, edit, and manage book copies.
- View all members, member detail pages, and full loan records.
- See circulation history on book detail pages (borrower names, dates, status).

### Admin

- Everything a librarian can do, plus:
- **Archive books** from the catalog (destructive action).
- **Suspend or unsuspend members** (affects their ability to borrow).

The distinction is intentional: day-to-day librarians handle circulation and catalog updates, while admins control higher-impact operations.

## Additional Features

### Reservation System

Members can reserve books that are currently unavailable. The system tracks queue position so members know where they stand, rather than having to repeatedly check the catalog.

### Copy-Level Inventory

Each book can have multiple physical copies rather than a single availability flag.

- Staff can add or remove individual copies.
- Each copy tracks its own availability and condition.

This makes the catalog behave more like a real physical library.

### Admin Dashboard

Staff can see high-level operational information at a glance.

- Total books, active loans, overdue count, and member counts.
- Recent loan activity for quick operational visibility.
- **Popular books** ranked by loan frequency.
- **Low availability alerts** for books running low on copies.

### Member Detail Pages

Staff can click into any member to see their full profile and borrowing activity.

- Role, status, and membership info.
- Active loans with book links, copy IDs, and overdue indicators.
- Full borrowing history including returned books with return dates.
- Admins can suspend or unsuspend members directly from this page.

### Privacy

Circulation history (who borrowed what) is only visible to staff. Regular members see book availability and copy status, but not other members' borrowing activity.

## AI Feature — Book Insights

Borrowers often see only a title and description when browsing a catalog. That usually isn't enough to decide whether to borrow a book.

This feature generates **structured insights from catalog metadata** to help users decide more quickly.

When requested, the system generates:

- a short summary
- who the book might appeal to
- tone and themes
- a short "why read it" explanation

**How it works:**

1. User clicks "Generate Insights" on any book detail page.
2. A Vercel serverless function sends the book's metadata to GPT-4o-mini.
3. The AI returns structured insights cached in the database.
4. Future views load instantly from the cached result.
5. If the book's metadata changes, insights regenerate on next request.


