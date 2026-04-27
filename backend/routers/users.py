from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database.db import get_db
from models.models import User, Ticket, Comment, AuditLog
from schemas.schemas import UserOut, UserUpdate, UserStatusUpdate
from utils.auth import get_current_user, require_admin

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return db.query(User).filter(
        User.role == "user",
        User.is_deleted == False
    ).all()


@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.name is not None:
        user.name = payload.name
    if payload.email is not None:
        user.email = payload.email
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/status", response_model=UserOut)
def update_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/restore", response_model=dict)
def restore_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = db.query(User).filter(
        User.id == user_id,
        User.is_deleted == True
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="Deleted user not found")
    user.is_deleted = False
    user.is_active = True
    db.commit()
    return {"message": "User restored successfully"}


# ── PERMANENT DELETE — must be before soft delete ─────────────────────────────
@router.delete("/{user_id}/permanent")
def permanent_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "admin":
        raise HTTPException(status_code=403, detail="Cannot delete an admin account")

    try:
        from models.models import LoginLog

        # 1. Delete login logs
        db.query(LoginLog).filter(LoginLog.user_id == user_id).delete()

        # 2. Delete comments by this user
        db.query(Comment).filter(Comment.user_id == user_id).delete()

        # 3. Handle tickets owned by this user
        tickets = db.query(Ticket).filter(Ticket.user_id == user_id).all()
        for ticket in tickets:
            db.query(AuditLog).filter(AuditLog.ticket_id == ticket.id).delete()
            db.query(Comment).filter(Comment.ticket_id == ticket.id).delete()
        db.query(Ticket).filter(Ticket.user_id == user_id).delete()

        # 4. Delete the user
        db.delete(user)
        db.commit()
        return {"message": f"User '{user.name}' permanently deleted from database"}

    except Exception as e:
        db.rollback()
        print(f"Permanent delete error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── SOFT DELETE — must be AFTER permanent delete ──────────────────────────────
@router.delete("/{user_id}", response_model=dict)
def soft_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = db.query(User).filter(
        User.id == user_id,
        User.is_deleted == False
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_deleted = True
    user.is_active = False
    db.commit()
    return {"message": "User deleted successfully"}