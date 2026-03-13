"use client";

import { MessageSquare, Calendar, AlertTriangle } from "lucide-react";
import { cn, PRIORITY_CONFIG, STATUS_CONFIG, getInitials, formatDate } from "@/lib/utils";
import { TaskWithDetails } from "@/types";

interface TaskCardProps {
  task: TaskWithDetails;
  isDragging: boolean;
  onClick: () => void;
}

export default function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  const priority = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  return (
    <div
      onClick={onClick}
      className={cn(
        "group p-3.5 rounded-xl bg-[#111118] border border-white/[0.06] cursor-pointer transition-all",
        "hover:border-white/[0.14] hover:shadow-lg hover:shadow-black/30",
        isDragging && "shadow-2xl shadow-violet-500/20 border-violet-500/30 rotate-1 scale-105"
      )}
    >
      {/* Priority indicator */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className={cn("text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1", priority.bg, priority.color)}>
          {task.priority === "URGENT" && <AlertTriangle className="w-2.5 h-2.5" />}
          {priority.label}
        </div>
        {task.labels.slice(0, 2).map((label) => (
          <div
            key={label.id}
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            title={label.name}
            style={{ backgroundColor: label.color }}
          />
        ))}
      </div>

      {/* Title */}
      <p className="text-white text-sm font-medium mb-3 leading-relaxed group-hover:text-violet-200 transition-colors line-clamp-3">
        {task.title}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Assignee */}
          {task.assignee && (
            <div
              className="w-5 h-5 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0"
              title={task.assignee.name || task.assignee.email}
            >
              {task.assignee.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={task.assignee.image}
                  alt={task.assignee.name || ""}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-[8px] font-bold text-violet-300">
                  {getInitials(task.assignee.name)}
                </span>
              )}
            </div>
          )}

          {/* Comments */}
          {(task._count?.comments ?? 0) > 0 && (
            <div className="flex items-center gap-1 text-slate-500">
              <MessageSquare className="w-3 h-3" />
              <span className="text-xs">{task._count?.comments}</span>
            </div>
          )}
        </div>

        {/* Due date */}
        {task.dueDate && (
          <div className={cn(
            "flex items-center gap-1 text-xs flex-shrink-0",
            isOverdue ? "text-red-400" : "text-slate-500"
          )}>
            <Calendar className="w-3 h-3" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
