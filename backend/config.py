"""
Configuration settings for the FastAPI application.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "postgresql://user:password@localhost/searcher_db"

    # Application
    debug: bool = False
    app_name: str = "Searcher - Data Collection Pipeline"

    # Scraping
    request_timeout: int = 30
    max_retries: int = 3
    batch_size: int = 10

    # API
    admin_api_key: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
