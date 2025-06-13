--------------------------------------------------------------------------------
-- README.md 
-- update: 13 jun 2025 -- 06:40 (MAJOR TECHNOLOGY UPDATES)
--------------------------------------------------------------------------------

# Boxiii - AI-Powered Educational Content Platform

## 🚨 MAJOR TECHNOLOGY CHANGES - June 13, 2025

### Critical Frontend Technology Migration: Tailwind CSS v4
**BREAKING CHANGE**: The Builder frontend has been migrated from Tailwind CSS v3 to v4 with significant architectural changes:

#### What Changed:
1. **Build System**: Replaced PostCSS plugin with dedicated `@tailwindcss/vite` plugin
2. **Configuration**: Removed `tailwind.config.js` (not needed in v4)
3. **CSS Import**: Changed from `@tailwind` directives to single `@import "tailwindcss"`
4. **Performance**: Now uses Rust-based compilation engine (5x faster builds)

#### Why This Path Was Chosen:
- **Performance**: Tailwind v4 offers significantly faster build times with Rust engine
- **Simplification**: Single import line vs. three @tailwind directives
- **Future-Proofing**: v4 is designed for modern build tools and CSS features
- **Integration**: Dedicated Vite plugin provides optimal developer experience

#### Files Modified:
- `package.json`: Updated to `tailwindcss@^4.1.8` and `@tailwindcss/vite@^4.1.8`
- `vite.config.ts`: Added `tailwindcss()` plugin import and configuration
- `src/index.css`: Changed to `@import "tailwindcss"`
- `postcss.config.js`: Simplified (no longer needed for primary processing)

#### Critical Notes for Future Development:
- **DO NOT** revert to v3 without understanding build system implications
- **Port Configuration**: Vite config locked to port 3000 (container) → 3001 (host)
- **Browser Support**: v4 requires Safari 16.4+, Chrome 111+, Firefox 128+

### Database Architecture Status:
- ✅ **PostgreSQL with JSONB**: Unified database for all services
- ✅ **SQLAlchemy ORM**: Type-safe models with relationships
- ✅ **Docker Integration**: Shared database container across services

## Overview

Boxiii is a comprehensive educational content platform that combines AI-powered content generation with a Netflix-style content discovery experience. The system consists of two main services:

- **Builder**: An admin/CMS interface for content creation and management, built with a React frontend and a Python/FastAPI backend.
- **Viewer**: A public-facing Progressive Web App (PWA) for content consumption, also built with React.

## Architecture

The system follows a decoupled architecture, with a shared PostgreSQL database:

```
┌─────────────────────────────────────────────────────────────┐
│                        Boxiii Platform                      │
├─────────────────────────┬───────────────────────────────────┤
│    Builder (Admin)      │        Viewer (Public)            │
├─────────────────────────┼───────────────────────────────────┤
│ • React 19+ (Vite)      │ • React + Vite                    │
│ • Tailwind CSS v4      │ • Tailwind CSS                    │
│ • TypeScript            │ • Netflix-style UI                │
│ • Python FastAPI       │ • User Authentication             │
│ • PostgreSQL + JSONB   │ • Content Discovery               │
│ • Multi-LLM Support    │ • PWA Capabilities                │
└─────────────────────────┴───────────────────────────────────┘
```

## Directory Structure

```
boxiii/
├── builder/
│   ├── backend/          # Python FastAPI API with SQLAlchemy
│   ├── frontend/         # React 19 + Vite + Tailwind v4 Admin UI  
│   └── Dockerfile
├── viewer/               # Public PWA (React + Vite)
│   ├── src/
│   ├── public/
│   └── Dockerfile
├── shared/               # Shared utilities, types, etc.
│   ├── schemas/          # JSON schema definitions
│   └── uploads/          # File upload storage
├── database/
│   └── init/             # PostgreSQL initialization scripts
├── docker-compose.yml    # Main orchestration
├── README.md            # This file
├── ARCHITECTURE.md      # Detailed system architecture
└── CLAUDE.md           # AI assistant project memory
```

## Technology Stack

### Frontend Technology Stack
#### Builder (Admin Interface)
- **React**: 19.1.0 (latest)
- **TypeScript**: 5.8.3 
- **Vite**: 6.3.5 (build tool)
- **Tailwind CSS**: 4.1.8 (Rust-based compilation)
- **Router**: React Router DOM 7.6.2
- **UI Libraries**: 
  - Heroicons 2.2.0
  - Lucide React 0.514.0
  - React Hot Toast 2.5.2
- **HTTP Client**: Axios 1.9.0

#### Viewer (Public PWA)
- **React**: Standard version with PWA capabilities
- **Tailwind CSS**: For styling
- **Service Worker**: For offline functionality
- **Responsive Design**: Mobile-first approach

### Backend Technology Stack
- **Python**: 3.12+
- **FastAPI**: High-performance async API framework
- **SQLAlchemy**: 2.0+ ORM with async support
- **PostgreSQL**: 15+ with JSONB for flexible content storage
- **Authentication**: JWT-based auth system
- **LLM Integration**: Multi-provider support (OpenAI, Claude, Gemini)

### Infrastructure & DevOps
- **Docker**: Containerized services
- **Docker Compose**: Service orchestration
- **PostgreSQL**: Shared database with JSONB flexibility
- **Environment**: .env-based configuration management

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- An `.env` file created from `.env.example` with your API keys

### Quick Start with Docker (Recommended)

1. **Clone and Setup Environment:**
```bash
git clone https://github.com/[username]/boxiii.git
cd boxiii
cp .env.example .env
# Edit .env with your API keys
```

2. **Start All Services:**
```bash
docker-compose up -d --build
```

3. **Access Services:**
- **Builder (Admin)**: http://localhost:3001
- **Viewer (Public)**: http://localhost:3000  
- **API Documentation**: http://localhost:5001/docs
- **PostgreSQL**: localhost:5432

### Local Development Setup

For frontend development with hot reload:

```bash
# Builder Frontend
cd builder/frontend
npm install
npm run dev  # Starts on localhost:3001

# Viewer
cd viewer  
npm install
npm run dev  # Starts on localhost:3000
```

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