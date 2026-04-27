from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database.db import get_db
from models.models import Ticket, Comment, User, Helper, AuditLog
from schemas.schemas import (
    TicketCreate, TicketOut, TicketStatusUpdate,
    TicketPriorityUpdate, TicketAssign, CommentCreate, CommentOut,
    AuditLogOut
)
from utils.auth import get_current_user, require_admin
from utils.audit import log_action
from utils.email import (
    send_ticket_created_email,
    send_ticket_status_email,
    send_ticket_assigned_email,
    send_comment_added_email,
    send_priority_changed_email,
)

router = APIRouter(prefix="/tickets", tags=["Tickets"])


# ── Get All Tickets (Admin) ───────────────────────────────────────────────────
@router.get("", response_model=List[TicketOut])
def get_all_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return db.query(Ticket).filter(Ticket.is_deleted == False).all()


# ── Get My Tickets (User) ─────────────────────────────────────────────────────
@router.get("/my", response_model=List[TicketOut])
def get_my_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Ticket).filter(
        Ticket.user_id == current_user.id,
        Ticket.is_deleted == False
    ).all()


# ── Get Single Ticket ─────────────────────────────────────────────────────────
@router.get("/{ticket_id}", response_model=TicketOut)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.is_deleted == False
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if current_user.role != "admin" and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return ticket


# ── Create Ticket ─────────────────────────────────────────────────────────────
@router.post("", response_model=TicketOut)
def create_ticket(
    payload: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = Ticket(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        user_id=current_user.id
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    # Audit log
    log_action(
        db=db,
        ticket_id=ticket.id,
        action="TICKET_CREATED",
        description=f"Ticket '{ticket.title}' created with priority '{ticket.priority}'.",
        performed_by=current_user.name,
        performed_by_role=current_user.role,
    )

    # Email
    try:
        send_ticket_created_email(
            to=current_user.email,
            user_name=current_user.name,
            ticket_title=ticket.title,
            ticket_id=ticket.id,
        )
    except Exception as e:
        print(f"Email error: {e}")

    return ticket


# ── Update Status ─────────────────────────────────────────────────────────────
@router.patch("/{ticket_id}/status", response_model=TicketOut)
def update_status(
    ticket_id: int,
    payload: TicketStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.is_deleted == False
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    old_status = ticket.status
    ticket.status = payload.status
    db.commit()
    db.refresh(ticket)

    # Audit log
    log_action(
        db=db,
        ticket_id=ticket.id,
        action="STATUS_CHANGED",
        description=f"Status changed from '{old_status}' to '{payload.status}'.",
        performed_by=current_user.name,
        performed_by_role=current_user.role,
    )

    # Email
    owner = db.query(User).filter(User.id == ticket.user_id).first()
    try:
        if owner:
            send_ticket_status_email(
                to=owner.email,
                user_name=owner.name,
                ticket_title=ticket.title,
                ticket_id=ticket.id,
                status=payload.status,
            )
    except Exception as e:
        print(f"Email error: {e}")

    return ticket


# ── Update Priority ───────────────────────────────────────────────────────────
@router.patch("/{ticket_id}/priority", response_model=TicketOut)
def update_priority(
    ticket_id: int,
    payload: TicketPriorityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.is_deleted == False
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    old_priority = ticket.priority
    ticket.priority = payload.priority
    db.commit()
    db.refresh(ticket)

    # Audit log
    log_action(
        db=db,
        ticket_id=ticket.id,
        action="PRIORITY_CHANGED",
        description=f"Priority changed from '{old_priority}' to '{payload.priority}'.",
        performed_by=current_user.name,
        performed_by_role=current_user.role,
    )

    # Email
    owner = db.query(User).filter(User.id == ticket.user_id).first()
    try:
        if owner:
            send_priority_changed_email(
                to=owner.email,
                user_name=owner.name,
                ticket_title=ticket.title,
                ticket_id=ticket.id,
                priority=payload.priority,
            )
    except Exception as e:
        print(f"Email error: {e}")

    return ticket


# ── Assign Ticket to Helper ───────────────────────────────────────────────────
@router.patch("/{ticket_id}/assign", response_model=TicketOut)
def assign_ticket(
    ticket_id: int,
    payload: TicketAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.is_deleted == False
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.helper_id = payload.helper_id
    db.commit()
    db.refresh(ticket)

    helper = db.query(Helper).filter(Helper.id == payload.helper_id).first()
    helper_name = helper.name if helper else f"Helper #{payload.helper_id}"

    # Audit log
    log_action(
        db=db,
        ticket_id=ticket.id,
        action="HELPER_ASSIGNED",
        description=f"Ticket assigned to helper '{helper_name}'.",
        performed_by=current_user.name,
        performed_by_role=current_user.role,
    )

    # Email
    owner = db.query(User).filter(User.id == ticket.user_id).first()
    try:
        if owner and helper:
            send_ticket_assigned_email(
                to=owner.email,
                user_name=owner.name,
                ticket_title=ticket.title,
                ticket_id=ticket.id,
                helper_name=helper_name,
            )
    except Exception as e:
        print(f"Email error: {e}")

    return ticket


# ── Add Comment ───────────────────────────────────────────────────────────────
@router.post("/{ticket_id}/comments", response_model=CommentOut)
def add_comment(
    ticket_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.is_deleted == False
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    comment = Comment(
        comment=payload.comment,
        ticket_id=ticket_id,
        user_id=current_user.id
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Audit log
    log_action(
        db=db,
        ticket_id=ticket.id,
        action="COMMENT_ADDED",
        description=f"Comment added by '{current_user.name}': \"{payload.comment[:80]}{'...' if len(payload.comment) > 80 else ''}\"",
        performed_by=current_user.name,
        performed_by_role=current_user.role,
    )

    # Email — notify the other party
    owner = db.query(User).filter(User.id == ticket.user_id).first()
    try:
        if owner and owner.id != current_user.id:
            # Admin commented → notify user
            send_comment_added_email(
                to=owner.email,
                user_name=owner.name,
                ticket_title=ticket.title,
                ticket_id=ticket.id,
                comment=payload.comment,
            )
        elif owner and owner.id == current_user.id:
            # User commented → notify admin
            admin = db.query(User).filter(User.role == "admin").first()
            if admin:
                send_comment_added_email(
                    to=admin.email,
                    user_name=admin.name,
                    ticket_title=ticket.title,
                    ticket_id=ticket.id,
                    comment=payload.comment,
                )
    except Exception as e:
        print(f"Email error: {e}")

    return comment


# ── Delete Comment ────────────────────────────────────────────────────────────
@router.delete("/{ticket_id}/comments/{comment_id}")
def delete_comment(
    ticket_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.ticket_id == ticket_id
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own comments")

    # Audit log before delete
    log_action(
        db=db,
        ticket_id=ticket_id,
        action="COMMENT_DELETED",
        description=f"Comment deleted by '{current_user.name}': \"{comment.comment[:80]}{'...' if len(comment.comment) > 80 else ''}\"",
        performed_by=current_user.name,
        performed_by_role=current_user.role,
    )

    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted"}


# ── Soft Delete Ticket (Admin) ────────────────────────────────────────────────
@router.delete("/{ticket_id}")
def soft_delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.is_deleted == False
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.is_deleted = True
    db.commit()

    # Audit log
    log_action(
        db=db,
        ticket_id=ticket_id,
        action="TICKET_DELETED",
        description=f"Ticket '{ticket.title}' soft deleted by admin.",
        performed_by=current_user.name,
        performed_by_role=current_user.role,
    )

    return {"message": "Ticket deleted successfully"}


# ── Restore Soft Deleted Ticket (Admin) ───────────────────────────────────────
@router.patch("/{ticket_id}/restore")
def restore_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.is_deleted == True
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Deleted ticket not found")

    ticket.is_deleted = False
    db.commit()

    # Audit log
    log_action(
        db=db,
        ticket_id=ticket_id,
        action="TICKET_RESTORED",
        description=f"Ticket '{ticket.title}' restored by admin.",
        performed_by=current_user.name,
        performed_by_role=current_user.role,
    )

    return {"message": "Ticket restored successfully"}


# ── Get Audit Logs for a Ticket (Admin) ───────────────────────────────────────
@router.get("/{ticket_id}/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    logs = (
        db.query(AuditLog)
        .filter(AuditLog.ticket_id == ticket_id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )
    return logs
# Permanent delete ticket (Admin only)
@router.delete("/{ticket_id}/permanent")
def permanent_delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    db.delete(ticket)
    db.commit()
    return {"message": f"Ticket '{ticket.title}' permanently deleted"}