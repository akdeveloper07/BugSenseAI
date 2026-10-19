"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.push("/");
  }

  const link = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`relative px-3 py-1.5 text-sm font-medium transition-all rounded-lg ${
          active
            ? "text-sky-300 bg-sky-500/10 shadow-[0_0_12px_rgba(56,189,248,0.25)]"
            : "text-slate-300 hover:text-white hover:bg-white/5"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-sky-400/15 bg-[#060b14]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-sky-400/40 shadow-[0_0_15px_rgba(0,210,255,0.3)] transition-transform group-hover:scale-105">
            <Image
              src="/bugsense-logo.png"
              alt="BugSense AI Logo"
              width={40}
              height={40}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-gradient text-lg font-bold tracking-tight">BugSense AI</span>
            <span className="hidden text-[10px] uppercase tracking-[0.2em] text-sky-300/70 sm:inline">
              Smarter Detection • Safer Code
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          {!loading && user ? (
            <>
              {link("/dashboard", "Analyze")}
              {link("/dashboard/history", "History")}
              {link("/profile", "Profile")}
              {user.role === "ADMIN" ? link("/admin", "Admin") : null}

              <div className="ml-2 flex items-center gap-3 pl-3 border-l border-white/10">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="h-8 w-8 rounded-full border border-sky-400/40 object-cover"
                  />
                ) : (
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-xs font-semibold text-white">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
                <button
                  onClick={() => void onLogout()}
                  className="rounded-lg border border-sky-400/25 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-200 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="btn-glow rounded-lg px-4 py-1.5 text-sm font-semibold tracking-wide"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
