# trading_routers.py
from fastapi import APIRouter, Request, Depends
from app.services import trading_services

router = APIRouter()

@router.get("/bit")
async def get_bit_price():
    return await trading_services.get_bit_price()

@router.get("/eth")
async def get_eth_price():
    return await trading_services.get_eth_price()
