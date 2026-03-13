import Link from "next/link";
import {
  Zap, Shield, BarChart3, Users, FolderKanban, CheckCircle2,
  ArrowRight, Star, Github
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "TaskFlow — Modern Project Management for Teams",
  description:
    "TaskFlow is a powerful, multi-tenant project management platform. Kanban boards, team collaboration, and smart analytics — built for modern teams.",
};

const FEATURES = [
  {
    icon: FolderKanban,
    title: "Visual Kanban Boards",
    desc: "Drag-and-drop task management with beautiful, customizable columns that your team will actually love to use.",
    color: "violet",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Invite teammates, assign tasks, leave comments, and collaborate in real-time across all your projects.",
    color: "blue",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    desc: "Track velocity, completion rates, and identify bottlenecks with a beautiful analytics dashboard.",
    color: "emerald",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "Role-based access control, audit logs, and data isolation ensure your data stays safe and private.",
    color: "amber",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Built on Next.js 14 with server components for instant page loads and real-time updates.",
    color: "orange",
  },
  {
    icon: CheckCircle2,
    title: "Multi-Tenant",
    desc: "Create multiple workspaces for different clients or teams — complete data isolation guaranteed.",
    color: "pink",
  },
];

const COLOR_MAP: Record<string, { text: string; bg: string; border: string }> = {
  violet: { text: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" },
  blue: { text: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  amber: { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  orange: { text: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
  pink: { text: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20" },
};

const TESTIMONIALS = [
  {
    quote: "TaskFlow transformed how our team ships products. We went from chaos to clarity in one week.",
    author: "Sarah Chen",
    role: "CTO at Horizons",
    avatar: "SC",
    stars: 5,
  },
  {
    quote: "The Kanban board is so smooth it almost makes work fun. Almost.",
    author: "Marcus Williams",
    role: "Product Lead at Nexus",
    avatar: "MW",
    stars: 5,
  },
  {
    quote: "Finally a PM tool that doesn't require a training course to set up.",
    author: "Priya Sharma",
    role: "Engineering Manager",
    avatar: "PS",
    stars: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] backdrop-blur-xl bg-[#0a0a0f]/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">TaskFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-slate-400 hover:text-white text-sm transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shadow-lg shadow-violet-500/25"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[300px] h-[300px] bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-8">
            <Zap className="w-3 h-3" />
            Used by 10,000+ high-performance teams
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
            Project management{" "}
            <br />
            <span className="gradient-text">done differently</span>
          </h1>

          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            TaskFlow combines the flexibility of a Kanban board with the power of multi-tenant collaboration.
            Ship faster, together.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-base shadow-xl shadow-violet-500/25 transition-all hover:scale-105"
            >
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://github.com"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-white hover:bg-white/[0.04] font-medium text-base transition-all"
            >
              <Github className="w-5 h-5" /> View on GitHub
            </a>
          </div>

          <p className="text-slate-600 text-sm mt-5">No credit card required • Free forever for small teams</p>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-5xl mx-auto mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent z-10 pointer-events-none h-full" style={{ background: "linear-gradient(to top, #0a0a0f 0%, transparent 40%)" }} />
          <div className="rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl shadow-violet-500/10 bg-[#111118]">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0d0d14]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/40" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/40" />
                <div className="w-3 h-3 rounded-full bg-green-400/40" />
              </div>
              <div className="flex-1 mx-3 px-3 py-1 rounded-md bg-white/[0.04] text-slate-600 text-xs font-mono text-center">
                taskflow.app/my-startup
              </div>
            </div>
            {/* Fake kanban preview */}
            <div className="p-6 flex gap-4 overflow-hidden h-64">
              {["To Do", "In Progress", "In Review", "Done"].map((col, i) => (
                <div key={col} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${["bg-slate-400","bg-violet-400","bg-amber-400","bg-emerald-400"][i]}`} />
                    <span className="text-white text-xs font-semibold">{col}</span>
                    <span className="text-slate-600 text-xs">{[3,2,1,4][i]}</span>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: [3,2,1,4][i] }).map((_, j) => (
                      <div key={j} className="p-2.5 rounded-lg bg-[#1a1a24] border border-white/[0.06]">
                        <div className={`h-1.5 rounded mb-2 ${["w-4/5","w-3/5","w-4/5","w-3/5"][j % 4]} bg-white/10`} />
                        <div className={`h-1 rounded ${["w-2/5","w-3/5","w-2/5","w-4/5"][j % 4]} bg-white/[0.05]`} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-[#0d0d14]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Everything you need</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Built for serious teams</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Every feature was designed with productivity in mind — no bloat, just the tools that actually matter.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              const colors = COLOR_MAP[feature.color];
              return (
                <div key={feature.title} className="p-6 rounded-2xl bg-[#111118] border border-white/[0.06] hover:border-white/[0.12] card-hover">
                  <div className={`w-11 h-11 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-3">Loved by builders</h2>
            <p className="text-slate-400">Join thousands of teams shipping faster with TaskFlow</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="p-6 rounded-2xl bg-[#111118] border border-white/[0.06]">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{t.author}</p>
                    <p className="text-slate-600 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-[#0d0d14]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-3">Simple pricing</h2>
            <p className="text-slate-400">Start free, scale when you&apos;re ready</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl bg-[#111118] border border-white/[0.06]">
              <h3 className="text-white font-bold text-2xl mb-1">Free</h3>
              <p className="text-slate-500 text-sm mb-6">Perfect for getting started</p>
              <div className="text-4xl font-bold text-white mb-6">$0<span className="text-slate-500 text-lg font-normal">/mo</span></div>
              <ul className="space-y-3 mb-8">
                {["3 projects","5 team members","Basic Kanban","5MB uploads","Email support"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block w-full text-center py-3 rounded-xl border border-white/[0.1] text-white text-sm font-semibold hover:bg-white/[0.04] transition-colors">
                Get started free
              </Link>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-b from-violet-600/15 to-indigo-600/5 border border-violet-500/30 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-1 rounded-full bg-violet-600 text-white text-xs font-semibold">Most popular</span>
              </div>
              <h3 className="text-white font-bold text-2xl mb-1">Pro</h3>
              <p className="text-slate-400 text-sm mb-6">For growing teams</p>
              <div className="text-4xl font-bold text-white mb-6">$12<span className="text-slate-500 text-lg font-normal">/seat/mo</span></div>
              <ul className="space-y-3 mb-8">
                {["Unlimited projects","Unlimited members","Advanced Kanban","50MB uploads","Priority support","Analytics dashboard","API access"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block w-full text-center py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-500/25">
                Start Pro trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-violet-600/20 to-indigo-600/10 border border-violet-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent" />
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">Ready to ship faster?</h2>
              <p className="text-slate-400 text-lg mb-8">Join 10,000+ teams building great products with TaskFlow.</p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-base shadow-2xl shadow-violet-500/30 transition-all hover:scale-105"
              >
                Create free account <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-slate-600 text-sm mt-4">No credit card • Ready in 60 seconds</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-white font-semibold">TaskFlow</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <a href="/terms" className="hover:text-slate-400 transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</a>
            <a href="/docs" className="hover:text-slate-400 transition-colors">Docs</a>
          </div>
          <p className="text-slate-700 text-sm">© 2026 TaskFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
