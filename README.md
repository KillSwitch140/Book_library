# Athenaeum

A premium digital library management system with catalog browsing, staff-mediated circulation, member reservations, and AI-powered book insights.

Built as a full-stack SPA with React, Supabase, and OpenAI — deployed on Vercel.

## Features

**Catalog & Discovery**
- Browse books by genre with cover art, ratings, and availability badges
- Full-text search across titles, authors, and ISBNs
- Book detail pages with metadata, copy availability, and loan history

**Circulation (Staff-Mediated)**
- Staff can issue borrows by searching members and selecting available copies
- Staff can process returns with overdue detection
- Members see their active loans and can request renewals

**Reservations**
- Members can reserve books and join a queue
- Queue position and estimated availability shown
- Cancel reservations at any time

**AI Book Insights**
- On-demand, AI-generated insights for any book in the catalog
- Powered by GPT-4o-mini via a Vercel serverless function
- Generates: summary, best-for audience, tone, themes, and a "why read it" recommendation
- Cached in the database — subsequent visits load instantly without re-calling the API
- Prompt hash tracks metadata changes so insights regenerate only when the book record changes
- Solves a real problem: helps borrowers make informed decisions from catalog metadata alone

**Admin & Roles**
- Three roles: `admin`, `librarian`, `member`
- Admin dashboard with book/loan/member stats
- Catalog management: add, edit, archive books and manage physical copies
- Role-based route protection and UI gating

**Auth**
- Email/password and magic link sign-in via Supabase Auth
- Session persists across page reloads
- Protected routes redirect to login with return URL

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router v6 |
| Data Fetching | TanStack Query v5 |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| UI Components | shadcn/ui (Radix primitives) |
| Styling | Tailwind CSS with custom dark theme |
| Forms | react-hook-form + Zod validation |
| AI | OpenAI GPT-4o-mini (structured output) |
| E2E Testing | Playwright |
| Unit Testing | Vitest |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [OpenAI API key](https://platform.openai.com/api-keys) (for AI insights)

### Install

```bash
git clone https://github.com/KillSwitch140/Book_library.git
cd Book_library
npm install
```

### Environment Variables

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
```

| Variable | Side | Where to find it |
|---|---|---|
| `VITE_SUPABASE_URL` | Client | Supabase Dashboard > Project Settings > API > Project URL |
| `VITE_SUPABASE_ANON_KEY` | Client | Supabase Dashboard > Project Settings > API > `anon` `public` key |
| `SUPABASE_SERVICE_KEY` | Server | Supabase Dashboard > Project Settings > API > `service_role` `secret` key |
| `OPENAI_API_KEY` | Server | OpenAI Platform > API Keys |

Client-side variables (`VITE_` prefix) are bundled into the browser build. Server-side variables are only available in Vercel serverless functions.

### Database Setup

Run the two migration files in order in the **Supabase SQL Editor**:

1. `supabase/migrations/00001_initial_schema.sql` — core tables, indexes, RLS, triggers
2. `supabase/migrations/00002_book_ai_insights.sql` — AI insights cache table

### Test Accounts

Create accounts through the app's signup page (`/signup`), then promote staff via SQL:

```sql
UPDATE public.profiles SET role = 'librarian' WHERE email = 'alice@example.com';
```

Members default to `role = 'member'` — no promotion needed.

### Run Locally

```bash
npm run dev    # Starts on http://localhost:8080
```

> **Note:** AI insights require the `/api/generate-insights` serverless function, which only runs on Vercel. Use `vercel dev` for local development with serverless functions.

## Running Tests

### Unit Tests

```bash
npm run test          # Single run
npm run test:watch    # Watch mode
```

### E2E Tests (Playwright)

**Setup:**

1. Install browsers: `npx playwright install chromium`
2. Configure test accounts in `.env.e2e`:

```env
PLAYWRIGHT_BASE_URL=http://localhost:8080
TEST_STAFF_EMAIL=alice@example.com
TEST_STAFF_PASSWORD=TestPass123!
TEST_MEMBER_EMAIL=bob@example.com
TEST_MEMBER_PASSWORD=TestPass123!
```

**Run:**

```bash
npm run test:e2e           # Headless
npm run test:e2e:headed    # With visible browser
```

Set `PLAYWRIGHT_BASE_URL` to your Vercel URL to test against production.

**Test suite:**

| Test | What it covers |
|---|---|
| 01 - Auth restore | Session persists across reload; protected routes survive reload |
| 02 - Catalog to detail | Browse catalog, click book, verify detail; detail survives reload |
| 03 - AI Insights | Generate insights, verify structured display, verify cache on reload |
| 04 - Member reservation | Reserve a book, verify on reservations page, cancel |
| 05 - Staff circulation | Find available book, issue borrow to member, verify loan recorded |

## Deployment

1. Import the repo on [Vercel](https://vercel.com/new)
2. Framework preset: **Vite** (auto-detected)
3. Add all 4 environment variables
4. Deploy

The `vercel.json` SPA rewrite handles client-side routing. The `api/` directory contains the serverless function for AI insights.

## Quick Evaluation Guide

1. Open the app and browse `/catalog` — filter by genre, click a book
2. On a book detail page, scroll to **AI Insights** and click **Generate Insights** (requires sign-in)
3. Sign in as staff (`alice@example.com`) — note the Admin section in the sidebar
4. On any book detail page, click **Issue Borrow** — search for a member, select a copy, confirm
5. Navigate to **Loans** in the sidebar to see the loan record
6. Sign in as member (`bob@example.com`) — check **My Books** for active loans and **Reservations** for holds
7. Reload any page — session and data persist

## Architecture

The app follows a layered architecture:

```
Pages → Hooks (TanStack Query) → Query Functions → Supabase Client
                                                  → Mock Data (fallback)
```

- Pages never import Supabase directly — all data access goes through hooks
- Hooks fall back to mock data when Supabase is not configured (graceful degradation)
- RLS policies enforce access control at the database level
- Auth state is managed via `AuthContext` with `getSession()` + `onAuthStateChange` (no async work in the listener)

See `docs/architecture.md` for the full design document.

## Known Limitations

- Reservation queue does not auto-transition from `waiting` to `ready` when a copy is returned
- Audit trail schema (`audit_logs` table) exists but is not populated by the app
- Settings page is a placeholder
- Wishlist/save button is client-side only (not persisted)
- No regenerate button for AI insights — insights refresh automatically if book metadata changes
- Members page is read-only (no suspend/edit functionality)
