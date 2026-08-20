"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "#lib/auth";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    router.replace(session ? "/dashboard" : "/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </main>
  );
}