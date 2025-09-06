# app/models/data.py

from sqlalchemy import Column, Integer, String, Enum, func, DateTime, Float, ForeignKey
from app.database import Base  # Base는 declarative_base()
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKeyConstraint
from app.models import enums

class user(Base):
    __tablename__ = "tb_user"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String(50), nullable=False)
    password = Column(String(256), nullable=False)

class trade(Base):
    __tablename__ = "tb_trade"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)

    # user_id = Column(Integer, ForeignKey("tb_user.id", ondelete="CASCADE"), nullable=False)

    code = Column(String(20), nullable=False)        # 예: "KRW-BTC"
    side = Column(String(20), nullable=False)  # 매수/매도 구분
    price = Column(Float, nullable=False)            # 주문 가격
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 관계 (거래 기록 → 유저)
    user = relationship("user", back_populates="trades")
