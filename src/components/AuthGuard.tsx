"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

/** Renders children only for an authenticated session; otherwise sends the user to /login. */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { hydrated, authed } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !authed) router.replace("/login");
  }, [hydrated, authed, router]);

  if (!hydrated || !authed) return <div className="screen" />;
  return <>{children}</>;
}
