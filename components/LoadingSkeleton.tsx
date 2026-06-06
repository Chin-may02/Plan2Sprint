export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 fade-up">
      {/* Stats bar skeleton */}
      <div className="flex gap-6 p-4 bg-[#12121a] border border-[#2a2a3d] rounded-xl">
        {[90, 110, 100, 95].map((w, i) => (
          <div key={i} className={`h-5 rounded skeleton`} style={{ width: w }} />
        ))}
      </div>

      {/* Epic skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-[#2a2a3d] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#1e1e2e] flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg skeleton shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 rounded skeleton" style={{ width: "55%" }} />
              <div className="h-3 rounded skeleton" style={{ width: "80%" }} />
            </div>
          </div>

          <div className="p-4 space-y-3">
            {[1, 2].map((j) => (
              <div key={j} className="border border-[#2a2a3d] rounded-xl p-4 space-y-3">
                <div className="h-4 rounded skeleton" style={{ width: "70%" }} />
                <div className="h-3 rounded skeleton" style={{ width: "90%" }} />
                <div className="space-y-2">
                  {[1, 2].map((k) => (
                    <div key={k} className="h-10 rounded-lg skeleton" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center py-4">
        <p className="text-xs font-mono text-slate-600 animate-pulse">
          Claude is analyzing your PRD…
        </p>
      </div>
    </div>
  );
}
