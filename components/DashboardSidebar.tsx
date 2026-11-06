"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Overview", href: "/" },
  { label: "Catalog", href: "/#catalog" },
  { label: "Records", href: "/#records" },
  { label: "Members", href: "/members" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/members") {
      return pathname.startsWith("/members");
    }

    return pathname === "/";
  };

  return (
    <aside
      className={[
        "w-full overflow-hidden rounded-[30px] border border-slate-200 bg-slate-950 text-slate-100 shadow-[0_25px_80px_rgba(15,23,42,0.2)] transition-all duration-300",
        "lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[260px]",
        collapsed ? "lg:w-24" : "lg:w-[260px]",
      ].join(" ")}
    >
      <div className="flex h-full flex-col p-4 sm:p-5">
        <div className="flex items-center justify-end border-b border-white/10 pb-4">
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-slate-200 transition hover:bg-white/10"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        <nav className="mt-6 space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={[
                  "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/15 text-white ring-1 ring-indigo-400/30"
                    : "text-slate-300 hover:bg-white/5 hover:text-white",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-xl text-base ring-1",
                    active ? "bg-indigo-500/20 text-indigo-100 ring-indigo-300/20" : "bg-white/5 text-indigo-200 ring-white/10",
                  ].join(" ")}
                >
                  {item.label === "Overview" ? "▣" : item.label === "Catalog" ? "▤" : item.label === "Records" ? "⏱" : "👥"}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className={collapsed ? "hidden lg:block lg:text-center" : "text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300"}>
            Quick note
          </p>
          <p className={collapsed ? "hidden lg:block lg:text-center lg:text-[11px] lg:text-slate-400" : "mt-2 text-sm text-slate-200"}>
            Keep books, members, and returns organised for the church week.
          </p>
        </div>
      </div>
    </aside>
  );
}
