"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BottomNav, SideNav, TopBar } from "@/components/Chrome";

export default function LeaderboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["leaderboard"], queryFn: api.leaderboard });
  return (
    <div className="flex min-h-screen bg-bg">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-xl px-4 py-6 pb-24">
          <h1 className="font-display text-2xl font-bold">Leaderboard</h1>
          <p className="mb-4 text-sm font-bold text-muted">All-time XP among seeded learners</p>
          {isLoading && <p>Loading…</p>}
          <ol className="divide-y divide-line rounded-2xl border-2 border-line bg-surface">
            {data?.map((row) => (
              <li
                key={row.user_id}
                className={`flex items-center justify-between px-4 py-3 ${row.is_you ? "bg-select" : ""}`}
              >
                <span className="font-extrabold">
                  {row.rank}. {row.display_name}
                  {row.is_you ? " (you)" : ""}
                </span>
                <span className="font-bold text-bee">{row.total_xp} XP</span>
              </li>
            ))}
          </ol>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
