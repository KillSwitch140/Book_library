# Architecture

## Responsibility Map

| Layer | Location | Responsibility |
|---|---|---|
| UI primitives | `src/components/ui/` | shadcn/ui components (unchanged) |
| App components | `src/components/` | `AppLayout`, `AppSidebar`, `BookCard`, `BookRail`, `HeroSection`, `NavLink`, `ProtectedRoute` (Phase 2), `RoleGuard` (Phase 2) |
| Pages/Routes | `src/pages/` | One file per route. Auth pages in `src/pages/auth/`. Routing in `src/App.tsx` |
| Domain logic (hooks) | `src/hooks/` | TanStack Query hooks: `useBooks`, `useLoans`, `useReservations`, `useMembers` |
| Supabase client | `src/lib/supabase.ts` | Singleton client, typed with `Database` |
| Query client | `src/lib/queryClient.ts` | TanStack QueryClient with production defaults |
| API handlers | `api/` (project root) | Vercel Serverless Functions for AI features (Phases 7-8) |
| Types | `src/types/` | `database.types.ts` (DB schema), `app.types.ts` (UI view types) |
| Validation | `zod` schemas | Co-located in hooks or `src/lib/validators.ts` if shared |
| Auth context | `src/context/AuthContext.tsx` | Session, profile, role, signOut (Phase 2) |
| Mock data | `src/data/mockData.ts` | Kept during transition, deleted in Phase 5 |

## Architectural Rules

1. **Pages import hooks, never Supabase directly.** Pages are pure presentation — they call hooks for data and mutations.
2. **Hooks handle Supabase queries + mapping** from DB types (`DbBook`) to view types (`BookView`).
3. **Mutations go through hooks** (`useMutation`), never raw client calls in components.
4. **AI features go through Vercel Functions** — the OpenAI/Anthropic API key is never in the client bundle.
5. **Prefer archive over hard delete** — set `is_archived = true` instead of `DELETE` everywhere.
6. **Borrow/Return terminology** consistently (never "Checked Out").
7. **RLS enforces access control at the database level** — client-side guards are for UX, not security.

## Data Flow

```
Page  →  useBooks()  →  supabase.from("books").select(...)  →  Supabase
  ↑                          ↓
  └──  BookView[]  ←  mapDbBookToView()
```

Mutations follow the same pattern in reverse, with `useMutation` + `queryClient.invalidateQueries`.

## Styling

- Tailwind CSS with CSS-variable theming (`src/index.css`)
- Dark mode: class-based (`next-themes`)
- Fonts: `font-display` (Playfair Display) for headings, `font-body` (DM Sans) for UI text
- Brand tokens: `text-copper`, `bg-gradient-warm`, `shadow-glow`, `bg-surface-elevated`
