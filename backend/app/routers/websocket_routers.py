# websocket_routers.py
from fastapi import APIRouter, WebSocket
from app.services import websocket_services

router = APIRouter()

@router.on_event("startup")
async def start_stream():
    return await websocket_services.start_stream()

@router.websocket("/{code}/{type}")
async def backend_websocket(websocket: WebSocket, code: str, type: str):
    await websocket_services.backend_websocket(websocket, code, type)