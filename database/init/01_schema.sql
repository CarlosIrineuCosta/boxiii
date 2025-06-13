-- Boxiii Database Schema
-- Using PostgreSQL with JSONB for flexible content storage

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Creators table (stable schema)
CREATE TABLE creators (
    creator_id VARCHAR(255) PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    platform_handle VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    banner_url TEXT,
    description TEXT,
    categories TEXT[], -- Array of category strings
    follower_count INTEGER,
    verified BOOLEAN DEFAULT FALSE,
    social_links JSONB DEFAULT '{}',
    expertise_areas TEXT[],
    content_style VARCHAR(50) DEFAULT 'educational',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Sets table (stable schema)
CREATE TABLE content_sets (
    set_id VARCHAR(255) PRIMARY KEY,
    creator_id VARCHAR(255) NOT NULL REFERENCES creators(creator_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    thumbnail_url TEXT,
    banner_url TEXT,
    card_count INTEGER DEFAULT 0,
    estimated_time_minutes INTEGER DEFAULT 30,
    difficulty_level VARCHAR(50) DEFAULT 'intermediate',
    target_audience VARCHAR(100) DEFAULT 'general_public',
    supported_navigation TEXT[],
    content_style VARCHAR(50) DEFAULT 'question_first',
    tags TEXT[],
    prerequisites TEXT[],
    learning_outcomes TEXT[],
    stats JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'draft',
    language VARCHAR(10) DEFAULT 'pt-BR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Cards table (hybrid schema - stable core + flexible JSONB)
CREATE TABLE content_cards (
    card_id VARCHAR(255) PRIMARY KEY,
    set_id VARCHAR(255) NOT NULL REFERENCES content_sets(set_id) ON DELETE CASCADE,
    creator_id VARCHAR(255) NOT NULL REFERENCES creators(creator_id) ON DELETE CASCADE,
    
    -- Core stable fields
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    
    -- Flexible content fields as JSONB
    detailed_content TEXT,
    domain_data JSONB DEFAULT '{}',
    media JSONB DEFAULT '[]',
    navigation_contexts JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_creators_platform ON creators(platform);
CREATE INDEX idx_creators_categories ON creators USING GIN(categories);
CREATE INDEX idx_creators_verified ON creators(verified);

CREATE INDEX idx_sets_creator ON content_sets(creator_id);
CREATE INDEX idx_sets_category ON content_sets(category);
CREATE INDEX idx_sets_status ON content_sets(status);
CREATE INDEX idx_sets_tags ON content_sets USING GIN(tags);

CREATE INDEX idx_cards_set ON content_cards(set_id);
CREATE INDEX idx_cards_creator ON content_cards(creator_id);
CREATE INDEX idx_cards_order ON content_cards(set_id, order_index);
CREATE INDEX idx_cards_domain_data ON content_cards USING GIN(domain_data);
CREATE INDEX idx_cards_tags ON content_cards USING GIN((tags));
CREATE INDEX idx_cards_media ON content_cards USING GIN(media);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_creators_updated_at BEFORE UPDATE ON creators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_sets_updated_at BEFORE UPDATE ON content_sets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_cards_updated_at BEFORE UPDATE ON content_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();