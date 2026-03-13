# TaskFlow 🚀

**A full-stack, multi-tenant project management SaaS built with Next.js 14.**

> Manage projects, organize tasks on beautiful Kanban boards, collaborate with your team, and scale with Stripe payments.

---

## ✨ Features

- 🔐 **Authentication** — Google OAuth, GitHub OAuth, email/password (bcrypt)
- 🏢 **Multi-Tenancy** — Unlimited workspaces with full data isolation
- 📋 **Kanban Boards** — Drag-and-drop task management with 4 status columns
- 👥 **Team Collaboration** — Invite members via email links, role-based access (Admin/Member/Viewer)
- 💬 **Comments** — Threaded comments on every task
- 🏷️ **Labels** — Color-coded labels for task categorization
- 💳 **Billing** — Stripe subscription management (Free/Pro plans)
- 📊 **Dashboard** — Project completion stats and activity feed

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Custom Properties |
| Auth | NextAuth v5 Beta |
| Database ORM | Prisma |
| Database | PostgreSQL |
| Drag & Drop | @hello-pangea/dnd |
| Payments | Stripe |
| Notifications | react-hot-toast |
| Icons | Lucide React |
| Validation | Zod |
| Data Fetching | TanStack React Query |

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd taskflow
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required values:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Any random string (generate with `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — [Google Console](https://console.cloud.google.com)
- `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` — [GitHub Developer Settings](https://github.com/settings/developers)
- `STRIPE_SECRET_KEY` + `STRIPE_PUBLISHABLE_KEY` — [Stripe Dashboard](https://dashboard.stripe.com)

### 3. Initialize Database
```bash
npx prisma db push      # Apply schema to your database
npx prisma generate     # Generate TypeScript client
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/               # Login, Register pages
│   ├── (dashboard)/
│   │   └── [orgSlug]/        # Org-scoped pages
│   │       ├── page.tsx      # Dashboard home
│   │       ├── projects/     # Projects CRUD + Kanban board
│   │       ├── members/      # Team management
│   │       ├── settings/     # Org settings
│   │       └── billing/      # Stripe billing
│   ├── api/
│   │   ├── auth/             # NextAuth + registration
│   │   ├── orgs/             # Org, member, project, task, comment APIs
│   │   ├── stripe/           # Checkout session
│   │   └── webhooks/stripe/  # Stripe webhook
│   ├── invite/[token]/       # Invite acceptance
│   └── page.tsx              # Public landing page
├── components/
│   ├── dashboard/            # Sidebar, OrgSwitcher
│   ├── kanban/               # KanbanBoard, TaskCard, TaskModal
│   └── providers/            # QueryProvider
├── lib/
│   ├── auth.ts               # NextAuth config
│   ├── prisma.ts             # DB singleton
│   ├── stripe.ts             # Stripe client + plans
│   ├── utils.ts              # Helper functions
│   └── validations/          # Zod schemas
└── types/
    ├── index.ts              # Shared TS types
    └── next-auth.d.ts        # Session type augmentation
```

## 📚 Documentation

Per-phase engineering documentation is in [`/docs`](./docs/):
- [Phase 0 — Project Setup](./docs/phase-0-project-setup.md)
- [Phase 1 — Database Schema](./docs/phase-1-database-schema.md)
- [Phase 2 — Authentication](./docs/phase-2-authentication.md)
- [Phase 3 — Organizations](./docs/phase-3-organizations.md)
- [Phase 4 — Projects CRUD](./docs/phase-4-projects-crud.md)
- [Phase 5 — Kanban Board](./docs/phase-5-kanban-board.md)
- [Phase 7 — Stripe Billing](./docs/phase-7-stripe-billing.md)
- [Phase 9 — Landing Page](./docs/phase-9-landing-page.md)

## 🔑 API Reference

All API routes are under `/api/orgs/[orgId]/...` and are protected by authentication and role checks.

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/orgs/[orgId]/projects` | List projects |
| POST | `/api/orgs/[orgId]/projects` | Create project |
| PATCH | `/api/orgs/[orgId]/projects/[id]` | Update project |
| DELETE | `/api/orgs/[orgId]/projects/[id]` | Delete project |
| GET | `/api/orgs/[orgId]/projects/[id]/tasks` | List tasks |
| POST | `/api/orgs/[orgId]/projects/[id]/tasks` | Create task |
| PATCH | `/api/orgs/[orgId]/projects/[pId]/tasks/[id]` | Update task |
| DELETE | `/api/orgs/[orgId]/projects/[pId]/tasks/[id]` | Delete task |
| GET/POST | `/api/orgs/[orgId]/projects/.../comments` | Task comments |
| GET/POST/DELETE | `/api/orgs/[orgId]/members` | Members |
| POST | `/api/stripe/checkout` | Create checkout session |
| POST | `/api/webhooks/stripe` | Stripe webhook |

## 🔒 Role Permissions

| Permission | ADMIN | MEMBER | VIEWER |
|-----------|-------|--------|--------|
| View everything | ✅ | ✅ | ✅ |
| Create/edit tasks | ✅ | ✅ | ❌ |
| Create/edit projects | ✅ | ✅ | ❌ |
| Delete projects | ✅ | ❌ | ❌ |
| Invite members | ✅ | ❌ | ❌ |
| Remove members | ✅ | ❌ | ❌ |
| Manage billing | ✅ | ❌ | ❌ |
| Edit org settings | ✅ | ❌ | ❌ |
