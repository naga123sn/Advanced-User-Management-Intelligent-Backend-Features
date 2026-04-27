from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.db import Base
import enum


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


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.user)
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    last_login = Column(DateTime(timezone=True), nullable=True)
    last_logout = Column(DateTime(timezone=True), nullable=True)
    is_online = Column(Boolean, default=False)
    failed_login_attempts = Column(Integer, default=0)       # ← new
    is_blocked = Column(Boolean, default=False)              # ← new
    blocked_until = Column(DateTime(timezone=True), nullable=True)  # ← new
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    tickets = relationship("Ticket", back_populates="user")
    comments = relationship("Comment", back_populates="user")
class Helper(Base):
    __tablename__ = "helpers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    tickets = relationship("Ticket", back_populates="helper")


class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.low)
    status = Column(Enum(StatusEnum), default=StatusEnum.pending)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    helper_id = Column(Integer, ForeignKey("helpers.id"), nullable=True)
    is_deleted = Column(Boolean, default=False)        # ← new
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=True, onupdate=func.now())
    user = relationship("User", back_populates="tickets")
    helper = relationship("Helper", back_populates="tickets")
    comments = relationship("Comment", back_populates="ticket")
    audit_logs = relationship("AuditLog", back_populates="ticket", cascade="all, delete")


class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    comment = Column(Text, nullable=False)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    ticket = relationship("Ticket", back_populates="comments")
    user = relationship("User", back_populates="comments")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    action = Column(String(100), nullable=False)
    description = Column(String(500), nullable=False)
    performed_by = Column(String(100), nullable=False)
    performed_by_role = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    ticket = relationship("Ticket", back_populates="audit_logs")


class LoginLog(Base):
    __tablename__ = "login_logs"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    email        = Column(String(100), nullable=False)
    status       = Column(Enum("success", "failed", "blocked", name="login_status"), nullable=False)
    reason       = Column(String(255), nullable=True)
    ip_address   = Column(String(50), nullable=True)
    attempted_at = Column(DateTime(timezone=True), server_default=func.now())