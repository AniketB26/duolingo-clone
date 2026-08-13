"use client";

import { Shell } from "@/components/Shell";

export default function SettingsPage() {
  return (
    <Shell title="Settings">
      <ul className="divide-y divide-swan rounded-2xl border-2 border-swan">
        {["Account", "Notifications", "Course", "Sound"].map((item) => (
          <li key={item} className="px-4 py-3 font-extrabold text-wolf">
            {item} — Coming Soon
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm font-bold text-hare">Sound is a placeholder. No audio engine is bundled.</p>
    </Shell>
  );
}
