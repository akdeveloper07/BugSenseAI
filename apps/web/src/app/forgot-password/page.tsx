"use client";

import { FormEvent, useState } from "react";
import { api, ApiRequestError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function requestToken(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const data = await api<{ message: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Request failed");
    }
  }

  async function reset(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setMessage("Password updated. You can log in now.");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Reset failed");
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="glass rounded-2xl p-8">
        <h1 className="mb-2 text-2xl font-semibold">Reset password</h1>
        <p className="mb-4 text-sm text-slate-400">
          For this college project, reset tokens are printed in the API console instead of email.
        </p>
        <form onSubmit={requestToken} className="space-y-3">
          <input
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="w-full rounded-lg bg-sky-400 py-2 font-medium text-slate-950">Send token</button>
        </form>
      </div>
      <div className="glass rounded-2xl p-8">
        <h2 className="mb-3 font-semibold">Have a token?</h2>
        <form onSubmit={reset} className="space-y-3">
          <input
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            placeholder="Reset token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
          <input
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <button className="w-full rounded-lg border border-sky-400/30 py-2">Update password</button>
        </form>
        {message ? <p className="mt-3 text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </div>
    </div>
  );
}
