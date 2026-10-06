from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Crop Yield & Market Analytics API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "sqlite:///./data/crop_analytics.db"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"

    # Default feeding baseline parameters (tunable)
    DEFAULT_FEED_COST_INR_PER_KG: float = 75.0

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
