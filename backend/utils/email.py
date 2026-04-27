import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")


def _send_email(to: str, subject: str, html: str):
    """Core send function using smtplib."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = MAIL_FROM
        msg["To"] = to
        msg.attach(MIMEText(html, "html"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.ehlo()
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(MAIL_FROM, to, msg.as_string())
        server.quit()
        print(f"✅ Email sent to {to} | Subject: {subject}")
    except Exception as e:
        print(f"❌ Email failed: {e}")


def send_ticket_created_email(to: str, user_name: str, ticket_title: str, ticket_id: int):
    subject = f"[Ticket #{ticket_id}] Created — {ticket_title}"
    html = f"""
    <html><body style="font-family:Arial,sans-serif; color:#333;">
    <h2>🎫 Ticket Created Successfully</h2>
    <p>Hi <b>{user_name}</b>,</p>
    <p>Your ticket has been submitted. Our team will look into it shortly.</p>
    <table style="border-collapse:collapse; margin-top:12px; width:100%; max-width:400px;">
      <tr><td style="padding:8px 12px; background:#f3f4f6; font-weight:bold; border:1px solid #e5e7eb;">Ticket ID</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb;">#{ticket_id}</td></tr>
      <tr><td style="padding:8px 12px; background:#f3f4f6; font-weight:bold; border:1px solid #e5e7eb;">Title</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb;">{ticket_title}</td></tr>
      <tr><td style="padding:8px 12px; background:#f3f4f6; font-weight:bold; border:1px solid #e5e7eb;">Status</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb; color:#f59e0b; font-weight:bold;">🕐 Pending</td></tr>
    </table>
    <p style="margin-top:16px; color:#6b7280; font-size:13px;">You will receive email updates when your ticket status changes.</p>
    </body></html>
    """
    _send_email(to, subject, html)


def send_ticket_status_email(to: str, user_name: str, ticket_title: str, ticket_id: int, status: str):
    status_display = {
        "pending": "🕐 Pending",
        "in_progress": "🔧 In Progress",
        "resolved": "✅ Resolved",
    }.get(status, status)

    color = {
        "pending": "#f59e0b",
        "in_progress": "#3b82f6",
        "resolved": "#10b981",
    }.get(status, "#6b7280")

    extra = (
        "<p style='margin-top:16px; color:#10b981; font-weight:bold;'>🎉 Your issue has been resolved. Thank you for your patience!</p>"
        if status == "resolved"
        else "<p style='margin-top:16px; color:#6b7280; font-size:13px;'>We will keep you posted on further updates.</p>"
    )

    subject = f"[Ticket #{ticket_id}] Status Updated — {status_display}"
    html = f"""
    <html><body style="font-family:Arial,sans-serif; color:#333;">
    <h2>🔔 Ticket Status Updated</h2>
    <p>Hi <b>{user_name}</b>,</p>
    <p>The status of your ticket has been updated.</p>
    <table style="border-collapse:collapse; margin-top:12px; width:100%; max-width:400px;">
      <tr><td style="padding:8px 12px; background:#f3f4f6; font-weight:bold; border:1px solid #e5e7eb;">Ticket ID</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb;">#{ticket_id}</td></tr>
      <tr><td style="padding:8px 12px; background:#f3f4f6; font-weight:bold; border:1px solid #e5e7eb;">Title</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb;">{ticket_title}</td></tr>
      <tr><td style="padding:8px 12px; background:#f3f4f6; font-weight:bold; border:1px solid #e5e7eb;">New Status</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb; color:{color}; font-weight:bold;">{status_display}</td></tr>
    </table>
    {extra}
    </body></html>
    """
    _send_email(to, subject, html)


def send_ticket_assigned_email(to: str, user_name: str, ticket_title: str, ticket_id: int, helper_name: str):
    subject = f"[Ticket #{ticket_id}] Assigned to Helper — {ticket_title}"
    html = f"""
    <html><body style="font-family:Arial,sans-serif; color:#333;">
    <h2>👷 Ticket Assigned to a Helper</h2>
    <p>Hi <b>{user_name}</b>,</p>
    <p>Your ticket has been assigned to a helper who will be working on it.</p>
    <table style="border-collapse:collapse; margin-top:12px; width:100%; max-width:400px;">
      <tr><td style="padding:8px 12px; background:#f3f4f6; font-weight:bold; border:1px solid #e5e7eb;">Ticket ID</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb;">#{ticket_id}</td></tr>
      <tr><td style="padding:8px 12px; background:#f3f4f6; font-weight:bold; border:1px solid #e5e7eb;">Title</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb;">{ticket_title}</td></tr>
      <tr><td style="padding:8px 12px; background:#f3f4f6; font-weight:bold; border:1px solid #e5e7eb;">Assigned To</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb; color:#3b82f6; font-weight:bold;">👤 {helper_name}</td></tr>
    </table>
    <p style="margin-top:16px; color:#6b7280; font-size:13px;">Your issue is in good hands. We will keep you updated on progress.</p>
    </body></html>
    """
    _send_email(to, subject, html)



def send_comment_added_email(to: str, user_name: str, ticket_title: str, ticket_id: int, comment: str):
    subject = f"[Ticket #{ticket_id}] New Comment Added — {ticket_title}"
    html = f"""
    <html><body style="font-family:Arial,sans-serif; color:#333;">
    <h2>💬 New Comment on Your Ticket</h2>
    <p>Hi <b>{user_name}</b>,</p>
    <p>A new comment has been added to your ticket.</p>
    <table style="border-collapse:collapse; margin-top:12px; width:100%; max-width:400px;">
      <tr><td style="padding:8px 12px; background:#f3f4f6; font-weight:bold; border:1px solid #e5e7eb;">Ticket ID</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb;">#{ticket_id}</td></tr>
      <tr><td style="padding:8px 12px; background:#f3f4f6; font-weight:bold; border:1px solid #e5e7eb;">Title</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb;">{ticket_title}</td></tr>
      <tr><td style="padding:8px 12px; background:#f3f4f6; font-weight:bold; border:1px solid #e5e7eb;">Comment</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb; color:#374151;">{comment}</td></tr>
    </table>
    <p style="margin-top:16px; color:#6b7280; font-size:13px;">Login to your account to view and reply to this comment.</p>
    </body></html>
    """
    _send_email(to, subject, html)


def send_priority_changed_email(to: str, user_name: str, ticket_title: str, ticket_id: int, priority: str):
    priority_display = {
        "low": "🟢 Low",
        "medium": "🟡 Medium",
        "high": "🔴 High",
    }.get(priority, priority)

    color = {
        "low": "#10b981",
        "medium": "#f59e0b",
        "high": "#ef4444",
    }.get(priority, "#6b7280")

    subject = f"[Ticket #{ticket_id}] Priority Changed — {ticket_title}"
    html = f"""
    <html><body style="font-family:Arial,sans-serif; color:#333;">
    <h2>🔺 Ticket Priority Updated</h2>
    <p>Hi <b>{user_name}</b>,</p>
    <p>The priority of your ticket has been changed.</p>
    <table style="border-collapse:collapse; margin-top:12px; width:100%; max-width:400px;">
      <tr><td style="padding:8px 12px; background:#f3f4f6; font-weight:bold; border:1px solid #e5e7eb;">Ticket ID</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb;">#{ticket_id}</td></tr>
      <tr><td style="padding:8px 12px; background:#f3f4f6; font-weight:bold; border:1px solid #e5e7eb;">Title</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb;">{ticket_title}</td></tr>
      <tr><td style="padding:8px 12px; background:#f3f4f6; font-weight:bold; border:1px solid #e5e7eb;">New Priority</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb; color:{color}; font-weight:bold;">{priority_display}</td></tr>
    </table>
    <p style="margin-top:16px; color:#6b7280; font-size:13px;">Our team is working to resolve your issue accordingly.</p>
    </body></html>
    """
    _send_email(to, subject, html)