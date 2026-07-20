from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    app_name: str = "LegalDoc API"
    cors_origins: str = "http://localhost:3000"
    database_url: str = Field(default="")
    openai_api_key: str = Field(default="")
    openai_model: str = "gpt-4o"
    openai_embedding_model: str = "text-embedding-3-small"
    supabase_url: str = Field(default="")
    supabase_service_role_key: str = Field(default="")
    supabase_jwks_url: str = Field(default="")
    supabase_jwks_cache_seconds: int = 3600
    supabase_jwt_audience: str = "authenticated"
    supabase_storage_bucket: str = "legal-documents"
    admin_emails: str = Field(default="")
    max_upload_mb: int = 20
    rate_limit_per_minute: int = 60

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def admin_email_set(self) -> set[str]:
        return {email.strip().lower() for email in self.admin_emails.split(",") if email.strip()}

    @property
    def jwks_url(self) -> str:
        if self.supabase_jwks_url:
            return self.supabase_jwks_url
        if not self.supabase_url:
            return ""
        return f"{self.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"

    @property
    def jwt_issuer(self) -> str:
        if not self.supabase_url:
            return ""
        return f"{self.supabase_url.rstrip('/')}/auth/v1"


@lru_cache
def get_settings() -> Settings:
    return Settings()
   