"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function Guard({
  children,
  admin,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (admin && user.role !== "ADMIN") router.replace("/dashboard");
  }, [admin, loading, router, user]);

  if (loading || !user || (admin && user.role !== "ADMIN")) {
    return <p className="text-slate-400">Loading…</p>;
  }

  return <>{children}</>;
}
