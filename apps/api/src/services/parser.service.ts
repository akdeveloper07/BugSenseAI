import type { BugType, Priority, Severity } from "@prisma/client";

export type ParsedBugReport = {
  bugDetected: boolean;
  bugType: BugType;
  severity: Severity;
  priority: Priority;
  rootCause: string;
  impact: string;
  suggestedFix: string;
  confidence: number;
  summary: string;
  parseWarnings: string[];
};

const BUG_TYPE_MAP: Record<string, BugType> = {
  syntax: "SYNTAX",
  runtime: "RUNTIME",
  logic: "LOGIC",
  ui: "UI",
  database: "DATABASE",
  security: "SECURITY",
  performance: "PERFORMANCE",
  configuration: "CONFIGURATION",
  other: "OTHER",
};

const SEVERITY_MAP: Record<string, Severity> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

const PRIORITY_MAP: Record<string, Priority> = {
  p1: "P1",
  p2: "P2",
  p3: "P3",
  p4: "P4",
};

const FIELD_ORDER = [
  "Bug Detected",
  "Bug Type",
  "Severity",
  "Priority",
  "Root Cause",
  "Impact",
  "Suggested Fix",
  "Confidence",
  "Summary",
] as const;

function extractLabeledBlocks(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  const labels = FIELD_ORDER.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const re = new RegExp(`(?:^|\\n)\\s*(${labels})\\s*:\\s*`, "gi");
  const matches: { label: string; index: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    matches.push({
      label: normalizeLabel(m[1]),
      index: m.index,
      end: m.index + m[0].length,
    });
  }
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].end;
    const stop = i + 1 < matches.length ? matches[i + 1].index : text.length;
    result[matches[i].label] = text.slice(start, stop).trim();
  }
  return result;
}

function normalizeLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseYesNo(value: string | undefined, warnings: string[]): boolean {
  if (!value) {
    warnings.push("Missing Bug Detected; defaulting to true");
    return true;
  }
  const v = value.toLowerCase();
  if (/\bno\b/.test(v)) return false;
  if (/\byes\b/.test(v)) return true;
  warnings.push(`Unrecognized Bug Detected value "${value}"; defaulting to true`);
  return true;
}

function parseBugType(value: string | undefined, warnings: string[]): BugType {
  if (!value) {
    warnings.push("Missing Bug Type; defaulting to OTHER");
    return "OTHER";
  }
  const key = value.split(/[\n|]/)[0].trim().toLowerCase();
  const mapped = BUG_TYPE_MAP[key];
  if (!mapped) {
    warnings.push(`Unrecognized Bug Type "${value}"; defaulting to OTHER`);
    return "OTHER";
  }
  return mapped;
}

function parseSeverity(value: string | undefined, warnings: string[]): Severity {
  if (!value) {
    warnings.push("Missing Severity; defaulting to MEDIUM");
    return "MEDIUM";
  }
  const key = value.split(/[\n|]/)[0].trim().toLowerCase();
  const mapped = SEVERITY_MAP[key];
  if (!mapped) {
    warnings.push(`Unrecognized Severity "${value}"; defaulting to MEDIUM`);
    return "MEDIUM";
  }
  return mapped;
}

function parsePriority(value: string | undefined, warnings: string[]): Priority {
  if (!value) {
    warnings.push("Missing Priority; defaulting to P3");
    return "P3";
  }
  const key = value.split(/[\n|]/)[0].trim().toLowerCase();
  const mapped = PRIORITY_MAP[key];
  if (!mapped) {
    warnings.push(`Unrecognized Priority "${value}"; defaulting to P3`);
    return "P3";
  }
  return mapped;
}

function parseConfidence(value: string | undefined, warnings: string[]): number {
  if (!value) {
    warnings.push("Missing Confidence; defaulting to 0");
    return 0;
  }
  const match = value.match(/(\d{1,3})/);
  if (!match) {
    warnings.push(`Unrecognized Confidence "${value}"; defaulting to 0`);
    return 0;
  }
  return Math.min(100, Math.max(0, Number(match[1])));
}

export function parseBugSenseResponse(raw: string): ParsedBugReport {
  const warnings: string[] = [];
  const fields = extractLabeledBlocks(raw);

  if (Object.keys(fields).length === 0) {
    warnings.push("Could not parse structured fields from AI response");
  }

  const missing = FIELD_ORDER.filter((label) => !fields[label]);
  for (const label of missing) {
    warnings.push(`Field "${label}" was not found in AI response`);
  }

  if (warnings.length) {
    console.warn("[bugsense-parser]", warnings.join("; "));
  }

  return {
    bugDetected: parseYesNo(fields["Bug Detected"], warnings),
    bugType: parseBugType(fields["Bug Type"], warnings),
    severity: parseSeverity(fields["Severity"], warnings),
    priority: parsePriority(fields["Priority"], warnings),
    rootCause: fields["Root Cause"] || "Unable to determine root cause from the model response.",
    impact: fields["Impact"] || "Impact could not be extracted from the model response.",
    suggestedFix: fields["Suggested Fix"] || "No suggested fix was extracted from the model response.",
    confidence: parseConfidence(fields["Confidence"], warnings),
    summary: fields["Summary"] || "The model returned an unstructured response. Review the raw output.",
    parseWarnings: warnings,
  };
}
