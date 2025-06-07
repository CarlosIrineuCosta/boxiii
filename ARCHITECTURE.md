# Boxiii Architecture Document

## System Design Philosophy

Boxiii follows a **decoupled architecture** where Builder and Viewer operate independently, communicating only through data exports. This design choice provides:

1. **Independent scaling** - Each service can scale based on its usage patterns
2. **Technology flexibility** - Different tech stacks can be used where appropriate
3. **Security isolation** - Admin functions are completely separated from public access
4. **Deployment flexibility** - Services can be deployed to different environments

## Service Architecture

### 1. Builder Service (Admin/CMS)

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
│  ├── Auth Middleware                                         │
│  ├── Content Generation Engine                               │
│  │   ├── Topic Extraction                                   │
│  │   ├── Card Generation                                     │
│  │   └── Multi-LLM Provider Interface                       │
│  ├── Data Management                                         │
│  │   ├── Creator CRUD                                       │
│  │   ├── Content Set CRUD                                   │
│  │   └── Card CRUD                                          │
│  └── Export Service                                          │
│      ├── JSON Export                                        │
│      └── MongoDB Export (future)                            │
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
│  ├── JSON Import Service                                     │
│  ├── Local Storage Cache                                     │
│  └── MongoDB Connection (future)                            │
└─────────────────────────────────────────────────────────────┘
```

## Data Architecture

### JSON Schema Evolution

The Viewer's newer JSON format will be the standard for both services:

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
# docker-compose.yml structure
services:
  builder-frontend:
    build: ./builder/frontend
    ports: ["3001:3000"]
    
  builder-backend:
    build: ./builder/backend
    ports: ["8001:8000"]
    environment:
      - JWT_SECRET
      - LLM_API_KEYS
      
  viewer:
    build: ./viewer
    ports: ["3000:3000"]
    
  nginx:
    image: nginx
    ports: ["80:80", "443:443"]
    # Reverse proxy configuration
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

### Phase 1: Repository Consolidation (Current)
- Merge codebases
- Standardize data format
- Setup Docker structure

### Phase 2: UI Migration
- Port Builder from Gradio to React
- Implement authentication
- Update data generation

### Phase 3: Production Deployment
- Deploy to VPS
- Setup monitoring
- Implement backups

### Phase 4: Advanced Features
- MongoDB migration
- Payment integration
- Analytics dashboard

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