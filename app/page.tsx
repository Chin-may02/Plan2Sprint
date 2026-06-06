"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { ConversionOutput } from "@/types";
import AuthButton from "@/components/AuthButton";
import PrdInput from "@/components/PrdInput";
import TaskOutput from "@/components/TaskOutput";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthRequiredBanner() {
  const params = useSearchParams();
  if (!params.get("authRequired")) return null;
  return (
    <div className="mb-4 text-center text-sm font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2">
      Sign in to access your conversion history.
    </div>
  );
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className="toast">✓ {message}</div>;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<ConversionOutput | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleConvert = async (prd: string) => {
    setLoading(true);
    setError("");
    setOutput(null);

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prd, userId: user?.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Conversion failed");
      }

      setOutput(data.output);

      if (user) {
        setToast("Saved to your history!");
      }

      // Scroll to output
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">⚡</span>
            <span className="font-syne font-bold text-sm tracking-tight">PRD → Tasks</span>
            <span className="hidden sm:inline text-xs font-mono text-slate-600 border border-[#2a2a3d] px-2 py-0.5 rounded-full">
              powered by Claude
            </span>
          </div>
          <AuthButton />
        </div>
      </nav>

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-[#1e1e2e]">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--c-border) 1px, transparent 1px), linear-gradient(90deg, var(--c-border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent" />

        <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            AI-powered • Instant • Structured
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-syne leading-tight mb-4">
            Turn any PRD into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              structured tasks
            </span>
          </h1>

          <p className="text-slate-400 font-mono text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Paste your product requirements document. Claude extracts epics, user stories,
            dev tasks with estimates, and QA tasks — ready for your sprint.
          </p>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 space-y-10">
        <Suspense fallback={null}>
          <AuthRequiredBanner />
        </Suspense>

        {!user && (
          <div className="text-center text-xs font-mono text-slate-600 bg-[#12121a] border border-[#2a2a3d] rounded-lg px-4 py-2">
            💡 Sign in to save conversions to your history
          </div>
        )}

        <PrdInput onSubmit={handleConvert} loading={loading} />

        {error && (
          <div className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            ⚠ {error}
          </div>
        )}

        {loading && <LoadingSkeleton />}

        {output && !loading && (
          <div ref={outputRef}>
            <TaskOutput output={output} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2e] py-6">
        <p className="text-center text-xs font-mono text-slate-700">
          PRD → Tasks · Built with Next.js, Supabase & Claude
        </p>
      </footer>

      {toast && <Toast message={toast} onDone={() => setToast("")} />}
    </div>
  );
}
