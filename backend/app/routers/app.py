from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.gamification import get_current_user, seconds_to_next_heart
from app.models import Course, Lesson, User, UserProgress
from app.schemas import (
    CourseTreeOut,
    LeaderboardEntryOut,
    LessonNodeOut,
    MeOut,
    ProfileOut,
    SkillNodeOut,
    UnitOut,
)

router = APIRouter(prefix="/api", tags=["app"])


def serialize_me(user: User) -> MeOut:
    return MeOut(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        total_xp=user.total_xp,
        current_streak=user.current_streak,
        hearts=user.hearts,
        max_hearts=settings.max_hearts,
        gems=user.gems,
        daily_xp_goal=user.daily_xp_goal,
        xp_today=user.xp_today,
        seconds_to_next_heart=seconds_to_next_heart(user),
    )


@router.get("/health")
def health():
    return {"ok": True}


@router.get("/me", response_model=MeOut)
def me(db: Session = Depends(get_db)):
    return serialize_me(get_current_user(db))


@router.get("/profile", response_model=ProfileOut)
def profile(db: Session = Depends(get_db)):
    user = get_current_user(db)
    lessons_completed = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == user.id, UserProgress.completed.is_(True))
        .count()
    )
    skill_ids = {
        row.skill_id
        for row in db.query(UserProgress).filter(
            UserProgress.user_id == user.id, UserProgress.completed.is_(True)
        )
    }
    skills_completed = 0
    for sid in skill_ids:
        total = db.query(Lesson).filter(Lesson.skill_id == sid).count()
        done = (
            db.query(UserProgress)
            .filter(
                UserProgress.user_id == user.id,
                UserProgress.skill_id == sid,
                UserProgress.completed.is_(True),
            )
            .count()
        )
        if total and done >= total:
            skills_completed += 1
    achievements = []
    if lessons_completed >= 1:
        achievements.append({"id": "first", "title": "First lesson", "detail": "Completed a lesson"})
    if user.current_streak >= 3:
        achievements.append({"id": "streak3", "title": "On a roll", "detail": "3-day streak"})
    if user.total_xp >= 50:
        achievements.append({"id": "xp50", "title": "Getting started", "detail": "50 XP earned"})
    return ProfileOut(
        me=serialize_me(user),
        skills_completed=skills_completed,
        lessons_completed=lessons_completed,
        achievements=achievements or [{"id": "welcome", "title": "Welcome", "detail": "Joined the path"}],
    )


@router.get("/leaderboard", response_model=list[LeaderboardEntryOut])
def leaderboard(db: Session = Depends(get_db)):
    user = get_current_user(db)
    rows = db.query(User).order_by(User.total_xp.desc(), User.id.asc()).all()
    return [
        LeaderboardEntryOut(
            rank=i,
            user_id=u.id,
            display_name=u.display_name,
            username=u.username,
            total_xp=u.total_xp,
            current_streak=u.current_streak,
            is_you=u.id == user.id,
        )
        for i, u in enumerate(rows, start=1)
    ]


@router.post("/practice/refill-hearts", response_model=MeOut)
def refill_hearts(db: Session = Depends(get_db)):
    user = get_current_user(db)
    user.hearts = settings.max_hearts
    db.commit()
    db.refresh(user)
    return serialize_me(user)


def _skill_status(skill, completed_lessons: set[int], previous_unlocked: bool):
    lessons = sorted(skill.lessons, key=lambda l: l.order_index)
    max_crowns = max(1, len(lessons))
    done = sum(1 for l in lessons if l.id in completed_lessons)
    progress = done / max_crowns if max_crowns else 0
    if not previous_unlocked:
        return "locked", done, max_crowns, progress
    if done >= max_crowns:
        return "completed", done, max_crowns, 1.0
    return "available", done, max_crowns, progress


@router.get("/courses/{course_id}/tree", response_model=CourseTreeOut)
def course_tree(course_id: int, db: Session = Depends(get_db)):
    user = get_current_user(db)
    course = db.get(Course, course_id)
    if course is None:
        raise HTTPException(404, "Course not found")
    completed = {
        p.lesson_id
        for p in db.query(UserProgress).filter(
            UserProgress.user_id == user.id, UserProgress.completed.is_(True)
        )
    }
    units_out: list[UnitOut] = []
    prev_skill_complete = True
    for unit in sorted(course.units, key=lambda u: u.order_index):
        skills_out: list[SkillNodeOut] = []
        for skill in sorted(unit.skills, key=lambda s: s.order_index):
            status, crowns, max_crowns, progress = _skill_status(
                skill, completed, prev_skill_complete
            )
            unlocked = status != "locked"
            lessons_out = []
            lesson_unlocked = unlocked
            for lesson in sorted(skill.lessons, key=lambda l: l.order_index):
                done = lesson.id in completed
                locked = (not lesson_unlocked) and (not done)
                lessons_out.append(
                    LessonNodeOut(
                        id=lesson.id,
                        title=lesson.title,
                        order_index=lesson.order_index,
                        completed=done,
                        locked=locked,
                    )
                )
                if not done:
                    lesson_unlocked = False
            skills_out.append(
                SkillNodeOut(
                    id=skill.id,
                    title=skill.title,
                    order_index=skill.order_index,
                    icon=skill.icon,
                    status=status,
                    crowns=crowns,
                    max_crowns=max_crowns,
                    progress=progress,
                    lessons=lessons_out,
                )
            )
            prev_skill_complete = status == "completed"
        units_out.append(
            UnitOut(
                id=unit.id,
                title=unit.title,
                description=unit.description,
                order_index=unit.order_index,
                color=unit.color,
                skills=skills_out,
            )
        )
    return CourseTreeOut(
        id=course.id,
        title=course.title,
        language_code=course.language_code,
        from_language=course.from_language,
        units=units_out,
    )
