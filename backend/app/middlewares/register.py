# 역할: FastAPI 앱에 모든 공통 미들웨어(CORS, 보안 등)를 일괄 등록

from fastapi import FastAPI
from .cors import add_cors
from .secure_headers_middleware import add_secure_headers

# CORS와 보안 헤더 미들웨어를 FastAPI 앱에 등록
def register_middlewares(app: FastAPI):
    add_cors(app)
    add_secure_headers(app)