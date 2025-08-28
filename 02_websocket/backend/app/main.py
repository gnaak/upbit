# 역할: FastAPI 앱 진입점 / 앱 생성, 미들웨어 등록, DB 초기화, 라우터 연결 등
from fastapi import FastAPI
from app.middlewares import register  # 미들웨어 통합 등록
from app.config.settings import settings          # 글로벌 설정 인스턴스
from app.database import Base, engine             # SQLAlchemy ORM 모델과 DB 엔진
from app.routers import trading_routers
# FastAPI 앱을 생성하고 필요한 설정을 적용하는 팩토리 함수
def create_app() -> FastAPI:
    app = FastAPI()

    # CORS 및 보안 헤더 미들웨어 등록
    register.register_middlewares(app)

    # 개발 환경일 경우 DB 테이블 자동 생성 (운영 환경에서는 Alembic 권장)
    if settings.env == "local":
        Base.metadata.create_all(bind=engine)
    
    app.include_router(trading_routers.router, prefix="/ws")

    return app

# FastAPI 실행 인스턴스
app = create_app()
