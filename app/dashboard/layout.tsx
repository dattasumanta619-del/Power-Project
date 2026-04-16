"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { NavTabs } from "@/components/layout/NavTabs";
import { DataProvider, useDataContext } from "@/context/DataContext";

function DashboardShell({ children }: { children: ReactNode }): JSX.Element {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const { connectionStatus } = useDataContext();

  useEffect(() => {
    const authenticated = sessionStorage.getItem("powerguard-auth") === "authenticated";
    if (!authenticated) {
      router.replace("/login");
    } else {
      setIsAuthorized(true);
    }
    setIsChecking(false);
  }, [router]);

  if (isChecking || !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-2xl border border-white/10 bg-powerCard px-6 py-4 text-sm text-white/70 shadow-glow">
          Validating operator session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header connectionStatus={connectionStatus} />
      <NavTabs />
      <main className="mx-auto max-w-7xl px-4 pb-10 pt-2 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

export default function DashboardLayout({
  children
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <DataProvider>
      <DashboardShell>{children}</DashboardShell>
    </DataProvider>
  );
}
