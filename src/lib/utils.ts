import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "text-blue-400", bg: "bg-blue-400/10" },
  MEDIUM: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  HIGH: { label: "High", color: "text-orange-400", bg: "bg-orange-400/10" },
  URGENT: { label: "Urgent", color: "text-red-400", bg: "bg-red-400/10" },
} as const;

export const STATUS_CONFIG = {
  TODO: { label: "To Do", color: "text-slate-400", bg: "bg-slate-400/10" },
  IN_PROGRESS: { label: "In Progress", color: "text-violet-400", bg: "bg-violet-400/10" },
  IN_REVIEW: { label: "In Review", color: "text-amber-400", bg: "bg-amber-400/10" },
  DONE: { label: "Done", color: "text-emerald-400", bg: "bg-emerald-400/10" },
} as const;
