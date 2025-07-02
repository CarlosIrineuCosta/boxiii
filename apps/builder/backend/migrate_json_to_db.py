#!/usr/bin/env python3
"""
Migration script to import JSON data to PostgreSQL
Handles platform field conversion and deduplication
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.models import Creator, ContentSet, ContentCard, Base

# Add current directory to path to import models
sys.path.append(str(Path(__file__).parent))

def load_json_data():
    """Load all JSON data files"""
    data_dir = Path(__file__).parent / "data"
    
    creators = []
    sets = []
    cards = []
    
    # Load creators
    creators_file = data_dir / "creators.json"
    if creators_file.exists():
        with open(creators_file) as f:
            creators = json.load(f)
    
    # Load content sets
    sets_file = data_dir / "content_sets.json"
    if sets_file.exists():
        with open(sets_file) as f:
            sets = json.load(f)
    
    # Load cards
    cards_file = data_dir / "cards.json"
    if cards_file.exists():
        with open(cards_file) as f:
            cards = json.load(f)
    
    return creators, sets, cards

def convert_creator_platforms(creator_data):
    """Convert legacy platform fields to new platforms array"""
    platforms = []
    
    # Convert legacy platform/platform_handle to platforms array
    if creator_data.get('platform') and creator_data.get('platform_handle'):
        platforms.append({
            'platform': creator_data['platform'],
            'handle': creator_data['platform_handle']
        })
    
    # Add social links as additional platforms
    social_links = creator_data.get('social_links', {})
    for platform, handle in social_links.items():
        if handle and handle != creator_data.get('platform_handle'):
            platforms.append({
                'platform': platform,
                'handle': handle.replace('@', '')  # Remove @ if present
            })
    
    return platforms

def deduplicate_sets(sets_data):
    """Remove duplicate content sets (keeping the latest one)"""
    # Group by creator_id and similar titles
    seen_combinations = {}
    unique_sets = []
    
    for content_set in sets_data:
        creator_id = content_set['creator_id']
        # Create a key based on creator and title similarity
        title_key = content_set['title'][:50]  # First 50 chars
        key = f"{creator_id}_{title_key}"
        
        if key not in seen_combinations:
            seen_combinations[key] = content_set
            unique_sets.append(content_set)
        else:
            # Keep the one with more cards or latest timestamp
            existing = seen_combinations[key]
            current_cards = content_set.get('card_count', 0)
            existing_cards = existing.get('card_count', 0)
            
            if current_cards > existing_cards:
                # Replace with current one
                unique_sets = [s for s in unique_sets if s['set_id'] != existing['set_id']]
                unique_sets.append(content_set)
                seen_combinations[key] = content_set
    
    return unique_sets

def migrate_data():
    """Migrate JSON data to PostgreSQL"""
    # Database connection
    database_url = os.getenv('DATABASE_URL', 'postgresql://boxiii_user:boxiii_dev_password@localhost:5432/boxiii')
    engine = create_engine(database_url)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        print("🔄 Loading JSON data...")
        creators_data, sets_data, cards_data = load_json_data()
        
        print(f"📊 Found: {len(creators_data)} creators, {len(sets_data)} sets, {len(cards_data)} cards")
        
        # Clear existing data
        print("🗑️  Clearing existing database data...")
        session.query(ContentCard).delete()
        session.query(ContentSet).delete()
        session.query(Creator).delete()
        session.commit()
        
        # Migrate creators
        print("👤 Migrating creators...")
        for creator_data in creators_data:
            platforms = convert_creator_platforms(creator_data)
            
            creator = Creator(
                creator_id=creator_data['creator_id'],
                display_name=creator_data['display_name'],
                platforms=platforms,
                description=creator_data.get('description'),
                categories=creator_data.get('categories', []),
                follower_count=creator_data.get('follower_count'),
                verified=creator_data.get('verified', False),
                social_links=creator_data.get('social_links', {}),
                expertise_areas=creator_data.get('expertise_areas', []),
                content_style=creator_data.get('content_style', 'educational'),
                # Legacy fields for backward compatibility
                platform=creator_data.get('platform', 'website'),
                platform_handle=creator_data.get('platform_handle', '')
            )
            session.add(creator)
            print(f"  ✅ {creator.display_name} with {len(platforms)} platforms")
        
        session.commit()
        
        # Deduplicate and migrate content sets
        print("📚 Migrating content sets...")
        unique_sets = deduplicate_sets(sets_data)
        print(f"  📝 Deduplicated from {len(sets_data)} to {len(unique_sets)} sets")
        
        for set_data in unique_sets:
            content_set = ContentSet(
                set_id=set_data['set_id'],
                creator_id=set_data['creator_id'],
                title=set_data['title'],
                description=set_data.get('description'),
                category=set_data['category'],
                thumbnail_url=set_data.get('thumbnail_url'),
                banner_url=set_data.get('banner_url'),
                card_count=set_data.get('card_count', 0),
                estimated_time_minutes=set_data.get('estimated_time_minutes', 30),
                difficulty_level=set_data.get('difficulty_level', 'intermediate'),
                target_audience=set_data.get('target_audience', 'general_public'),
                supported_navigation=set_data.get('supported_navigation', []),
                content_style=set_data.get('content_style', 'question_first'),
                tags=set_data.get('tags', []),
                prerequisites=set_data.get('prerequisites', []),
                learning_outcomes=set_data.get('learning_outcomes', []),
                stats=set_data.get('stats', {}),
                status=set_data.get('status', 'draft'),
                language=set_data.get('language', 'pt-BR')
            )
            session.add(content_set)
            print(f"  ✅ {content_set.title[:50]}...")
        
        session.commit()
        
        # Get set IDs that actually exist after deduplication
        existing_set_ids = {s['set_id'] for s in unique_sets}
        
        # Migrate content cards (only for existing sets)
        print("🃏 Migrating content cards...")
        cards_migrated = 0
        for card_data in cards_data:
            if card_data['set_id'] in existing_set_ids:
                card = ContentCard(
                    card_id=card_data['card_id'],
                    set_id=card_data['set_id'],
                    creator_id=card_data['creator_id'],
                    title=card_data['title'],
                    summary=card_data['summary'],
                    order_index=card_data['order_index'],
                    detailed_content=card_data.get('detailed_content'),
                    domain_data=card_data.get('domain_data', {}),
                    media=card_data.get('media', []),
                    navigation_contexts=card_data.get('navigation_contexts', {}),
                    tags=card_data.get('tags', [])
                )
                session.add(card)
                cards_migrated += 1
        
        session.commit()
        print(f"  ✅ Migrated {cards_migrated} cards")
        
        # Update card counts
        print("🔢 Updating card counts...")
        for content_set in session.query(ContentSet).all():
            actual_count = session.query(ContentCard).filter_by(set_id=content_set.set_id).count()
            content_set.card_count = actual_count
        
        session.commit()
        
        # Final summary
        print("\n✨ Migration completed successfully!")
        final_creators = session.query(Creator).count()
        final_sets = session.query(ContentSet).count()
        final_cards = session.query(ContentCard).count()
        
        print(f"📊 Final count: {final_creators} creators, {final_sets} sets, {final_cards} cards")
        
        # Show creator summary
        print("\n👥 Creators in database:")
        for creator in session.query(Creator).all():
            sets_count = session.query(ContentSet).filter_by(creator_id=creator.creator_id).count()
            cards_count = session.query(ContentCard).filter_by(creator_id=creator.creator_id).count()
            print(f"  • {creator.display_name}: {sets_count} sets, {cards_count} cards")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == "__main__":
    migrate_data()