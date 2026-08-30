"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ApiRequestError } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="glass rounded-2xl p-8">
        <h1 className="mb-1 text-2xl font-semibold">Welcome back</h1>
        <p className="mb-6 text-sm text-slate-400">Sign in to analyze bugs and view history.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm">
            Email
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-sky-400"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            Password
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-sky-400"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button
            disabled={pending}
            className="w-full rounded-lg bg-sky-400 py-2.5 font-medium text-slate-950 disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Login"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-400">
          No account?{" "}
          <Link href="/signup" className="text-sky-300">
            Sign up
          </Link>
          {" · "}
          <Link href="/forgot-password" className="text-sky-300">
            Forgot password
          </Link>
        </p>
      </div>
    </div>
  );
}
