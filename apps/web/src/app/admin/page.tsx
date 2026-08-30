"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Guard } from "@/components/Guard";
import { api, ApiRequestError } from "@/lib/api";
import type { Analysis, Role, User } from "@/lib/types";
import { formatDate, severityClass } from "@/lib/ui";

type AdminUser = User & { _count?: { analyses: number } };

export default function AdminPage() {
  return (
    <Guard admin>
      <AdminView />
    </Guard>
  );
}

function AdminView() {
  const [tab, setTab] = useState<"analyses" | "users">("analyses");
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Admin dashboard</h1>
      <div className="flex gap-2">
        <TabButton active={tab === "analyses"} onClick={() => setTab("analyses")}>
          Analyses
        </TabButton>
        <TabButton active={tab === "users"} onClick={() => setTab("users")}>
          Users
        </TabButton>
      </div>
      {tab === "analyses" ? <AdminAnalyses /> : <AdminUsers />}
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm ${active ? "bg-sky-400 text-slate-950" : "border border-white/10"}`}
    >
      {children}
    </button>
  );
}

function AdminAnalyses() {
  const [items, setItems] = useState<Analysis[]>([]);
  const [q, setQ] = useState("");
  const [language, setLanguage] = useState("");
  const [bugType, setBugType] = useState("");
  const [severity, setSeverity] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const params = new URLSearchParams({ pageSize: "50" });
      if (q) params.set("q", q);
      if (language) params.set("language", language);
      if (bugType) params.set("bugType", bugType);
      if (severity) params.set("severity", severity);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const data = await api<{ items: Analysis[] }>(`/api/admin/analyses?${params.toString()}`);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to load");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <input className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" placeholder="Search summary or code" value={q} onChange={(e) => setQ(e.target.value)} />
        <input className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" placeholder="Language" value={language} onChange={(e) => setLanguage(e.target.value)} />
        <select className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" value={bugType} onChange={(e) => setBugType(e.target.value)}>
          <option value="">All types</option>
          {["SYNTAX", "RUNTIME", "LOGIC", "UI", "DATABASE", "SECURITY", "PERFORMANCE", "CONFIGURATION", "OTHER"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="">All severities</option>
          {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <input className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <button onClick={() => void load()} className="rounded-lg bg-sky-400 px-4 py-2 text-sm text-slate-950">
        Apply filters
      </button>
      {error ? <p className="text-rose-300">{error}</p> : null}
      <div className="overflow-x-auto glass rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-slate-400">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Lang</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Summary</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-white/5">
                <td className="whitespace-nowrap px-4 py-3">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-3">{item.user?.email}</td>
                <td className="px-4 py-3">{item.language}</td>
                <td className="px-4 py-3">{item.bugType}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ring-1 ${severityClass(item.severity)}`}>
                    {item.severity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/history/${item.id}`} className="text-sky-300 hover:underline">
                    {item.summary.slice(0, 80)}…
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await api<{ users: AdminUser[] }>("/api/admin/users");
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to load users");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function patch(id: string, body: { role?: Role; isActive?: boolean }) {
    await api(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    await load();
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-rose-300">{error}</p> : null}
      <div className="overflow-x-auto glass rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Analyses</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/5">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">{u.isActive ? "Active" : "Inactive"}</td>
                <td className="px-4 py-3">{u._count?.analyses ?? 0}</td>
                <td className="space-x-2 px-4 py-3">
                  <button
                    className="text-sky-300"
                    onClick={() => void patch(u.id, { role: u.role === "ADMIN" ? "USER" : "ADMIN" })}
                  >
                    Toggle role
                  </button>
                  <button className="text-amber-200" onClick={() => void patch(u.id, { isActive: !u.isActive })}>
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
