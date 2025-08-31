# 역할: SQLAlchemy 기반 데이터베이스 연결 설정 및 세션 생성 함수 정의

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config.settings import settings  # .env 기반 설정 객체

# SQLAlchemy 연결 URL 구성
SQLALCHEMY_DATABASE_URL = (
    f"mysql+pymysql://{settings.mysql_user}:{settings.mysql_password}"
    f"@{settings.mysql_host}:{settings.mysql_port}/{settings.mysql_db}?charset=utf8mb4"
)
# DB 엔진 생성 (pool_pre_ping: 연결 체크)
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)

# DB 세션 생성기 (autocommit/autoflush 비활성화)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 모든 모델 클래스의 부모가 될 베이스 클래스
Base = declarative_base()

# 의존성 주입을 위한 DB 세션 생성 함수 (FastAPI Depends에서 사용)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()