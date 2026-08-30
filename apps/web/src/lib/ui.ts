import type { Severity } from "./types";

export function severityClass(severity: Severity | string) {
  switch (severity) {
    case "CRITICAL":
      return "bg-rose-500/15 text-rose-300 ring-rose-500/30";
    case "HIGH":
      return "bg-orange-500/15 text-orange-300 ring-orange-500/30";
    case "MEDIUM":
      return "bg-amber-500/15 text-amber-200 ring-amber-500/30";
    default:
      return "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30";
  }
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}
