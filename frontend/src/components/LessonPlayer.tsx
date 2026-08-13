"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useLessonStore } from "@/lib/lessonStore";
import { ExerciseView } from "./exercises";
import { BumpButton } from "./BumpButton";
import { Owl } from "./Owl";

export function LessonPlayer({ lessonId }: { lessonId: number }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => api.lesson(lessonId),
  });
  const load = useLessonStore((s) => s.load);
  const index = useLessonStore((s) => s.index);
  const exercises = useLessonStore((s) => s.exercises);
  const selected = useLessonStore((s) => s.selected);
  const checked = useLessonStore((s) => s.checked);
  const correct = useLessonStore((s) => s.correct);
  const correctAnswer = useLessonStore((s) => s.correctAnswer);
  const hearts = useLessonStore((s) => s.hearts);
  const phase = useLessonStore((s) => s.phase);
  const mistakes = useLessonStore((s) => s.mistakes);
  const xpAwarded = useLessonStore((s) => s.xpAwarded);
  const streak = useLessonStore((s) => s.streak);
  const markFeedback = useLessonStore((s) => s.markFeedback);
  const next = useLessonStore((s) => s.next);
  const finish = useLessonStore((s) => s.finish);

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) load(data.id, data.exercises, data.hearts);
  }, [data, load]);

  const complete = useMutation({
    mutationFn: () => api.completeLesson(lessonId, mistakes),
    onSuccess: (res) => {
      finish(res.xp_awarded, res.current_streak);
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["tree"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });

  async function check() {
    const ex = exercises[index];
    if (!ex || selected === null || selected === undefined || selected === "") return;
    setBusy(true);
    try {
      const res = await api.submitAnswer(lessonId, ex.id, selected);
      markFeedback(res.correct, res.correct_answer, res.hearts, res.out_of_hearts);
      qc.invalidateQueries({ queryKey: ["me"] });
    } finally {
      setBusy(false);
    }
  }

  async function continueLesson() {
    if (index + 1 >= exercises.length) {
      complete.mutate();
      return;
    }
    next();
  }

  if (isLoading) return <p className="p-8 font-bold">Loading lesson…</p>;
  if (error || !data) return <p className="p-8 font-bold text-cardinal">Lesson failed to load.</p>;

  const progress = exercises.length ? ((index + (checked ? 1 : 0)) / exercises.length) * 100 : 0;
  const ex = exercises[index];

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={() => router.push("/")} className="text-2xl text-muted" aria-label="Close">
          ×
        </button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-feather transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="font-extrabold text-cardinal">❤ {hearts}</span>
      </div>

      {phase === "outOfHearts" && (
        <Modal>
          <Owl className="mx-auto h-20 w-20" />
          <h2 className="mt-3 text-center font-display text-2xl font-bold">You ran out of hearts</h2>
          <p className="mt-2 text-center text-muted">Practice to refill, or wait — hearts return every 4 hours.</p>
          <div className="mt-6 flex flex-col gap-3">
            <BumpButton
              onClick={async () => {
                await api.refillHearts();
                qc.invalidateQueries({ queryKey: ["me"] });
                router.push("/");
              }}
            >
              Practice to refill
            </BumpButton>
            <BumpButton tone="white" onClick={() => router.push("/")}>
              End lesson
            </BumpButton>
          </div>
        </Modal>
      )}

      {phase === "complete" && xpAwarded > 0 && (
        <Modal>
          <p className="text-center text-4xl">🎉</p>
          <h2 className="mt-2 text-center font-display text-3xl font-bold text-feather">Lesson complete!</h2>
          <p className="mt-3 text-center font-extrabold text-bee">+{xpAwarded} XP</p>
          <p className="text-center font-bold text-fox">🔥 {streak} day streak</p>
          <BumpButton className="mt-6 w-full" onClick={() => router.push("/")}>
            Continue
          </BumpButton>
        </Modal>
      )}

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-6">
        {ex && (
          <>
            <p className="mb-2 text-sm font-extrabold uppercase text-muted">{data.skill_title}</p>
            <h1 className="mb-6 font-display text-2xl font-bold">{ex.prompt}</h1>
            <ExerciseView exercise={ex} />
          </>
        )}
      </div>

      <div
        className={`border-t-2 px-4 py-4 ${
          checked ? (correct ? "border-feather bg-ok" : "border-cardinal bg-bad") : "border-line"
        }`}
      >
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <div>
            {checked && correct && <p className="font-display text-xl font-bold text-feather">Correct!</p>}
            {checked && !correct && (
              <div>
                <p className="font-display text-xl font-bold text-cardinal">Correct solution:</p>
                <p className="font-bold text-fg">{formatAnswer(correctAnswer)}</p>
              </div>
            )}
          </div>
          {!checked ? (
            <BumpButton disabled={busy || !canCheck(selected)} onClick={check}>
              Check
            </BumpButton>
          ) : (
            <BumpButton tone={correct ? "green" : "red"} onClick={continueLesson} disabled={complete.isPending}>
              Continue
            </BumpButton>
          )}
        </div>
      </div>
    </div>
  );
}

function canCheck(selected: unknown) {
  if (selected === null || selected === undefined) return false;
  if (typeof selected === "string" && selected.trim() === "") return false;
  if (Array.isArray(selected) && selected.length === 0) return false;
  if (typeof selected === "object" && !Array.isArray(selected) && Object.keys(selected as object).length === 0)
    return false;
  return true;
}

function formatAnswer(answer: unknown) {
  if (Array.isArray(answer)) return answer.join(" ");
  if (answer && typeof answer === "object") return Object.entries(answer as Record<string, string>).map(([k, v]) => `${k} → ${v}`).join(", ");
  return String(answer ?? "");
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-surface p-6 shadow-xl">{children}</div>
    </div>
  );
}
