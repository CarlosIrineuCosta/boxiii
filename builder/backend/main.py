#!/usr/bin/env python3
"""
FastAPI Server for Boxiii Builder with PostgreSQL Database
"""

import os
import uvicorn
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

# Import database components
from database import get_db, init_db, check_db_connection
from database.models import Creator, ContentSet, ContentCard


# Platform model for multiple platforms
class Platform(BaseModel):
    platform: str
    handle: str

# Pydantic models for API validation
class CreatorCreate(BaseModel):
    display_name: str
    platforms: List[Platform] = []
    description: Optional[str] = ""
    categories: List[str] = []
    follower_count: Optional[int] = None
    verified: bool = False
    social_links: Dict[str, str] = {}
    expertise_areas: List[str] = []
    content_style: str = "educational"


class CreatorUpdate(BaseModel):
    display_name: Optional[str] = None
    platforms: Optional[List[Platform]] = None
    description: Optional[str] = None
    categories: Optional[List[str]] = None
    follower_count: Optional[int] = None
    verified: Optional[bool] = None
    social_links: Optional[Dict[str, str]] = None
    expertise_areas: Optional[List[str]] = None
    content_style: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None


class ContentSetCreate(BaseModel):
    creator_id: str
    title: str
    description: str
    category: str
    difficulty_level: str = "intermediate"
    target_audience: str = "general_public"
    content_style: str = "question_first"
    tags: List[str] = []
    prerequisites: List[str] = []
    learning_outcomes: List[str] = []


class ContentCardCreate(BaseModel):
    set_id: str
    creator_id: str
    title: str
    summary: str
    order_index: int
    detailed_content: Optional[str] = ""
    domain_data: Dict[str, Any] = {}
    media: List[Dict[str, Any]] = []
    navigation_contexts: Dict[str, Any] = {}
    tags: List[str] = []


# Initialize FastAPI app
app = FastAPI(
    title="Boxiii Builder API",
    description="PostgreSQL-backed API for content management",
    version="2.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",  # Builder frontend
        "http://localhost:3000",  # Viewer frontend
        "http://localhost:5010",  # Legacy port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files for testing
static_dir = Path(__file__).parent / "static"
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    if not check_db_connection():
        print("❌ Database connection failed!")
        print("Make sure PostgreSQL is running and DATABASE_URL is correct")
        exit(1)
    
    init_db()
    print("✅ Database initialized successfully")


# Helper function to generate IDs
def generate_creator_id(display_name: str, platforms: List[Dict] = None) -> str:
    """Generate creator ID from display name and first platform"""
    import uuid
    # Use first platform handle if available, otherwise use display name
    if platforms and len(platforms) > 0:
        clean_handle = platforms[0].get("handle", "").replace("@", "").lower()
    else:
        clean_handle = display_name.replace(" ", "_").lower()
    
    clean_handle = "".join(c for c in clean_handle if c.isalnum() or c == "_")[:20]
    return f"{clean_handle}_{uuid.uuid4().hex[:8]}"


def generate_set_id(creator_id: str, title: str) -> str:
    """Generate set ID"""
    import uuid
    clean_title = "".join(c for c in title.lower() if c.isalnum() or c in [' ', '-']).replace(' ', '_')[:20]
    return f"{creator_id}_{clean_title}_{uuid.uuid4().hex[:8]}"


def generate_card_id(set_id: str, order_index: int) -> str:
    """Generate card ID"""
    return f"{set_id}_card_{order_index:03d}"


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Boxiii Builder API v2.0",
        "database": "PostgreSQL",
        "docs": "/docs",
        "health": "/api/health"
    }


# System endpoints
@app.get("/api/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    try:
        # Test database connection
        from sqlalchemy import text
        result = db.execute(text("SELECT 1")).scalar()
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "database": f"error: {str(e)}"
        }


# Creator endpoints
@app.get("/api/creators")
async def list_creators(
    limit: Optional[int] = None,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """List all creators"""
    query = db.query(Creator)
    
    if offset:
        query = query.offset(offset)
    if limit:
        query = query.limit(limit)
    
    creators = query.all()
    return [creator.to_dict() for creator in creators]


@app.get("/api/creators/{creator_id}")
async def get_creator(creator_id: str, db: Session = Depends(get_db)):
    """Get specific creator"""
    creator = db.query(Creator).filter(Creator.creator_id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    return creator.to_dict()


@app.post("/api/creators")
async def create_creator(creator_data: CreatorCreate, db: Session = Depends(get_db)):
    """Create new creator"""
    try:
        # Convert platforms to dict format for database
        platforms_dict = [{"platform": p.platform, "handle": p.handle} for p in creator_data.platforms]
        
        # Generate creator ID
        creator_id = generate_creator_id(creator_data.display_name, platforms_dict)
        
        # Create creator object
        creator = Creator(
            creator_id=creator_id,
            display_name=creator_data.display_name,
            platforms=platforms_dict,
            description=creator_data.description,
            categories=creator_data.categories,
            follower_count=creator_data.follower_count,
            verified=creator_data.verified,
            social_links=creator_data.social_links,
            expertise_areas=creator_data.expertise_areas,
            content_style=creator_data.content_style
        )
        
        db.add(creator)
        db.commit()
        db.refresh(creator)
        
        return creator.to_dict()
        
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Creator with this handle may already exist")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/api/creators/{creator_id}")
async def update_creator(
    creator_id: str,
    creator_data: CreatorUpdate,
    db: Session = Depends(get_db)
):
    """Update creator"""
    creator = db.query(Creator).filter(Creator.creator_id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    try:
        # Update fields
        update_data = creator_data.dict(exclude_unset=True)
        
        # Convert platforms if provided
        if "platforms" in update_data and update_data["platforms"] is not None:
            platforms_dict = [{"platform": p.platform, "handle": p.handle} for p in update_data["platforms"]]
            update_data["platforms"] = platforms_dict
        
        for field, value in update_data.items():
            setattr(creator, field, value)
        
        db.commit()
        db.refresh(creator)
        
        return creator.to_dict()
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/creators/{creator_id}")
async def delete_creator(creator_id: str, db: Session = Depends(get_db)):
    """Delete creator"""
    creator = db.query(Creator).filter(Creator.creator_id == creator_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    try:
        db.delete(creator)
        db.commit()
        return {"success": True, "message": "Creator deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# Content Set endpoints
@app.get("/api/sets")
async def list_content_sets(
    creator_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List content sets"""
    query = db.query(ContentSet)
    
    if creator_id:
        query = query.filter(ContentSet.creator_id == creator_id)
    
    sets = query.all()
    return [content_set.to_dict() for content_set in sets]


@app.post("/api/sets")
async def create_content_set(set_data: ContentSetCreate, db: Session = Depends(get_db)):
    """Create new content set"""
    try:
        # Verify creator exists
        creator = db.query(Creator).filter(Creator.creator_id == set_data.creator_id).first()
        if not creator:
            raise HTTPException(status_code=404, detail="Creator not found")
        
        # Generate set ID
        set_id = generate_set_id(set_data.creator_id, set_data.title)
        
        # Create content set
        content_set = ContentSet(
            set_id=set_id,
            **set_data.dict()
        )
        
        db.add(content_set)
        db.commit()
        db.refresh(content_set)
        
        return content_set.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# Content Card endpoints
@app.get("/api/cards")
async def list_content_cards(
    set_id: Optional[str] = None,
    creator_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List content cards"""
    query = db.query(ContentCard)
    
    if set_id:
        query = query.filter(ContentCard.set_id == set_id)
    if creator_id:
        query = query.filter(ContentCard.creator_id == creator_id)
    
    query = query.order_by(ContentCard.order_index)
    cards = query.all()
    return [card.to_dict() for card in cards]


@app.post("/api/cards")
async def create_content_card(card_data: ContentCardCreate, db: Session = Depends(get_db)):
    """Create new content card"""
    try:
        # Verify creator and set exist
        creator = db.query(Creator).filter(Creator.creator_id == card_data.creator_id).first()
        if not creator:
            raise HTTPException(status_code=404, detail="Creator not found")
        
        content_set = db.query(ContentSet).filter(ContentSet.set_id == card_data.set_id).first()
        if not content_set:
            raise HTTPException(status_code=404, detail="Content set not found")
        
        # Generate card ID
        card_id = generate_card_id(card_data.set_id, card_data.order_index)
        
        # Create content card
        card = ContentCard(
            card_id=card_id,
            **card_data.dict()
        )
        
        db.add(card)
        
        # Update set card count
        content_set.card_count = db.query(ContentCard).filter(ContentCard.set_id == card_data.set_id).count() + 1
        
        db.commit()
        db.refresh(card)
        
        return card.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# File upload endpoints (placeholder for now)
@app.post("/api/creators/{creator_id}/avatar")
async def upload_creator_avatar(
    creator_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload creator avatar"""
    # This is a placeholder - in production you'd save to cloud storage
    return {"message": "Avatar upload not implemented yet", "filename": file.filename}


@app.post("/api/creators/{creator_id}/banner")
async def upload_creator_banner(
    creator_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload creator banner"""
    # This is a placeholder - in production you'd save to cloud storage
    return {"message": "Banner upload not implemented yet", "filename": file.filename}


# Export endpoint (for debugging)
@app.post("/api/export")
async def export_data(db: Session = Depends(get_db)):
    """Export all data as JSON for debugging"""
    try:
        creators = db.query(Creator).all()
        sets = db.query(ContentSet).all()
        cards = db.query(ContentCard).all()
        
        export_data = {
            "creators": [creator.to_dict() for creator in creators],
            "content_sets": [content_set.to_dict() for content_set in sets],
            "content_cards": [card.to_dict() for card in cards],
            "exported_at": datetime.now().isoformat()
        }
        
        return export_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Debug endpoint
@app.get("/api/debug/data-summary")
async def get_data_summary(db: Session = Depends(get_db)):
    """Get summary of all data for debugging"""
    try:
        creators_count = db.query(Creator).count()
        sets_count = db.query(ContentSet).count()
        cards_count = db.query(ContentCard).count()
        
        recent_creators = db.query(Creator).order_by(Creator.created_at.desc()).limit(5).all()
        
        return {
            "summary": {
                "creators": creators_count,
                "content_sets": sets_count,
                "content_cards": cards_count
            },
            "recent_creators": [
                {"id": c.creator_id, "name": c.display_name}
                for c in recent_creators
            ],
            "database": "PostgreSQL",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    # Get port from environment or default to 5001
    port = int(os.getenv("API_PORT", 5001))
    
    print(f"🚀 Starting Boxiii Builder API v2.0 on port {port}")
    print(f"🗄️  Database: PostgreSQL with SQLAlchemy")
    print(f"🌐 API docs: http://localhost:{port}/docs")
    print(f"💾 Health check: http://localhost:{port}/api/health")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )