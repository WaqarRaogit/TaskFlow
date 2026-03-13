"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Plus, FolderKanban, MoreHorizontal, Pencil, Trash2,
  Search, CheckCircle2, Clock, AlertCircle, Loader2, X
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Role, TaskStatus } from "@/types";
import { useRouter } from "next/navigation";

const PROJECT_COLORS = [
  "#7c3aed", "#4f46e5", "#0ea5e9", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6",
];

interface ProjectItem {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  _count: { tasks: number };
  tasks: { status: TaskStatus }[];
}

interface OrgData {
  id: string;
  name: string;
  slug: string;
  projects: ProjectItem[];
}

interface ProjectsClientProps {
  org: OrgData;
  role: Role;
  orgSlug: string;
}

export default function ProjectsClient({ org, role, orgSlug }: ProjectsClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(org.projects);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<ProjectItem | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", color: "#7c3aed" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canEdit = role === "ADMIN" || role === "MEMBER";
  const canDelete = role === "ADMIN";

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditProject(null);
    setForm({ name: "", description: "", color: "#7c3aed" });
    setShowModal(true);
  };

  const openEdit = (project: ProjectItem) => {
    setEditProject(project);
    setForm({ name: project.name, description: project.description || "", color: project.color });
    setShowModal(true);
    setOpenMenu(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setIsSubmitting(true);

    try {
      const url = editProject
        ? `/api/orgs/${org.id}/projects/${editProject.id}`
        : `/api/orgs/${org.id}/projects`;
      const method = editProject ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed"); return; }

      if (editProject) {
        setProjects((prev) => prev.map((p) => p.id === editProject.id ? { ...p, ...data } : p));
        toast.success("Project updated!");
      } else {
        setProjects((prev) => [{ ...data, tasks: [], _count: { tasks: 0 } }, ...prev]);
        toast.success("Project created!");
      }

      setShowModal(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("Delete this project and all its tasks? This cannot be undone.")) return;
    setOpenMenu(null);

    try {
      const res = await fetch(`/api/orgs/${org.id}/projects/${projectId}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete"); return; }
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success("Project deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const getProjectStats = (project: ProjectItem) => {
    const done = project.tasks.filter((t) => t.status === "DONE").length;
    const inProgress = project.tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const total = project.tasks.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { done, inProgress, total, pct };
  };

  return (
    <div className="p-6 lg:p-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Projects</h1>
          <p className="text-slate-400 text-sm">{projects.length} projects in {org.name}</p>
        </div>
        {canEdit && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
        />
      </div>

      {/* Projects Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((project) => {
            const stats = getProjectStats(project);
            return (
              <div key={project.id} className="group relative p-5 rounded-2xl bg-[#111118] border border-white/[0.06] hover:border-white/[0.12] card-hover flex flex-col">
                {/* Top bar color */}
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ backgroundColor: project.color }} />

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: project.color + "20", border: `1px solid ${project.color}40` }}
                    >
                      <FolderKanban className="w-5 h-5" style={{ color: project.color }} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold truncate max-w-[160px]">{project.name}</h3>
                      <p className="text-slate-600 text-xs mt-0.5">{formatDate(project.createdAt)}</p>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="relative">
                      <button
                        onClick={(e) => { e.preventDefault(); setOpenMenu(openMenu === project.id ? null : project.id); }}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-white/[0.06] transition-all opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenu === project.id && (
                        <div className="absolute right-0 top-full mt-1 bg-[#1a1a24] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-10 min-w-[140px] scale-in">
                          <button onClick={() => openEdit(project)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors">
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          {canDelete && (
                            <button onClick={() => handleDelete(project.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {project.description && (
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{project.description}</p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-slate-500">Progress</span>
                    <span className="text-xs text-slate-400 font-medium">{stats.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${stats.pct}%`, backgroundColor: project.color }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 mb-5 mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {stats.done} done
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-violet-400" />
                    {stats.inProgress} in progress
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                    {stats.total} total
                  </div>
                </div>

                <Link
                  href={`/${orgSlug}/projects/${project.id}`}
                  className="block w-full text-center py-2.5 rounded-xl text-sm font-medium transition-all border"
                  style={{
                    color: project.color,
                    borderColor: project.color + "40",
                    backgroundColor: project.color + "10",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = project.color + "25";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = project.color + "10";
                  }}
                >
                  Open Board
                </Link>
              </div>
            );
          })}

          {/* Create new project card */}
          {canEdit && (
            <button
              onClick={openCreate}
              className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-dashed border-white/[0.1] hover:border-violet-500/40 hover:bg-violet-500/5 text-slate-600 hover:text-violet-400 transition-all min-h-[200px]"
            >
              <div className="w-12 h-12 rounded-2xl border border-dashed border-current flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">New Project</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-4">
            <FolderKanban className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            {search ? "No projects found" : "No projects yet"}
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            {search ? `No projects matching "${search}"` : "Get started by creating your first project"}
          </p>
          {canEdit && !search && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-[#111118] border border-white/[0.08] rounded-2xl shadow-2xl scale-in">
            <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">
                {editProject ? "Edit Project" : "Create Project"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Marketing Website"
                  className="w-full px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/60 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/60 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={cn(
                        "w-8 h-8 rounded-lg transition-all",
                        form.color === color ? "ring-2 ring-white scale-110" : "opacity-70 hover:opacity-100"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-slate-400 text-sm font-medium hover:bg-white/[0.04] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editProject ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
