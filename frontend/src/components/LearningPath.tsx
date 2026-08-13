"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SkillNode, UnitNode } from "@/lib/types";

const offsets = [0, 56, 88, 56, 0, -56, -88, -56];

function SkillBubble({ skill, index }: { skill: SkillNode; index: number }) {
  const nextLesson = skill.lessons.find((l) => !l.completed && !l.locked) || skill.lessons.find((l) => !l.locked);
  const locked = skill.status === "locked";
  const done = skill.status === "completed";
  const color = done ? "bg-bee shadow-[0_8px_0_0_#E5A800]" : locked ? "bg-swan shadow-[0_8px_0_0_#CFCFCF]" : "bg-feather shadow-[0_8px_0_0_#46A302]";
  const ring = `conic-gradient(#58CC02 ${skill.progress * 360}deg, #E5E5E5 0deg)`;
  const inner = (
    <div className="flex flex-col items-center" style={{ transform: `translateX(${offsets[index % offsets.length]}px)` }}>
      <div className="relative h-[88px] w-[88px] rounded-full p-[6px]" style={{ background: locked ? "#E5E5E5" : ring }}>
        <div
          className={`flex h-full w-full items-center justify-center rounded-full text-3xl text-white ${color}`}
        >
          {locked ? "🔒" : done ? "👑" : "★"}
        </div>
      </div>
      <p className="mt-2 max-w-[140px] text-center text-sm font-extrabold text-eel">{skill.title}</p>
      <p className="text-xs font-bold text-wolf">
        {skill.crowns}/{skill.max_crowns} crowns
      </p>
    </div>
  );
  if (locked || !nextLesson) return inner;
  return <Link href={`/lesson/${nextLesson.id}`}>{inner}</Link>;
}

function UnitBlock({ unit, startIndex }: { unit: UnitNode; startIndex: number }) {
  return (
    <section className="mb-10">
      <div
        className="mb-8 flex items-center justify-between rounded-2xl px-5 py-4 text-white"
        style={{ background: unit.color }}
      >
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider opacity-90">{unit.title}</p>
          <h2 className="font-display text-xl font-bold">{unit.description}</h2>
        </div>
      </div>
      <div className="flex flex-col items-center gap-8 py-2">
        {unit.skills.map((skill, i) => (
          <SkillBubble key={skill.id} skill={skill} index={startIndex + i} />
        ))}
      </div>
    </section>
  );
}

export function LearningPath() {
  const { data, isLoading, error } = useQuery({ queryKey: ["tree"], queryFn: () => api.tree(1) });
  if (isLoading) return <p className="p-8 font-bold text-wolf">Loading your path…</p>;
  if (error || !data) return <p className="p-8 font-bold text-cardinal">Could not load the course. Is the API running?</p>;
  let n = 0;
  return (
    <div className="mx-auto max-w-xl px-4 py-6 pb-24 lg:pb-8">
      {data.units.map((unit) => {
        const block = <UnitBlock key={unit.id} unit={unit} startIndex={n} />;
        n += unit.skills.length;
        return block;
      })}
    </div>
  );
}
