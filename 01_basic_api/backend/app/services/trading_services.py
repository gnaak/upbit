# trading_services.py
import requests

async def get_bit_price():
    # 여기에서 업비트 API를 호출해서 비트코인 가져오기
    url = "https://api.upbit.com/v1/ticker?markets=KRW-BTC"

    headers = {"accept": "application/json"}  

    response = requests.get(url, headers=headers)

    return response.json()

async def get_eth_price():
    # 여기에서 업비트 API를 호출해서 비트코인 가져오기
    url = "https://api.upbit.com/v1/ticker?markets=KRW-BTC"

    headers = {"accept": "application/json"}  

    response = requests.get(url, headers=headers)

    print(response.text)