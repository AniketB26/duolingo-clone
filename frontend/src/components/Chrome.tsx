"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Owl } from "./Owl";

const links = [
  { href: "/", label: "Learn", icon: "★" },
  { href: "/leaderboard", label: "Leaderboard", icon: "♛" },
  { href: "/profile", label: "Profile", icon: "☺" },
  { href: "/shop", label: "Shop", icon: "◆" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export function TopBar() {
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: api.me });
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-swan bg-white px-4 py-3 lg:px-8">
      <div className="flex items-center gap-2 lg:hidden">
        <Owl className="h-8 w-8" />
        <span className="font-display text-xl font-bold text-feather">lingo</span>
      </div>
      <div className="ml-auto flex items-center gap-4 text-sm font-extrabold">
        <span className="flex items-center gap-1 text-fox" title="Streak">
          🔥 {me?.current_streak ?? "—"}
        </span>
        <span className="flex items-center gap-1 text-bee" title="XP">
          ⚡ {me?.total_xp ?? "—"}
        </span>
        <span className="flex items-center gap-1 text-cardinal" title="Hearts">
          ❤ {me?.hearts ?? "—"}
        </span>
        <span className="flex items-center gap-1 text-macaw" title="Gems (mocked)">
          💎 {me?.gems ?? "—"}
        </span>
      </div>
    </header>
  );
}

export function SideNav() {
  const path = usePathname();
  return (
    <aside className="hidden w-[224px] shrink-0 border-r border-swan lg:flex lg:flex-col lg:py-6">
      <Link href="/" className="mb-6 flex items-center gap-2 px-6">
        <Owl className="h-10 w-10" />
        <span className="font-display text-2xl font-bold text-feather">lingo</span>
      </Link>
      <nav className="flex flex-col gap-1 px-3">
        {links.map((l) => {
          const active = path === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold uppercase tracking-wide ${
                active ? "border-2 border-macaw bg-[#ddf4ff] text-macaw" : "text-wolf hover:bg-slate-50"
              }`}
            >
              <span>{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-swan bg-white lg:hidden">
      {links.map((l) => {
        const active = path === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex flex-1 flex-col items-center py-2 text-[11px] font-extrabold uppercase ${
              active ? "text-macaw" : "text-hare"
            }`}
          >
            <span className="text-lg">{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DailyGoalRail() {
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: api.me });
  const goal = me?.daily_xp_goal ?? 20;
  const xp = me?.xp_today ?? 0;
  const pct = Math.min(100, Math.round((xp / goal) * 100));
  return (
    <aside className="hidden w-[300px] shrink-0 p-4 xl:block">
      <div className="rounded-2xl border-2 border-swan p-4">
        <p className="text-xs font-extrabold uppercase text-wolf">Daily goal</p>
        <p className="mt-1 font-display text-lg font-bold text-eel">Earn {goal} XP today</p>
        <div className="mt-3 h-4 overflow-hidden rounded-full bg-swan">
          <div className="h-full rounded-full bg-feather transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-sm font-bold text-wolf">
          {xp} / {goal} XP
        </p>
      </div>
      <div className="mt-4 rounded-2xl border-2 border-swan p-4">
        <p className="text-xs font-extrabold uppercase text-wolf">Spanish</p>
        <p className="mt-1 text-sm font-bold text-eel">English → Spanish path. Keep the streak alive.</p>
      </div>
    </aside>
  );
}
