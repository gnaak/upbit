# secure_headers_middleware.py

from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, FastAPI
from starlette.websockets import WebSocket

# HTTP 응답에 보안 헤더를 삽입하는 커스텀 미들웨어
class SecureHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if isinstance(request, WebSocket):
            return await call_next(request)
        
        response = await call_next(request)

        # 보안 헤더 삽입
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response

# FastAPI 앱에 보안 헤더 미들웨어를 추가
def add_secure_headers(app: FastAPI):
    app.add_middleware(SecureHeadersMiddleware)