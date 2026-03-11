# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server on port 8080

# Build
npm run build        # Production build
npm run build:dev    # Development build

# Lint
npm run lint         # Run ESLint

# Test
npm run test         # Run Vitest (single run)
npm run test:watch   # Run Vitest in watch mode

# Preview
npm run preview      # Preview production build
```

Tests use Vitest with jsdom. Test files go in `src/**/*.{test,spec}.{ts,tsx}` with setup in `src/test/setup.ts`.

## Architecture

**Athenaeum** is a library management SPA built with React + TypeScript + Vite, using shadcn/ui components and Tailwind CSS.

### Key patterns

- **Path alias**: `@/` maps to `src/` throughout the codebase
- **All data is mock**: `src/data/mockData.ts` exports typed arrays (`books`, `members`, `loans`, `reservations`, `genres`) — there is no backend or API
- **No state management library**: pages read directly from mock data; TanStack Query is available but not actively used for data fetching
- **shadcn/ui components**: UI primitives live in `src/components/ui/` — add new ones via `npx shadcn@latest add <component>`

### Routing (`src/App.tsx`)

React Router v6. All routes are wrapped in `AppLayout`, which provides the collapsible sidebar (`AppSidebar`) and top header.

| Route | Page |
|---|---|
| `/` | HomePage |
| `/catalog` | CatalogPage |
| `/book/:id` | BookDetailPage |
| `/my-books` | MyBooksPage |
| `/reservations` | ReservationsPage |
| `/admin` | AdminPage |
| `/admin/catalog` | CatalogManagementPage |
| `/members` | MembersPage |
| `/loans` | LoansPage |
| `/settings` | SettingsPage |

### Sidebar sections

- **Browse**: Home, Catalog, My Books, Reservations (member-facing)
- **Admin**: Dashboard, Manage Catalog, Members, Loans, Settings (admin-facing)

### Styling

Tailwind with CSS variables for theming (defined in `src/index.css`). Custom tokens used throughout:
- `bg-surface-elevated`, `bg-surface-hover` — layered surface colors
- `text-copper`, `bg-gradient-warm`, `shadow-glow` — brand accent styles
- Fonts: `font-display` (Playfair Display, serif headings) and `font-body` (DM Sans, UI text)

Dark mode is class-based (`darkMode: ["class"]` in `tailwind.config.ts`), managed via `next-themes`.
