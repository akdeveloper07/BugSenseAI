"use client";

import Link from "next/link";
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

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm ${pathname === href ? "text-sky-300" : "text-slate-300 hover:text-white"}`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-20 border-b border-sky-400/10 bg-[#07111c]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-400/15 font-mono text-sky-300">
            BS
          </span>
          BugSense AI
        </Link>
        <nav className="flex items-center gap-5">
          {!loading && user ? (
            <>
              {link("/dashboard", "Analyze")}
              {link("/dashboard/history", "History")}
              {link("/profile", "Profile")}
              {user.role === "ADMIN" ? link("/admin", "Admin") : null}
              <button
                onClick={() => void onLogout()}
                className="rounded-md border border-sky-400/20 px-3 py-1.5 text-sm text-slate-200 hover:bg-sky-400/10"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {link("/login", "Login")}
              <Link
                href="/signup"
                className="rounded-md bg-sky-400 px-3 py-1.5 text-sm font-medium text-slate-950 hover:bg-sky-300"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
