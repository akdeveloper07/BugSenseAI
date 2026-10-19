"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
        setError("Invalid email or password. Please verify your credentials.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later or reset password.");
      } else {
        setError(err?.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setPending(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setGooglePending(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled.");
      } else if (err?.code === "auth/operation-not-allowed") {
        setError("Google sign-in is not enabled in Firebase Console. Please enable Google provider in Authentication settings.");
      } else {
        setError(err?.message || "Failed to sign in with Google.");
      }
    } finally {
      setGooglePending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md pt-6 sm:pt-10">
      <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
        {/* Glow ambient circle */}
        <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        {/* Brand Header with Logo */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-3 h-16 w-16 overflow-hidden rounded-2xl border border-sky-400/30 p-1 shadow-[0_0_25px_rgba(0,210,255,0.3)]">
            <Image
              src="/bugsense-logo.png"
              alt="BugSense AI Logo"
              width={64}
              height={64}
              className="h-full w-full rounded-xl object-cover"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome to BugSense AI</h1>
          <p className="mt-1 text-sm text-slate-400">
            Intelligent debugging & code vulnerability analysis
          </p>
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googlePending || pending}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-sky-400/25 bg-[#0f1d38]/80 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-sky-500/10 hover:border-sky-400/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all disabled:opacity-60 cursor-pointer"
        >
          {googlePending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
              Signing in with Google…
            </span>
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-sky-400/15" />
          </div>
          <span className="relative bg-[#0c1830] px-3 text-xs uppercase tracking-wider text-slate-400">
            or sign in with email
          </span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              className="w-full rounded-xl border border-sky-400/20 bg-[#070e1c]/70 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-sky-400 focus:shadow-[0_0_15px_rgba(56,189,248,0.25)]"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-sky-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              className="w-full rounded-xl border border-sky-400/20 bg-[#070e1c]/70 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-sky-400 focus:shadow-[0_0_15px_rgba(56,189,248,0.25)]"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending || googlePending}
            className="btn-glow w-full rounded-xl py-3 text-sm font-semibold tracking-wide disabled:opacity-60 cursor-pointer"
          >
            {pending ? "Signing in…" : "Sign In with Email"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-sky-400 hover:text-sky-300 transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
