"use client";

import { Shell } from "@/components/Shell";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SettingsPage() {
  return (
    <Shell title="Settings">
      <div className="rounded-2xl border-2 border-line bg-surface px-4 py-4">
        <p className="text-xs font-extrabold uppercase text-muted">Appearance</p>
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="font-extrabold text-fg">Dark mode</p>
          <ThemeToggle />
        </div>
        <p className="mt-2 text-sm font-bold text-muted">
          Uses Duolingo-style dark slate (#131F24). Brand greens and reds stay the same.
        </p>
      </div>
      <ul className="mt-4 divide-y divide-line rounded-2xl border-2 border-line bg-surface">
        {["Account", "Notifications", "Course", "Sound"].map((item) => (
          <li key={item} className="px-4 py-3 font-extrabold text-muted">
            {item} — Coming Soon
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm font-bold text-muted">Sound is a placeholder. No audio engine is bundled.</p>
    </Shell>
  );
}
