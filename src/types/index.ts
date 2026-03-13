// Local enum definitions that mirror the Prisma schema
// These will be compatible with the generated Prisma types once db is set up

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type Role = "ADMIN" | "MEMBER" | "VIEWER";
export type Plan = "FREE" | "PRO";

// Extended types for data returned with relations

export interface UserBase {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface LabelItem {
  id: string;
  name: string;
  color: string;
  orgId: string;
}

export interface CommentWithAuthor {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: UserBase;
}

export interface TaskWithDetails {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  position: number;
  projectId: string;
  assigneeId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: UserBase | null;
  labels: LabelItem[];
  _count?: { comments: number };
}

export interface KanbanColumn {
  id: TaskStatus;
  label: string;
  color: string;
  accent: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: "TODO", label: "To Do", color: "border-slate-700/50", accent: "bg-slate-400" },
  { id: "IN_PROGRESS", label: "In Progress", color: "border-violet-700/30", accent: "bg-violet-400" },
  { id: "IN_REVIEW", label: "In Review", color: "border-amber-700/30", accent: "bg-amber-400" },
  { id: "DONE", label: "Done", color: "border-emerald-700/30", accent: "bg-emerald-400" },
];

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
