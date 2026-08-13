from typing import Any, Literal

from pydantic import BaseModel, Field


ExerciseType = Literal[
    "multiple_choice",
    "translate_bank",
    "match_pairs",
    "fill_blank",
    "type_answer",
]


class MeOut(BaseModel):
    id: int
    username: str
    display_name: str
    total_xp: int
    current_streak: int
    hearts: int
    max_hearts: int
    gems: int
    daily_xp_goal: int
    xp_today: int
    seconds_to_next_heart: int | None


class LessonNodeOut(BaseModel):
    id: int
    title: str
    order_index: int
    completed: bool
    locked: bool


class SkillNodeOut(BaseModel):
    id: int
    title: str
    order_index: int
    icon: str
    status: Literal["completed", "available", "locked"]
    crowns: int
    max_crowns: int
    progress: float
    lessons: list[LessonNodeOut]


class UnitOut(BaseModel):
    id: int
    title: str
    description: str
    order_index: int
    color: str
    skills: list[SkillNodeOut]


class CourseTreeOut(BaseModel):
    id: int
    title: str
    language_code: str
    from_language: str
    units: list[UnitOut]


class ExerciseOut(BaseModel):
    id: int
    exercise_type: ExerciseType
    prompt: str
    content: dict[str, Any]


class LessonOut(BaseModel):
    id: int
    title: str
    skill_id: int
    skill_title: str
    xp_reward: int
    hearts: int
    exercises: list[ExerciseOut]


class SubmitAnswerIn(BaseModel):
    exercise_id: int
    answer: Any
    timezone: str = "UTC"


class SubmitAnswerOut(BaseModel):
    correct: bool
    correct_answer: Any | None = None
    hearts: int
    out_of_hearts: bool = False


class CompleteLessonIn(BaseModel):
    timezone: str = "UTC"
    mistakes: int = Field(default=0, ge=0)


class CompleteLessonOut(BaseModel):
    xp_awarded: int
    total_xp: int
    current_streak: int
    xp_today: int
    daily_xp_goal: int
    hearts: int
    skill_completed: bool


class LeaderboardEntryOut(BaseModel):
    rank: int
    user_id: int
    display_name: str
    username: str
    total_xp: int
    current_streak: int
    is_you: bool


class ProfileOut(BaseModel):
    me: MeOut
    skills_completed: int
    lessons_completed: int
    achievements: list[dict[str, str]]
