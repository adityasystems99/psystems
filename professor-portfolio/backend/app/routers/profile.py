import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from app.schemas import ProfileResponse

router = APIRouter(prefix="/api", tags=["profile"])

DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "profile.json"

@router.get("/profile", response_model=ProfileResponse)
def get_profile():
    if not DATA_PATH.exists():
        raise HTTPException(status_code=404, detail="Profile data file not found")
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

