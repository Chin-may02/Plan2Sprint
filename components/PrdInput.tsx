"use client";

import { useState } from "react";

interface PrdInputProps {
  onSubmit: (prd: string) => void;
  loading: boolean;
}

const PLACEHOLDER = `Example PRD — replace with yours:

## Overview
Build a user authentication system that allows users to register, login, and manage their profile.

## Goals
- Secure registration with email verification
- OAuth support (Google, GitHub)
- Password reset flow
- Session management with refresh tokens
- Rate limiting on auth endpoints

## Non-Goals
- SSO / SAML (out of scope for v1)
- Two-factor authentication (future milestone)

## Success Metrics
- Registration completion rate > 80%
- Login success rate > 95%
- < 200ms p99 auth latency`;

export default function PrdInput({ onSubmit, loading }: PrdInputProps) {
  const [prd, setPrd] = useState("");
  const charCount = prd.trim().length;
  const isValid = charCount >= 50;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !loading) {
      onSubmit(prd);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative group">
        {/* Glow border */}
        <div
          className={`absolute -inset-px rounded-xl transition-all duration-500 pointer-events-none ${
            loading
              ? "bg-gradient-to-r from-purple-600/30 via-blue-500/30 to-purple-600/30 animate-pulse"
              : "bg-gradient-to-r from-purple-600/0 via-purple-600/0 to-purple-600/0 group-focus-within:from-purple-600/20 group-focus-within:via-blue-500/20 group-focus-within:to-purple-600/20"
          }`}
        />

        <textarea
          value={prd}
          onChange={(e) => setPrd(e.target.value)}
          placeholder={PLACEHOLDER}
          disabled={loading}
          rows={16}
          className="w-full bg-[#12121a] border border-[#2a2a3d] group-focus-within:border-[#3d3d5c] rounded-xl p-5 text-sm font-mono text-slate-300 placeholder-[#2e2e45] resize-none leading-relaxed focus:outline-none transition-all duration-200 disabled:opacity-60"
          spellCheck={false}
        />

        {/* Char count */}
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          <span
            className={`text-xs font-mono transition-colors ${
              charCount === 0
                ? "text-slate-700"
                : isValid
                ? "text-slate-600"
                : "text-amber-600"
            }`}
          >
            {charCount < 50 && charCount > 0
              ? `${50 - charCount} more chars needed`
              : `${charCount.toLocaleString()} chars`}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-600 font-mono">
          Paste any PRD format — structured or freeform.{" "}
          <span className="text-slate-500">Min 50 characters.</span>
        </p>

        <button
          type="submit"
          disabled={!isValid || loading}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-syne font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
            isValid && !loading
              ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/50 hover:shadow-purple-900/70 hover:-translate-y-0.5"
              : "bg-[#1a1a26] text-slate-600 border border-[#2a2a3d] cursor-not-allowed"
          }`}
        >
          {loading ? (
            <>
              <span className="spinner w-4 h-4 inline-block" />
              <span>Analyzing…</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Convert to Tasks</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
