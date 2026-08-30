import type { Analysis } from "@/lib/types";
import { severityClass } from "@/lib/ui";

export function AnalysisResult({ analysis }: { analysis: Analysis }) {
  return (
    <div className="glass space-y-5 rounded-2xl p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-sky-400/15 px-3 py-1 text-xs text-sky-200 ring-1 ring-sky-400/30">
          Bug detected: {analysis.bugDetected ? "Yes" : "No"}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs ring-1 ${severityClass(analysis.severity)}`}>
          {analysis.severity}
        </span>
        <span className="rounded-full bg-slate-500/15 px-3 py-1 text-xs text-slate-200 ring-1 ring-white/10">
          {analysis.bugType}
        </span>
        <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs text-indigo-200 ring-1 ring-indigo-400/30">
          {analysis.priority}
        </span>
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200 ring-1 ring-emerald-400/30">
          Confidence {analysis.confidence}%
        </span>
      </div>

      <Field title="Summary" body={analysis.summary} />
      <Field title="Root cause" body={analysis.rootCause || ""} />
      <Field title="Impact" body={analysis.impact || ""} />
      <div>
        <h3 className="mb-2 text-sm font-semibold text-sky-200">Suggested fix</h3>
        <pre className="code-block rounded-xl bg-black/40 p-4 text-sm text-sky-50">
          {analysis.suggestedFix}
        </pre>
      </div>
    </div>
  );
}

function Field({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold text-sky-200">{title}</h3>
      <p className="text-sm leading-6 text-slate-200">{body}</p>
    </div>
  );
}
