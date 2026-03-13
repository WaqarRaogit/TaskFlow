# Phase 4 — Projects CRUD

## What Was Built
- Full REST API for projects (GET, POST, PATCH, DELETE)
- Projects grid page with search, color-coded cards
- Create/Edit modal with color picker
- Project progress visualization

## Files

| File | Purpose |
|------|---------|
| `src/app/api/orgs/[orgId]/projects/route.ts` | GET list + POST create |
| `src/app/api/orgs/[orgId]/projects/[projectId]/route.ts` | GET one + PATCH + DELETE |
| `src/app/(dashboard)/[orgSlug]/projects/page.tsx` | Server component (data fetching) |
| `src/app/(dashboard)/[orgSlug]/projects/ProjectsClient.tsx` | Interactive client UI |

## CRUD Pattern

Every API endpoint follows a 3-check pattern:
1. **Authenticated?** Check `session` exists
2. **Authorized?** Check `membership` exists with correct role
3. **Valid input?** Parse with Zod schema

```typescript
// Example: POST /api/orgs/[orgId]/projects
const session = await auth();           // 1. Auth
if (!session?.user) return 401;

const membership = await findMembership; // 2. Authz
if (!membership || role === "VIEWER") return 403;

const data = schema.parse(body);        // 3. Validate
await prisma.project.create({ data });
```

### Role Permissions
| Action | ADMIN | MEMBER | VIEWER |
|--------|-------|--------|--------|
| Create project | ✅ | ✅ | ❌ |
| Edit project | ✅ | ✅ | ❌ |
| Delete project | ✅ | ❌ | ❌ |

## UI Design

### Project Cards
Each card features:
- Colored top border and icon matching project color
- Progress bar (done/total tasks)
- Stats row (done, in-progress, total)
- "Open Board" CTA button styled in the project color
- Hover actions (edit, delete) — appear only on hover to reduce clutter

### Color Picker
8 curated colors provided as swatches rather than a free-form color input. This ensures all project colors look intentional and harmonious against the dark background.

### Optimistic UI
When creating or editing a project, the UI updates immediately (optimistic update) and the server request runs in the background. If it fails, a toast error appears. This makes the UI feel instant.

## Data Fetching Strategy
The page uses a **server component → client component split**:
- Server component fetches initial data (no loading state on first paint)
- Client component manages mutations and local state
- `router.refresh()` after mutations to re-sync server state

## Checkpoints Passed
- ✅ Full CRUD API with auth checks at every level
- ✅ Projects grid with color-coded cards and progress bars
- ✅ Create/edit modal with validation
- ✅ Delete with confirmation dialog
- ✅ Search/filter functionality
