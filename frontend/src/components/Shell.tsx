"use client";

import { BottomNav, SideNav, TopBar } from "@/components/Chrome";

export function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-xl px-4 py-6 pb-24">
          <h1 className="mb-3 font-display text-2xl font-bold">{title}</h1>
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
