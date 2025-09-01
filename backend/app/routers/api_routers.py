# api_routers.py
from fastapi import APIRouter, WebSocket
from app.services import api_services

router = APIRouter()

@router.get("/candle/{type}/{code}")
async def get_candle_data(type: str, code: str, count: int = 200):
    # type 예: "minutes1", "minutes5", "days"
    if type.startswith("minutes"):
        type = type.replace("minutes", "minutes/")
    data = await api_services.get_candle_data(type, code, count)
    return data