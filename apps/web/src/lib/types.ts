export type Role = "USER" | "ADMIN";
export type BugType =
  | "SYNTAX"
  | "RUNTIME"
  | "LOGIC"
  | "UI"
  | "DATABASE"
  | "SECURITY"
  | "PERFORMANCE"
  | "CONFIGURATION"
  | "OTHER";
export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type Priority = "P1" | "P2" | "P3" | "P4";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
};

export type Analysis = {
  id: string;
  userId?: string;
  language: string;
  framework: string | null;
  environment?: string | null;
  codeInput?: string;
  logsInput?: string | null;
  bugDescription?: string | null;
  bugDetected: boolean;
  bugType: BugType;
  severity: Severity;
  priority: Priority;
  rootCause?: string;
  impact?: string;
  suggestedFix?: string;
  confidence: number;
  summary: string;
  tags: string[];
  rating: number | null;
  createdAt: string;
  user?: { id: string; name: string; email: string };
};

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; error: { message: string; code?: string } };
