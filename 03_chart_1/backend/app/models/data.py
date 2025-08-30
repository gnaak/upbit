# app/models/data.py

from sqlalchemy import Column, Integer, String, Boolean, Enum, UniqueConstraint, func, DateTime, Text
from app.database import Base  # Base는 declarative_base()
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKeyConstraint
from app.models import enums

class user(Base):
    __tablename__ = "tb_user"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String(50), nullable=False)
    # email = Column(String(50), nullable=False, unique=True)
    email = Column(String(50), nullable=False)
    password = Column(String(256), nullable=False)
    user_status = Column(Enum(enums.UserStatusEnum), nullable=False, default=enums.UserStatusEnum.WAITING) # 가입승인 상태 -> 승인 대기 / 승인 완료 / 거절     
    is_admin = Column(Boolean, default=False) # 관리자 여부    
    created_at = Column(DateTime, default=func.now()) 
    last_login_at = Column(DateTime, nullable=True)
        
    refresh_tokens = relationship("user_token", backref="user", cascade="all, delete-orphan")
    avatar = relationship("avatar", backref="user", cascade="all, delete-orphan")
    avatar_candidate = relationship("avatar_candidate", backref="user", cascade="all, delete-orphan")

class user_token(Base):
    __tablename__ = "tb_user_token"    

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    refresh_token = Column(String(50), nullable=False)
    device_info = Column(String(100), nullable=False)
    expired_at = Column(DateTime, nullable=True) 
    created_at = Column(DateTime, default=func.now())     
    
    user_id = Column(Integer, nullable=False)

    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['tb_user.id'], ondelete="CASCADE"),
    )  

class avatar_candidate(Base):
    __tablename__ = "tb_avatar_candidate"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True) 
    user_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=func.now())     

    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['tb_user.id'], ondelete="CASCADE"),
    )  

class avatar(Base):
    __tablename__ = "tb_avatar"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True) 
    user_id = Column(Integer, nullable=False)
    talking_photo_id = Column(String(256), nullable=True)
    elevenlabs_voice_id = Column(String(256), nullable=True)
    group_id = Column(String(256), nullable=True)
    avatar_name = Column(String(100), nullable=True)
    avatar_candidate_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=func.now())     

    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['tb_user.id'], ondelete="CASCADE"),
    )  

class video(Base):
    __tablename__ = "tb_video"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, nullable=False)
    title = Column(String(256), nullable=False)
    video_id = Column(String(256), nullable=False)
    avatar_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=func.now())

    __table_args__ = (
        ForeignKeyConstraint(['avatar_id'], ['tb_avatar.id'], ondelete="SET NULL"),
        ForeignKeyConstraint(['user_id'], ['tb_user.id'], ondelete="CASCADE"),
    )  

class ai_model(Base):
    __tablename__ = "tb_ai_model"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    ai_type = Column(String(256), nullable=False)
    service_type = Column(String(256), nullable=False)
    resource_url = Column(String(256), nullable=False)
    created_at = Column(DateTime, default=func.now())