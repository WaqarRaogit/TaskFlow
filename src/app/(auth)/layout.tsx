import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your TaskFlow account",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0a0f] items-center justify-center">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl" />
        
        <div className="relative z-10 px-16 max-w-2xl">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-white font-semibold text-xl tracking-tight">TaskFlow</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Build products{" "}
            <span className="gradient-text">your team</span>{" "}
            actually loves to use
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-12">
            Streamline your workflow with powerful Kanban boards, smart task management, and seamless team collaboration.
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {["A", "B", "C", "D"].map((l, i) => (
                <div
                  key={l}
                  className="w-9 h-9 rounded-full border-2 border-[#0a0a0f] flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: ["#7c3aed","#4f46e5","#0ea5e9","#10b981"][i] }}
                >
                  {l}
                </div>
              ))}
            </div>
            <div>
              <p className="text-white text-sm font-medium">Trusted by 10,000+ teams</p>
              <p className="text-slate-500 text-xs">across 120+ countries</p>
            </div>
          </div>

          {/* Feature cards */}
          <div className="mt-12 grid gap-3">
            {[
              { icon: "⚡", title: "Real-time collaboration", desc: "See changes instantly across your team" },
              { icon: "📊", title: "Smart analytics", desc: "Understand your team's velocity and bottlenecks" },
              { icon: "🔒", title: "Enterprise-grade security", desc: "SOC2 compliant with end-to-end encryption" },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-xl mt-0.5">{feature.icon}</span>
                <div>
                  <p className="text-white text-sm font-medium">{feature.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#0d0d14]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg">TaskFlow</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
