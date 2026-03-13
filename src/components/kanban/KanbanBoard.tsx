"use client";

import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import toast from "react-hot-toast";
import { Plus, ArrowLeft, Settings2 } from "lucide-react";
import Link from "next/link";
import { cn, PRIORITY_CONFIG, STATUS_CONFIG, getInitials, formatDate } from "@/lib/utils";
import { TaskStatus, Role } from "@/types";
import { KANBAN_COLUMNS, TaskWithDetails, LabelItem } from "@/types";
import TaskModal from "./TaskModal";
import TaskCard from "./TaskCard";

interface Member {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
}

interface KanbanBoardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    color: string;
    orgId: string;
    tasks: TaskWithDetails[];
  };
  orgId: string;
  orgSlug: string;
  role: Role;
  members: Member[];
  labels: LabelItem[];
  currentUserId: string;
}

type ColumnTasks = Record<TaskStatus, TaskWithDetails[]>;

function groupByStatus(tasks: TaskWithDetails[]): ColumnTasks {
  const groups: ColumnTasks = { TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] };
  for (const task of tasks) {
    groups[task.status].push(task);
  }
  return groups;
}

export default function KanbanBoard({
  project,
  orgId,
  orgSlug,
  role,
  members,
  labels,
  currentUserId,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<ColumnTasks>(() => groupByStatus(project.tasks));
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
  const [creatingIn, setCreatingIn] = useState<TaskStatus | null>(null);
  const [quickTitle, setQuickTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const canEdit = role === "ADMIN" || role === "MEMBER";

  // ---- DRAG AND DROP ----
  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;

      const srcStatus = source.droppableId as TaskStatus;
      const dstStatus = destination.droppableId as TaskStatus;

      // Optimistic update
      setColumns((prev) => {
        const next = { ...prev };
        const srcCopy = [...prev[srcStatus]];
        const dstCopy = srcStatus === dstStatus ? srcCopy : [...prev[dstStatus]];

        const [moved] = srcCopy.splice(source.index, 1);
        const updatedMoved = { ...moved, status: dstStatus };

        if (srcStatus === dstStatus) {
          srcCopy.splice(destination.index, 0, updatedMoved);
          next[srcStatus] = srcCopy.map((t, i) => ({ ...t, position: i }));
        } else {
          dstCopy.splice(destination.index, 0, updatedMoved);
          next[srcStatus] = srcCopy.map((t, i) => ({ ...t, position: i }));
          next[dstStatus] = dstCopy.map((t, i) => ({ ...t, position: i }));
        }

        return next;
      });

      try {
        await fetch(`/api/orgs/${orgId}/projects/${project.id}/tasks/${draggableId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: dstStatus, position: destination.index }),
        });
      } catch {
        toast.error("Failed to update task position");
        // Revert by re-fetching (simplified)
        setColumns(groupByStatus(project.tasks));
      }
    },
    [orgId, project.id, project.tasks]
  );

  // ---- QUICK CREATE ----
  const handleQuickCreate = async (status: TaskStatus) => {
    if (!quickTitle.trim()) { setCreatingIn(null); return; }
    setIsCreating(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/projects/${project.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: quickTitle.trim(), status }),
      });
      const newTask = await res.json();
      if (!res.ok) { toast.error(newTask.error); return; }

      setColumns((prev) => ({
        ...prev,
        [status]: [...prev[status], { ...newTask, _count: { comments: 0 } }],
      }));
      setQuickTitle("");
      setCreatingIn(null);
      toast.success("Task created");
    } catch {
      toast.error("Failed to create task");
    } finally {
      setIsCreating(false);
    }
  };

  // ---- TASK UPDATE ----
  const handleTaskUpdate = (updatedTask: TaskWithDetails) => {
    setColumns((prev) => {
      // Remove from all columns
      const next = { ...prev };
      for (const status of Object.keys(next) as TaskStatus[]) {
        next[status] = next[status].filter((t) => t.id !== updatedTask.id);
      }
      // Add to correct column
      next[updatedTask.status] = [...next[updatedTask.status], updatedTask];
      return next;
    });
    setSelectedTask(updatedTask);
  };

  // ---- TASK DELETE ----
  const handleTaskDelete = (taskId: string, status: TaskStatus) => {
    setColumns((prev) => ({
      ...prev,
      [status]: prev[status].filter((t) => t.id !== taskId),
    }));
    setSelectedTask(null);
  };

  const totalTasks = Object.values(columns).flat().length;

  return (
    <div className="flex flex-col h-full">
      {/* Project Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0"
        style={{ borderTop: `3px solid ${project.color}` }}
      >
        <div className="flex items-center gap-4">
          <Link
            href={`/${orgSlug}/projects`}
            className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Projects</span>
          </Link>
          <div className="w-px h-5 bg-white/[0.08]" />
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: project.color + "25", border: `1px solid ${project.color}50` }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
            </div>
            <div>
              <h1 className="text-white font-semibold text-base">{project.name}</h1>
              <p className="text-slate-500 text-xs">{totalTasks} tasks</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Member avatars */}
          <div className="hidden sm:flex -space-x-2">
            {members.slice(0, 4).map((m) => (
              <div
                key={m.id}
                title={m.name || m.email}
                className="w-7 h-7 rounded-full bg-violet-600/30 border-2 border-[#0a0a0f] flex items-center justify-center text-xs font-bold text-violet-300"
              >
                {m.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.image} alt={m.name || ""} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(m.name)
                )}
              </div>
            ))}
          </div>
          <Link
            href={`/${orgSlug}/settings`}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <Settings2 className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 p-6 h-full min-w-max">
            {KANBAN_COLUMNS.map((col) => {
              const tasks = columns[col.id];
              const count = tasks.length;

              return (
                <div key={col.id} className="flex flex-col w-72 flex-shrink-0">
                  {/* Column Header */}
                  <div className={cn("flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 border", col.color, "bg-white/[0.02]")}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", col.accent)} />
                      <span className="text-white text-sm font-semibold">{col.label}</span>
                      <span className="text-slate-500 text-xs px-1.5 py-0.5 rounded-md bg-white/[0.05]">
                        {count}
                      </span>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => { setCreatingIn(col.id); setQuickTitle(""); }}
                        className="text-slate-500 hover:text-violet-400 transition-colors"
                        title="Add task"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Quick Add Input */}
                  {creatingIn === col.id && (
                    <div className="mb-2 p-2 rounded-xl bg-[#111118] border border-violet-500/30">
                      <input
                        autoFocus
                        type="text"
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleQuickCreate(col.id);
                          if (e.key === "Escape") { setCreatingIn(null); setQuickTitle(""); }
                        }}
                        placeholder="Task title... (Enter to save, Esc to cancel)"
                        className="w-full bg-transparent text-white text-sm placeholder-slate-600 focus:outline-none"
                        disabled={isCreating}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleQuickCreate(col.id)}
                          disabled={isCreating || !quickTitle.trim()}
                          className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setCreatingIn(null); setQuickTitle(""); }}
                          className="px-3 py-1 rounded-lg text-slate-400 hover:text-white text-xs transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Task List */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex-1 space-y-2.5 overflow-y-auto rounded-xl transition-all min-h-[100px] pb-2",
                          snapshot.isDraggingOver && "drop-zone-active ring-1 ring-violet-500/30 bg-violet-500/5"
                        )}
                      >
                        {tasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                            isDragDisabled={!canEdit}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <TaskCard
                                  task={task}
                                  isDragging={snapshot.isDragging}
                                  onClick={() => setSelectedTask(task)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {count === 0 && creatingIn !== col.id && !snapshot.isDraggingOver && (
                          <div className="flex flex-col items-center justify-center py-8 text-center opacity-50">
                            <div className={cn("w-1.5 h-8 rounded-full", col.accent, "opacity-30 mb-2")} />
                            <p className="text-slate-600 text-xs">No tasks</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          orgId={orgId}
          projectId={project.id}
          members={members}
          labels={labels}
          canEdit={canEdit}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
