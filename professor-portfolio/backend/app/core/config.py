import os
from typing import List

class Settings:
    PROJECT_NAME: str = "Professor Portfolio API"
    ALLOWED_ORIGINS_STR: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    RATE_LIMIT: str = os.getenv("RATE_LIMIT", "5/minute")

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS_STR.split(",") if origin.strip()]

settings = Settings()

