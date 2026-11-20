import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_db
from app.models import Message, Project
from app.main import app

TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_profile_endpoint(client):
    response = client.get("/api/profile")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "skills" in data
    assert "frontend" in data["skills"]
    assert "backend" in data["skills"]
    assert "links" in data

def test_projects_endpoint_seeding(client):
    response = client.get("/api/projects")
    assert response.status_code == 200
    projects = response.json()
    assert isinstance(projects, list)
    assert len(projects) >= 3
    first = projects[0]
    assert "id" in first
    assert "title" in first
    assert "summary" in first
    assert "stack" in first
    assert isinstance(first["stack"], list)

def test_contact_submission_success(client):
    payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "message": "Thank you so much for the exceptional guidance in backend systems!",
        "type": "contact"
    }
    response = client.post("/api/contact", json=payload)
    assert response.status_code == 201
    res = response.json()
    assert res["status"] == "success"
    assert "id" in res

def test_contact_validation_errors(client):
    # Invalid email
    bad_email = {
        "name": "Jane",
        "email": "not-an-email",
        "message": "This is a valid long message for contact."
    }
    res1 = client.post("/api/contact", json=bad_email)
    assert res1.status_code == 422

    # Message too short (< 10 chars)
    short_msg = {
        "name": "Jane",
        "email": "jane@example.com",
        "message": "Too short"
    }
    res2 = client.post("/api/contact", json=short_msg)
    assert res2.status_code == 422

    # Invalid type
    bad_type = {
        "name": "Jane",
        "email": "jane@example.com",
        "message": "This message is long enough to pass validation.",
        "type": "unsupported_type"
    }
    res3 = client.post("/api/contact", json=bad_type)
    assert res3.status_code == 422

def test_testimonials_approval_filtering(client):
    # Submit a testimonial
    payload = {
        "name": "Alex Student",
        "email": "alex@university.edu",
        "message": "Professor was the most inspiring mentor throughout my undergraduate thesis.",
        "type": "testimonial"
    }
    sub_res = client.post("/api/contact", json=payload)
    assert sub_res.status_code == 201
    testimonial_id = sub_res.json()["id"]

    # Verify unapproved testimonial does NOT appear
    get_res1 = client.get("/api/testimonials")
    assert get_res1.status_code == 200
    assert len(get_res1.json()) == 0

    # Simulate manual admin approval in database
    db = TestingSessionLocal()
    row = db.query(Message).filter(Message.id == testimonial_id).first()
    assert row is not None
    assert row.approved is False
    row.approved = True
    db.commit()
    db.close()

    # Verify approved testimonial now appears
    get_res2 = client.get("/api/testimonials")
    assert get_res2.status_code == 200
    data = get_res2.json()
    assert len(data) == 1
    assert data[0]["name"] == "Alex Student"

def test_contact_rate_limiting(client):
    payload = {
        "name": "Spammer",
        "email": "spam@example.com",
        "message": "Spamming the contact endpoint rapidly to verify rate limit.",
        "type": "contact"
    }
    status_codes = []
    for _ in range(8):
        resp = client.post("/api/contact", json=payload)
        status_codes.append(resp.status_code)

    assert 429 in status_codes
