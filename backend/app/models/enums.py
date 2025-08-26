# app/models/enums.py

import enum

class UserStatusEnum(enum.Enum):
    WAITING = "waiting"
    APPROVED = "approved"
    REJECTED = "rejected"  

class AITypeEnum(enum.Enum):
    HEYGEN = "heygen"
    ELEVENLABS = "elevenlabs"