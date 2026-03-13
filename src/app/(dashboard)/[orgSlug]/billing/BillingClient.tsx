"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Check, Zap, Crown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Role } from "@/types";

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for individuals and small teams",
    features: [
      "Up to 3 projects",
      "Up to 5 team members",
      "Basic Kanban board",
      "5MB file uploads",
      "Email support",
    ],
    cta: "Current plan",
    highlight: false,
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$12",
    period: "/month per seat",
    description: "For growing teams that need unlimited everything",
    features: [
      "Unlimited projects",
      "Unlimited team members",
      "Advanced Kanban + custom workflows",
      "50MB file uploads per file",
      "Analytics & reporting",
      "Priority support",
      "API access",
      "Custom labels",
    ],
    cta: "Upgrade to Pro",
    highlight: true,
  },
];

interface BillingClientProps {
  org: { id: string; name: string; slug: string; plan: string };
  role: Role;
}

export default function BillingClient({ org, role }: BillingClientProps) {
  const isAdmin = role === "ADMIN";
  const isPro = org.plan === "PRO";
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!isAdmin) { toast.error("Only admins can manage billing"); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: org.id }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to start checkout"); return; }
      window.location.href = data.url;
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Billing</h1>
        <p className="text-slate-400 text-sm">
          Current plan: <span className={cn("font-semibold", isPro ? "text-amber-400" : "text-slate-300")}>{org.plan}</span>
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
        {PLANS.map((plan) => {
          const isCurrentPlan = plan.id === org.plan;
          return (
            <div
              key={plan.id}
              className={cn(
                "relative p-6 rounded-2xl border flex flex-col",
                plan.highlight
                  ? "bg-gradient-to-b from-violet-600/10 to-indigo-600/5 border-violet-500/30"
                  : "bg-[#111118] border-white/[0.06]"
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-semibold shadow-lg">
                    <Zap className="w-3 h-3" />
                    Recommended
                  </span>
                </div>
              )}

              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  {plan.id === "PRO" ? (
                    <Crown className="w-5 h-5 text-amber-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                  )}
                  <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
                <p className="text-slate-500 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Check className={cn("w-4 h-4 flex-shrink-0", plan.highlight ? "text-violet-400" : "text-emerald-400")} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={plan.id === "PRO" && !isPro ? handleUpgrade : undefined}
                disabled={isCurrentPlan || isLoading || !isAdmin}
                className={cn(
                  "w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
                  isCurrentPlan
                    ? "bg-white/[0.05] text-slate-500 cursor-default border border-white/[0.06]"
                    : plan.highlight
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 disabled:opacity-50"
                    : "border border-white/[0.08] text-slate-400 cursor-default"
                )}
              >
                {isLoading && plan.id === "PRO" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {isCurrentPlan ? "✓ Current plan" : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Info */}
      {!isAdmin && (
        <p className="mt-6 text-slate-500 text-sm">
          Only workspace admins can manage billing. Contact your admin to upgrade.
        </p>
      )}
    </div>
  );
}
