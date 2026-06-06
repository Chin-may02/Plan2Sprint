import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ConversionHistory from "@/components/ConversionHistory";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <span className="text-lg">⚡</span>
              <span className="font-syne font-bold text-sm tracking-tight">PRD → Tasks</span>
            </Link>
          </div>
          <AuthButton />
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black font-syne">Conversion History</h1>
            <p className="text-sm font-mono text-slate-500 mt-1">
              Your past PRD breakdowns, most recent first.
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-mono font-medium transition-all shadow-lg shadow-purple-900/40"
          >
            + New Conversion
          </Link>
        </div>

        <ConversionHistory />
      </main>

      <footer className="border-t border-[#1e1e2e] py-6">
        <p className="text-center text-xs font-mono text-slate-700">
          PRD → Tasks · Built with Next.js, Supabase & Claude
        </p>
      </footer>
    </div>
  );
}
