import json
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Project
from app.schemas import ProjectResponse

router = APIRouter(prefix="/api", tags=["projects"])

PROJECTS_DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "projects.json"

def seed_projects_if_needed(db: Session):
    count = db.query(Project).count()
    if count == 0 and PROJECTS_DATA_PATH.exists():
        with open(PROJECTS_DATA_PATH, "r", encoding="utf-8") as f:
            raw_projects = json.load(f)
            for item in raw_projects:
                project = Project(
                    id=item.get("id"),
                    title=item.get("title"),
                    summary=item.get("summary"),
                    stack=json.dumps(item.get("stack", [])),
                    live_url=item.get("liveUrl"),
                    repo_url=item.get("repoUrl"),
                    image=item.get("image")
                )
                db.add(project)
            db.commit()

@router.get("/projects", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    seed_projects_if_needed(db)
    projects = db.query(Project).all()
    results = []
    for p in projects:
        try:
            stack_list = json.loads(p.stack) if p.stack else []
        except Exception:
            stack_list = [s.strip() for s in p.stack.split(",") if s.strip()] if p.stack else []
        results.append(ProjectResponse(
            id=p.id,
            title=p.title,
            summary=p.summary,
            stack=stack_list,
            liveUrl=p.live_url,
            repoUrl=p.repo_url,
            image=p.image
        ))
    return results

