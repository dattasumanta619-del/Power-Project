"use client";

import { useRouter } from "next/navigation";

import { ConnectionStatus } from "@/lib/types";

interface HeaderProps {
  connectionStatus: ConnectionStatus;
}

export function Header({ connectionStatus }: HeaderProps): JSX.Element {
  const router = useRouter();

  const handleLogout = (): void => {
    sessionStorage.removeItem("powerguard-auth");
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-powerBg/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">PowerGuard</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">
            Power Quality Monitoring and Theft Detection
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`rounded-full border px-4 py-2 text-sm ${
              connectionStatus === "connected"
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                : "border-yellow-400/30 bg-yellow-500/10 text-yellow-100"
            }`}
          >
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-current" />
            {connectionStatus === "connected" ? "Firebase connected" : "Demo mode"}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
