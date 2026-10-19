import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="space-y-20 pt-4 pb-12">
      {/* Hero Section */}
      <section className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="space-y-6 lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold tracking-wider uppercase text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            AI-Powered Code Diagnostics
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.1]">
            <span className="block text-white">Smarter Detection.</span>
            <span className="text-gradient">Safer Code.</span>
          </h1>

          <p className="max-w-xl text-lg text-slate-300 leading-relaxed">
            BugSense AI accepts code, error logs, and stack traces — instantly returning bug type, severity, root cause, impact, and verified fixes with high precision.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/signup"
              className="btn-glow rounded-xl px-6 py-3 font-semibold text-sm tracking-wide shadow-lg"
            >
              Start Free Analysis
            </Link>
            <Link
              href="/login"
              className="btn-secondary rounded-xl px-6 py-3 font-medium text-sm text-sky-200"
            >
              Sign In with Google / Email
            </Link>
          </div>

          {/* Quick Stats / Highlights */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-sky-400/15">
            <div>
              <p className="text-2xl font-bold text-sky-300">Firebase</p>
              <p className="text-xs text-slate-400">Secure Auth & Google SSO</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-sky-300">&lt; 3s</p>
              <p className="text-xs text-slate-400">Diagnosis Latency</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-sky-300">Structured</p>
              <p className="text-xs text-slate-400">Actionable Bug Reports</p>
            </div>
          </div>
        </div>

        {/* Hero Visual Card with BugSense Logo & Sample Output */}
        <div className="lg:col-span-5">
          <div className="glass-card rounded-3xl p-6 relative">
            <div className="flex items-center gap-4 pb-4 border-b border-sky-400/15">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-sky-400/40 shadow-[0_0_20px_rgba(0,210,255,0.35)] shrink-0">
                <Image
                  src="/bugsense-logo.png"
                  alt="BugSense AI Logo"
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-sky-300">Live AI Output</p>
                <h2 className="text-base font-semibold text-white">Diagnostic Inspection Card</h2>
              </div>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <Row k="Bug Detected" v={<span className="font-semibold text-rose-400">Yes (Critical)</span>} />
              <Row k="Bug Type" v={<span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-mono text-purple-300">RUNTIME</span>} />
              <Row k="Severity" v={<span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-xs font-mono text-rose-300">HIGH</span>} />
              <Row k="Confidence" v={<span className="text-emerald-400 font-semibold">94%</span>} />
              <Row
                k="Root Cause"
                v="Unchecked nullable object access in authentication token verification payload."
              />
              <Row
                k="Suggested Fix"
                v={<span className="font-mono text-xs text-sky-300">if (!session?.user) return unauthorized();</span>}
              />
            </dl>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section matching the Logo artwork */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-sky-400">Architected for Developers</p>
          <h2 className="text-3xl font-bold tracking-tight text-white">Why Developers Choose BugSense AI</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={
              <svg className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            title="Detect Bugs"
            description="Catch syntax errors, runtime crashes, memory leaks, and logic flaws before production."
          />
          <FeatureCard
            icon={
              <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            title="Analyze with AI"
            description="Deep AI parsing pinpoints exact line numbers, call hierarchy, and contextual impact."
          />
          <FeatureCard
            icon={
              <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            title="Improve Quality"
            description="Receive actionable patches with zero fluff to elevate codebase reliability."
          />
          <FeatureCard
            icon={
              <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            }
            title="Build Better"
            description="Historical tracking and insights ensure your development team prevents recurring bugs."
          />
        </div>
      </section>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex gap-4 border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
      <dt className="w-28 shrink-0 text-xs font-mono text-slate-400">{k}</dt>
      <dd className="text-xs text-slate-200">{v}</dd>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass-card rounded-2xl p-5 hover:border-sky-400/40 transition-all hover:translate-y-[-2px]">
      <div className="mb-3 inline-flex rounded-xl bg-white/5 p-2.5 border border-white/10 shadow-inner">
        {icon}
      </div>
      <h3 className="mb-1 text-base font-semibold text-white">{title}</h3>
      <p className="text-xs leading-relaxed text-slate-300">{description}</p>
    </div>
  );
}
