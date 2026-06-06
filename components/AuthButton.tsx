"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      setShowModal(false);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="h-9 w-24 rounded-lg skeleton" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm font-mono text-slate-400 hover:text-purple-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-500/10"
        >
          History
        </Link>
        <span className="text-xs font-mono text-slate-500 hidden sm:block truncate max-w-[140px]">
          {user.email}
        </span>
        <button
          onClick={handleSignOut}
          className="text-sm px-4 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-red-500/50 hover:text-red-400 transition-all font-mono"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all font-mono font-medium shadow-lg shadow-purple-900/40"
      >
        Sign in
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-[#12121a] border border-[#2a2a3d] rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold mb-1 font-syne">
              {authMode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-slate-500 text-sm mb-6 font-mono">
              {authMode === "login"
                ? "Sign in to save your conversions"
                : "Start saving your PRD conversions"}
            </p>

            <button
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-[#2a2a3d] hover:border-[#3d3d5c] text-slate-300 hover:text-white transition-all text-sm mb-4"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#2a2a3d]" />
              <span className="text-xs text-slate-600 font-mono">or</span>
              <div className="flex-1 h-px bg-[#2a2a3d]" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0a0a0f] border border-[#2a2a3d] rounded-lg px-4 py-2.5 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/60 transition-colors"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0a0a0f] border border-[#2a2a3d] rounded-lg px-4 py-2.5 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/60 transition-colors"
              />
              {authError && (
                <p className="text-red-400 text-xs font-mono">{authError}</p>
              )}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-mono font-medium transition-all"
              >
                {authLoading
                  ? "..."
                  : authMode === "login"
                  ? "Sign in"
                  : "Create account"}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 font-mono mt-4">
              {authMode === "login" ? "No account?" : "Have an account?"}{" "}
              <button
                onClick={() => {
                  setAuthMode(authMode === "login" ? "signup" : "login");
                  setAuthError("");
                }}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                {authMode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-600 hover:text-slate-400 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
