"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, Github, User, Mail, Lock, Check } from "lucide-react";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      toast.success("Account created! Signing you in...");

      // Auto sign in after registration
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Auto sign-in failed. Please log in manually.");
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setOauthLoading(provider);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch {
      toast.error("OAuth sign-in failed");
      setOauthLoading(null);
    }
  };

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(form.password)).length;

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
        <p className="text-slate-400 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => handleOAuth("google")}
          disabled={!!oauthLoading || isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white text-sm font-medium transition-all hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {oauthLoading === "google" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Sign up with Google
        </button>

        <button
          onClick={() => handleOAuth("github")}
          disabled={!!oauthLoading || isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white text-sm font-medium transition-all hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {oauthLoading === "github" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Github className="w-4 h-4" />
          )}
          Sign up with GitHub
        </button>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/8" />
        </div>
        <div className="relative flex justify-center text-xs text-slate-500">
          <span className="bg-[#0d0d14] px-3">or sign up with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              required
              minLength={2}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Alex Johnson"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/60 input-glow transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/60 input-glow transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Create a strong password"
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/60 input-glow transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password strength */}
          {form.password.length > 0 && (
            <div className="mt-2.5 space-y-1.5">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background: i < passwordStrength
                        ? passwordStrength === 3 ? "#10b981" : passwordStrength === 2 ? "#f59e0b" : "#ef4444"
                        : "rgba(255,255,255,0.08)"
                    }}
                  />
                ))}
              </div>
              <div className="space-y-1">
                {PASSWORD_RULES.map((rule) => (
                  <div key={rule.label} className="flex items-center gap-1.5">
                    <Check
                      className={`w-3 h-3 transition-colors ${
                        rule.test(form.password) ? "text-emerald-400" : "text-slate-600"
                      }`}
                    />
                    <span className={`text-xs transition-colors ${
                      rule.test(form.password) ? "text-emerald-400" : "text-slate-600"
                    }`}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !!oauthLoading || passwordStrength < 3}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create free account"
          )}
        </button>
      </form>

      <p className="text-center text-xs text-slate-600 mt-6">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-slate-500 hover:text-slate-400 underline">Terms</Link>
        {" "}and{" "}
        <Link href="/privacy" className="text-slate-500 hover:text-slate-400 underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
