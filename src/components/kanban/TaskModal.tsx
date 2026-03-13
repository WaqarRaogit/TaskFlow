"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  X, Loader2, Trash2, User as UserIcon, Calendar, Tag,
  MessageSquare, Flag, Send, ChevronDown
} from "lucide-react";
import { cn, PRIORITY_CONFIG, STATUS_CONFIG, getInitials, formatRelativeTime } from "@/lib/utils";
import { Priority, TaskStatus } from "@/types";
import { TaskWithDetails, LabelItem, CommentWithAuthor } from "@/types";

interface Member {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
}

interface TaskModalProps {
  task: TaskWithDetails;
  orgId: string;
  projectId: string;
  members: Member[];
  labels: LabelItem[];
  canEdit: boolean;
  onUpdate: (task: TaskWithDetails) => void;
  onDelete: (taskId: string, status: TaskStatus) => void;
  onClose: () => void;
}

const PRIORITIES = Object.keys(PRIORITY_CONFIG) as Priority[];
const STATUSES = Object.keys(STATUS_CONFIG) as TaskStatus[];

export default function TaskModal({
  task,
  orgId,
  projectId,
  members,
  labels,
  canEdit,
  onUpdate,
  onDelete,
  onClose,
}: TaskModalProps) {
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || "",
    status: task.status,
    priority: task.priority,
    assigneeId: task.assignee?.id || "",
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    labelIds: task.labels.map((l) => l.id),
  });
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "comments">("details");

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/projects/${projectId}/tasks/${task.id}/comments`);
      if (res.ok) setComments(await res.json());
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/projects/${projectId}/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          assigneeId: form.assigneeId || null,
          dueDate: form.dueDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      onUpdate(data);
      toast.success("Task updated");
    } catch {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/projects/${projectId}/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete"); return; }
      onDelete(task.id, task.status);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setIsPostingComment(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/projects/${projectId}/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setComments((prev) => [...prev, data]);
      setNewComment("");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setIsPostingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0f0f18] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={cn("text-xs font-medium px-2.5 py-1 rounded-full", PRIORITY_CONFIG[form.priority].bg, PRIORITY_CONFIG[form.priority].color)}>
              <Flag className="w-3 h-3 inline mr-1" />
              {PRIORITY_CONFIG[form.priority].label}
            </div>
            <div className={cn("text-xs font-medium px-2.5 py-1 rounded-full", STATUS_CONFIG[form.status].bg, STATUS_CONFIG[form.status].color)}>
              {STATUS_CONFIG[form.status].label}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06] px-6 flex-shrink-0">
          {["details", "comments"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "details" | "comments")}
              className={cn(
                "py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-all capitalize",
                activeTab === tab
                  ? "border-violet-500 text-violet-300"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              )}
            >
              {tab}
              {tab === "comments" && comments.length > 0 && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-white/[0.06] text-slate-400">
                  {comments.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "details" ? (
            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                {canEdit ? (
                  <textarea
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full text-xl font-bold text-white bg-transparent focus:outline-none resize-none placeholder-slate-600 leading-snug"
                    rows={2}
                    placeholder="Task title"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-white">{task.title}</h2>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Description</label>
                {canEdit ? (
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Add a description..."
                    rows={4}
                    className="w-full px-3.5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/50 transition-all resize-none"
                  />
                ) : (
                  <p className="text-slate-300 text-sm leading-relaxed">{task.description || "No description."}</p>
                )}
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                      disabled={!canEdit}
                      className="w-full appearance-none px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all disabled:opacity-60 cursor-pointer"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-[#111118]">
                          {STATUS_CONFIG[s].label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Priority</label>
                  <div className="relative">
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                      disabled={!canEdit}
                      className="w-full appearance-none px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all disabled:opacity-60 cursor-pointer"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p} className="bg-[#111118]">
                          {PRIORITY_CONFIG[p].label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                    <UserIcon className="w-3 h-3 inline mr-1" />Assignee
                  </label>
                  <div className="relative">
                    <select
                      value={form.assigneeId}
                      onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                      disabled={!canEdit}
                      className="w-full appearance-none px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all disabled:opacity-60 cursor-pointer"
                    >
                      <option value="" className="bg-[#111118]">Unassigned</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#111118]">
                          {m.name || m.email}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                    <Calendar className="w-3 h-3 inline mr-1" />Due Date
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    disabled={!canEdit}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all disabled:opacity-60 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Labels */}
              {labels.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                    <Tag className="w-3 h-3 inline mr-1" />Labels
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {labels.map((label) => {
                      const isSelected = form.labelIds.includes(label.id);
                      return (
                        <button
                          key={label.id}
                          type="button"
                          disabled={!canEdit}
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              labelIds: isSelected
                                ? prev.labelIds.filter((id) => id !== label.id)
                                : [...prev.labelIds, label.id],
                            }));
                          }}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                            isSelected ? "opacity-100" : "opacity-40 hover:opacity-70"
                          )}
                          style={{
                            color: label.color,
                            borderColor: label.color + "50",
                            backgroundColor: label.color + "20",
                          }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: label.color }} />
                          {label.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4 mb-6">
                {loadingComments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-violet-300">
                        {comment.author.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={comment.author.image} alt="" className="w-full h-full rounded-full" />
                        ) : (
                          getInitials(comment.author.name)
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-sm font-medium">{comment.author.name || comment.author.email}</span>
                          <span className="text-slate-600 text-xs">{formatRelativeTime(comment.createdAt)}</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No comments yet</p>
                  </div>
                )}
              </div>

              {canEdit && (
                <div className="flex gap-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePostComment(); }}
                    placeholder="Write a comment... (Ctrl+Enter to send)"
                    rows={3}
                    className="flex-1 px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/50 transition-all resize-none"
                  />
                  <button
                    onClick={handlePostComment}
                    disabled={isPostingComment || !newComment.trim()}
                    className="self-end p-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-50"
                  >
                    {isPostingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer (save button) */}
        {canEdit && activeTab === "details" && (
          <div className="px-6 py-4 border-t border-white/[0.06] flex-shrink-0 flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-slate-400 text-sm hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
