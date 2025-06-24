"""
PostgreSQL implementation of data interfaces using SQLAlchemy
"""

import os
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import IntegrityError

from data_interfaces import CreatorDataInterface, ContentDataInterface, ContentSetDataInterface
from database.models import Creator, ContentCard, ContentSet, Base


class PostgreSQLConnection:
    """Shared PostgreSQL connection manager"""
    
    def __init__(self, database_url: str = None):
        if database_url is None:
            database_url = os.getenv('DATABASE_URL', 'postgresql://boxiii_user:boxiii_dev_password@postgres:5432/boxiii')
        
        self.engine = create_engine(database_url)
        self.SessionLocal = sessionmaker(bind=self.engine)
    
    def get_session(self) -> Session:
        return self.SessionLocal()


class PostgreSQLCreatorData(CreatorDataInterface):
    """PostgreSQL implementation for creator data operations"""
    
    def __init__(self, connection: PostgreSQLConnection):
        self.connection = connection
    
    def _prepare_platforms(self, platforms):
        """
        Prepare platform data for database storage.
        
        NOTE: Validation is now handled at the API layer (Pydantic) in api_server.py
        This method only handles data preparation/formatting.
        """
        if not platforms:
            return []
        
        prepared = []
        for platform in platforms:
            if not isinstance(platform, dict):
                continue
            
            platform_name = platform.get('platform', '').strip().lower()
            handle = platform.get('handle', '').strip()
            
            if platform_name and handle:
                prepared.append({
                    'platform': platform_name,
                    'handle': handle
                })
        
        return prepared
    
    async def create_creator(self, creator_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create new creator in database.
        
        NOTE: Platform validation is now handled at API layer (Pydantic).
        This method receives already-validated data from api_server.py
        """
        session = self.connection.get_session()
        try:
            # Generate ID if not provided
            if 'creator_id' not in creator_data:
                creator_data['creator_id'] = f"{creator_data.get('display_name', 'creator').lower().replace(' ', '_')}_{str(uuid.uuid4())[:8]}"
            
            # Prepare platforms for database storage (already validated)
            platforms = creator_data.get('platforms', [])
            prepared_platforms = self._prepare_platforms(platforms)
            
            creator = Creator(
                creator_id=creator_data['creator_id'],
                display_name=creator_data['display_name'],
                platforms=prepared_platforms,
                description=creator_data.get('description'),
                categories=creator_data.get('categories', []),
                follower_count=creator_data.get('follower_count'),
                verified=creator_data.get('verified', False),
                social_links=creator_data.get('social_links', {}),
                expertise_areas=creator_data.get('expertise_areas', []),
                content_style=creator_data.get('content_style', 'educational')
            )
            
            session.add(creator)
            session.commit()
            return creator.to_dict()
            
        except IntegrityError as e:
            session.rollback()
            raise ValueError("Creator with this handle may already exist")
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    async def get_creator(self, creator_id: str) -> Optional[Dict[str, Any]]:
        session = self.connection.get_session()
        try:
            creator = session.query(Creator).filter_by(creator_id=creator_id).first()
            return creator.to_dict() if creator else None
        finally:
            session.close()
    
    async def list_creators(self, limit: Optional[int] = None, offset: int = 0, with_content_only: bool = False) -> List[Dict[str, Any]]:
        session = self.connection.get_session()
        try:
            if with_content_only:
                # Only return creators that have at least one content set
                query = session.query(Creator).join(ContentSet, Creator.creator_id == ContentSet.creator_id).offset(offset)
            else:
                # Return all creators
                query = session.query(Creator).offset(offset)
            
            if limit:
                query = query.limit(limit)
            creators = query.distinct().all()
            return [creator.to_dict() for creator in creators]
        finally:
            session.close()
    
    async def update_creator(self, creator_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update creator in database.
        
        NOTE: Platform validation is now handled at API layer (Pydantic).
        This method receives already-validated data from api_server.py
        """
        session = self.connection.get_session()
        try:
            creator = session.query(Creator).filter_by(creator_id=creator_id).first()
            if not creator:
                raise ValueError(f"Creator {creator_id} not found")
            
            # Handle platforms update (already validated)
            if 'platforms' in updates:
                prepared_platforms = self._prepare_platforms(updates['platforms'])
                creator.platforms = prepared_platforms
            
            # Update other fields
            for key, value in updates.items():
                if hasattr(creator, key) and key not in ['creator_id', 'platforms']:
                    setattr(creator, key, value)
            
            session.commit()
            return creator.to_dict()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    async def delete_creator(self, creator_id: str) -> bool:
        session = self.connection.get_session()
        try:
            creator = session.query(Creator).filter_by(creator_id=creator_id).first()
            if creator:
                session.delete(creator)
                session.commit()
                return True
            return False
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    async def export_to_json(self, output_path) -> Dict[str, Any]:
        """Export all creators to JSON format"""
        creators = await self.list_creators()
        export_data = {
            "creators": creators,
            "exported_at": datetime.now().isoformat(),
            "total_count": len(creators)
        }
        
        if output_path:
            import json
            from pathlib import Path
            output_path = Path(output_path)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w') as f:
                json.dump(export_data, f, indent=2)
        
        return export_data
    
    async def get_schema(self) -> Dict[str, Any]:
        """Get creator data schema"""
        return {
            "table": "creators",
            "fields": {
                "creator_id": {"type": "string", "primary_key": True},
                "display_name": {"type": "string", "required": True},
                "platforms": {"type": "jsonb", "schema": {"platform": "string", "handle": "string"}},
                "avatar_url": {"type": "text", "optional": True},
                "banner_url": {"type": "text", "optional": True},
                "description": {"type": "text", "optional": True},
                "categories": {"type": "array[string]", "default": []},
                "follower_count": {"type": "integer", "optional": True},
                "verified": {"type": "boolean", "default": False},
                "social_links": {"type": "jsonb", "default": {}},
                "expertise_areas": {"type": "array[string]", "default": []},
                "content_style": {"type": "string", "default": "educational"},
                "created_at": {"type": "datetime", "auto": True},
                "updated_at": {"type": "datetime", "auto": True}
            }
        }


class PostgreSQLContentSetData(ContentSetDataInterface):
    """PostgreSQL implementation for content set data operations"""
    
    def __init__(self, connection: PostgreSQLConnection):
        self.connection = connection
    
    async def create_set(self, set_data: Dict[str, Any]) -> Dict[str, Any]:
        session = self.connection.get_session()
        try:
            # Generate ID if not provided
            if 'set_id' not in set_data:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M")
                set_data['set_id'] = f"{set_data['creator_id']}_{set_data['category']}_{timestamp}"
            
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
            session.commit()
            return content_set.to_dict()
            
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    async def get_set(self, set_id: str) -> Optional[Dict[str, Any]]:
        session = self.connection.get_session()
        try:
            content_set = session.query(ContentSet).filter_by(set_id=set_id).first()
            return content_set.to_dict() if content_set else None
        finally:
            session.close()
    
    async def list_sets(self, creator_id: Optional[str] = None) -> List[Dict[str, Any]]:
        session = self.connection.get_session()
        try:
            query = session.query(ContentSet)
            if creator_id:
                query = query.filter_by(creator_id=creator_id)
            sets = query.all()
            return [content_set.to_dict() for content_set in sets]
        finally:
            session.close()
    
    async def update_set(self, set_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        session = self.connection.get_session()
        try:
            content_set = session.query(ContentSet).filter_by(set_id=set_id).first()
            if not content_set:
                raise ValueError(f"Content set {set_id} not found")
            
            for key, value in updates.items():
                if hasattr(content_set, key) and key != 'set_id':
                    setattr(content_set, key, value)
            
            session.commit()
            return content_set.to_dict()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    async def delete_set(self, set_id: str) -> bool:
        session = self.connection.get_session()
        try:
            content_set = session.query(ContentSet).filter_by(set_id=set_id).first()
            if content_set:
                session.delete(content_set)
                session.commit()
                return True
            return False
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    async def export_to_json(self, output_path) -> Dict[str, Any]:
        """Export all content sets to JSON format"""
        sets = await self.list_sets()
        export_data = {
            "content_sets": sets,
            "exported_at": datetime.now().isoformat(),
            "total_count": len(sets)
        }
        
        if output_path:
            import json
            from pathlib import Path
            output_path = Path(output_path)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w') as f:
                json.dump(export_data, f, indent=2)
        
        return export_data
    
    async def get_schema(self) -> Dict[str, Any]:
        """Get content set data schema"""
        return {
            "table": "content_sets",
            "fields": {
                "set_id": {"type": "string", "primary_key": True},
                "creator_id": {"type": "string", "foreign_key": "creators.creator_id"},
                "title": {"type": "text", "required": True},
                "description": {"type": "text", "optional": True},
                "category": {"type": "string", "required": True},
                "thumbnail_url": {"type": "text", "optional": True},
                "banner_url": {"type": "text", "optional": True},
                "card_count": {"type": "integer", "default": 0},
                "estimated_time_minutes": {"type": "integer", "default": 30},
                "difficulty_level": {"type": "string", "default": "intermediate"},
                "target_audience": {"type": "string", "default": "general_public"},
                "supported_navigation": {"type": "array[string]", "default": []},
                "content_style": {"type": "string", "default": "question_first"},
                "tags": {"type": "array[string]", "default": []},
                "prerequisites": {"type": "array[string]", "default": []},
                "learning_outcomes": {"type": "array[string]", "default": []},
                "stats": {"type": "jsonb", "default": {}},
                "status": {"type": "string", "default": "draft"},
                "language": {"type": "string", "default": "pt-BR"},
                "created_at": {"type": "datetime", "auto": True},
                "updated_at": {"type": "datetime", "auto": True}
            }
        }


class PostgreSQLContentData(ContentDataInterface):
    """PostgreSQL implementation for content card data operations"""
    
    def __init__(self, connection: PostgreSQLConnection):
        self.connection = connection
    
    async def create_card(self, card_data: Dict[str, Any]) -> Dict[str, Any]:
        session = self.connection.get_session()
        try:
            # Generate ID if not provided
            if 'card_id' not in card_data:
                card_data['card_id'] = f"{card_data['set_id']}_card_{str(uuid.uuid4())[:8]}"
            
            # Determine order_index if not provided
            if 'order_index' not in card_data:
                max_order = session.query(ContentCard).filter_by(set_id=card_data['set_id']).count()
                card_data['order_index'] = max_order + 1
            
            card = ContentCard(
                card_id=card_data['card_id'],
                set_id=card_data['set_id'],
                creator_id=card_data['creator_id'],
                title=card_data['title'],
                summary=card_data.get('summary', ''),
                order_index=card_data['order_index'],
                detailed_content=card_data.get('detailed_content'),
                domain_data=card_data.get('domain_data', {}),
                media=card_data.get('media', []),
                navigation_contexts=card_data.get('navigation_contexts', {}),
                tags=card_data.get('tags', [])
            )
            
            session.add(card)
            
            # Update set card count
            content_set = session.query(ContentSet).filter_by(set_id=card_data['set_id']).first()
            if content_set:
                content_set.card_count += 1
            
            session.commit()
            return card.to_dict()
            
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    async def get_card(self, card_id: str) -> Optional[Dict[str, Any]]:
        session = self.connection.get_session()
        try:
            card = session.query(ContentCard).filter_by(card_id=card_id).first()
            return card.to_dict() if card else None
        finally:
            session.close()
    
    async def list_cards(self, creator_id: Optional[str] = None, set_id: Optional[str] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        session = self.connection.get_session()
        try:
            query = session.query(ContentCard)
            if creator_id:
                query = query.filter_by(creator_id=creator_id)
            if set_id:
                query = query.filter_by(set_id=set_id)
            if limit:
                query = query.limit(limit)
            
            cards = query.order_by(ContentCard.order_index).all()
            return [card.to_dict() for card in cards]
        finally:
            session.close()
    
    async def update_card(self, card_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        session = self.connection.get_session()
        try:
            card = session.query(ContentCard).filter_by(card_id=card_id).first()
            if not card:
                raise ValueError(f"Card {card_id} not found")
            
            for key, value in updates.items():
                if hasattr(card, key) and key != 'card_id':
                    setattr(card, key, value)
            
            session.commit()
            return card.to_dict()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    async def delete_card(self, card_id: str) -> bool:
        session = self.connection.get_session()
        try:
            card = session.query(ContentCard).filter_by(card_id=card_id).first()
            if card:
                set_id = card.set_id
                session.delete(card)
                
                # Update set card count
                content_set = session.query(ContentSet).filter_by(set_id=set_id).first()
                if content_set:
                    content_set.card_count -= 1
                
                session.commit()
                return True
            return False
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    async def export_to_json(self, output_path) -> Dict[str, Any]:
        """Export all content cards to JSON format"""
        cards = await self.list_cards()
        export_data = {
            "content_cards": cards,
            "exported_at": datetime.now().isoformat(),
            "total_count": len(cards)
        }
        
        if output_path:
            import json
            from pathlib import Path
            output_path = Path(output_path)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w') as f:
                json.dump(export_data, f, indent=2)
        
        return export_data
    
    async def get_schema(self) -> Dict[str, Any]:
        """Get content card data schema"""
        return {
            "table": "content_cards",
            "fields": {
                "card_id": {"type": "string", "primary_key": True},
                "set_id": {"type": "string", "foreign_key": "content_sets.set_id"},
                "creator_id": {"type": "string", "foreign_key": "creators.creator_id"},
                "title": {"type": "text", "required": True},
                "summary": {"type": "text", "required": True},
                "order_index": {"type": "integer", "required": True},
                "detailed_content": {"type": "text", "optional": True},
                "domain_data": {"type": "jsonb", "default": {}},
                "media": {"type": "jsonb", "default": []},
                "navigation_contexts": {"type": "jsonb", "default": {}},
                "tags": {"type": "jsonb", "default": []},
                "created_at": {"type": "datetime", "auto": True},
                "updated_at": {"type": "datetime", "auto": True}
            }
        }