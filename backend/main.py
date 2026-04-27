from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine, Base
from models import models
from routers import auth, tickets, users, helpers, stats, analytics, deleted, login_logs, user_stats, export

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ticket Management System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*", "Content-Disposition"],
)

app.include_router(auth.router)
app.include_router(tickets.router)
app.include_router(users.router)
app.include_router(helpers.router)
app.include_router(stats.router)
app.include_router(analytics.router)
app.include_router(deleted.router)
app.include_router(login_logs.router)
app.include_router(user_stats.router)
app.include_router(export.router)

@app.get("/")
def root():
    return {"message": "Ticket Management API is running"}