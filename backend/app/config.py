import secrets
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Crop Yield & Market Analytics API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "sqlite:///./data/crop_analytics.db"
    CORS_ORIGINS: str = (
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
    )

    # Development uses a process-local key. Production must supply this value.
    JWT_SECRET_KEY: str | None = None
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours
    WEATHER_TIMEOUT_SECONDS: float = 8.0

    @property
    def jwt_secret_key(self) -> str:
        if self.JWT_SECRET_KEY:
            return self.JWT_SECRET_KEY
        if self.ENVIRONMENT.lower() == "production":
            raise RuntimeError("JWT_SECRET_KEY must be set in production")
        return _development_jwt_secret

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"


_development_jwt_secret = secrets.token_urlsafe(32)
settings = Settings()
