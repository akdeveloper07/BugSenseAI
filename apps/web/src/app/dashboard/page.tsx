"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Guard } from "@/components/Guard";
import { AnalysisResult } from "@/components/AnalysisResult";
import { api, ApiRequestError } from "@/lib/api";
import type { Analysis } from "@/lib/types";

const LANGUAGES = ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "PHP", "Ruby", "Other"];
const FRAMEWORKS = ["None / vanilla", "React", "Next.js", "Express", "Django", "Spring", "Flutter", "Other"];

export default function DashboardPage() {
  return (
    <Guard>
      <AnalyzeView />
    </Guard>
  );
}

function AnalyzeView() {
  const [language, setLanguage] = useState("JavaScript");
  const [framework, setFramework] = useState("");
  const [environment, setEnvironment] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [logsInput, setLogsInput] = useState("");
  const [bugDescription, setBugDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const data = await api<{ analysis: Analysis }>("/api/analyze-bug", {
        method: "POST",
        body: JSON.stringify({
          language,
          framework: framework || null,
          environment: environment || null,
          codeInput,
          logsInput: logsInput || null,
          bugDescription: bugDescription || null,
        }),
      });
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Analysis failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Analyze a bug</h1>
          <p className="mt-1 text-slate-400">Paste code, logs, or a description. BugSense returns a structured report.</p>
        </div>
        <Link href="/dashboard/history" className="text-sm text-sky-300 hover:underline">
          View history →
        </Link>
      </div>

      <form onSubmit={onSubmit} className="glass grid gap-4 rounded-2xl p-6 md:grid-cols-2">
        <label className="text-sm">
          Language
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Framework
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
          >
            <option value="">Select (optional)</option>
            {FRAMEWORKS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="text-sm md:col-span-2">
          Environment (optional)
          <textarea
            className="mt-1 min-h-20 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            placeholder="Node 20, Windows 11, PostgreSQL 16…"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
          />
        </label>
        <label className="text-sm md:col-span-2">
          Code
          <textarea
            className="code-block mt-1 min-h-40 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
            placeholder="Paste the relevant snippet"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
          />
        </label>
        <label className="text-sm md:col-span-2">
          Logs / stack trace (optional)
          <textarea
            className="code-block mt-1 min-h-28 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
            value={logsInput}
            onChange={(e) => setLogsInput(e.target.value)}
          />
        </label>
        <label className="text-sm md:col-span-2">
          Bug description
          <textarea
            className="mt-1 min-h-24 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            placeholder="What did you expect vs what happened?"
            value={bugDescription}
            onChange={(e) => setBugDescription(e.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-rose-300 md:col-span-2">{error}</p> : null}
        <div className="md:col-span-2">
          <button
            disabled={pending}
            className="rounded-lg bg-sky-400 px-5 py-2.5 font-medium text-slate-950 disabled:opacity-60"
          >
            {pending ? "Analyzing…" : "Analyze"}
          </button>
        </div>
      </form>

      {pending ? (
        <div className="glass rounded-2xl p-6 text-slate-300">
          Calling the model and parsing a structured report…
        </div>
      ) : null}
      {analysis ? <AnalysisResult analysis={analysis} /> : null}
    </div>
  );
}
