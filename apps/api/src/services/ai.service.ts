import { env } from "../config/env";
import { BUGSENSE_SYSTEM_PROMPT } from "../constants/systemPrompt";
import { HttpError } from "../utils/httpError";

export type AnalysisInput = {
  language: string;
  framework?: string | null;
  environment?: string | null;
  codeInput: string;
  logsInput?: string | null;
  bugDescription?: string | null;
};

export function buildUserPrompt(input: AnalysisInput): string {
  const parts = [
    `Language: ${input.language}`,
    `Framework: ${input.framework || "Not specified"}`,
    `Environment: ${input.environment || "Not specified"}`,
    "",
    "### Code",
    input.codeInput.trim() || "(none provided)",
    "",
    "### Logs / Error / Stack Trace",
    input.logsInput?.trim() || "(none provided)",
    "",
    "### Bug Description",
    input.bugDescription?.trim() || "(none provided)",
  ];
  return parts.join("\n");
}

function isDemoKey(key: string) {
  return !key || key === "sk-your-key" || key.startsWith("sk-your-");
}

function demoResponse(input: AnalysisInput): string {
  const hasNullish = /cannot read propert|undefined|nullpointer|noneType/i.test(
    `${input.codeInput}\n${input.logsInput ?? ""}\n${input.bugDescription ?? ""}`,
  );
  if (hasNullish) {
    return `Bug Detected: Yes
Bug Type: Runtime
Severity: High
Priority: P2
Root Cause: The code dereferences a value that can be null or undefined without a guard, which throws at runtime when the expected object is missing.
Impact: The request or render path crashes. Users see an error; no data is persisted incorrectly, but the feature is unavailable until the process recovers.
Suggested Fix: Guard the access before use and return a controlled error.

if (!user) {
  throw new Error("Unauthorized");
}
const id = user.id;

Confidence: 78%
Summary: Demo mode diagnosed a likely null/undefined dereference from the provided logs or description. Add a null check before property access. Replace AI_API_KEY with a real OpenAI-compatible key for a live model diagnosis.`;
  }

  return `Bug Detected: Yes
Bug Type: Logic
Severity: Medium
Priority: P3
Root Cause: The submitted snippet and description suggest incorrect control flow or an unhandled error path. Critical runtime evidence is limited, so this is a best-effort diagnosis.
Impact: Feature behavior may be wrong for some inputs. User-facing errors are likely; data corruption is not confirmed from the provided context.
Suggested Fix: Add explicit validation and error handling around the failing path, log the unexpected state, and write a regression test for the reported input.
Confidence: 55%
Summary: Running in demo mode because no live AI key is configured. The report is a structured placeholder based on simple heuristics. Set AI_API_KEY and AI_BASE_URL to enable the real BugSense model.`;
}

export async function callBugSenseModel(input: AnalysisInput): Promise<string> {
  if (isDemoKey(env.AI_API_KEY)) {
    console.warn("[ai] Using demo response. Set AI_API_KEY for a live provider.");
    return demoResponse(input);
  }

  const url = `${env.AI_BASE_URL.replace(/\/$/, "")}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.AI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.AI_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: BUGSENSE_SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[ai-provider]", res.status, body);
    throw new HttpError(502, "AI provider request failed", "AI_PROVIDER_ERROR");
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new HttpError(502, "AI provider returned an empty response", "AI_EMPTY");
  }
  return content;
}
