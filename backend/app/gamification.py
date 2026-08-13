from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.config import settings
from app.models import User


def _now() -> datetime:
    return datetime.utcnow()


def apply_heart_regen(user: User) -> None:
    if user.hearts >= settings.max_hearts:
        user.last_heart_regen_at = _now()
        return
    elapsed = (_now() - user.last_heart_regen_at).total_seconds()
    gained = int(elapsed // settings.heart_regen_seconds)
    if gained <= 0:
        return
    user.hearts = min(settings.max_hearts, user.hearts + gained)
    user.last_heart_regen_at = user.last_heart_regen_at + timedelta(
        seconds=gained * settings.heart_regen_seconds
    )


def seconds_to_next_heart(user: User) -> int | None:
    if user.hearts >= settings.max_hearts:
        return None
    elapsed = (_now() - user.last_heart_regen_at).total_seconds()
    remaining = settings.heart_regen_seconds - (elapsed % settings.heart_regen_seconds)
    return max(0, int(remaining))


def local_today(timezone: str) -> str:
    try:
        tz = ZoneInfo(timezone)
    except Exception:
        tz = ZoneInfo("UTC")
    return datetime.now(tz).date().isoformat()


def apply_daily_xp_window(user: User, timezone: str) -> None:
    today = local_today(timezone)
    if user.xp_today_date != today:
        user.xp_today = 0
        user.xp_today_date = today


def apply_streak(user: User, timezone: str) -> None:
    today = local_today(timezone)
    last = user.last_active_at
    user.timezone = timezone
    if last is None:
        user.current_streak = 1
        user.last_active_at = _now()
        return
    try:
        tz = ZoneInfo(timezone)
    except Exception:
        tz = ZoneInfo("UTC")
    last_local = last.replace(tzinfo=ZoneInfo("UTC")).astimezone(tz).date().isoformat()
    if last_local == today:
        return
    last_date = datetime.fromisoformat(last_local).date()
    today_date = datetime.fromisoformat(today).date()
    delta = (today_date - last_date).days
    if delta == 1:
        user.current_streak += 1
    else:
        user.current_streak = 1
    user.last_active_at = _now()


def get_current_user(db: Session) -> User:
    user = db.get(User, settings.default_user_id)
    if user is None:
        raise RuntimeError("Default learner is missing. Re-seed the database.")
    apply_heart_regen(user)
    apply_daily_xp_window(user, user.timezone or "UTC")
    db.commit()
    db.refresh(user)
    return user
