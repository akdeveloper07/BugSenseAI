import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="grid gap-10 pt-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-sky-300">College-ready AI platform</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Diagnose bugs with a structured AI report — not a wall of chat.
          </h1>
          <p className="max-w-xl text-lg text-slate-300">
            BugSense AI accepts code, logs, and stack traces, then returns bug type, severity, root cause,
            impact, and a minimal fix. Built as a full-stack product: auth, history, and an admin dashboard.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-sky-400 px-5 py-2.5 font-medium text-slate-950 hover:bg-sky-300"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-sky-400/30 px-5 py-2.5 text-sky-100 hover:bg-sky-400/10"
            >
              Login
            </Link>
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="mb-4 font-mono text-xs text-sky-300">sample output</p>
          <dl className="space-y-3 text-sm">
            <Row k="Bug Detected" v="Yes" />
            <Row k="Bug Type" v="Runtime" />
            <Row k="Severity" v="High" />
            <Row k="Priority" v="P2" />
            <Row k="Confidence" v="86%" />
            <Row k="Summary" v="Null dereference on empty user session. Guard the lookup and return 401." />
          </dl>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card title="Paste anything" body="Code, logs, stack traces, and a short description — one form, one analysis." />
        <Card title="Structured reports" body="Fixed fields every time: type, severity, root cause, impact, fix, confidence." />
        <Card title="History & admin" body="Users keep a personal archive. Admins search every analysis across the class." />
      </section>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-4 border-b border-white/5 pb-3">
      <dt className="w-32 shrink-0 text-slate-400">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="mb-2 font-semibold">{title}</h2>
      <p className="text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}
