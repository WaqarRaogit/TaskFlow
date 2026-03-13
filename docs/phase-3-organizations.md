# Phase 3 — Organizations & Multi-Tenancy

## What Was Built
- Org-scoped layout with membership validation
- Premium collapsible Sidebar component
- Org Switcher dropdown
- Auto-org creation on registration
- Members API (invite, list, remove)
- Invite acceptance page

## Files

| File | Purpose |
|------|---------|
| `src/app/(dashboard)/[orgSlug]/layout.tsx` | Org-scoped shell — validates membership |
| `src/components/dashboard/Sidebar.tsx` | Main navigation sidebar |
| `src/app/api/orgs/[orgId]/members/route.ts` | Members API |
| `src/app/(dashboard)/[orgSlug]/members/` | Members management UI |
| `src/app/invite/[token]/page.tsx` | Invite acceptance page |

## Multi-Tenancy Architecture

The key insight: **every database query within a dashboard page must be scoped to the org.**

```
URL: /my-startup/projects
     └── [orgSlug] = "my-startup"
         └── Layout validates user is a member of "my-startup"
             └── Page fetches projects WHERE orgId = membership.org.id
```

This prevents data leakage between organizations because:
1. The org is always resolved from the URL slug
2. Membership is always verified before any data is returned
3. Prisma queries filter by `orgId` at the database level

### The Layout Guard Pattern
```typescript
// [orgSlug]/layout.tsx
const membership = await prisma.membership.findFirst({
  where: {
    userId: session.user.id,
    org: { slug: orgSlug },  // Slug → Org lookup
  },
});
if (!membership) notFound();  // 404, not 403 (doesn't leak org existence)
```

Using `notFound()` instead of a 403 error is a security best practice — it prevents enumeration attacks (attackers can't tell if an org exists vs. if they're not a member).

## Sidebar Design

### Collapsible with Icon Mode
The sidebar supports two states:
- **Expanded (240px):** Full labels, org switcher, project list, user card
- **Collapsed (64px):** Icons only with tooltips

This pattern (used by Notion, Linear, Slack) maximizes screen real estate for large Kanban boards.

### Upgrade Banner
Free plan workspaces see an upgrade prompt at the bottom of the sidebar. Strategic placement — visible every session but not obtrusive.

## Invite System Flow
```
Admin → POST /api/orgs/[orgId]/members { email, role }
  → Creates Invite record with unique token + 48h expiry
  → Returns inviteUrl = /invite/[token]
  → Admin copies and shares link (email integration ready)

Invitee → GET /invite/[token]
  → Validates token exists and not expired
  → If not logged in: redirect to /register?callbackUrl=...
  → Creates Membership record
  → Deletes invite (single-use)
  → Redirects to org dashboard
```

## Checkpoints Passed
- ✅ Auto-org creation on registration (in transaction)
- ✅ Org-scoped layout with 404 guard
- ✅ Sidebar with collapsible state, org switcher, projects list
- ✅ Invite system (create + accept via token)
- ✅ Members page with list, invite form, pending invites
