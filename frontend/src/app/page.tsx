"use client";

import { BottomNav, DailyGoalRail, SideNav, TopBar } from "@/components/Chrome";
import { LearningPath } from "@/components/LearningPath";

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-bg">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <div className="flex flex-1">
          <main className="min-w-0 flex-1">
            <LearningPath />
          </main>
          <DailyGoalRail />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
