#  Library Assessment — Project Context

## Goal
Build a production-minded digital library web app for an assessment.

## Product direction
A premium dark-mode library experience inspired by modern streaming platforms, but clearly book-centric and library-oriented.

## Core requirements
- Book management
- Search
- Borrow / Return flows

## Treat as mandatory for scoring
- Strong UX polish
- Deployment
- Auth
- Roles
- AI feature(s)
- Extra practical features

## Tech direction
- Frontend/app layer: Next.js + TypeScript
- Styling: Tailwind
- Backend: Supabase
- AI: OpenAI or Anthropic API
- Hosting: Vercel

## Important terminology
Use:
- Borrow
- Return
- Available
- Checked Out
- Reserved
- Overdue

Do NOT use ambiguous reversed check-in/check-out wording in the UI.

## Product entities
- books
- book_copies
- profiles
- loans
- reservations
- audit_logs

## Key product rules
- A book title can have multiple copies
- Borrowing must create a loan record
- Returning must close the active loan
- Archive preferred over hard delete
- AI suggestions should be reviewable, never auto-overwrite user data

## Roles
- admin
- librarian
- member

## Current state
UI scaffold was generated in Lovable.
Need to now convert this into an intentional, production-ready app without unnecessary rewrites.