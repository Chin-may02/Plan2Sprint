"use client";

import { useState } from "react";
import type { ConversionOutput, Epic, UserStory, DevTask, QATask } from "@/types";

interface TaskOutputProps {
  output: ConversionOutput;
}

function generateMarkdown(output: ConversionOutput): string {
  const lines: string[] = ["# PRD Breakdown\n"];

  for (const epic of output.epics) {
    lines.push(`## 🟣 Epic: ${epic.title}`);
    lines.push(`${epic.description}\n`);

    const stories = output.userStories.filter((s) => s.epicId === epic.id);
    for (const story of stories) {
      lines.push(`### 🔵 ${story.title}`);
      lines.push(`**Acceptance criteria:** ${story.acceptance}\n`);

      const devTasks = output.devTasks.filter((t) => t.storyId === story.id);
      if (devTasks.length) {
        lines.push("**Dev Tasks:**");
        for (const t of devTasks) {
          lines.push(`- [${t.estimate}] ${t.title}${t.notes ? ` — ${t.notes}` : ""}`);
        }
        lines.push("");
      }

      const qaTasks = output.qaTasks.filter((q) => q.storyId === story.id);
      if (qaTasks.length) {
        lines.push("**QA Tasks:**");
        for (const q of qaTasks) {
          lines.push(`- [${q.type}] ${q.title}`);
        }
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}

const ESTIMATE_COLORS: Record<string, string> = {
  S: "text-green-400 bg-green-500/10 border-green-500/20",
  M: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  L: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  XL: "text-red-400 bg-red-500/10 border-red-500/20",
};

const QA_TYPE_COLORS: Record<string, string> = {
  functional: "text-green-400 bg-green-500/10 border-green-500/20",
  regression: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  performance: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  accessibility: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

function StatsBar({ output }: { output: ConversionOutput }) {
  const stats = [
    { label: "Epics", count: output.epics.length, color: "text-purple-400", dot: "bg-purple-400" },
    { label: "Stories", count: output.userStories.length, color: "text-blue-400", dot: "bg-blue-400" },
    { label: "Dev Tasks", count: output.devTasks.length, color: "text-amber-400", dot: "bg-amber-400" },
    { label: "QA Tasks", count: output.qaTasks.length, color: "text-green-400", dot: "bg-green-400" },
  ];

  return (
    <div className="flex flex-wrap gap-3 p-4 bg-[#12121a] border border-[#2a2a3d] rounded-xl">
      {stats.map((s) => (
        <div key={s.label} className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${s.dot}`} />
          <span className={`text-xl font-bold font-mono ${s.color}`}>{s.count}</span>
          <span className="text-sm text-slate-500 font-syne">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function StoryCard({ story, devTasks, qaTasks }: { story: UserStory; devTasks: DevTask[]; qaTasks: QATask[] }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-[#2a2a3d] rounded-xl overflow-hidden bg-blue-500/5 hover:border-blue-500/30 transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-xs font-mono text-blue-400/60 mt-0.5 shrink-0">
            {story.id}
          </span>
          <span className="text-sm text-blue-100 font-syne font-medium leading-relaxed">
            {story.title}
          </span>
        </div>
        <span className={`text-slate-500 text-xs mt-1 shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <p className="text-xs text-slate-500 font-mono leading-relaxed border-l-2 border-blue-500/20 pl-3">
            ✓ {story.acceptance}
          </p>

          {devTasks.length > 0 && (
            <div>
              <p className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-wider">
                Dev Tasks
              </p>
              <div className="space-y-2">
                {devTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg"
                  >
                    <span className="text-xs font-mono text-amber-500/50 shrink-0 mt-0.5">
                      {task.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-amber-100/90 font-syne">{task.title}</p>
                      {task.notes && (
                        <p className="text-xs text-slate-600 font-mono mt-1">{task.notes}</p>
                      )}
                    </div>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded border shrink-0 ${
                        ESTIMATE_COLORS[task.estimate] ?? "text-slate-400 bg-slate-500/10 border-slate-500/20"
                      }`}
                    >
                      {task.estimate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {qaTasks.length > 0 && (
            <div>
              <p className="text-xs font-mono text-slate-500 mb-2 uppercase tracking-wider">
                QA Tasks
              </p>
              <div className="space-y-2">
                {qaTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 bg-green-500/5 border border-green-500/10 rounded-lg"
                  >
                    <span className="text-xs font-mono text-green-500/50 shrink-0 mt-0.5">
                      {task.id}
                    </span>
                    <p className="flex-1 text-sm text-green-100/90 font-syne">{task.title}</p>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded border shrink-0 capitalize ${
                        QA_TYPE_COLORS[task.type] ?? "text-slate-400 bg-slate-500/10 border-slate-500/20"
                      }`}
                    >
                      {task.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EpicSection({ epic, output }: { epic: Epic; output: ConversionOutput }) {
  const stories = output.userStories.filter((s) => s.epicId === epic.id);

  return (
    <div className="border border-purple-500/20 rounded-xl overflow-hidden bg-purple-500/5">
      <div className="p-4 border-b border-purple-500/10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
            <span className="text-purple-400 text-xs font-mono font-bold">{epic.id}</span>
          </div>
          <div>
            <h3 className="text-base font-bold font-syne text-purple-100">{epic.title}</h3>
            <p className="text-sm text-slate-500 font-mono mt-1 leading-relaxed">{epic.description}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {stories.length === 0 ? (
          <p className="text-xs text-slate-600 font-mono">No stories in this epic.</p>
        ) : (
          stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              devTasks={output.devTasks.filter((t) => t.storyId === story.id)}
              qaTasks={output.qaTasks.filter((q) => q.storyId === story.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function TaskOutput({ output }: TaskOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateMarkdown(output));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const md = generateMarkdown(output);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prd-breakdown-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 fade-up">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <StatsBar output={output} />
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono border border-[#2a2a3d] text-slate-400 hover:border-[#3d3d5c] hover:text-slate-200 transition-all"
          >
            {copied ? "✓ Copied" : "⎘ Copy MD"}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono border border-[#2a2a3d] text-slate-400 hover:border-[#3d3d5c] hover:text-slate-200 transition-all"
          >
            ↓ Export .md
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {output.epics.map((epic) => (
          <EpicSection key={epic.id} epic={epic} output={output} />
        ))}
      </div>
    </div>
  );
}
