# Phase 1 — Database Schema

## What Was Built
- Complete Prisma schema with 9 models and 4 enums
- Database singleton client with hot-reload safety

## File
`prisma/schema.prisma`

## Models Defined

| Model | Purpose |
|-------|---------|
| `User` | Core user — supports both OAuth and credential login |
| `Account` | OAuth account records (NextAuth required) |
| `Session` | Database sessions (NextAuth required) |
| `VerificationToken` | Email verification tokens (NextAuth required) |
| `Organization` | A workspace/tenant — the multi-tenancy unit |
| `Membership` | Join table between User and Organization (carries `role`) |
| `Project` | A project within an org (has a `color` for visual identity) |
| `Task` | A task within a project (has `status`, `priority`, `position` for Kanban) |
| `Label` | Color tags that can be applied to many tasks (many-to-many) |
| `Comment` | Comments on tasks |
| `Invite` | Pending email invites with expiry token |

## Enums

```prisma
enum Role    { ADMIN | MEMBER | VIEWER }
enum Plan    { FREE | PRO }
enum TaskStatus { TODO | IN_PROGRESS | IN_REVIEW | DONE }
enum Priority   { LOW | MEDIUM | HIGH | URGENT }
```

## Design Decisions

### Why `cuid()` instead of auto-increment?
Auto-increment IDs (1, 2, 3...) leak business metrics. If a user ID is 47, someone knows your app has 47 users. CUIDs are random, globally unique, and safe to expose in URLs.

### Why `onDelete: Cascade`?
When you delete an Organization, all its Projects, Tasks, Comments, Memberships, and Invites should also be deleted. Without cascade, you'd have orphaned data requiring manual cleanup.

### Why explicit `Membership` model instead of implicit join?
The User↔Organization relationship is many-to-many **with extra data** (the `role` field). Prisma's implicit join tables don't support extra fields, so we use an explicit `Membership` model.

### Why `position: Int` on Task?
This enables the Kanban board's drag-and-drop ordering. When a task is dragged, we update its `position` value and the column of tasks re-renders in the correct order.

### Why `@db.Text` on long string fields?
PostgreSQL's `VARCHAR` max is ~65,535 characters but `TEXT` is unlimited. Task descriptions and passwords shouldn't be artificially truncated.

## Setup Command
```bash
# After adding DATABASE_URL to .env:
npx prisma db push     # Push schema to database
npx prisma generate    # Generate TypeScript client
```

## Checkpoints Passed
- ✅ All models defined with correct relations
- ✅ `prisma.ts` singleton client created
- ⏳ Database sync (requires DATABASE_URL in .env first)
