#!/usr/bin/env python3
"""
Render static JSON files from database for Viewer PWA
Run this to generate/update the static JSON files that the Viewer uses
"""

import json
import os
import asyncio
from datetime import datetime
from pathlib import Path
from database.connection import get_session
from database.models import Creator, ContentSet, ContentCard
from sqlalchemy import select
from sqlalchemy.orm import selectinload

# Output directory for rendered JSON
OUTPUT_DIR = Path("../../viewer-pwa/public/data")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

async def export_creators(session):
    """Export all creators to creators.json"""
    result = await session.execute(
        select(Creator).order_by(Creator.display_name)
    )
    creators = result.scalars().all()
    
    creators_data = []
    for creator in creators:
        creators_data.append({
            "creator_id": creator.creator_id,
            "display_name": creator.display_name,
            "platform": creator.platforms[0]["platform"] if creator.platforms else "website",
            "platform_handle": creator.platforms[0]["handle"] if creator.platforms else creator.display_name,
            "avatar_url": creator.avatar_url or f"https://ui-avatars.com/api/?name={creator.display_name}",
            "banner_url": creator.banner_url,
            "description": creator.description,
            "categories": creator.categories or [],
            "follower_count": creator.follower_count,
            "verified": creator.verified,
            "social_links": creator.social_links or {},
            "expertise_areas": creator.expertise_areas or [],
            "content_style": creator.content_style,
            "created_at": creator.created_at.isoformat() if creator.created_at else None,
            "updated_at": creator.updated_at.isoformat() if creator.updated_at else None
        })
    
    with open(OUTPUT_DIR / "creators.json", "w", encoding="utf-8") as f:
        json.dump(creators_data, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Exported {len(creators_data)} creators")
    return len(creators_data)

async def export_content_sets(session):
    """Export all content sets to content_sets.json"""
    result = await session.execute(
        select(ContentSet)
        .options(selectinload(ContentSet.creator))
        .order_by(ContentSet.created_at.desc())
    )
    content_sets = result.scalars().all()
    
    sets_data = []
    for content_set in content_sets:
        # Count actual cards
        cards_result = await session.execute(
            select(ContentCard).where(ContentCard.set_id == content_set.set_id)
        )
        card_count = len(cards_result.scalars().all())
        
        sets_data.append({
            "set_id": content_set.set_id,
            "set_number": f"s{len(sets_data) + 1:03d}",  # Generate set number
            "creator_id": content_set.creator_id,
            "title": content_set.title,
            "description": content_set.description,
            "category": content_set.category,
            "thumbnail_url": content_set.thumbnail_url or f"https://source.unsplash.com/400x400/?{content_set.category}",
            "banner_url": content_set.banner_url or f"https://source.unsplash.com/800x400/?{content_set.category}",
            "card_count": card_count,
            "estimated_time_minutes": content_set.estimated_time_minutes,
            "difficulty_level": content_set.difficulty_level,
            "target_audience": content_set.target_audience,
            "supported_navigation": content_set.supported_navigation or ["sequential"],
            "content_style": content_set.content_style,
            "tags": content_set.tags or [],
            "tags_pt": ["Populares"] if len(sets_data) < 5 else [],  # First 5 are popular
            "is_hero": len(sets_data) == 0,  # First one is hero
            "prerequisites": content_set.prerequisites or [],
            "learning_outcomes": content_set.learning_outcomes or [],
            "color_scheme": {
                "primary": "#3B82F6",
                "secondary": "#1E40AF", 
                "accent": "#60A5FA"
            },
            "stats": content_set.stats or {"views": 0, "completion_rate": 0},
            "status": content_set.status,
            "language": content_set.language,
            "created_at": content_set.created_at.isoformat() if content_set.created_at else None,
            "updated_at": content_set.updated_at.isoformat() if content_set.updated_at else None
        })
    
    with open(OUTPUT_DIR / "content_sets.json", "w", encoding="utf-8") as f:
        json.dump(sets_data, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Exported {len(sets_data)} content sets")
    return len(sets_data)

async def export_cards(session):
    """Export all cards to cards.json"""
    result = await session.execute(
        select(ContentCard)
        .order_by(ContentCard.set_id, ContentCard.order_index)
    )
    cards = result.scalars().all()
    
    cards_data = []
    for card in cards:
        cards_data.append({
            "card_id": card.card_id,
            "card_number": f"c{card.order_index:03d}",
            "set_id": card.set_id,
            "creator_id": card.creator_id,
            "title": card.title,
            "summary": card.summary,
            "detailed_content": card.detailed_content,
            "order_index": card.order_index,
            "navigation_contexts": card.navigation_contexts or {},
            "media": card.media or [],
            "domain_data": card.domain_data or {},
            "tags": card.tags or [],
            "created_at": card.created_at.isoformat() if card.created_at else None,
            "updated_at": card.updated_at.isoformat() if card.updated_at else None
        })
    
    with open(OUTPUT_DIR / "cards.json", "w", encoding="utf-8") as f:
        json.dump(cards_data, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Exported {len(cards_data)} cards")
    return len(cards_data)

async def render_all():
    """Render all data to static JSON files"""
    print(f"\n🔄 Rendering static JSON files to {OUTPUT_DIR}")
    print(f"   Timestamp: {datetime.now().isoformat()}")
    
    async with get_session() as session:
        # Export all data
        creators_count = await export_creators(session)
        sets_count = await export_content_sets(session)
        cards_count = await export_cards(session)
        
        # Create metadata file
        metadata = {
            "rendered_at": datetime.now().isoformat(),
            "counts": {
                "creators": creators_count,
                "content_sets": sets_count,
                "cards": cards_count
            },
            "version": "1.0.0"
        }
        
        with open(OUTPUT_DIR / "metadata.json", "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
        
        print(f"\n✅ Rendering complete!")
        print(f"   Files created in: {OUTPUT_DIR.absolute()}")

if __name__ == "__main__":
    asyncio.run(render_all())