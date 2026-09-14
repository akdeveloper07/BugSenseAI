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

function isDemoKey(key: string): boolean {
  return (
    !key ||
    key === "sk-your-key" ||
    key.startsWith("sk-your-")
  );
}

/**
 * Demo-mode analysis.
 *
 * This is not a full AI code analyzer.
 * It checks only a few obvious error patterns.
 * It must not automatically report every submission as buggy.
 */
function demoResponse(input: AnalysisInput): string {
  const code = input.codeInput || "";
  const logs = input.logsInput || "";
  const description = input.bugDescription || "";

  const text = `${code}\n${logs}\n${description}`;

  // 1. Detect explicit null or undefined runtime errors
  const hasNullishError =
    /cannot read propert|cannot read propert(y|ies)|undefined|nullpointer|nonetype|none type/i.test(
      text
    );

  if (hasNullishError) {
    return `Bug Detected: Yes
Bug Type: Runtime
Severity: High
Priority: P2
Root Cause: The code or error description suggests that a null or undefined value is being accessed without proper validation.
Impact: The application may crash when the expected value is missing.
Suggested Fix: Add a null check before accessing the value and handle the error safely.

Confidence: 78%
Summary: Demo mode detected a possible null or undefined value error. This is a heuristic result, not a full AI diagnosis.`;
  }

  // 2. Detect explicit division-by-zero evidence
  const hasDivisionByZero =
    /zerodivisionerror|division by zero/i.test(text) ||
    /\/\s*0(?:\s|[;,)\]}]|$)/.test(code);

  if (hasDivisionByZero) {
    return `Bug Detected: Yes
Bug Type: Runtime
Severity: High
Priority: P2
Root Cause: The code may attempt to divide by zero.
Impact: The program may terminate with a division-by-zero error.
Suggested Fix: Check that the divisor is not zero before performing the division.

Confidence: 95%
Summary: Demo mode detected a possible division-by-zero error.`;
  }

  // 3. Detect an unsafe Python average calculation
  const hasPossibleEmptyAverage =
    /sum\s*\(\s*\w+\s*\)\s*\/\s*len\s*\(\s*\w+\s*\)/i.test(code) &&
    !/if\s+not\s+\w+\s*:/i.test(code) &&
    !/if\s+len\s*\(\s*\w+\s*\)\s*==\s*0/i.test(code);

  if (hasPossibleEmptyAverage) {
    return `Bug Detected: Yes
Bug Type: Runtime
Severity: Medium
Priority: P3
Root Cause: The average calculation may divide by the length of an empty collection.
Impact: The program may raise a ZeroDivisionError when an empty list is provided.
Suggested Fix: Validate that the collection is not empty before calculating the average.

Confidence: 82%
Summary: Demo mode detected a possible empty-collection average issue.`;
  }

  // 4. No obvious bug detected
  return `Bug Detected: No
Bug Type: None
Severity: None
Priority: None
Root Cause: No confirmed bug was detected by the available demo-mode checks.
Impact: No confirmed impact.
Suggested Fix: No fix required.

Confidence: 85%
Summary: Demo mode did not detect an obvious issue in the submitted code. This is not a guarantee that the code is completely bug-free.`;
}

export async function callBugSenseModel(
  input: AnalysisInput
): Promise<string> {
  // Demo mode
  if (isDemoKey(env.AI_API_KEY)) {
    console.warn(
      "[ai] Using demo response. Set AI_API_KEY for a live provider."
    );

    return demoResponse(input);
  }

  // Live AI provider
  const baseUrl = env.AI_BASE_URL.replace(/\/+$/, "");
  const url = `${baseUrl}/chat/completions`;

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
        {
          role: "system",
          content: BUGSENSE_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: buildUserPrompt(input),
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();

    console.error("[ai-provider]", res.status, body);

    throw new HttpError(
      502,
      "AI provider request failed",
      "AI_PROVIDER_ERROR"
    );
  }

  const json = (await res.json()) as {
    choices?: {
      message?: {
        content?: string;
      };
    }[];
  };

  const content = json.choices?.[0]?.message?.content;

  if (!content) {
    throw new HttpError(
      502,
      "AI provider returned an empty response",
      "AI_EMPTY"
    );
  }

  return content;
}
