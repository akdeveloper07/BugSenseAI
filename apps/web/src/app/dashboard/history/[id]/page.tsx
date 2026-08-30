"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Guard } from "@/components/Guard";
import { AnalysisResult } from "@/components/AnalysisResult";
import { api, ApiRequestError } from "@/lib/api";
import type { Analysis } from "@/lib/types";

export default function AnalysisDetailPage() {
  return (
    <Guard>
      <DetailView />
    </Guard>
  );
}

function DetailView() {
  const params = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [tagInput, setTagInput] = useState("");

  async function load() {
    try {
      const data = await api<{ analysis: Analysis }>(`/api/analyses/${params.id}`);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to load analysis");
    }
  }

  useEffect(() => {
    void load();
  }, [params.id]);

  async function rate(rating: -1 | 1) {
    if (!analysis) return;
    const next = analysis.rating === rating ? 0 : rating;
    const data = await api<{ analysis: Analysis }>(`/api/analyses/${analysis.id}`, {
      method: "PATCH",
      body: JSON.stringify({ rating: next }),
    });
    setAnalysis(data.analysis);
  }

  async function addTag() {
    if (!analysis || !tagInput.trim()) return;
    const tags = Array.from(new Set([...analysis.tags, tagInput.trim()]));
    const data = await api<{ analysis: Analysis }>(`/api/analyses/${analysis.id}`, {
      method: "PATCH",
      body: JSON.stringify({ tags }),
    });
    setAnalysis(data.analysis);
    setTagInput("");
  }

  if (error) return <p className="text-rose-300">{error}</p>;
  if (!analysis) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Analysis details</h1>
      <AnalysisResult analysis={analysis} />

      <div className="glass space-y-4 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <p className="text-sm text-slate-300">Was this suggestion useful?</p>
          <button
            onClick={() => void rate(1)}
            className={`rounded-md border px-3 py-1 text-sm ${analysis.rating === 1 ? "border-emerald-400 text-emerald-300" : "border-white/10"}`}
          >
            👍
          </button>
          <button
            onClick={() => void rate(-1)}
            className={`rounded-md border px-3 py-1 text-sm ${analysis.rating === -1 ? "border-rose-400 text-rose-300" : "border-white/10"}`}
          >
            👎
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {analysis.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-sky-400/10 px-3 py-1 text-xs text-sky-200">
              {tag}
            </span>
          ))}
          <input
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-1 text-sm"
            placeholder="Add tag (e.g. college project)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          />
          <button onClick={() => void addTag()} className="text-sm text-sky-300">
            Save tag
          </button>
        </div>
        {analysis.codeInput ? (
          <div>
            <h2 className="mb-2 text-sm font-semibold text-sky-200">Original code</h2>
            <pre className="code-block rounded-xl bg-black/40 p-4 text-sm">{analysis.codeInput}</pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}
