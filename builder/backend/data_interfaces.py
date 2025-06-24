#!/usr/bin/env python3
"""
Data Interface Contracts - Abstract base classes for data operations
This ensures any storage backend (JSON, MongoDB, Vector DB) implements the same interface
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
import json
from pathlib import Path


class DataInterface(ABC):
    """Abstract base class for all data operations"""
    
    @abstractmethod
    async def export_to_json(self, output_path: Path) -> Dict[str, Any]:
        """Export all data to JSON format - ALWAYS available for debugging"""
        pass
    
    @abstractmethod
    async def get_schema(self) -> Dict[str, Any]:
        """Get the data schema definition"""
        pass


class CreatorDataInterface(DataInterface):
    """Interface for creator CRUD operations"""
    
    @abstractmethod
    async def list_creators(self, limit: Optional[int] = None, offset: int = 0, with_content_only: bool = False) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    async def get_creator(self, creator_id: str) -> Optional[Dict[str, Any]]:
        pass
    
    @abstractmethod
    async def create_creator(self, creator_data: Dict[str, Any]) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    async def update_creator(self, creator_id: str, creator_data: Dict[str, Any]) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    async def delete_creator(self, creator_id: str) -> bool:
        pass


class ContentDataInterface(DataInterface):
    """Interface for content card operations"""
    
    @abstractmethod
    async def list_cards(self, creator_id: Optional[str] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    async def get_card(self, card_id: str) -> Optional[Dict[str, Any]]:
        pass
    
    @abstractmethod
    async def create_card(self, card_data: Dict[str, Any]) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    async def update_card(self, card_id: str, card_data: Dict[str, Any]) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    async def delete_card(self, card_id: str) -> bool:
        pass


class ContentSetDataInterface(DataInterface):
    """Interface for content set operations"""
    
    @abstractmethod
    async def list_sets(self, creator_id: Optional[str] = None) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    async def get_set(self, set_id: str) -> Optional[Dict[str, Any]]:
        pass
    
    @abstractmethod
    async def create_set(self, set_data: Dict[str, Any]) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    async def update_set(self, set_id: str, set_data: Dict[str, Any]) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    async def delete_set(self, set_id: str) -> bool:
        pass


class DataManager:
    """Unified data manager that coordinates all data interfaces"""
    
    def __init__(self, 
                 creator_interface: CreatorDataInterface,
                 content_interface: ContentDataInterface,
                 set_interface: ContentSetDataInterface):
        self.creators = creator_interface
        self.cards = content_interface
        self.sets = set_interface
    
    async def export_all_to_json(self, output_dir: Path) -> Dict[str, str]:
        """Export all data to JSON files - debugging/backup functionality"""
        output_dir.mkdir(parents=True, exist_ok=True)
        
        exports = {}
        
        # Export creators
        creators_path = output_dir / "creators.json"
        creator_result = await self.creators.export_to_json(creators_path)
        exports["creators"] = str(creators_path)
        
        # Export cards
        cards_path = output_dir / "cards.json"
        cards_result = await self.cards.export_to_json(cards_path)
        exports["cards"] = str(cards_path)
        
        # Export sets
        sets_path = output_dir / "content_sets.json"
        sets_result = await self.sets.export_to_json(sets_path)
        exports["sets"] = str(sets_path)
        
        # Export metadata
        metadata = {
            "export_timestamp": datetime.now().isoformat(),
            "total_creators": len(creator_result.get("data", [])),
            "total_cards": len(cards_result.get("data", [])),
            "total_sets": len(sets_result.get("data", [])),
            "data_interfaces": {
                "creators": type(self.creators).__name__,
                "cards": type(self.cards).__name__,
                "sets": type(self.sets).__name__
            }
        }
        
        metadata_path = output_dir / "export_metadata.json"
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        exports["metadata"] = str(metadata_path)
        
        return exports
    
    async def get_system_schema(self) -> Dict[str, Any]:
        """Get complete system schema"""
        return {
            "creators": await self.creators.get_schema(),
            "cards": await self.cards.get_schema(),
            "sets": await self.sets.get_schema(),
            "system_version": "1.0.0",
            "schema_timestamp": datetime.now().isoformat()
        }