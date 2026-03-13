"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  UserPlus, Crown, Shield, Eye, Trash2, Loader2,
  Mail, Clock, Copy, Check
} from "lucide-react";
import { cn, getInitials, formatDate } from "@/lib/utils";
import { Role } from "@/types";
import { useRouter } from "next/navigation";

const ROLE_CONFIG = {
  ADMIN: { label: "Admin", icon: Crown, color: "text-amber-400", bg: "bg-amber-400/10" },
  MEMBER: { label: "Member", icon: Shield, color: "text-violet-400", bg: "bg-violet-400/10" },
  VIEWER: { label: "Viewer", icon: Eye, color: "text-slate-400", bg: "bg-slate-400/10" },
};

interface MembersClientProps {
  org: {
    id: string;
    name: string;
    members: {
      id: string;
      role: Role;
      user: { id: string; name: string | null; email: string; image: string | null };
    }[];
    invites: {
      id: string;
      email: string;
      role: Role;
      expiresAt: string;
      token: string;
    }[];
  };
  currentRole: Role;
  currentUserId: string;
}

export default function MembersClient({ org, currentRole, currentUserId }: MembersClientProps) {
  const router = useRouter();
  const isAdmin = currentRole === "ADMIN";
  const [inviteForm, setInviteForm] = useState({ email: "", role: "MEMBER" as "MEMBER" | "VIEWER" });
  const [isInviting, setIsInviting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [members, setMembers] = useState(org.members);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      const res = await fetch(`/api/orgs/${org.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(`Invite sent to ${inviteForm.email}!`);
      setInviteUrl(data.inviteUrl);
      setInviteForm({ ...inviteForm, email: "" });
      router.refresh();
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    if (!confirm("Remove this member from the organization?")) return;
    try {
      const res = await fetch(`/api/orgs/${org.id}/members?membershipId=${membershipId}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to remove member"); return; }
      setMembers((prev) => prev.filter((m) => m.id !== membershipId));
      toast.success("Member removed");
    } catch {
      toast.error("Something went wrong");
    }
  };

  const copyInviteUrl = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Members</h1>
        <p className="text-slate-400 text-sm">{members.length} member{members.length !== 1 ? "s" : ""} in {org.name}</p>
      </div>

      {/* Invite Form */}
      {isAdmin && (
        <div className="mb-8 p-6 rounded-2xl bg-[#111118] border border-white/[0.06]">
          <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-violet-400" />
            Invite a teammate
          </h2>
          <p className="text-slate-500 text-sm mb-4">Send an invite link to add someone to your workspace.</p>
          <form onSubmit={handleInvite} className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="colleague@company.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as "MEMBER" | "VIEWER" })}
              className="px-3 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all"
            >
              <option value="MEMBER" className="bg-[#111118]">Member</option>
              <option value="VIEWER" className="bg-[#111118]">Viewer (read-only)</option>
            </select>
            <button
              type="submit"
              disabled={isInviting}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Send Invite
            </button>
          </form>

          {/* Invite URL */}
          {inviteUrl && (
            <div className="mt-4 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center gap-3">
              <p className="text-violet-300 text-xs flex-1 truncate font-mono">{inviteUrl}</p>
              <button
                onClick={copyInviteUrl}
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors flex-shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Members List */}
      <div className="rounded-2xl bg-[#111118] border border-white/[0.06] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-white font-semibold">Team Members</h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {members.map((member) => {
            const RoleIcon = ROLE_CONFIG[member.role].icon;
            const isSelf = member.user.id === currentUserId;
            const isOwner = member.role === "ADMIN";
            return (
              <div key={member.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-9 h-9 rounded-full bg-violet-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  {member.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.user.image} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-violet-300">{getInitials(member.user.name)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {member.user.name || member.user.email}
                    {isSelf && <span className="text-slate-500 text-xs ml-1.5">(you)</span>}
                  </p>
                  <p className="text-slate-500 text-xs truncate">{member.user.email}</p>
                </div>
                <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", ROLE_CONFIG[member.role].bg, ROLE_CONFIG[member.role].color)}>
                  <RoleIcon className="w-3 h-3" />
                  {ROLE_CONFIG[member.role].label}
                </div>
                {isAdmin && !isSelf && !isOwner && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invites */}
      {isAdmin && org.invites.length > 0 && (
        <div className="mt-6 rounded-2xl bg-[#111118] border border-white/[0.06] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <h2 className="text-white font-semibold text-sm">Pending Invites</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {org.invites.map((invite) => (
              <div key={invite.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{invite.email}</p>
                  <div className="flex items-center gap-1.5 text-slate-600 text-xs mt-0.5">
                    <Clock className="w-3 h-3" />
                    Expires {formatDate(invite.expiresAt)}
                  </div>
                </div>
                <span className="text-xs text-slate-500 px-2 py-1 rounded-full bg-white/[0.04]">
                  {ROLE_CONFIG[invite.role].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
