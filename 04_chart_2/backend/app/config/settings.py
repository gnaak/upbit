import os
import socket
from typing import List, Optional
from pydantic_settings import BaseSettings


class RawEnv(BaseSettings):
    # 환경별 변수 전부 불러오기
    local_mysql_user: str
    local_mysql_password: str
    local_mysql_host: str
    local_mysql_db: str
    mysql_port: int

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
        env_file_encoding = "utf-8"


class Settings:
    def __init__(self):
        self.raw = RawEnv()
        self.env = self._detect_env()

    def _detect_env(self) -> str:
        hostname = socket.gethostname()
        return "prod" if hostname.startswith("ip-") or hostname.startswith("ec2-") else "local"

    @property
    def mysql_user(self) -> str:
        return getattr(self.raw, f"{self.env}_mysql_user")

    @property
    def mysql_password(self) -> str:
        return getattr(self.raw, f"{self.env}_mysql_password")

    @property
    def mysql_host(self) -> str:
        return getattr(self.raw, f"{self.env}_mysql_host")

    @property
    def mysql_db(self) -> str:
        return getattr(self.raw, f"{self.env}_mysql_db")

    @property
    def mysql_port(self) -> int:
        return self.raw.mysql_port

    @property
    def cors_origins(self) -> List[str]:
        return ["https://yourdomain.com"] if self.env == "prod" else [
            "http://localhost:3000", "http://127.0.0.1:8000"
        ]
    
# 인스턴스 생성
def get_settings() -> Settings:
    return Settings()

settings = get_settings()