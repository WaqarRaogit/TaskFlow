# Phase 5 — Tasks & Kanban Board

## What Was Built
- Full task CRUD API (GET, POST, PATCH, DELETE)
- Kanban board with 4 status columns and drag-and-drop
- TaskCard component with priority badges, label dots, assignee avatars
- Full-featured TaskModal with Details and Comments tabs
- Quick-add task within a column (click + icon or press Enter)
- Comments API (GET + POST per task)

## Files

| File | Purpose |
|------|---------|
| `src/app/api/orgs/[orgId]/projects/[projectId]/tasks/route.ts` | Task CRUD |
| `src/app/api/orgs/[orgId]/projects/[projectId]/tasks/[taskId]/route.ts` | Task update/delete |
| `src/app/api/orgs/[orgId]/projects/[projectId]/tasks/[taskId]/comments/route.ts` | Comments |
| `src/components/kanban/KanbanBoard.tsx` | Main board with DnD context |
| `src/components/kanban/TaskCard.tsx` | Individual task card |
| `src/components/kanban/TaskModal.tsx` | Task detail + edit modal |

## Drag-and-Drop Implementation

**Library:** `@hello-pangea/dnd` (community-maintained fork of react-beautiful-dnd with React 18+ support)

### Why @hello-pangea/dnd?
- Most mature DnD library for React (years of polish)
- Accessibility built-in (keyboard navigation, screen reader support)
- Better than HTML5 drag-and-drop (consistent cross-browser behavior)
- `@hello-pangea/dnd` fixes the React 18 StrictMode issues of the original

### Optimistic Update Pattern
When a task is dragged:
1. **Immediately** update local state (feels instant)
2. **In background:** send PATCH request to update status + position
3. **On error:** revert to original state, show toast

```typescript
// Optimistic update first
setColumns((prev) => {
  // ... move task in local state
});

// Then persist
await fetch(`/api/.../tasks/${taskId}`, {
  method: "PATCH",
  body: JSON.stringify({ status: dstStatus, position: destination.index }),
});
```

## TaskCard Design

Each card is a micro-interface with:
- **Priority badge** (colored pill with label)
- **Label dots** (up to 2 visible, colored circles matching label color)
- **Task title** (3-line clamp to prevent overflow)
- **Assignee avatar** (image or initials fallback)
- **Comment count** (with MessageSquare icon)
- **Due date** (red if overdue)
- **Drag rotation** (1° tilt when dragging for physical feel)

## TaskModal Design

Two-tab interface:
- **Details tab:** Title editor, description textarea, Status selector, Priority selector, Assignee dropdown, Due date picker, Label pills
- **Comments tab:** Chronological comment thread, comment input with Ctrl+Enter shortcut

### Why tabs instead of single scrolling view?
Separates the editing context from the discussion context. Users who just want to read comments don't have to scroll past all the form fields.

## Position Management
Tasks have a `position: Int` field. When calculating position for new tasks:
```typescript
const maxPos = await prisma.task.aggregate({
  where: { projectId, status },
  _max: { position: true },
});
const newPosition = (maxPos._max.position ?? -1) + 1;
```

This appends new tasks to the bottom of their column without needing to re-sequence all positions.

## Checkpoints Passed
- ✅ Tasks API (GET, POST, PATCH, DELETE) with auth/role guards
- ✅ Kanban board with 4 columns
- ✅ Drag-and-drop with optimistic updates
- ✅ TaskCard with priority, labels, assignee, due date
- ✅ TaskModal with details editing + comments
- ✅ Quick-add input in each column
- ✅ Comments API
