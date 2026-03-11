# Database Schema

All tables live in the `public` schema on Supabase (PostgreSQL).

---

## Tables

### `profiles`

User profiles, auto-created on signup via a trigger on `auth.users`.

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users(id)` ON DELETE CASCADE | — | Matches auth user ID |
| `full_name` | `text` | NOT NULL | `''` | Display name |
| `email` | `text` | NOT NULL | — | Copied from auth.users on creation |
| `role` | `text` | NOT NULL, CHECK (`member`, `librarian`, `admin`) | `'member'` | Authorization role |
| `avatar_url` | `text` | | `null` | Profile picture URL |
| `is_suspended` | `boolean` | NOT NULL | `false` | Suspended members cannot borrow |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | Auto-updated via trigger |

### `books`

Canonical book records (one row per title, not per physical copy).

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK | `gen_random_uuid()` | |
| `title` | `text` | NOT NULL | — | |
| `author` | `text` | NOT NULL | — | |
| `isbn` | `text` | UNIQUE | `null` | ISBN-13 |
| `genre` | `text` | NOT NULL | `'General'` | |
| `year` | `smallint` | | `null` | Publication year |
| `description` | `text` | | `''` | Synopsis |
| `cover_url` | `text` | | `null` | Cover image URL |
| `rating` | `numeric(2,1)` | CHECK (0–5) | `0` | Average rating |
| `ai_summary` | `text` | | `null` | AI-generated summary (user-triggered only, never auto-overwrite) |
| `is_archived` | `boolean` | NOT NULL | `false` | Soft-delete flag |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | Auto-updated via trigger |

**FTS index**: `fts` column (generated tsvector from `title`, `author`, `description`).

### `book_copies`

Physical copies of a book.

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK | `gen_random_uuid()` | |
| `book_id` | `uuid` | NOT NULL, FK → `books(id)` ON DELETE CASCADE | — | |
| `condition` | `text` | NOT NULL, CHECK (`new`, `good`, `fair`, `poor`) | `'good'` | |
| `is_available` | `boolean` | NOT NULL | `true` | False when currently on loan |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |

### `loans`

Borrow/return records. One row per borrow event — returning sets `returned_at`, never deletes.

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK | `gen_random_uuid()` | |
| `copy_id` | `uuid` | NOT NULL, FK → `book_copies(id)` | — | Specific copy borrowed |
| `member_id` | `uuid` | NOT NULL, FK → `profiles(id)` | — | Who borrowed it |
| `borrowed_at` | `timestamptz` | NOT NULL | `now()` | |
| `due_at` | `timestamptz` | NOT NULL | — | Typically `borrowed_at + 14 days` |
| `returned_at` | `timestamptz` | | `null` | Set on return |
| `status` | `text` | NOT NULL, CHECK (`active`, `overdue`, `returned`) | `'active'` | |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |

### `reservations`

Hold queue per book (not per copy). Position determines queue order.

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK | `gen_random_uuid()` | |
| `book_id` | `uuid` | NOT NULL, FK → `books(id)` | — | |
| `member_id` | `uuid` | NOT NULL, FK → `profiles(id)` | — | |
| `position` | `integer` | NOT NULL | — | Queue position (1 = next) |
| `status` | `text` | NOT NULL, CHECK (`waiting`, `ready`, `fulfilled`, `cancelled`, `expired`) | `'waiting'` | |
| `reserved_at` | `timestamptz` | NOT NULL | `now()` | |
| `expires_at` | `timestamptz` | | `null` | Set when status → `ready` |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |

### `audit_logs`

Append-only event log. No client writes — populated by DB triggers or server functions.

| Column | Type | Constraints | Default | Notes |
|---|---|---|---|---|
| `id` | `uuid` | PK | `gen_random_uuid()` | |
| `actor_id` | `uuid` | FK → `profiles(id)` | `null` | Who performed the action (null = system) |
| `action` | `text` | NOT NULL | — | e.g. `book.borrow`, `book.return`, `member.suspend` |
| `entity_type` | `text` | NOT NULL | — | e.g. `loan`, `book`, `profile` |
| `entity_id` | `uuid` | NOT NULL | — | ID of affected row |
| `metadata` | `jsonb` | | `'{}'` | Additional context |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |

---

## Indexes

| Table | Index | Purpose |
|---|---|---|
| `books` | GIN on `fts` | Full-text search |
| `books` | btree on `genre` | Genre filter |
| `books` | btree on `isbn` | ISBN lookup |
| `loans` | btree on `(member_id) WHERE status != 'returned'` | Active loans per member |
| `loans` | btree on `(copy_id) WHERE status != 'returned'` | Active loan per copy |
| `loans` | btree on `(due_at) WHERE status = 'active'` | Overdue scan |
| `reservations` | btree on `(book_id, position) WHERE status = 'waiting'` | Reservation queue |

---

## RLS Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | Own row; staff see all | — (trigger-created) | Own profile; staff update any | Never |
| `books` | Everyone (non-archived) | Staff only | Staff only | Never (use `is_archived`) |
| `book_copies` | Everyone | Staff only | Staff only | Staff only |
| `loans` | Own loans; staff see all | Staff only | Staff only | Never |
| `reservations` | Own; staff see all | Authenticated | Own cancel; staff update any | Never |
| `audit_logs` | Staff only | Never (DB triggers only) | Never | Never |

"Staff" = role in (`librarian`, `admin`).

---

## Key Product Rules

1. **Borrowing** creates a loan record on a specific `book_copy` and sets `is_available = false` on that copy.
2. **Returning** sets `returned_at` and `status = 'returned'` — the loan row is never deleted.
3. **Reservations** queue by `position` per `book_id`. When a copy is returned and a reservation exists, the first `waiting` reservation transitions to `ready`.
4. **AI summaries** are stored in the `ai_summary` column. They are never auto-generated — only triggered explicitly by the user.
5. **Audit logs** are append-only. No client-side writes; populated by database triggers or server-side functions.
6. **Soft delete** — books use `is_archived = true` instead of `DELETE`.
