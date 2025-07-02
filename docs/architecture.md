# Boxiii Architecture

## System Overview

Boxiii is a monorepo containing multiple applications for educational content creation and consumption.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Builder App   │    │   Viewer PWA    │    │  Viewer Mobile  │
│  (Admin/CMS)    │    │   (Public)      │    │ (React Native)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  FastAPI Backend │
                    │   + PostgreSQL   │
                    └─────────────────┘
```

## Applications

### Builder (apps/builder/)
**Purpose**: Content management system for creating educational content

**Frontend** (apps/builder/frontend/):
- React 18+ with TypeScript
- Tailwind CSS v4
- Vite build system
- Admin interface with CRUD operations

**Backend** (apps/builder/backend/):
- FastAPI with Python 3.9+
- SQLAlchemy ORM
- PostgreSQL with JSONB
- RESTful API endpoints

### Viewer PWA (apps/viewer/)
**Purpose**: Public-facing content consumption interface

**Technology**:
- React 19.1 with TypeScript
- Vite build system
- Progressive Web App (PWA)
- Offline-first with IndexedDB
- Touch gesture support

### Viewer Mobile (apps/viewer-mobile/)
**Purpose**: Native mobile app experience

**Technology**:
- React Native with Expo
- Cross-platform (iOS/Android)
- Currently experimental

## Shared Resources (packages/)

### Database (packages/database/)
**System**: PostgreSQL 15 with JSONB support

**Models**:
- `Creator`: Content creators with platform information
- `ContentSet`: Collections of educational cards
- `ContentCard`: Individual learning items

**Features**:
- JSONB for flexible content storage
- Full-text search capabilities
- Referential integrity
- JSON schema validation

### Schemas (packages/schemas/)
JSON Schema definitions for data validation:
- Creator validation
- ContentSet structure
- ContentCard format

### Uploads (packages/uploads/)
Shared file storage for:
- Creator avatars and banners
- Content images and media
- Generated exports

## Operations (ops/)

### Docker (ops/docker/)
- `docker-compose.yml`: Development environment
- `docker-compose.prod.yml`: Production configuration

### Deployment (ops/deploy/)
Scripts for various deployment targets:
- VPS deployment automation
- Database migrations
- GitHub token setup

### Nginx (ops/nginx/)
Web server configuration:
- Reverse proxy for API
- Static file serving
- SSL/TLS configuration

## Data Flow

### Content Creation (Builder)
1. Admin creates Creator profiles
2. Generates ContentSets with AI assistance
3. Creates individual ContentCards
4. Content stored in PostgreSQL with JSONB

### Content Consumption (Viewer)
1. Viewer fetches ContentSets via API
2. Displays content in PWA interface
3. Supports offline viewing with IndexedDB
4. Tracks progress locally

## API Architecture

### Builder API Endpoints
- `/api/creators/` - Creator CRUD operations
- `/api/content-sets/` - ContentSet management
- `/api/cards/` - ContentCard operations
- `/api/generate/` - AI content generation

### Public API Endpoints
- `/api/public/content-sets/` - Read-only content access
- `/api/public/cards/` - Card data for viewers

## Technology Stack Summary

**Frontend**:
- React 18+ (Builder) / React 19.1 (Viewer)
- TypeScript throughout
- Tailwind CSS for styling
- Vite for modern build tooling

**Backend**:
- FastAPI with Python 3.9+
- SQLAlchemy ORM
- PostgreSQL 15 with JSONB
- Docker containerization

**Mobile**:
- React Native with Expo
- Cross-platform development

**Infrastructure**:
- Docker Compose for development
- Nginx for production
- VPS deployment ready

## Security Considerations

- Environment variables for API keys
- CORS configuration for cross-origin requests
- Input validation with JSON schemas
- Prepared statements for SQL injection prevention

## Development Workflow

1. **Local Development**: Individual app development with hot reload
2. **Integration Testing**: Docker Compose environment
3. **Production Deployment**: VPS with Nginx reverse proxy
4. **Database Management**: Migrations through SQLAlchemy