"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { href: "/dashboard/power-quality", label: "Power Quality" },
  { href: "/dashboard/anomaly", label: "Anomaly" },
  { href: "/dashboard/settings", label: "Settings" }
];

export function NavTabs(): JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              "rounded-xl border px-4 py-2 text-sm transition",
              isActive
                ? "border-blue-400/40 bg-blue-500/20 text-white"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
