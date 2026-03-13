# Phase 0 — Project Setup & Folder Structure

## What Was Built
- Initialized the Next.js 14 project using `create-next-app` with TypeScript, Tailwind CSS, ESLint, App Router, and `src/` directory layout
- Created the complete folder architecture following the "restaurant metaphor" pattern from the mentor guide
- Established the global design system in `globals.css`

## Project Location
`C:\Users\pc\Desktop\Authentication\taskflow\`

## Dependencies Installed

| Package | Purpose |
|---------|---------|
| `next`, `react`, `react-dom` | Core framework (Next.js 14) |
| `typescript` | Static typing — catches bugs before runtime |
| `tailwindcss` | Utility-first CSS framework |
| `prisma`, `@prisma/client` | Type-safe database ORM |
| `next-auth@beta` | Authentication (v5 beta — App Router-native) |
| `@auth/prisma-adapter` | Bridges Prisma and NextAuth |
| `bcryptjs` | Password hashing — never store plain text |
| `zod` | Runtime schema validation for all user input |
| `@tanstack/react-query` | Client-side data fetching/caching |
| `clsx`, `tailwind-merge` | Conditional and conflict-free Tailwind classes |
| `lucide-react` | Consistent icon library |
| `@hello-pangea/dnd` | Drag-and-drop for Kanban board |
| `react-hot-toast` | Toast notification system |
| `stripe`, `@stripe/stripe-js` | Payment processing |
| `nodemailer` | Email delivery for invite system |

## Approach

### Design System Philosophy
The global CSS (`src/styles/globals.css`) was built as a **CSS custom properties system** rather than just Tailwind utilities. This allows:
- Consistent design tokens (colors, spacing) across components
- Easy theming — changing `--accent` updates the entire app
- Premium animations defined once and reused everywhere

**Color palette:** Deep navy/slate dark theme with violet `#7c3aed` as the primary accent. Chosen because it communicates premium quality, used by products like Linear, Vercel, and Raycast.

### Folder Structure
```
src/
├── app/          # Routes (Next.js App Router)
├── components/   # Reusable UI (ui/, dashboard/, kanban/, landing/)
├── lib/          # Backend logic (prisma, auth, stripe, utils, validations)
├── hooks/        # Custom React hooks
└── types/        # TypeScript type definitions
```

**Why `(auth)` and `(dashboard)` groups?** Next.js route groups let shared layouts apply without affecting the URL. `/login` stays `/login`, not `/auth/login`.

### Key Utilities Created
- `src/lib/utils.ts` — `cn()` class merger, `formatDate()`, `slugify()`, `getInitials()`, `PRIORITY_CONFIG`, `STATUS_CONFIG`
- `src/lib/prisma.ts` — Singleton client (prevents connection exhaustion on hot reload)
- `src/types/index.ts` — All shared TypeScript interfaces
- `src/lib/validations/` — Zod schemas for auth, projects, tasks

## Checkpoints Passed
- ✅ Next.js project created and running
- ✅ All ~20 dependencies installed
- ✅ Folder structure created
- ✅ Prisma initialized (`prisma init`)
- ✅ Utility functions created
- ✅ Global CSS design system established
