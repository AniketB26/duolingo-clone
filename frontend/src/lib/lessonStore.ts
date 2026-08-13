"use client";

import { create } from "zustand";
import type { Exercise } from "./types";

type Phase = "idle" | "feedback" | "complete" | "outOfHearts";

type LessonState = {
  lessonId: number | null;
  exercises: Exercise[];
  index: number;
  selected: unknown;
  checked: boolean;
  correct: boolean;
  correctAnswer: unknown;
  hearts: number;
  mistakes: number;
  phase: Phase;
  xpAwarded: number;
  streak: number;
  load: (lessonId: number, exercises: Exercise[], hearts: number) => void;
  setSelected: (value: unknown) => void;
  markFeedback: (correct: boolean, answer: unknown, hearts: number, out: boolean) => void;
  next: () => void;
  finish: (xp: number, streak: number) => void;
  resetSelection: () => void;
};

export const useLessonStore = create<LessonState>((set, get) => ({
  lessonId: null,
  exercises: [],
  index: 0,
  selected: null,
  checked: false,
  correct: false,
  correctAnswer: null,
  hearts: 5,
  mistakes: 0,
  phase: "idle",
  xpAwarded: 0,
  streak: 0,
  load: (lessonId, exercises, hearts) =>
    set({
      lessonId,
      exercises,
      index: 0,
      selected: null,
      checked: false,
      correct: false,
      hearts,
      mistakes: 0,
      phase: hearts <= 0 ? "outOfHearts" : "idle",
      xpAwarded: 0,
    }),
  setSelected: (value) => set({ selected: value }),
  markFeedback: (correct, answer, hearts, out) =>
    set((s) => ({
      checked: true,
      correct,
      correctAnswer: answer,
      hearts,
      mistakes: correct ? s.mistakes : s.mistakes + 1,
      phase: out ? "outOfHearts" : "feedback",
    })),
  next: () => {
    const { index, exercises } = get();
    if (index + 1 >= exercises.length) {
      set({ phase: "complete" });
      return;
    }
    set({
      index: index + 1,
      selected: null,
      checked: false,
      correct: false,
      correctAnswer: null,
      phase: "idle",
    });
  },
  finish: (xp, streak) => set({ xpAwarded: xp, streak, phase: "complete" }),
  resetSelection: () => set({ selected: null, checked: false, phase: "idle" }),
}));
