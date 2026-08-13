from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = f"sqlite:///{(DATA_DIR / 'app.db').as_posix()}"
    cors_origins: str = "http://localhost:3000"
    default_user_id: int = 1
    max_hearts: int = 5
    heart_regen_seconds: int = 4 * 3600
    daily_xp_goal: int = 20
    lesson_xp: int = 10

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
