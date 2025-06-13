# Boxiii - AI-Powered Educational Content Platform

## Overview

Boxiii is a comprehensive educational content platform that combines AI-powered content generation with Netflix-style content discovery. The system consists of two main services:

- **Builder**: Admin/CMS interface for content creation and management
- **Viewer**: Public-facing PWA for content consumption

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Boxiii Platform                        │
├─────────────────────────┬───────────────────────────────────┤
│    Builder (Admin)      │        Viewer (Public)            │
├─────────────────────────┼───────────────────────────────────┤
│ • React + Tailwind      │ • React PWA                      │
│ • Python API Backend    │ • Tailwind CSS                   │
│ • Multi-LLM Support     │ • Netflix-style UI               │
│ • Authentication        │ • User Authentication            │
│ • Content Management    │ • Content Discovery              │
│ • Export to JSON/DB     │ • Import from JSON/DB            │
└─────────────────────────┴───────────────────────────────────┘
```

## Directory Structure

```
boxiii/
├── builder/               # Admin/CMS application
│   ├── frontend/         # React + Tailwind UI
│   ├── backend/          # Python API
│   └── Dockerfile
├── viewer/               # Public PWA
│   ├── src/             # React application
│   ├── public/          # Static assets
│   └── Dockerfile
├── shared/              # Shared utilities and types
│   ├── types/           # TypeScript interfaces
│   └── schemas/         # JSON schemas
├── docs/                # Documentation
├── .docker/             # Docker configurations
└── docker-compose.yml   # Multi-container setup
```

## Key Features

### Builder (Admin/CMS)
- Secure authentication for administrators
- Multi-provider LLM integration (Gemini, Claude, GPT-4)
- Content creation and management
- Creator profile management
- Export functionality to JSON/MongoDB
- Cost optimization for AI operations

### Viewer (Public PWA)
- Netflix-style content discovery
- Progressive Web App capabilities
- User authentication
- Multi-language support
- Offline functionality
- Future: Payment integration (Stripe, PayPal, Mercado Pago)

## Meta-CRUD Architecture Philosophy

### Data Abstraction Strategy
Boxiii implements a sophisticated data abstraction system that enables:

1. **Backend Flexibility**: Swap between JSON files, MongoDB, PostgreSQL, or Vector databases without changing frontend code
2. **Schema-Driven UI**: Dynamic form generation based on data schema definitions  
3. **Field Behaviors**: AI-powered field actions (text generation, image creation, web search)
4. **Multi-Platform Publishing**: Transform content for LinkedIn, Instagram, TikTok from single input
5. **Always-Available Debugging**: JSON export capability maintained regardless of backend

### Current Data Flow

```
Builder Frontend ↔ Builder API ↔ PostgreSQL Database ↔ Viewer Frontend
   (Port 3001)      (Port 5001)     (Port 5432)        (Port 3000)
```

**Phase 1 (Complete)**: PostgreSQL backend with JSONB flexibility
**Phase 2 (Current)**: Creator Management CRUD interface
**Phase 3 (Planned)**: Content Generation with AI integration
**Phase 4 (Future)**: Advanced features (analytics, payments, multi-language)

### Development Safety
- **Always-Available JSON Export**: Every operation can export to JSON for Obsidian viewing
- **Interface Contracts**: Changing backends doesn't break existing code
- **Incremental Migration**: Can gradually move from JSON → MongoDB → Vector DB

## Technology Stack

### Frontend (Both Services)
- React 18.2+
- Tailwind CSS
- TypeScript
- React Router DOM
- React Hot Toast for notifications

### Builder Backend
- Python 3.12+
- FastAPI with data abstraction layer
- **Database**: PostgreSQL with JSONB for flexible content storage
- **ORM**: SQLAlchemy 2.0+ with async support
- Multi-provider LLM integration (Claude, Gemini, GPT-4)
- **Meta-CRUD System**: Data interface contracts for flexible backend swapping

### Database Architecture
- **PostgreSQL with JSONB**: Hybrid approach for stable core fields + flexible content
- **Core Tables**: creators, content_sets, content_cards
- **Flexible Fields**: domain_data, media, navigation_contexts as JSONB
- **Indexes**: GIN indexes on JSONB columns for fast queries
- **Migrations**: Alembic for schema versioning

### Infrastructure
- Docker containers with shared PostgreSQL database
- Environment-based configuration
- JWT authentication
- HTTPS/TLS

## Current System Status (Phase 2 - Creator Management)

### ✅ Unified Architecture with PostgreSQL
The system now uses a **shared PostgreSQL database** for all services:

**Key Components:**
- **PostgreSQL Database**: Shared data storage with JSONB flexibility
- **SQLAlchemy Models**: Type-safe database models with relationships
- **Creator Management**: Full CRUD interface for managing content creators
- **Data Abstraction**: Interface contracts maintained for future migrations

### ✅ Builder Frontend (Port 3001)
- **Creator Management CRUD**: Complete interface for managing creators
  - Create new creators with comprehensive profile information
  - Edit existing creator details including categories and social links
  - Delete creators with cascade handling for related content
  - Real-time API integration with loading states and error handling
- React + TypeScript with Tailwind CSS
- Hot toast notifications for user feedback
- Responsive design with proper loading and empty states

### ✅ Builder Backend API (Port 5001)
**Database Integration:**
- PostgreSQL with SQLAlchemy ORM
- JSONB columns for flexible content structures
- Proper indexing for performance
- Database migrations with Alembic

**API Endpoints:**
```
GET    /api/creators           # List all creators
POST   /api/creators           # Create new creator
GET    /api/creators/{id}      # Get creator by ID
PUT    /api/creators/{id}      # Update creator
DELETE /api/creators/{id}      # Delete creator
POST   /api/creators/{id}/avatar   # Upload avatar
POST   /api/creators/{id}/banner   # Upload banner
GET    /api/sets              # List content sets
POST   /api/sets              # Create content set
GET    /api/cards             # List content cards
POST   /api/generate          # Generate AI content
POST   /api/export            # Export data
```

### ✅ Shared Database (Port 5432)
- **PostgreSQL 15** with UTF-8 support
- **Tables**: creators, content_sets, content_cards
- **JSONB Fields**: domain_data, media, navigation_contexts, tags
- **Indexes**: GIN indexes on JSONB columns for fast queries
- **Relationships**: Foreign keys with cascade delete

### ✅ Viewer (Port 3000)
- React PWA for content consumption
- Connects to same API for real-time data access
- Netflix-style content discovery interface

## Getting Started

### Quick Start with Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/[username]/boxiii.git
cd boxiii
```

2. Create environment file:
```bash
cp .env.example .env
# Edit .env with your API keys:
# - GEMINI_API_KEY=your_key
# - CLAUDE_API_KEY=your_key  
# - OPENAI_API_KEY=your_key
# - JWT_SECRET=your_secret
# - DB_PASSWORD=your_db_password
```

3. Start all services:
```bash
# Use the unified Docker compose file
docker-compose -f docker-compose.unified.yml up -d

# Services will be available at:
# - Builder Frontend: http://localhost:3001
# - Builder Backend API: http://localhost:5001  
# - Viewer: http://localhost:3000
# - PostgreSQL: localhost:5432
```

4. Initialize the database:
```bash
# The database will auto-initialize with the schema
# Check logs: docker-compose -f docker-compose.unified.yml logs postgres
```

### Manual Development Setup

1. **Database Setup:**
```bash
# Start PostgreSQL container
docker run --name boxiii-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15-alpine
```

2. **Builder Backend:**
```bash
cd builder/backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://boxiii_user:password@localhost:5432/boxiii"
python api_server.py
```

3. **Builder Frontend:**
```bash
cd builder/frontend
npm install
npm run dev  # Starts on port 3001
```

4. **Viewer:**
```bash
cd viewer
npm install
npm run dev  # Starts on port 3000
```

## Security

- JWT-based authentication for both services
- Environment variable management for secrets
- API rate limiting
- Input validation and sanitization
- CORS configuration

## Future Integrations

- OpenWebUI for centralized LLM access
- MongoDB for production scalability
- Payment gateways (Stripe, PayPal, Mercado Pago)
- Analytics and monitoring

## License

[To be determined]

## Contributing

[Guidelines to be added]