"use client";

import { useState } from "react";
import { useLessonStore } from "@/lib/lessonStore";
import type { Exercise } from "@/lib/types";

export function ExerciseView({ exercise }: { exercise: Exercise }) {
  switch (exercise.exercise_type) {
    case "multiple_choice":
      return <MultipleChoice exercise={exercise} />;
    case "translate_bank":
      return <TranslateBank exercise={exercise} />;
    case "match_pairs":
      return <MatchPairs exercise={exercise} />;
    case "fill_blank":
      return <FillBlank exercise={exercise} />;
    case "type_answer":
      return <TypeAnswer exercise={exercise} />;
    default:
      return null;
  }
}

function MultipleChoice({ exercise }: { exercise: Exercise }) {
  const options = (exercise.content.options as string[]) || [];
  const selected = useLessonStore((s) => s.selected) as number | null;
  const setSelected = useLessonStore((s) => s.setSelected);
  const locked = useLessonStore((s) => s.checked);
  return (
    <div className="grid gap-3">
      {options.map((opt, i) => {
        const on = selected === i;
        return (
          <button
            key={opt}
            type="button"
            disabled={locked}
            onClick={() => setSelected(i)}
            className={`rounded-2xl border-2 border-b-4 px-4 py-3 text-left font-extrabold ${
              on ? "border-macaw bg-select text-macaw" : "border-line text-fg"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function TranslateBank({ exercise }: { exercise: Exercise }) {
  const bank = (exercise.content.bank as string[]) || [];
  const selected = (useLessonStore((s) => s.selected) as string[]) || [];
  const setSelected = useLessonStore((s) => s.setSelected);
  const locked = useLessonStore((s) => s.checked);
  const unused: string[] = [];
  const counts: Record<string, number> = {};
  for (const w of selected) counts[w] = (counts[w] || 0) + 1;
  const usedCounts: Record<string, number> = {};
  for (const w of bank) {
    const used = usedCounts[w] || 0;
    const taken = counts[w] || 0;
    if (used < taken) usedCounts[w] = used + 1;
    else unused.push(w);
  }
  return (
    <div>
      <div className="mb-6 flex min-h-[56px] flex-wrap gap-2 border-b-2 border-line pb-4">
        {selected.map((w, i) => (
          <button
            key={`${w}-${i}`}
            type="button"
            disabled={locked}
            onClick={() => setSelected(selected.filter((_, j) => j !== i))}
            className="rounded-xl border-2 border-b-4 border-line bg-surface px-3 py-2 font-extrabold"
          >
            {w}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {unused.map((w, i) => (
          <button
            key={`${w}-u-${i}`}
            type="button"
            disabled={locked}
            onClick={() => setSelected([...selected, w])}
            className="rounded-xl border-2 border-b-4 border-line bg-surface px-3 py-2 font-extrabold"
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

function MatchPairs({ exercise }: { exercise: Exercise }) {
  const left = (exercise.content.left as string[]) || [];
  const right = (exercise.content.right as string[]) || [];
  const selected = (useLessonStore((s) => s.selected) as Record<string, string>) || {};
  const setSelected = useLessonStore((s) => s.setSelected);
  const locked = useLessonStore((s) => s.checked);
  const [pick, setPick] = useState<string | null>(null);

  function chooseLeft(item: string) {
    if (locked) return;
    setPick(item);
  }
  function chooseRight(item: string) {
    if (locked || !pick) return;
    const next = { ...selected };
    for (const [k, v] of Object.entries(next)) {
      if (v === item) delete next[k];
    }
    next[pick] = item;
    setSelected(next);
    setPick(null);
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-2">
        {left.map((item) => (
          <button
            key={item}
            type="button"
            disabled={locked}
            onClick={() => chooseLeft(item)}
            className={`rounded-2xl border-2 border-b-4 px-3 py-3 font-extrabold ${
              pick === item || selected[item] ? "border-macaw bg-select text-macaw" : "border-line"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {right.map((item) => {
          const taken = Object.values(selected).includes(item);
          return (
            <button
              key={item}
              type="button"
              disabled={locked}
              onClick={() => chooseRight(item)}
              className={`rounded-2xl border-2 border-b-4 px-3 py-3 font-extrabold ${
                taken ? "border-feather bg-ok text-feather" : "border-line"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FillBlank({ exercise }: { exercise: Exercise }) {
  const selected = (useLessonStore((s) => s.selected) as string) || "";
  const setSelected = useLessonStore((s) => s.setSelected);
  const locked = useLessonStore((s) => s.checked);
  const sentence = (exercise.content.sentence as string) || "____";
  return (
    <div>
      <p className="mb-4 text-center font-display text-2xl font-bold">{sentence.replace("____", "______")}</p>
      <input
        disabled={locked}
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 text-center text-lg font-bold"
        placeholder="Type the missing word"
      />
    </div>
  );
}

function TypeAnswer({ exercise }: { exercise: Exercise }) {
  const selected = (useLessonStore((s) => s.selected) as string) || "";
  const setSelected = useLessonStore((s) => s.setSelected);
  const locked = useLessonStore((s) => s.checked);
  return (
    <input
      disabled={locked}
      value={selected}
      onChange={(e) => setSelected(e.target.value)}
      className="w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 text-center text-lg font-bold"
      placeholder="Type your answer"
    />
  );
}
