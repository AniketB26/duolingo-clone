import type {
  CourseTree,
  LeaderboardEntry,
  LessonPayload,
  Me,
  Profile,
} from "./types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function timezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  me: () => request<Me>("/api/me"),
  tree: (courseId = 1) => request<CourseTree>(`/api/courses/${courseId}/tree`),
  lesson: (id: number) => request<LessonPayload>(`/api/lessons/${id}`),
  leaderboard: () => request<LeaderboardEntry[]>("/api/leaderboard"),
  profile: () => request<Profile>("/api/profile"),
  submitAnswer: (lessonId: number, exerciseId: number, answer: unknown) =>
    request<{
      correct: boolean;
      correct_answer: unknown;
      hearts: number;
      out_of_hearts: boolean;
    }>(`/api/lessons/${lessonId}/submit-answer`, {
      method: "POST",
      body: JSON.stringify({ exercise_id: exerciseId, answer, timezone: timezone() }),
    }),
  completeLesson: (lessonId: number, mistakes: number) =>
    request<{
      xp_awarded: number;
      total_xp: number;
      current_streak: number;
      xp_today: number;
      daily_xp_goal: number;
      hearts: number;
      skill_completed: boolean;
    }>(`/api/lessons/${lessonId}/complete`, {
      method: "POST",
      body: JSON.stringify({ timezone: timezone(), mistakes }),
    }),
  refillHearts: () =>
    request<Me>("/api/practice/refill-hearts", { method: "POST" }),
};
