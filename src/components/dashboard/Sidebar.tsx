"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, FolderKanban, Users, Settings, CreditCard,
  ChevronDown, Plus, LogOut, User, Check, Zap, X, Menu
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Role } from "@/types";

interface SidebarOrg {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

interface SidebarProject {
  id: string;
  name: string;
  color: string;
}

interface SidebarProps {
  org: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    projects: SidebarProject[];
    _count: { members: number };
  };
  role: Role;
  user: { id: string; name: string | null; email: string; image: string | null };
  allOrgs: SidebarOrg[];
  currentOrgSlug: string;
}

const NAV_ITEMS = (slug: string) => [
  { href: `/${slug}`, label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: `/${slug}/projects`, label: "Projects", icon: FolderKanban },
  { href: `/${slug}/members`, label: "Members", icon: Users },
  { href: `/${slug}/settings`, label: "Settings", icon: Settings },
  { href: `/${slug}/billing`, label: "Billing", icon: CreditCard },
];

export default function Sidebar({ org, role, user, allOrgs, currentOrgSlug }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const orgRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) setOrgDropdownOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navItems = NAV_ITEMS(currentOrgSlug);

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "relative flex flex-col h-full border-r border-white/[0.06] bg-[#0d0d14] sidebar-transition z-20",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-[#1a1a24] border border-white/10 flex items-center justify-center hover:bg-[#22222e] transition-colors z-10"
        >
          <Menu className="w-3 h-3 text-slate-400" />
        </button>

        {/* Logo */}
        <div className={cn("flex items-center gap-2.5 px-4 py-5 border-b border-white/[0.06]", collapsed && "justify-center px-0")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-500/20">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          {!collapsed && (
            <span className="text-white font-bold text-base tracking-tight">TaskFlow</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-6">
          {/* Org Switcher */}
          <div className={cn("px-3", collapsed && "px-2")} ref={orgRef}>
            {!collapsed ? (
              <div className="relative">
                <button
                  onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                    >
                      {getInitials(org.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{org.name}</p>
                      <p className="text-slate-500 text-xs">{org.plan === "PRO" ? "Pro plan" : "Free plan"}</p>
                    </div>
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-slate-500 flex-shrink-0 transition-transform", orgDropdownOpen && "rotate-180")} />
                </button>

                {orgDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#1a1a24] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 scale-in">
                    <div className="p-1.5">
                      <p className="text-[11px] font-medium text-slate-500 px-2 py-1 uppercase tracking-wider">Workspaces</p>
                      {allOrgs.map((o) => (
                        <button
                          key={o.id}
                          onClick={() => {
                            router.push(`/${o.slug}`);
                            setOrgDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.06] transition-colors text-left"
                        >
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                          >
                            {getInitials(o.name)}
                          </div>
                          <span className="text-white text-sm truncate flex-1">{o.name}</span>
                          {o.slug === currentOrgSlug && <Check className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-white/[0.06] p-1.5">
                      <button
                        onClick={() => { router.push("/new-org"); setOrgDropdownOpen(false); }}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/[0.06] transition-colors text-left"
                      >
                        <div className="w-6 h-6 rounded-md border border-dashed border-white/20 flex items-center justify-center">
                          <Plus className="w-3 h-3 text-slate-400" />
                        </div>
                        <span className="text-slate-400 text-sm">Create workspace</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                className="w-full flex justify-center p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
                title={org.name}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                >
                  {getInitials(org.name)}
                </div>
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className={cn("space-y-0.5 px-3", collapsed && "px-2")}>
            {!collapsed && (
              <p className="text-[11px] font-medium text-slate-600 px-2 pb-1.5 uppercase tracking-wider">Navigation</p>
            )}
            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm transition-all group relative",
                    collapsed && "justify-center px-0 py-2.5",
                    active
                      ? "bg-violet-600/15 text-violet-300 border border-violet-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-500 rounded-r" />
                  )}
                  <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-violet-400" : "group-hover:text-white")} />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Projects */}
          {!collapsed && (
            <div className="px-3">
              <div className="flex items-center justify-between px-2 mb-1.5">
                <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">Projects</p>
                {(role === "ADMIN" || role === "MEMBER") && (
                  <Link
                    href={`/${currentOrgSlug}/projects/new`}
                    className="text-slate-500 hover:text-violet-400 transition-colors"
                    title="New project"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
              <div className="space-y-0.5">
                {org.projects.slice(0, 8).map((project) => (
                  <Link
                    key={project.id}
                    href={`/${currentOrgSlug}/projects/${project.id}`}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all",
                      pathname.includes(project.id)
                        ? "text-white bg-white/[0.06]"
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                    )}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                  </Link>
                ))}
                {org.projects.length === 0 && (
                  <p className="text-slate-600 text-xs px-2.5 py-1">No projects yet</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Plan upgrade banner */}
        {!collapsed && org.plan === "FREE" && (
          <div className="px-3 pb-3">
            <div className="rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/10 border border-violet-500/20 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-violet-300 text-xs font-semibold">Upgrade to Pro</span>
              </div>
              <p className="text-slate-400 text-xs mb-3 leading-relaxed">
                Unlock unlimited projects, members, and analytics.
              </p>
              <Link
                href={`/${currentOrgSlug}/billing`}
                className="block w-full text-center py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
              >
                Upgrade now
              </Link>
            </div>
          </div>
        )}

        {/* User Menu */}
        <div className={cn("border-t border-white/[0.06] p-3", collapsed && "p-2")} ref={userRef}>
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={cn(
                "w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.06] transition-all",
                collapsed && "justify-center p-2"
              )}
            >
              <div className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name || ""} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-violet-300">{getInitials(user.name)}</span>
                )}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white text-xs font-medium truncate">{user.name}</p>
                  <p className="text-slate-500 text-xs truncate">{user.email}</p>
                </div>
              )}
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1a1a24] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-50 scale-in">
                <div className="p-1.5">
                  <Link
                    href={`/${currentOrgSlug}/profile`}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-white transition-colors text-sm"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="w-3.5 h-3.5" />
                    Profile settings
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-red-500/10 text-slate-300 hover:text-red-400 transition-colors text-sm"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
