import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, Clock, AlertCircle, TrendingUp, FolderKanban, 
  Users, Plus, ArrowUpRight 
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { TaskStatus, Priority } from "@/types";

interface OrgDashboardProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgDashboardPage({ params }: OrgDashboardProps) {
  const { orgSlug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, org: { slug: orgSlug } },
    include: { org: true },
  });

  if (!membership) redirect("/dashboard");

  const org = membership.org;

  // Fetch stats
  const [projects, taskStats, recentTasks] = await Promise.all([
    prisma.project.findMany({
      where: { orgId: org.id },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
        tasks: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.aggregate({
      where: { project: { orgId: org.id } },
      _count: true,
    }),
    prisma.task.findMany({
      where: { project: { orgId: org.id } },
      include: {
        project: { select: { name: true, color: true } },
        assignee: { select: { name: true, image: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
  ]);

  const doneCount = await prisma.task.count({
    where: { project: { orgId: org.id }, status: "DONE" },
  });
  const inProgressCount = await prisma.task.count({
    where: { project: { orgId: org.id }, status: "IN_PROGRESS" },
  });
  const todoCount = await prisma.task.count({
    where: { project: { orgId: org.id }, status: "TODO" },
  });
  const memberCount = await prisma.membership.count({ where: { orgId: org.id } });

  const totalTasks = taskStats._count;
  const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  const STATS = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: FolderKanban,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
      border: "border-violet-400/20",
    },
    {
      label: "Completed",
      value: doneCount,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
    },
    {
      label: "Team Members",
      value: memberCount,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
    },
  ];

  const PRIORITY_COLORS: Record<Priority, string> = {
    LOW: "bg-blue-400",
    MEDIUM: "bg-yellow-400",
    HIGH: "bg-orange-400",
    URGENT: "bg-red-400",
  };

  const STATUS_COLORS: Record<TaskStatus, string> = {
    TODO: "text-slate-400 bg-slate-400/10",
    IN_PROGRESS: "text-violet-400 bg-violet-400/10",
    IN_REVIEW: "text-amber-400 bg-amber-400/10",
    DONE: "text-emerald-400 bg-emerald-400/10",
  };

  const STATUS_LABELS: Record<TaskStatus, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    IN_REVIEW: "In Review",
    DONE: "Done",
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome back 👋
          </h1>
          <p className="text-slate-400 text-sm">
            Here&apos;s what&apos;s happening in <span className="text-white font-medium">{org.name}</span>
          </p>
        </div>
        <Link
          href={`/${orgSlug}/projects`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shadow-lg shadow-violet-500/20"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`p-5 rounded-2xl bg-[#111118] border ${stat.border} card-hover`}
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-slate-500 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Completion Rate */}
      <div className="p-6 rounded-2xl bg-[#111118] border border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-lg">Overall Completion</h3>
            <p className="text-slate-500 text-sm mt-0.5">Across all projects</p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-2xl font-bold text-white">{completionRate}%</span>
          </div>
        </div>
        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
          <span>{doneCount} completed</span>
          <span>{todoCount} remaining</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Projects */}
        <div className="p-6 rounded-2xl bg-[#111118] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">Projects</h3>
            <Link
              href={`/${orgSlug}/projects`}
              className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1 transition-colors"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 5).map((project: { id: string; name: string; color: string; tasks: {status: string}[] }) => {
              const done = project.tasks.filter((t) => t.status === "DONE").length;
              const total = project.tasks.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <Link
                  key={project.id}
                  href={`/${orgSlug}/projects/${project.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group"
                >
                  <div
                    className="w-2.5 h-10 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate group-hover:text-violet-300 transition-colors">
                      {project.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: project.color }}
                        />
                      </div>
                      <span className="text-slate-500 text-xs flex-shrink-0">{done}/{total}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-violet-400 transition-colors flex-shrink-0" />
                </Link>
              );
            })}
            {projects.length === 0 && (
              <div className="text-center py-8">
                <FolderKanban className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No projects yet</p>
                <Link href={`/${orgSlug}/projects`} className="text-violet-400 text-sm hover:text-violet-300 mt-1 inline-block">
                  Create your first project →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="p-6 rounded-2xl bg-[#111118] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">Recent Activity</h3>
            <AlertCircle className="w-4 h-4 text-slate-600" />
          </div>
          <div className="space-y-2">
            {recentTasks.slice(0, 6).map((task: { id: string; title: string; priority: string; status: string; project: { name: string; color: string } }) => (
              <div key={task.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: task.project.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{task.title}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{task.project.name}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_COLORS[task.priority as Priority]}`} />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[task.status as TaskStatus]}`}>
                    {STATUS_LABELS[task.status as TaskStatus]}
                  </span>
                </div>
              </div>
            ))}
            {recentTasks.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No tasks yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
