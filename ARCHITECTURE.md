Boxiii Architecture Document
System Design Philosophy
Boxiii follows a decoupled architecture where the Builder and Viewer services operate independently. They share a common PostgreSQL database as the single source of truth, but do not communicate directly via API calls. This provides:

Independent Scaling: Each service can be scaled based on its specific load.
Technology Flexibility: The frontend and backend can evolve independently.
Security Isolation: Admin functions are completely separated from the public-facing application.
Service Architecture

1. Builder Service (Admin/CMS)

The Builder is a React-based Single Page Application that communicates with a Python/FastAPI backend API to manage platform content.

```

┌─────────────────────────────────────────────────────────────┐
│                      Builder Service                          │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React)                                            │
│  ├── Authentication (JWT)                                    │
│  ├── Content Management UI                                   │
│  ├── Creator Management                                      │
│  └── Export Controls                                        │
├─────────────────────────────────────────────────────────────┤
│  Backend API (Python/FastAPI)                                │
│  ├── Auth Middleware (JWT)                                   │
│  ├── Content Generation Engine                               │
│  │   ├── Topic Extraction                                   │
│  │   ├── Card Generation                                     │
│  │   └── Multi-LLM Provider Interface                       │
│  ├── Database Layer (SQLAlchemy)                            │
│  │   ├── PostgreSQL with JSONB                              │
│  │   ├── Creator Models & CRUD                              │
│  │   ├── Content Set Models & CRUD                          │
│  │   └── Card Models & CRUD                                 │
│  └── API Services                                            │
│      ├── Creator Management API                             │
│      ├── Content Generation API                             │
│      └── Export Service (JSON backup)                       │
└─────────────────────────────────────────────────────────────┘
```

### 2. Viewer Service (Public PWA)

```
┌─────────────────────────────────────────────────────────────┐
│                      Viewer Service                           │
├─────────────────────────────────────────────────────────────┤
│  Progressive Web App (React)                                 │
│  ├── User Authentication                                     │
│  ├── Content Discovery (Netflix-style)                      │
│  ├── Card Navigation                                         │
│  ├── Offline Support (Service Worker)                       │
│  └── Payment Integration (future)                            │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                  │
│  ├── API Client (Builder Backend)                           │
│  ├── Local Storage Cache                                     │
│  ├── Service Worker (Offline Support)                       │
│  └── IndexedDB (Local Persistence)                          │
└─────────────────────────────────────────────────────────────┘
```

## Data Architecture

### PostgreSQL Database Schema

The unified database uses PostgreSQL with JSONB for flexible content storage:

#### Core Tables Structure
```sql
-- Creators table (stable schema)
CREATE TABLE creators (
    creator_id VARCHAR(255) PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    platform_handle VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    banner_url TEXT,
    description TEXT,
    categories TEXT[],
    follower_count INTEGER,
    verified BOOLEAN DEFAULT FALSE,
    social_links JSONB DEFAULT '{}',
    expertise_areas TEXT[],
    content_style VARCHAR(50) DEFAULT 'educational',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Sets table
CREATE TABLE content_sets (
    set_id VARCHAR(255) PRIMARY KEY,
    creator_id VARCHAR(255) REFERENCES creators(creator_id),
    title TEXT NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    thumbnail_url TEXT,
    banner_url TEXT,
    card_count INTEGER DEFAULT 0,
    -- ... other fields with JSONB for flexibility
    stats JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Cards table (hybrid schema)
CREATE TABLE content_cards (
    card_id VARCHAR(255) PRIMARY KEY,
    set_id VARCHAR(255) REFERENCES content_sets(set_id),
    creator_id VARCHAR(255) REFERENCES creators(creator_id),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    detailed_content TEXT,
    -- Flexible JSONB fields
    domain_data JSONB DEFAULT '{}',
    media JSONB DEFAULT '[]',
    navigation_contexts JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### TypeScript Interfaces

```typescript
// Creator Schema
interface Creator {
  creator_id: string;          // Clean ID format (e.g., "ana_contti")
  display_name: string;
  platform: string;
  platform_handle: string;
  avatar_url: string;
  banner_url: string;
  description: string;
  categories: string[];
  follower_count: number;
  verified: boolean;
  social_links: Record<string, string>;
  expertise_areas: string[];
  content_style: ContentStyle;
  created_at: string;
  updated_at: string;
}

// Content Set Schema
interface ContentSet {
  set_id: string;
  set_number: string;          // New: Display reference (e.g., "s001")
  creator_id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string;
  banner_url: string;
  card_count: number;
  estimated_time_minutes: number;
  difficulty_level: DifficultyLevel;
  target_audience: string;
  supported_navigation: NavigationType[];
  content_style: ContentStyle;
  tags: string[];
  tags_pt: string[];           // New: Portuguese display tags
  is_hero: boolean;            // New: Featured content flag
  prerequisites: string[];
  learning_outcomes: string[];
  color_scheme: ColorScheme;   // New: Theming support
  stats: ContentStats;         // New: Analytics data
  status: PublishStatus;
  language: string;
  created_at: string;
  updated_at: string;
}

// Card Schema
interface Card {
  card_id: string;
  card_number: string;         // New: Display reference (e.g., "c001")
  set_id: string;
  creator_id: string;
  title: string;
  summary: string;
  detailed_content: string;
  order_index: number;
  navigation_contexts: NavigationContexts;
  media: MediaAttachment[];
  domain_data: DomainData;
  tags: string[];
  created_at: string;
  updated_at: string;
}
```

## Authentication Architecture

### Builder Authentication
- Admin users only
- JWT tokens with role-based access
- Session management
- API key management for LLM providers

### Viewer Authentication  
- Public user registration
- JWT tokens
- Social login (future)
- Payment gateway integration (future)

## Deployment Architecture

### Docker Containers

```yaml
# docker-compose.unified.yml structure
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: boxiii
      POSTGRES_USER: boxiii_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports: ["5432:5432"]
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    
  builder-backend:
    build: ./builder
    ports: ["5001:5000"]
    environment:
      - DATABASE_URL=postgresql://boxiii_user:${DB_PASSWORD}@postgres:5432/boxiii
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
      
  builder-frontend:
    build: ./builder/frontend
    ports: ["3001:3000"]
    environment:
      - VITE_API_URL=http://localhost:5001/api
    depends_on:
      - builder-backend
      
  viewer:
    build: ./viewer
    ports: ["3000:3000"]
    environment:
      - VITE_API_URL=http://localhost:5001/api/public
    depends_on:
      - builder-backend
```

## Security Considerations

1. **Network Isolation**
   - Builder on internal network
   - Viewer on DMZ
   - Database access restricted

2. **Authentication**
   - Separate auth systems
   - No shared sessions
   - API key rotation

3. **Data Validation**
   - Schema validation at all layers
   - Input sanitization
   - Output encoding

## Migration Path

### ✅ Phase 1: Database Unification (Complete)
- Implemented PostgreSQL with JSONB for flexibility
- Created SQLAlchemy models with relationships
- Set up unified Docker compose structure
- Database initialization scripts

### ✅ Phase 2: Creator Management (Complete)
- Built React frontend with TypeScript
- Implemented full CRUD for Creator management
- API service layer with error handling
- Real-time data integration

### 🔄 Phase 3: Backend Migration (In Progress)
- Update FastAPI to use SQLAlchemy instead of JSON files
- Implement proper authentication with JWT
- Add file upload handling for avatars/banners
- Database session management

### Phase 4: Content Generation (Planned)
- Connect AI generation to database
- Implement Content Set and Card management
- Export functionality for Viewer
- Cost optimization for LLM operations

### Phase 5: Production Deployment (Future)
- Deploy to cloud infrastructure
- Setup monitoring and logging
- Implement backup strategies
- Performance optimization

## Performance Considerations

1. **Builder Service**
   - Async LLM operations
   - Batch processing
   - Cost optimization

2. **Viewer Service**
   - CDN for static assets
   - Service worker caching
   - Lazy loading

## Monitoring and Observability

- Application logs
- Performance metrics
- Error tracking
- User analytics
- LLM usage tracking