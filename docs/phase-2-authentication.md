# Phase 2 — Authentication

## What Was Built
- NextAuth v5 Beta configuration with 3 providers
- Registration API with password hashing and auto-org creation
- Route protection middleware
- Premium login and register pages with real-time password validation

## Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | NextAuth configuration |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth catch-all handler |
| `src/app/api/auth/register/route.ts` | Custom registration endpoint |
| `src/middleware.ts` | Route protection |
| `src/app/(auth)/layout.tsx` | Split-panel auth layout |
| `src/app/(auth)/login/page.tsx` | Login form |
| `src/app/(auth)/register/page.tsx` | Register form |
| `src/types/next-auth.d.ts` | Type augmentation to add `user.id` to session |

## Authentication Strategy

### Providers
1. **Google OAuth** — Fast, frictionless for users with Google accounts
2. **GitHub OAuth** — Popular among technical teams
3. **Credentials** — Email + bcrypt-hashed password for users who don't want OAuth

### Session Strategy: JWT
We use JWT sessions (`strategy: "jwt"`) instead of database sessions because:
- No extra database query on every request
- Works well with the PrismaAdapter
- We store `user.id` in the JWT payload via the `jwt` callback

### Why NextAuth v5?
- Native App Router support (no more wrapping in `SessionProvider`)
- `auth()` server-side function works in Server Components, Route Handlers, and Server Actions
- The `handlers` export pattern is cleaner than the old Pages Router approach

### Password Security
- Passwords hashed with `bcrypt` at cost factor **12** (2^12 iterations)
- Cost 12 is the industry standard balance between security and performance (~250ms per hash)
- We NEVER store plain text passwords
- `null` password is valid for OAuth-only users

## Registration Flow
```
POST /api/auth/register
  → Zod validate (name, email, password)
  → Check email uniqueness
  → bcrypt.hash(password, 12)
  → prisma.$transaction:
      → Create User
      → Create Organization ("Name's Workspace")
      → Create Membership (ADMIN role)
  → Return 201 Created
```

**Why a transaction?** If org creation fails after user creation, you'd have a user with no workspace. Transactions ensure both succeed or both fail atomically.

## UI Design Decisions

### Split-Panel Layout
The auth pages use a 50/50 split: brand story on the left, form on the right. This pattern is used by Vercel, Linear, Notion, and other premium products. It:
- Reinforces brand messaging at the moment of signup
- Gives the form area breathing room
- Disappears gracefully on mobile (shows stacked layout)

### Password Strength Indicator
Real-time validation with 3 rules (length, uppercase, number) shown as:
- Color-coded progress bars (red → yellow → green)
- Individual checkmarks per rule
- Submit button disabled until all pass

This reduces failed registrations and sets user expectations upfront.

## Checkpoints Passed
- ✅ Registration API with auto-org creation
- ✅ NextAuth configured with Google, GitHub, credentials
- ✅ JWT session with user.id
- ✅ Middleware protects dashboard routes
- ✅ Login/register pages built with premium design
