"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Conversion } from "@/types";
import TaskOutput from "./TaskOutput";

export default function ConversionHistory() {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Conversion | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("conversions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        setError(error.message);
      } else {
        setConversions(data as Conversion[]);
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  const deleteConversion = async (id: string) => {
    const supabase = createClient();
    await supabase.from("conversions").delete().eq("id", id);
    setConversions((prev) => prev.filter((c) => c.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-xl skeleton" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 font-mono text-sm">{error}</p>
      </div>
    );
  }

  if (conversions.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">📭</p>
        <p className="text-slate-400 font-syne font-medium">No conversions yet</p>
        <p className="text-slate-600 font-mono text-sm mt-1">
          Go convert a PRD and it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selected && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelected(null)}
              className="text-sm font-mono text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              ← Back to list
            </button>
            <span className="text-slate-700">|</span>
            <p className="text-xs font-mono text-slate-600 truncate flex-1">
              {selected.prd_text.slice(0, 80)}…
            </p>
          </div>
          <TaskOutput output={selected.output} />
        </div>
      )}

      {!selected && (
        <div className="space-y-3">
          {conversions.map((conversion) => {
            const stats = {
              epics: conversion.output.epics?.length ?? 0,
              stories: conversion.output.userStories?.length ?? 0,
              devTasks: conversion.output.devTasks?.length ?? 0,
              qaTasks: conversion.output.qaTasks?.length ?? 0,
            };
            const date = new Date(conversion.created_at);

            return (
              <div
                key={conversion.id}
                className="group border border-[#2a2a3d] rounded-xl p-4 hover:border-[#3d3d5c] transition-all cursor-pointer bg-[#12121a] hover:bg-[#14141e]"
                onClick={() => setSelected(conversion)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 font-mono leading-relaxed truncate">
                      {conversion.prd_text.slice(0, 100)}…
                    </p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span className="text-xs font-mono text-purple-400">
                        {stats.epics} epics
                      </span>
                      <span className="text-xs font-mono text-blue-400">
                        {stats.stories} stories
                      </span>
                      <span className="text-xs font-mono text-amber-400">
                        {stats.devTasks} dev tasks
                      </span>
                      <span className="text-xs font-mono text-green-400">
                        {stats.qaTasks} QA tasks
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <p className="text-xs font-mono text-slate-600">
                      {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversion(conversion.id);
                      }}
                      className="text-xs font-mono text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
