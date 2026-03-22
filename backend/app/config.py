from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://civic_user:civic_pass@db:5432/civic_db"
    SECRET_KEY: str = "dev-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 20
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
