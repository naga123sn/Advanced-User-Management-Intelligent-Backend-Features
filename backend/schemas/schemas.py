from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import enum


# ── Enums (standalone, no import from models) ─────────────────────────────────
class RoleEnum(str, enum.Enum):
    admin = "admin"
    user = "user"

class PriorityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class StatusEnum(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    resolved = "resolved"


# ── Auth ───────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum
    is_active: bool
    is_online: bool = False
    is_blocked: bool = False
    failed_login_attempts: int = 0
    blocked_until: Optional[datetime] = None
    last_login: Optional[datetime] = None
    last_logout: Optional[datetime] = None

    class Config:
        from_attributes = True
    id: int
    name: str
    email: str
    role: RoleEnum
    is_active: bool
    is_online: bool = False
    last_login: Optional[datetime] = None
    last_logout: Optional[datetime] = None

    class Config:
        from_attributes = True
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class UserStatusUpdate(BaseModel):
    is_active: bool


# ── Helper ─────────────────────────────────────────────────────────────────────
class HelperCreate(BaseModel):
    name: str
    email: EmailStr

class HelperOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Ticket ─────────────────────────────────────────────────────────────────────
class TicketCreate(BaseModel):
    title: str
    description: str
    priority: PriorityEnum = PriorityEnum.low

class TicketStatusUpdate(BaseModel):
    status: StatusEnum

class TicketPriorityUpdate(BaseModel):
    priority: PriorityEnum

class TicketAssign(BaseModel):
    helper_id: int

class CommentOut(BaseModel):
    id: int
    comment: str
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TicketOut(BaseModel):
    id: int
    title: str
    description: str
    priority: PriorityEnum
    status: StatusEnum
    user_id: int
    helper_id: Optional[int] = None
    created_at: datetime
    comments: List[CommentOut] = []

    class Config:
        from_attributes = True


# ── Comment ────────────────────────────────────────────────────────────────────
class CommentCreate(BaseModel):
    comment: str


# ── Audit Log ──────────────────────────────────────────────────────────────────
class AuditLogOut(BaseModel):
    id: int
    ticket_id: int
    action: str
    description: str
    performed_by: str
    performed_by_role: str
    created_at: datetime

    class Config:
        from_attributes = True


TokenResponse.model_rebuild()


# ── Soft Delete ────────────────────────────────────────────────────────────────
class DeletedTicketOut(BaseModel):
    id: int
    title: str
    description: str
    priority: PriorityEnum
    status: StatusEnum
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class DeletedUserOut(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum
    created_at: datetime

    class Config:
        from_attributes = True


class LoginLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    email: str
    status: str
    reason: Optional[str] = None
    ip_address: Optional[str] = None
    attempted_at: datetime

    class Config:
        from_attributes = True