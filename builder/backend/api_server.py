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
from pydantic import BaseModel, field_validator
from datetime import datetime

# Import our data interfaces
from data_interfaces import DataManager
from postgresql_data_impl import PostgreSQLConnection, PostgreSQLCreatorData, PostgreSQLContentData, PostgreSQLContentSetData

# Import generation functionality
try:
    from unified_generator import get_unified_generator, LLMProvider, ContentGenerationError
    from core_models import ContentType
    GENERATION_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Generation functionality not available: {e}")
    GENERATION_AVAILABLE = False


# Pydantic models for API validation
class Platform(BaseModel):
    platform: str
    handle: str
    
    @field_validator('handle')
    @classmethod
    def validate_handle_characters(cls, v: str) -> str:
        """
        Validate platform handle characters.
        
        DESIGN DECISION: Moving validation to API layer (Pydantic) instead of database layer
        for better user experience. This ensures:
        1. Immediate feedback to frontend (422 response) 
        2. No database round-trip for invalid data
        3. Standard FastAPI validation pattern
        4. Clear error messages in UI modal
        
        Handles cannot contain spaces or special characters that break platform URLs.
        """
        if not v or not v.strip():
            raise ValueError("Platform handle cannot be empty")
            
        forbidden_chars = [' ', '\t', '\n', '@', '#', '&', '?', '=', '+', '%']
        for char in forbidden_chars:
            if char in v:
                raise ValueError(f"Platform handle '{v}' is invalid! Handles cannot contain spaces or special characters like: {', '.join(forbidden_chars)}")
        return v.strip()
    
    @field_validator('platform')
    @classmethod
    def validate_supported_platform(cls, v: str) -> str:
        """Validate platform is supported"""
        valid_platforms = ['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin', 'website', 'facebook', 'twitch']
        v_lower = v.lower().strip()
        if v_lower not in valid_platforms:
            raise ValueError(f"Platform '{v}' is not supported. Valid platforms: {', '.join(valid_platforms)}")
        return v_lower  # Store platform names consistently as lowercase

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


class GenerationRequest(BaseModel):
    creator_id: str
    topic: str
    llm_provider: str  # 'gemini', 'claude', 'gpt4'
    num_cards: int = 5
    style: Optional[str] = "educational"
    content_type: Optional[str] = "general"  # Will be mapped to ContentType enum
    

class GenerationResponse(BaseModel):
    success: bool
    set_id: Optional[str] = None
    cards_generated: int = 0
    message: str
    error: Optional[str] = None


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
    with_content_only: bool = False,
    dm: DataManager = Depends(get_data_manager)
):
    """List all creators. with_content_only filters to creators that have at least one content set."""
    creators = await dm.creators.list_creators(limit=limit, offset=offset, with_content_only=with_content_only)
    return creators


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


@app.put("/api/cards/{card_id}")
async def update_card(card_id: str, card: CardCreate, dm: DataManager = Depends(get_data_manager)):
    """Update existing content card"""
    try:
        card_data = card.dict()
        result = await dm.cards.update_card(card_id, card_data)
        if not result:
            raise HTTPException(status_code=404, detail="Card not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/cards/{card_id}")
async def delete_card(card_id: str, dm: DataManager = Depends(get_data_manager)):
    """Delete content card"""
    success = await dm.cards.delete_card(card_id)
    if not success:
        raise HTTPException(status_code=404, detail="Card not found")
    return {"status": "deleted", "card_id": card_id}


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


@app.put("/api/sets/{set_id}")
async def update_set(set_id: str, content_set: SetCreate, dm: DataManager = Depends(get_data_manager)):
    """Update existing content set"""
    try:
        set_data = content_set.dict()
        result = await dm.sets.update_set(set_id, set_data)
        if not result:
            raise HTTPException(status_code=404, detail="Content set not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/sets/{set_id}")
async def delete_set(set_id: str, dm: DataManager = Depends(get_data_manager)):
    """Delete content set"""
    success = await dm.sets.delete_set(set_id)
    if not success:
        raise HTTPException(status_code=404, detail="Content set not found")
    return {"status": "deleted", "set_id": set_id}


# Content generation endpoint
@app.post("/api/generate", response_model=GenerationResponse)
async def generate_content(request: GenerationRequest, dm: DataManager = Depends(get_data_manager)):
    """Generate AI content cards for a creator"""
    
    if not GENERATION_AVAILABLE:
        raise HTTPException(
            status_code=503, 
            detail="Content generation is not available. Check AI provider configuration."
        )
    
    try:
        # 1. Validate creator exists
        creator = await dm.creators.get_creator(request.creator_id)
        if not creator:
            raise HTTPException(status_code=404, detail="Creator not found")
        
        # 2. Map frontend provider names to backend enums
        provider_mapping = {
            'gemini': LLMProvider.GEMINI_OPENAI,
            'claude': LLMProvider.ANTHROPIC,
            'gpt4': LLMProvider.OPENAI
        }
        
        llm_provider = provider_mapping.get(request.llm_provider.lower())
        if not llm_provider:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported provider: {request.llm_provider}. Supported: {list(provider_mapping.keys())}"
            )
        
        # 3. Map content type string to enum
        content_type_mapping = {
            'general': ContentType.GENERAL,
            'technology_gaming': ContentType.TECHNOLOGY_GAMING,
            'health_fitness': ContentType.HEALTH_FITNESS,
            'education_science': ContentType.EDUCATION_SCIENCE,
            'wellness': ContentType.WELLNESS,
            'nutrition': ContentType.NUTRITION,
            'space_exploration': ContentType.SPACE_EXPLORATION,
            # Add more mappings as needed
        }
        
        content_type = content_type_mapping.get(request.content_type.lower(), ContentType.GENERAL)
        
        # 4. Initialize the AI generator
        generator = get_unified_generator()
        if not generator.get_available_providers():
            raise HTTPException(
                status_code=503,
                detail="No AI providers are available. Check your API keys configuration."
            )
        
        if llm_provider not in generator.get_available_providers():
            available = [p.value for p in generator.get_available_providers()]
            raise HTTPException(
                status_code=400,
                detail=f"Provider {request.llm_provider} is not available. Available providers: {available}"
            )
        
        # 5. Create content set for the generated cards
        set_title = f"Generated: {request.topic}"
        set_data = {
            'creator_id': request.creator_id,
            'title': set_title,
            'description': f"AI-generated content about: {request.topic}",
            'category': request.content_type or 'general',
            'difficulty_level': 'intermediate',
            'target_audience': 'general_public',
            'content_style': request.style or 'educational',
            'estimated_time_minutes': request.num_cards * 5,  # Estimate 5 min per card
            'status': 'draft',
            'language': 'pt-BR'
        }
        
        content_set = await dm.sets.create_set(set_data)
        set_id = content_set['set_id']
        
        # 6. Generate cards using AI
        generated_cards = []
        for i in range(request.num_cards):
            try:
                card_context = f"Card {i+1} of {request.num_cards} in the series"
                
                # Generate card content using AI
                card_data = await generator.generate_content_card(
                    topic=request.topic,
                    content_type=content_type,
                    card_context=card_context,
                    provider=llm_provider
                )
                
                # 7. Create card in database
                card_record = {
                    'set_id': set_id,
                    'creator_id': request.creator_id,
                    'title': card_data.get('title', f'Card {i+1}: {request.topic}'),
                    'summary': card_data.get('summary', ''),
                    'detailed_content': card_data.get('detailed_content', ''),
                    'order_index': i + 1,
                    'domain_data': {
                        'topic': request.topic,
                        'difficulty': card_data.get('difficulty', 'intermediate'),
                        'guidance': card_data.get('guidance', ''),
                        'ai_provider': request.llm_provider,
                        'generation_timestamp': datetime.now().isoformat()
                    },
                    'tags': card_data.get('tags', []),
                    'media': [],  # Will be added manually later if needed
                    'navigation_contexts': {}
                }
                
                created_card = await dm.cards.create_card(card_record)
                generated_cards.append(created_card)
                
            except Exception as card_error:
                print(f"Error generating card {i+1}: {card_error}")
                # Continue with other cards even if one fails
                continue
        
        # 8. Update content set with actual card count
        await dm.sets.update_set(set_id, {'card_count': len(generated_cards)})
        
        return GenerationResponse(
            success=True,
            set_id=set_id,
            cards_generated=len(generated_cards),
            message=f"Successfully generated {len(generated_cards)} cards for '{request.topic}'"
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except ContentGenerationError as e:
        return GenerationResponse(
            success=False,
            message="Content generation failed",
            error=str(e)
        )
    except Exception as e:
        print(f"Unexpected error in content generation: {e}")
        return GenerationResponse(
            success=False,
            message="An unexpected error occurred during content generation",
            error=str(e)
        )


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