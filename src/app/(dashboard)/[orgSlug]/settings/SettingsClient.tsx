"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Save, Loader2, AlertTriangle, Building2 } from "lucide-react";
import { Role } from "@/types";
import { useRouter } from "next/navigation";

interface SettingsClientProps {
  org: { id: string; name: string; slug: string; plan: string };
  role: Role;
  userId: string;
}

export default function SettingsClient({ org, role, userId }: SettingsClientProps) {
  const router = useRouter();
  const isAdmin = role === "ADMIN";
  const [orgName, setOrgName] = useState(org.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/orgs/${org.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName }),
      });
      if (!res.ok) { toast.error("Failed to save"); return; }
      toast.success("Settings saved!");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-slate-400 text-sm">Manage your workspace settings</p>
      </div>

      {/* General Settings */}
      <div className="p-6 rounded-2xl bg-[#111118] border border-white/[0.06] mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-violet-400" />
          </div>
          <h2 className="text-white font-semibold">Workspace</h2>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Workspace Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              disabled={!isAdmin}
              className="w-full px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Workspace URL</label>
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-slate-600 text-sm">taskflow.app/</span>
              <span className="text-white text-sm">{org.slug}</span>
            </div>
            <p className="text-slate-600 text-xs mt-1">Workspace URLs cannot be changed after creation.</p>
          </div>
          {isAdmin && (
            <button
              type="submit"
              disabled={isSaving || orgName === org.name}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          )}
        </form>
      </div>

      {/* Danger Zone */}
      {isAdmin && (
        <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h2 className="text-red-400 font-semibold text-sm">Danger Zone</h2>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Deleting a workspace is irreversible. All projects, tasks, and members will be permanently removed.
          </p>
          <button
            onClick={() => toast.error("Workspace deletion is disabled for safety.")}
            className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium transition-all"
          >
            Delete workspace
          </button>
        </div>
      )}
    </div>
  );
}
