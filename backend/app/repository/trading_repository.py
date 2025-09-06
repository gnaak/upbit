# trading_repository.py
# -----------------------------------------------
# CRUD 함수 네이밍 규칙
# - get_*: 데이터 조회
# - create_*: 새 데이터 생성
# - update_*: 기존 데이터 수정
# - delete_*: 데이터 삭제
# - get_*_list : 목록 조회
# - *_*_by_{조건명}: 조건별 필터 조회
# 예: get_user_by_id, create_user, update_user_name, delete_user_by_id
# -----------------------------------------------

from app.models import data

async def create_trading_log(code, price, type, db):
    try:
        new_log = data.trade(
        code=code,
        side=type,
        price=price,
        )
        db.add(new_log)
        db.commit()
        return "success"

    except Exception as e:
        print(str(e))
        return "false"