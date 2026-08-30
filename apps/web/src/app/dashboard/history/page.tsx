"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Guard } from "@/components/Guard";
import { api, ApiRequestError } from "@/lib/api";
import type { Analysis } from "@/lib/types";
import { formatDate, severityClass } from "@/lib/ui";

export default function HistoryPage() {
  return (
    <Guard>
      <HistoryView />
    </Guard>
  );
}

function HistoryView() {
  const [items, setItems] = useState<Analysis[]>([]);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("");
  const [severity, setSeverity] = useState("");

  async function load() {
    try {
      const params = new URLSearchParams();
      if (language) params.set("language", language);
      if (severity) params.set("severity", severity);
      params.set("pageSize", "50");
      const data = await api<{ items: Analysis[] }>(`/api/analyses?${params.toString()}`);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to load history");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function exportCsv() {
    const csv = await api<string>("/api/analyses/export");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bugsense-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Analysis history</h1>
          <p className="mt-1 text-slate-400">Every report you have generated.</p>
        </div>
        <button
          onClick={() => void exportCsv()}
          className="rounded-lg border border-sky-400/30 px-4 py-2 text-sm hover:bg-sky-400/10"
        >
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          placeholder="Filter language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        />
        <select
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="">All severities</option>
          <option>CRITICAL</option>
          <option>HIGH</option>
          <option>MEDIUM</option>
          <option>LOW</option>
        </select>
        <button onClick={() => void load()} className="rounded-lg bg-sky-400 px-4 py-2 text-sm text-slate-950">
          Apply
        </button>
      </div>

      {error ? <p className="text-rose-300">{error}</p> : null}

      <div className="overflow-x-auto glass rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-slate-400">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Language</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Summary</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="whitespace-nowrap px-4 py-3 text-slate-300">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-3">{item.language}</td>
                <td className="px-4 py-3">{item.bugType}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ring-1 ${severityClass(item.severity)}`}>
                    {item.severity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/history/${item.id}`} className="text-sky-300 hover:underline">
                    {item.summary.slice(0, 90)}
                    {item.summary.length > 90 ? "…" : ""}
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No analyses yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
