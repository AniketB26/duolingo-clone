"use client";

import { useParams } from "next/navigation";
import { LessonPlayer } from "@/components/LessonPlayer";

export default function LessonPage() {
  const params = useParams<{ id: string }>();
  const lessonId = Number(params?.id);
  if (!Number.isFinite(lessonId) || lessonId <= 0) {
    return <p className="p-8 font-bold text-cardinal">That lesson could not be found.</p>;
  }
  return <LessonPlayer lessonId={lessonId} />;
}
