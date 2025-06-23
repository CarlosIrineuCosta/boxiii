"""
SQLAlchemy Models for Boxiii Database
Using PostgreSQL with JSONB for flexible content storage
"""

from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, ARRAY, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()


class Creator(Base):
    __tablename__ = 'creators'
    
    creator_id = Column(String(255), primary_key=True)
    display_name = Column(String(255), nullable=False)
    platforms = Column(JSONB, default=list)  # [{"platform": "youtube", "handle": "channelname"}]
    avatar_url = Column(Text)
    banner_url = Column(Text)
    description = Column(Text)
    categories = Column(ARRAY(Text), default=list)
    follower_count = Column(Integer)
    verified = Column(Boolean, default=False)
    social_links = Column(JSONB, default=dict)
    expertise_areas = Column(ARRAY(Text), default=list)
    content_style = Column(String(50), default='educational')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    content_sets = relationship("ContentSet", back_populates="creator", cascade="all, delete-orphan")
    content_cards = relationship("ContentCard", back_populates="creator", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "creator_id": self.creator_id,
            "display_name": self.display_name,
            "platforms": self.platforms or [],
            "avatar_url": self.avatar_url,
            "banner_url": self.banner_url,
            "description": self.description,
            "categories": self.categories or [],
            "follower_count": self.follower_count,
            "verified": self.verified,
            "social_links": self.social_links or {},
            "expertise_areas": self.expertise_areas or [],
            "content_style": self.content_style,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class ContentSet(Base):
    __tablename__ = 'content_sets'
    
    set_id = Column(String(255), primary_key=True)
    creator_id = Column(String(255), ForeignKey('creators.creator_id', ondelete='CASCADE'), nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text)
    category = Column(String(100), nullable=False)
    thumbnail_url = Column(Text)
    banner_url = Column(Text)
    card_count = Column(Integer, default=0)
    estimated_time_minutes = Column(Integer, default=30)
    difficulty_level = Column(String(50), default='intermediate')
    target_audience = Column(String(100), default='general_public')
    supported_navigation = Column(ARRAY(Text), default=list)
    content_style = Column(String(50), default='question_first')
    tags = Column(ARRAY(Text), default=list)
    prerequisites = Column(ARRAY(Text), default=list)
    learning_outcomes = Column(ARRAY(Text), default=list)
    stats = Column(JSONB, default=dict)
    status = Column(String(50), default='draft')
    language = Column(String(10), default='pt-BR')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("Creator", back_populates="content_sets")
    content_cards = relationship("ContentCard", back_populates="content_set", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "set_id": self.set_id,
            "creator_id": self.creator_id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "thumbnail_url": self.thumbnail_url,
            "banner_url": self.banner_url,
            "card_count": self.card_count,
            "estimated_time_minutes": self.estimated_time_minutes,
            "difficulty_level": self.difficulty_level,
            "target_audience": self.target_audience,
            "supported_navigation": self.supported_navigation,
            "content_style": self.content_style,
            "tags": self.tags,
            "prerequisites": self.prerequisites,
            "learning_outcomes": self.learning_outcomes,
            "stats": self.stats,
            "status": self.status,
            "language": self.language,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class ContentCard(Base):
    __tablename__ = 'content_cards'
    
    card_id = Column(String(255), primary_key=True)
    set_id = Column(String(255), ForeignKey('content_sets.set_id', ondelete='CASCADE'), nullable=False)
    creator_id = Column(String(255), ForeignKey('creators.creator_id', ondelete='CASCADE'), nullable=False)
    
    # Core stable fields
    title = Column(Text, nullable=False)
    summary = Column(Text, nullable=False)
    order_index = Column(Integer, nullable=False)
    
    # Flexible content fields
    detailed_content = Column(Text)
    domain_data = Column(JSONB, default=dict)
    media = Column(JSONB, default=list)
    navigation_contexts = Column(JSONB, default=dict)
    tags = Column(JSONB, default=list)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("Creator", back_populates="content_cards")
    content_set = relationship("ContentSet", back_populates="content_cards")
    
    def to_dict(self):
        return {
            "card_id": self.card_id,
            "set_id": self.set_id,
            "creator_id": self.creator_id,
            "title": self.title,
            "summary": self.summary,
            "order_index": self.order_index,
            "detailed_content": self.detailed_content,
            "domain_data": self.domain_data,
            "media": self.media,
            "navigation_contexts": self.navigation_contexts,
            "tags": self.tags,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }