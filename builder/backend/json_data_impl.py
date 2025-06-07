#!/usr/bin/env python3
"""
JSON Data Implementation - Maintains current JSON file structure
This implements the data interfaces using the existing JSON files
"""

import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
import shutil

from data_interfaces import CreatorDataInterface, ContentDataInterface, ContentSetDataInterface


class JSONCreatorData(CreatorDataInterface):
    """JSON file implementation for creator data"""
    
    def __init__(self, data_dir: Path):
        self.data_dir = Path(data_dir)
        self.creators_file = self.data_dir / "creators.json"
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize file if it doesn't exist
        if not self.creators_file.exists():
            with open(self.creators_file, 'w', encoding='utf-8') as f:
                json.dump([], f)
    
    async def _load_creators(self) -> List[Dict[str, Any]]:
        """Load creators from JSON file"""
        try:
            with open(self.creators_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    async def _save_creators(self, creators: List[Dict[str, Any]]) -> None:
        """Save creators to JSON file"""
        with open(self.creators_file, 'w', encoding='utf-8') as f:
            json.dump(creators, f, indent=2, ensure_ascii=False)
    
    async def list_creators(self, limit: Optional[int] = None, offset: int = 0) -> List[Dict[str, Any]]:
        creators = await self._load_creators()
        if limit:
            return creators[offset:offset + limit]
        return creators[offset:]
    
    async def get_creator(self, creator_id: str) -> Optional[Dict[str, Any]]:
        creators = await self._load_creators()
        for creator in creators:
            if creator.get("creator_id") == creator_id:
                return creator
        return None
    
    async def create_creator(self, creator_data: Dict[str, Any]) -> Dict[str, Any]:
        creators = await self._load_creators()
        
        # Ensure required fields
        now = datetime.now().isoformat()
        creator_data.update({
            "creator_id": creator_data.get("creator_id", f"creator_{uuid.uuid4().hex[:8]}"),
            "created_at": now,
            "updated_at": now
        })
        
        creators.append(creator_data)
        await self._save_creators(creators)
        return creator_data
    
    async def update_creator(self, creator_id: str, creator_data: Dict[str, Any]) -> Dict[str, Any]:
        creators = await self._load_creators()
        
        for i, creator in enumerate(creators):
            if creator.get("creator_id") == creator_id:
                creator_data["updated_at"] = datetime.now().isoformat()
                creator_data["creator_id"] = creator_id  # Preserve ID
                creators[i] = {**creator, **creator_data}
                await self._save_creators(creators)
                return creators[i]
        
        raise ValueError(f"Creator {creator_id} not found")
    
    async def delete_creator(self, creator_id: str) -> bool:
        creators = await self._load_creators()
        
        for i, creator in enumerate(creators):
            if creator.get("creator_id") == creator_id:
                creators.pop(i)
                await self._save_creators(creators)
                return True
        
        return False
    
    async def export_to_json(self, output_path: Path) -> Dict[str, Any]:
        """Export creators to JSON (copy current file)"""
        creators = await self._load_creators()
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(creators, f, indent=2, ensure_ascii=False)
        
        return {
            "data": creators,
            "count": len(creators),
            "exported_at": datetime.now().isoformat()
        }
    
    async def get_schema(self) -> Dict[str, Any]:
        """Return creator schema based on current JSON structure"""
        return {
            "type": "object",
            "properties": {
                "creator_id": {"type": "string", "required": True},
                "display_name": {"type": "string", "required": True},
                "platform": {"type": "string"},
                "platform_handle": {"type": "string"},
                "avatar_url": {"type": "string", "nullable": True},
                "banner_url": {"type": "string", "nullable": True},
                "description": {"type": "string"},
                "categories": {"type": "array", "items": {"type": "string"}},
                "follower_count": {"type": "integer", "nullable": True},
                "verified": {"type": "boolean"},
                "social_links": {"type": "object"},
                "expertise_areas": {"type": "array", "items": {"type": "string"}},
                "content_style": {"type": "string"},
                "created_at": {"type": "string", "format": "date-time"},
                "updated_at": {"type": "string", "format": "date-time"}
            }
        }


class JSONContentData(ContentDataInterface):
    """JSON file implementation for content card data"""
    
    def __init__(self, data_dir: Path):
        self.data_dir = Path(data_dir)
        self.cards_file = self.data_dir / "cards.json"
        
        if not self.cards_file.exists():
            with open(self.cards_file, 'w', encoding='utf-8') as f:
                json.dump([], f)
    
    async def _load_cards(self) -> List[Dict[str, Any]]:
        try:
            with open(self.cards_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    async def _save_cards(self, cards: List[Dict[str, Any]]) -> None:
        with open(self.cards_file, 'w', encoding='utf-8') as f:
            json.dump(cards, f, indent=2, ensure_ascii=False)
    
    async def list_cards(self, creator_id: Optional[str] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        cards = await self._load_cards()
        
        if creator_id:
            cards = [card for card in cards if card.get("creator_id") == creator_id]
        
        if limit:
            cards = cards[:limit]
        
        return cards
    
    async def get_card(self, card_id: str) -> Optional[Dict[str, Any]]:
        cards = await self._load_cards()
        for card in cards:
            if card.get("card_id") == card_id:
                return card
        return None
    
    async def create_card(self, card_data: Dict[str, Any]) -> Dict[str, Any]:
        cards = await self._load_cards()
        
        # Generate ID if not provided
        if "card_id" not in card_data:
            card_data["card_id"] = f"card_{uuid.uuid4().hex[:12]}"
        
        cards.append(card_data)
        await self._save_cards(cards)
        return card_data
    
    async def update_card(self, card_id: str, card_data: Dict[str, Any]) -> Dict[str, Any]:
        cards = await self._load_cards()
        
        for i, card in enumerate(cards):
            if card.get("card_id") == card_id:
                card_data["card_id"] = card_id  # Preserve ID
                cards[i] = {**card, **card_data}
                await self._save_cards(cards)
                return cards[i]
        
        raise ValueError(f"Card {card_id} not found")
    
    async def delete_card(self, card_id: str) -> bool:
        cards = await self._load_cards()
        
        for i, card in enumerate(cards):
            if card.get("card_id") == card_id:
                cards.pop(i)
                await self._save_cards(cards)
                return True
        
        return False
    
    async def export_to_json(self, output_path: Path) -> Dict[str, Any]:
        cards = await self._load_cards()
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(cards, f, indent=2, ensure_ascii=False)
        
        return {
            "data": cards,
            "count": len(cards),
            "exported_at": datetime.now().isoformat()
        }
    
    async def get_schema(self) -> Dict[str, Any]:
        return {
            "type": "object", 
            "properties": {
                "card_id": {"type": "string", "required": True},
                "set_id": {"type": "string", "required": True},
                "creator_id": {"type": "string", "required": True},
                "title": {"type": "string", "required": True},
                "summary": {"type": "string"},
                "detailed_content": {"type": "string"},
                "order_index": {"type": "integer"},
                "navigation_contexts": {"type": "object"},
                "media": {"type": "array"},
                "domain_data": {"type": "object"},
                "tags": {"type": "array", "items": {"type": "string"}}
            }
        }


class JSONContentSetData(ContentSetDataInterface):
    """JSON file implementation for content set data"""
    
    def __init__(self, data_dir: Path):
        self.data_dir = Path(data_dir)
        self.sets_file = self.data_dir / "content_sets.json"
        
        if not self.sets_file.exists():
            with open(self.sets_file, 'w', encoding='utf-8') as f:
                json.dump([], f)
    
    async def _load_sets(self) -> List[Dict[str, Any]]:
        try:
            with open(self.sets_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    async def _save_sets(self, sets: List[Dict[str, Any]]) -> None:
        with open(self.sets_file, 'w', encoding='utf-8') as f:
            json.dump(sets, f, indent=2, ensure_ascii=False)
    
    async def list_sets(self, creator_id: Optional[str] = None) -> List[Dict[str, Any]]:
        sets = await self._load_sets()
        
        if creator_id:
            sets = [s for s in sets if s.get("creator_id") == creator_id]
        
        return sets
    
    async def get_set(self, set_id: str) -> Optional[Dict[str, Any]]:
        sets = await self._load_sets()
        for content_set in sets:
            if content_set.get("set_id") == set_id:
                return content_set
        return None
    
    async def create_set(self, set_data: Dict[str, Any]) -> Dict[str, Any]:
        sets = await self._load_sets()
        
        if "set_id" not in set_data:
            set_data["set_id"] = f"set_{uuid.uuid4().hex[:12]}"
        
        sets.append(set_data)
        await self._save_sets(sets)
        return set_data
    
    async def update_set(self, set_id: str, set_data: Dict[str, Any]) -> Dict[str, Any]:
        sets = await self._load_sets()
        
        for i, content_set in enumerate(sets):
            if content_set.get("set_id") == set_id:
                set_data["set_id"] = set_id
                sets[i] = {**content_set, **set_data}
                await self._save_sets(sets)
                return sets[i]
        
        raise ValueError(f"Set {set_id} not found")
    
    async def delete_set(self, set_id: str) -> bool:
        sets = await self._load_sets()
        
        for i, content_set in enumerate(sets):
            if content_set.get("set_id") == set_id:
                sets.pop(i)
                await self._save_sets(sets)
                return True
        
        return False
    
    async def export_to_json(self, output_path: Path) -> Dict[str, Any]:
        sets = await self._load_sets()
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(sets, f, indent=2, ensure_ascii=False)
        
        return {
            "data": sets,
            "count": len(sets),
            "exported_at": datetime.now().isoformat()
        }
    
    async def get_schema(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "set_id": {"type": "string", "required": True},
                "creator_id": {"type": "string", "required": True},
                "title": {"type": "string", "required": True},
                "description": {"type": "string"},
                "category": {"type": "string"},
                "thumbnail_url": {"type": "string", "nullable": True},
                "banner_url": {"type": "string", "nullable": True},
                "card_count": {"type": "integer"},
                "estimated_time_minutes": {"type": "integer"},
                "difficulty_level": {"type": "string"},
                "target_audience": {"type": "string"},
                "supported_navigation": {"type": "array", "items": {"type": "string"}},
                "content_style": {"type": "string"},
                "tags": {"type": "array", "items": {"type": "string"}},
                "prerequisites": {"type": "array", "items": {"type": "string"}}
            }
        }