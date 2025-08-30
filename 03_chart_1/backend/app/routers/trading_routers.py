# trading_routers.py
from fastapi import APIRouter, WebSocket
from app.services import trading_services
import asyncio, websockets, json

router = APIRouter()

@router.on_event("startup")
async def start_stream():
    return await trading_services.start_stream()


@router.websocket("/{code}")
async def backend_websocket(websocket: WebSocket, code: str):
    await trading_services.backend_websocket(websocket, code)