# Boxiii Migration Guide

## Overview

This guide helps you migrate from the current Info Navigator structure to the unified Boxiii platform.

## Key Changes

### 1. Repository Structure

**Before:**
- `info-navigator/` - Mixed Builder and Viewer
- `info-navigator-pwa/` - Separate PWA Viewer

**After:**
- `boxiii/` - Unified repository with clear separation
  - `builder/` - Admin/CMS application
  - `viewer/` - Public PWA
  - `shared/` - Common utilities and schemas

### 2. Data Format Migration

The Builder needs to be updated to generate data in the Viewer's newer format. Key changes:

#### Creator Format Updates
```python
# Old format
{
    "creator_id": "anacontti50mais_dc55d49d",  # Complex ID
    "avatar_url": "data/images/...",           # Local path
    "follower_count": null,                    # Missing data
    "expertise_areas": [],                     # Empty
}

# New format
{
    "creator_id": "ana_contti",                # Clean ID
    "avatar_url": "./images/creators/...",     # Relative URL
    "follower_count": 50000,                   # Actual data
    "expertise_areas": ["Bem-estar", "..."],   # Populated
}
```

#### Content Set Format Updates
```python
# Key additions needed:
- set_number: "s001"              # Display reference
- tags_pt: ["Destaque", "..."]    # Portuguese tags
- is_hero: true                   # Featured flag
- color_scheme: {...}             # Theme colors
- stats: {views: 0, ...}          # Analytics
```

#### Card Format Updates
```python
# Key additions needed:
- card_number: "c001"             # Display reference
- navigation_contexts: {...}       # Navigation data
- media: [{...}]                  # Media attachments
- domain_data.related_concepts    # Related topics
```

## Implementation Steps

### Step 1: Update Core Models

Update `builder/backend/core_models.py` to match new schema:

```python
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum

class ContentStyle(str, Enum):
    EDUCATIONAL = "educational"
    STORY_DRIVEN = "story_driven"
    TUTORIAL = "tutorial"
    INSPIRATIONAL = "inspirational"
    ANALYTICAL = "analytical"

class ColorScheme(BaseModel):
    primary: str = Field(pattern="^#[0-9A-Fa-f]{6}$")
    secondary: str = Field(pattern="^#[0-9A-Fa-f]{6}$")
    accent: str = Field(pattern="^#[0-9A-Fa-f]{6}$")

class ContentStats(BaseModel):
    views: int = 0
    completion_rate: float = 0.0

class Creator(BaseModel):
    creator_id: str = Field(pattern="^[a-z0-9_]+$")
    display_name: str
    platform: str
    platform_handle: str
    avatar_url: str
    banner_url: str
    description: str
    categories: List[str]
    follower_count: Optional[int]
    verified: bool = False
    social_links: Dict[str, str] = {}
    expertise_areas: List[str] = []
    content_style: ContentStyle
    created_at: datetime
    updated_at: datetime
```

### Step 2: Update ID Generation

Create cleaner IDs without timestamps:

```python
def generate_clean_id(name: str) -> str:
    """Generate clean lowercase ID from name"""
    # Remove special characters and spaces
    clean = re.sub(r'[^a-z0-9\s]', '', name.lower())
    # Replace spaces with underscores
    clean = re.sub(r'\s+', '_', clean.strip())
    return clean

# Example: "Ana Contti 50+" -> "ana_contti_50"
```

### Step 3: Add Display References

Generate sequential numbers for sets and cards:

```python
class ContentSetManager:
    def __init__(self):
        self._set_counter = self._get_next_set_number()
    
    def _get_next_set_number(self) -> int:
        """Get next available set number"""
        existing_sets = self.load_all_sets()
        if not existing_sets:
            return 1
        
        numbers = []
        for set_data in existing_sets:
            if 'set_number' in set_data:
                match = re.match(r's(\d+)', set_data['set_number'])
                if match:
                    numbers.append(int(match.group(1)))
        
        return max(numbers) + 1 if numbers else 1
    
    def generate_set_number(self) -> str:
        """Generate next set number (e.g., 's001')"""
        number = self._set_counter
        self._set_counter += 1
        return f"s{number:03d}"
```

### Step 4: Enhance Content Generation

Update the content generation to include new fields:

```python
def generate_content_set(self, creator, topic, cards):
    """Generate content set with enhanced metadata"""
    return {
        "set_id": generate_set_id(creator, topic),
        "set_number": self.generate_set_number(),
        "creator_id": creator.creator_id,
        "title": self.generate_engaging_title(topic),
        "description": self.generate_description(topic),
        "category": self.determine_category(topic),
        "thumbnail_url": f"./images/sets/{set_number}/thumbnail.jpg",
        "banner_url": f"./images/sets/{set_number}/banner.jpg",
        "card_count": len(cards),
        "estimated_time_minutes": len(cards) * 5,
        "difficulty_level": "beginner",
        "target_audience": creator.target_audience,
        "supported_navigation": ["thematic", "random"],
        "content_style": "story_driven",
        "tags": self.extract_tags(topic),
        "tags_pt": self.get_portuguese_tags(category),
        "is_hero": self.should_be_hero(topic),
        "prerequisites": [],
        "learning_outcomes": self.generate_outcomes(topic),
        "color_scheme": self.generate_color_scheme(category),
        "stats": {"views": 0, "completion_rate": 0.0},
        "status": "published",
        "language": "pt-BR",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z"
    }
```

### Step 5: Add Portuguese Tags

Create category-specific Portuguese tags:

```python
PORTUGUESE_TAGS = {
    "wellness": ["Bem-estar", "Saúde", "Qualidade de Vida"],
    "health_fitness": ["Fitness", "Exercícios", "Vida Ativa"],
    "nutrition": ["Nutrição", "Alimentação", "Dieta"],
    "science_tech": ["Ciência", "Tecnologia", "Inovação"],
    # ... more categories
}

def get_portuguese_tags(category: str) -> List[str]:
    """Get Portuguese display tags for category"""
    base_tags = PORTUGUESE_TAGS.get(category, [])
    # Add special tags
    if random.random() < 0.3:  # 30% chance
        base_tags.append("Destaque Principal")
    if random.random() < 0.5:  # 50% chance
        base_tags.append("Populares")
    return base_tags[:3]  # Limit to 3 tags
```

### Step 6: Generate Color Schemes

Create category-appropriate color schemes:

```python
CATEGORY_COLORS = {
    "wellness": {
        "primary": "#059669",    # Green
        "secondary": "#047857",
        "accent": "#34D399"
    },
    "science_tech": {
        "primary": "#3B82F6",    # Blue
        "secondary": "#2563EB",
        "accent": "#60A5FA"
    },
    # ... more categories
}

def generate_color_scheme(category: str) -> Dict[str, str]:
    """Generate color scheme for category"""
    return CATEGORY_COLORS.get(category, {
        "primary": "#6366F1",    # Default purple
        "secondary": "#4F46E5",
        "accent": "#818CF8"
    })
```

### Step 7: Update Export Functions

Ensure data is exported in the correct format:

```python
def export_for_viewer(self):
    """Export data in Viewer-compatible format"""
    # Clean creator IDs
    creators = self.clean_creator_ids()
    
    # Add missing fields
    creators = self.enhance_creator_data(creators)
    content_sets = self.enhance_content_sets(content_sets)
    cards = self.enhance_cards(cards)
    
    # Export to viewer directory
    viewer_data_path = "../../viewer/public/data"
    
    # Save with proper formatting
    self.save_json(f"{viewer_data_path}/creators.json", creators)
    self.save_json(f"{viewer_data_path}/content_sets.json", content_sets)
    self.save_json(f"{viewer_data_path}/cards.json", cards)
```

## Testing the Migration

1. **Test Data Generation**
   ```bash
   cd builder/backend
   python test_new_format.py
   ```

2. **Validate Against Schema**
   ```bash
   python validate_json.py
   ```

3. **Test in Viewer**
   - Copy generated files to `viewer/public/data/`
   - Run viewer: `cd viewer && npm start`
   - Verify all content displays correctly

## Deployment Steps

1. **Local Testing**
   ```bash
   docker-compose up -d
   ```

2. **GitHub Pages Deployment**
   ```bash
   cd viewer
   npm run build
   # Deploy build folder to GitHub Pages
   ```

## Rollback Plan

If issues arise:
1. Keep original data files as backup
2. Maintain version tags in git
3. Test thoroughly before production deployment

## Common Issues and Solutions

### Issue 1: ID Mismatches
**Problem:** Creator IDs don't match between files
**Solution:** Run ID migration script to clean all references

### Issue 2: Missing Images
**Problem:** Image URLs return 404
**Solution:** Ensure images are copied to correct viewer paths

### Issue 3: Navigation Broken
**Problem:** Cards don't navigate properly
**Solution:** Populate navigation_contexts with proper data

## Support

For questions or issues during migration:
1. Check the schema definitions in `/shared/schemas/`
2. Review test data in viewer for examples
3. Create GitHub issue with migration tag