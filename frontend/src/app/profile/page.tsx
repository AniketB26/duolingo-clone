"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BottomNav, SideNav, TopBar } from "@/components/Chrome";
import { Owl } from "@/components/Owl";

export default function ProfilePage() {
  const { data } = useQuery({ queryKey: ["profile"], queryFn: api.profile });
  const me = data?.me;
  return (
    <div className="flex min-h-screen">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-xl px-4 py-6 pb-24">
          <div className="flex items-center gap-4">
            <Owl className="h-20 w-20" />
            <div>
              <h1 className="font-display text-2xl font-bold">{me?.display_name ?? "Learner"}</h1>
              <p className="font-bold text-wolf">@{me?.username}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Streak" value={`${me?.current_streak ?? 0} days`} />
            <Stat label="Total XP" value={`${me?.total_xp ?? 0}`} />
            <Stat label="Skills" value={`${data?.skills_completed ?? 0}`} />
            <Stat label="Lessons" value={`${data?.lessons_completed ?? 0}`} />
          </div>
          <h2 className="mt-8 font-display text-xl font-bold">Achievements</h2>
          <ul className="mt-3 space-y-2">
            {data?.achievements.map((a) => (
              <li key={a.id} className="rounded-2xl border-2 border-swan px-4 py-3">
                <p className="font-extrabold">{a.title}</p>
                <p className="text-sm font-bold text-wolf">{a.detail}</p>
              </li>
            ))}
          </ul>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-swan p-4">
      <p className="text-xs font-extrabold uppercase text-wolf">{label}</p>
      <p className="font-display text-xl font-bold">{value}</p>
    </div>
  );
}
