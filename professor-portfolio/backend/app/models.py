from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from app.db import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(100), primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    summary = Column(Text, nullable=False)
    stack = Column(Text, nullable=False)  # stored as comma-separated or json string
    live_url = Column(String(500), nullable=True)
    repo_url = Column(String(500), nullable=True)
    image = Column(String(500), nullable=True)

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False, default="contact")  # "contact" or "testimonial"
    approved = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

