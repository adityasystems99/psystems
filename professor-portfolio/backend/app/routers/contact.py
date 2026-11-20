from typing import List
from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Message
from app.schemas import ContactCreate, ContactResponse, TestimonialResponse
from app.core.limiter import limiter
from app.core.config import settings

router = APIRouter(prefix="/api", tags=["contact"])

@router.post("/contact", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT)
def submit_contact(request: Request, payload: ContactCreate, db: Session = Depends(get_db)):
    is_testimonial = (payload.type == "testimonial")
    new_message = Message(
        name=payload.name,
        email=str(payload.email),
        message=payload.message,
        type=payload.type,
        approved=False  # Testimonials always start unapproved
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    ack_text = "Thank you! Your testimonial has been submitted for review." if is_testimonial else "Thank you! Your message has been sent successfully."
    return ContactResponse(
        status="success",
        message=ack_text,
        id=new_message.id
    )

@router.get("/testimonials", response_model=List[TestimonialResponse])
def get_testimonials(db: Session = Depends(get_db)):
    approved_testimonials = (
        db.query(Message)
        .filter(Message.type == "testimonial", Message.approved == True)
        .order_by(Message.created_at.desc())
        .all()
    )
    return [
        TestimonialResponse(
            id=t.id,
            name=t.name,
            message=t.message,
            created_at=t.created_at
        )
        for t in approved_testimonials
    ]

