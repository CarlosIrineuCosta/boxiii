#!/usr/bin/env python3
"""
FastAPI Server for Boxiii Builder
Provides REST API with data abstraction layer
"""

import os
import uvicorn
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

# Import our data interfaces
from data_interfaces import DataManager
from postgresql_data_impl import PostgreSQLConnection, PostgreSQLCreatorData, PostgreSQLContentData, PostgreSQLContentSetData


# Pydantic models for API validation
class Platform(BaseModel):
    platform: str
    handle: str

class CreatorCreate(BaseModel):
    display_name: str
    platforms: List[Platform] = []
    description: Optional[str] = None
    categories: List[str] = []
    content_style: str = "educational"
    verified: bool = False
    follower_count: Optional[int] = None


class CreatorUpdate(BaseModel):
    display_name: Optional[str] = None
    platforms: Optional[List[Platform]] = None
    description: Optional[str] = None
    categories: Optional[List[str]] = None
    content_style: Optional[str] = None
    verified: Optional[bool] = None
    follower_count: Optional[int] = None


class CardCreate(BaseModel):
    set_id: str
    creator_id: str
    title: str
    summary: Optional[str] = None
    detailed_content: Optional[str] = None
    tags: List[str] = []


class SetCreate(BaseModel):
    creator_id: str
    title: str
    description: Optional[str] = None
    category: str
    difficulty_level: str = "intermediate"
    target_audience: str = "general_public"


# Initialize FastAPI app
app = FastAPI(
    title="Boxiii Builder API",
    description="Meta-CRUD API with data abstraction for content management",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5010", "http://localhost:3000"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files for testing
static_dir = Path(__file__).parent / "static"
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Global data manager instance
data_manager: DataManager = None


async def get_data_manager() -> DataManager:
    """Dependency to get data manager instance"""
    global data_manager
    if data_manager is None:
        # Initialize with PostgreSQL backend
        db_connection = PostgreSQLConnection()
        data_manager = DataManager(
            creator_interface=PostgreSQLCreatorData(db_connection),
            content_interface=PostgreSQLContentData(db_connection),
            set_interface=PostgreSQLContentSetData(db_connection)
        )
    return data_manager


# Root endpoint - redirect to test page
@app.get("/")
async def root():
    """Root endpoint - redirect to test page"""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/static/test.html")

# System endpoints
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/api/schema")
async def get_system_schema(dm: DataManager = Depends(get_data_manager)):
    """Get complete system schema"""
    return await dm.get_system_schema()


@app.post("/api/export")
async def export_all_data(
    background_tasks: BackgroundTasks,
    output_dir: Optional[str] = None,
    dm: DataManager = Depends(get_data_manager)
):
    """Export all data to JSON files for debugging/backup"""
    if output_dir is None:
        output_dir = Path(__file__).parent / "exports" / datetime.now().strftime("%Y%m%d_%H%M%S")
    else:
        output_dir = Path(output_dir)
    
    try:
        exports = await dm.export_all_to_json(output_dir)
        return {
            "status": "success",
            "message": "Data exported successfully",
            "exports": exports,
            "export_dir": str(output_dir)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


# Creator endpoints
@app.get("/api/creators")
async def list_creators(
    limit: Optional[int] = None,
    offset: int = 0,
    dm: DataManager = Depends(get_data_manager)
):
    """List all creators"""
    creators = await dm.creators.list_creators(limit=limit, offset=offset)
    return {"data": creators, "count": len(creators)}


@app.get("/api/creators/{creator_id}")
async def get_creator(creator_id: str, dm: DataManager = Depends(get_data_manager)):
    """Get specific creator"""
    creator = await dm.creators.get_creator(creator_id)
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    return creator


@app.post("/api/creators")
async def create_creator(creator: CreatorCreate, dm: DataManager = Depends(get_data_manager)):
    """Create new creator"""
    try:
        creator_data = creator.dict()
        result = await dm.creators.create_creator(creator_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/api/creators/{creator_id}")
async def update_creator(
    creator_id: str, 
    creator: CreatorUpdate, 
    dm: DataManager = Depends(get_data_manager)
):
    """Update creator"""
    try:
        creator_data = creator.dict(exclude_unset=True)
        result = await dm.creators.update_creator(creator_id, creator_data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/creators/{creator_id}")
async def delete_creator(creator_id: str, dm: DataManager = Depends(get_data_manager)):
    """Delete creator"""
    success = await dm.creators.delete_creator(creator_id)
    if not success:
        raise HTTPException(status_code=404, detail="Creator not found")
    return {"status": "deleted", "creator_id": creator_id}


# Content card endpoints
@app.get("/api/cards")
async def list_cards(
    creator_id: Optional[str] = None,
    limit: Optional[int] = None,
    dm: DataManager = Depends(get_data_manager)
):
    """List content cards"""
    cards = await dm.cards.list_cards(creator_id=creator_id, limit=limit)
    return {"data": cards, "count": len(cards)}


@app.get("/api/cards/{card_id}")
async def get_card(card_id: str, dm: DataManager = Depends(get_data_manager)):
    """Get specific card"""
    card = await dm.cards.get_card(card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card


@app.post("/api/cards")
async def create_card(card: CardCreate, dm: DataManager = Depends(get_data_manager)):
    """Create new content card"""
    try:
        card_data = card.dict()
        result = await dm.cards.create_card(card_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Content set endpoints
@app.get("/api/sets")
async def list_sets(
    creator_id: Optional[str] = None,
    dm: DataManager = Depends(get_data_manager)
):
    """List content sets"""
    sets = await dm.sets.list_sets(creator_id=creator_id)
    return {"data": sets, "count": len(sets)}


@app.get("/api/sets/{set_id}")
async def get_set(set_id: str, dm: DataManager = Depends(get_data_manager)):
    """Get specific content set"""
    content_set = await dm.sets.get_set(set_id)
    if not content_set:
        raise HTTPException(status_code=404, detail="Content set not found")
    return content_set


@app.post("/api/sets")
async def create_set(content_set: SetCreate, dm: DataManager = Depends(get_data_manager)):
    """Create new content set"""
    try:
        set_data = content_set.dict()
        result = await dm.sets.create_set(set_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Development and debugging endpoints
@app.get("/api/debug/data-summary")
async def get_data_summary(dm: DataManager = Depends(get_data_manager)):
    """Get summary of all data for debugging"""
    creators = await dm.creators.list_creators()
    cards = await dm.cards.list_cards()
    sets = await dm.sets.list_sets()
    
    return {
        "summary": {
            "creators": len(creators),
            "cards": len(cards),
            "sets": len(sets)
        },
        "creators": [{"id": c.get("creator_id"), "name": c.get("display_name")} for c in creators],
        "recent_cards": [{"id": c.get("card_id"), "title": c.get("title")} for c in cards[-5:]],
        "recent_sets": [{"id": s.get("set_id"), "title": s.get("title")} for s in sets[-5:]]
    }


if __name__ == "__main__":
    # Get port from environment or default to 5001
    port = int(os.getenv("API_PORT", 5001))
    
    print(f"🚀 Starting Boxiii Builder API on port {port}")
    print(f"📁 Data directory: {Path(__file__).parent / 'data'}")
    print(f"🌐 API docs: http://localhost:{port}/docs")
    print(f"💾 Export endpoint: http://localhost:{port}/api/export")
    
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )