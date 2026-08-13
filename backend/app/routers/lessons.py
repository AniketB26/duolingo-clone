import json
import unicodedata
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.gamification import apply_streak, get_current_user
from app.models import Exercise, Lesson, Skill, UserProgress
from app.schemas import (
    CompleteLessonIn,
    CompleteLessonOut,
    ExerciseOut,
    LessonOut,
    SubmitAnswerIn,
    SubmitAnswerOut,
)

router = APIRouter(prefix="/api/lessons", tags=["lessons"])


def _norm(value: str) -> str:
    nfkd = unicodedata.normalize("NFKD", value)
    stripped = "".join(c for c in nfkd if not unicodedata.combining(c))
    return " ".join(stripped.lower().strip().replace("¿", "").replace("?", "").split())


def _grade(exercise: Exercise, answer: Any) -> tuple[bool, Any]:
    solution = json.loads(exercise.solution_json)
    etype = exercise.exercise_type
    if etype == "multiple_choice":
        expected = solution["index"]
        try:
            got = int(answer)
        except (TypeError, ValueError):
            return False, expected
        return got == expected, expected
    if etype == "translate_bank":
        expected = solution["words"]
        got = answer if isinstance(answer, list) else []
        return [str(w) for w in got] == expected, expected
    if etype == "match_pairs":
        expected: dict[str, str] = solution["pairs"]
        got = answer if isinstance(answer, dict) else {}
        ok = all(str(got.get(k, "")) == v for k, v in expected.items()) and len(got) == len(expected)
        return ok, expected
    if etype in ("fill_blank", "type_answer"):
        accepted = [_norm(a) for a in solution["accepted"]]
        got = _norm(str(answer or ""))
        return got in accepted, solution["accepted"][0]
    return False, None


@router.get("/{lesson_id}", response_model=LessonOut)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    user = get_current_user(db)
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(404, "Lesson not found")
    skill = db.get(Skill, lesson.skill_id)
    exercises = sorted(lesson.exercises, key=lambda e: e.order_index)
    return LessonOut(
        id=lesson.id,
        title=lesson.title,
        skill_id=lesson.skill_id,
        skill_title=skill.title if skill else "",
        xp_reward=lesson.xp_reward,
        hearts=user.hearts,
        exercises=[
            ExerciseOut(
                id=e.id,
                exercise_type=e.exercise_type,  # type: ignore[arg-type]
                prompt=e.prompt,
                content=json.loads(e.content_json),
            )
            for e in exercises
        ],
    )


@router.post("/{lesson_id}/submit-answer", response_model=SubmitAnswerOut)
def submit_answer(lesson_id: int, body: SubmitAnswerIn, db: Session = Depends(get_db)):
    user = get_current_user(db)
    if user.hearts <= 0:
        return SubmitAnswerOut(correct=False, hearts=0, out_of_hearts=True)
    exercise = db.get(Exercise, body.exercise_id)
    if not exercise or exercise.lesson_id != lesson_id:
        raise HTTPException(404, "Exercise not found")
    correct, expected = _grade(exercise, body.answer)
    if not correct:
        user.hearts = max(0, user.hearts - 1)
        db.commit()
        db.refresh(user)
    return SubmitAnswerOut(
        correct=correct,
        correct_answer=None if correct else expected,
        hearts=user.hearts,
        out_of_hearts=user.hearts <= 0,
    )


@router.post("/{lesson_id}/complete", response_model=CompleteLessonOut)
def complete_lesson(lesson_id: int, body: CompleteLessonIn, db: Session = Depends(get_db)):
    user = get_current_user(db)
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(404, "Lesson not found")
    if user.hearts <= 0:
        raise HTTPException(403, "Out of hearts")

    progress = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == user.id, UserProgress.lesson_id == lesson.id)
        .first()
    )
    first_time = progress is None or not progress.completed
    if progress is None:
        progress = UserProgress(
            user_id=user.id,
            skill_id=lesson.skill_id,
            lesson_id=lesson.id,
            completed=True,
            crown_level=1,
        )
        db.add(progress)
    else:
        progress.completed = True
        progress.crown_level = min(5, progress.crown_level + (1 if first_time else 0))

    xp = lesson.xp_reward if first_time else max(2, lesson.xp_reward // 2)
    user.total_xp += xp
    user.xp_today += xp
    apply_streak(user, body.timezone)
    db.commit()
    db.refresh(user)

    skill_lessons = db.query(Lesson).filter(Lesson.skill_id == lesson.skill_id).all()
    done_ids = {
        p.lesson_id
        for p in db.query(UserProgress).filter(
            UserProgress.user_id == user.id,
            UserProgress.skill_id == lesson.skill_id,
            UserProgress.completed.is_(True),
        )
    }
    skill_completed = all(l.id in done_ids for l in skill_lessons)

    return CompleteLessonOut(
        xp_awarded=xp,
        total_xp=user.total_xp,
        current_streak=user.current_streak,
        xp_today=user.xp_today,
        daily_xp_goal=user.daily_xp_goal,
        hearts=user.hearts,
        skill_completed=skill_completed,
    )
