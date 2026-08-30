"use client";

import { FormEvent, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAuth } from "@/lib/auth";
import { api, ApiRequestError } from "@/lib/api";
import type { User } from "@/lib/types";

export default function ProfilePage() {
  return (
    <Guard>
      <ProfileView />
    </Guard>
  );
}

function ProfileView() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api<{ user: User }>("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ name, email }),
      });
      await refresh();
      setMessage("Profile updated.");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Update failed");
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password changed.");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Password change failed");
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-3xl font-semibold">Profile</h1>
      <form onSubmit={saveProfile} className="glass space-y-4 rounded-2xl p-6">
        <label className="block text-sm">
          Name
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Email
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <p className="text-xs text-slate-400">Role: {user?.role}</p>
        <button className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-medium text-slate-950">Save profile</button>
      </form>
      <form onSubmit={savePassword} className="glass space-y-4 rounded-2xl p-6">
        <h2 className="font-semibold">Change password</h2>
        <input
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <input
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          required
        />
        <button className="rounded-lg border border-sky-400/30 px-4 py-2 text-sm">Update password</button>
      </form>
      {message ? <p className="text-emerald-300">{message}</p> : null}
      {error ? <p className="text-rose-300">{error}</p> : null}
    </div>
  );
}
