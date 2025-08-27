# trading_routers.py
from fastapi import APIRouter, Request, Depends
from app.services import trading_services

router = APIRouter()

@router.get("/websocket")
async def start_stream():
    return await trading_services.start_stream()
