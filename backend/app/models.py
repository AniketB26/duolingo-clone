from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True)
    display_name: Mapped[str] = mapped_column(String(120))
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_active_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    timezone: Mapped[str] = mapped_column(String(64), default="UTC")
    hearts: Mapped[int] = mapped_column(Integer, default=5)
    last_heart_regen_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    gems: Mapped[int] = mapped_column(Integer, default=500)
    daily_xp_goal: Mapped[int] = mapped_column(Integer, default=20)
    xp_today: Mapped[int] = mapped_column(Integer, default=0)
    xp_today_date: Mapped[str | None] = mapped_column(String(16), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

    progress: Mapped[list["UserProgress"]] = relationship(back_populates="user")


class AppMeta(Base):
    __tablename__ = "app_meta"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[str] = mapped_column(String(120))


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(120))
    language_code: Mapped[str] = mapped_column(String(16))
    from_language: Mapped[str] = mapped_column(String(64), default="English")

    units: Mapped[list["Unit"]] = relationship(back_populates="course")


class Unit(Base):
    __tablename__ = "units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"))
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(String(255), default="")
    order_index: Mapped[int] = mapped_column(Integer)
    color: Mapped[str] = mapped_column(String(16), default="#58CC02")

    course: Mapped[Course] = relationship(back_populates="units")
    skills: Mapped[list["Skill"]] = relationship(back_populates="unit")


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    unit_id: Mapped[int] = mapped_column(ForeignKey("units.id"))
    title: Mapped[str] = mapped_column(String(120))
    order_index: Mapped[int] = mapped_column(Integer)
    icon: Mapped[str] = mapped_column(String(32), default="star")

    unit: Mapped[Unit] = relationship(back_populates="skills")
    lessons: Mapped[list["Lesson"]] = relationship(back_populates="skill")


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"))
    title: Mapped[str] = mapped_column(String(120))
    order_index: Mapped[int] = mapped_column(Integer)
    xp_reward: Mapped[int] = mapped_column(Integer, default=10)

    skill: Mapped[Skill] = relationship(back_populates="lessons")
    exercises: Mapped[list["Exercise"]] = relationship(back_populates="lesson")


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"))
    order_index: Mapped[int] = mapped_column(Integer)
    exercise_type: Mapped[str] = mapped_column(String(32))
    prompt: Mapped[str] = mapped_column(Text)
    content_json: Mapped[str] = mapped_column(Text)
    solution_json: Mapped[str] = mapped_column(Text)

    lesson: Mapped[Lesson] = relationship(back_populates="exercises")


class UserProgress(Base):
    __tablename__ = "user_progress"
    __table_args__ = (UniqueConstraint("user_id", "lesson_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"))
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"))
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    crown_level: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped[User] = relationship(back_populates="progress")
