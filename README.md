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
React Frontend ↔ FastAPI (Port 5001) ↔ Data Abstraction Layer ↔ JSON Files
                                     ↓
                              Export/Import ↔ Viewer (Port 3000)
```

**Phase 1 (Complete)**: JSON backend with API abstraction
**Phase 2 (Planned)**: Dynamic UI generation from schema  
**Phase 3 (Planned)**: AI field behaviors and multi-platform publishing
**Phase 4 (Future)**: Vector DB backend for semantic content operations

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

### Builder Backend
- Python 3.12+
- FastAPI with data abstraction layer
- Multi-provider LLM integration (Claude, Gemini, GPT-4)
- **Meta-CRUD System**: Data interface contracts for flexible backend swapping
- JSON/MongoDB/Vector DB support through abstraction layer

### Infrastructure
- Docker containers
- Environment-based configuration
- JWT authentication
- HTTPS/TLS

## Current System Status (Phase 1 Complete)

### ✅ Builder Backend API (Port 5001)
The Builder now implements a **meta-CRUD architecture** with data abstraction:

**Key Components:**
- **Data Interfaces** (`data_interfaces.py`): Abstract contracts for any data backend
- **JSON Implementation** (`json_data_impl.py`): Current JSON file backend
- **FastAPI Server** (`api_server.py`): REST API with CORS support
- **Always-Available Export**: JSON backup generation for debugging/migration

**API Endpoints:**
```
GET  /api/health              # System status
GET  /api/creators            # List creators
POST /api/creators            # Create creator
GET  /api/cards              # List content cards  
GET  /api/sets               # List content sets
POST /api/export             # Export all data to JSON
GET  /api/debug/data-summary # Development info
```

**Browser Testing:** `http://localhost:5001/` (Interactive test interface)

**Current Data:**
- 2 Creators: "Lunar Explorer" (space content), "Longe Vida" (wellness 50+)
- 13 Content Cards: Educational content on health, space exploration
- 3 Content Sets: Grouped thematic content collections

**Verification Commands:**
```bash
# Test API health
curl http://localhost:5001/api/health

# Get data summary  
curl http://localhost:5001/api/debug/data-summary

# Export all data to JSON (for Obsidian viewing)
curl -X POST http://localhost:5001/api/export
```

### 🔄 Builder Frontend (Port 5010)
- React development server running
- Configured to proxy API calls to backend
- **Next Phase**: Connect to API endpoints for CRUD operations

### ✅ Viewer (Port 3000/8001)
- Fully functional PWA
- Consumes exported JSON from Builder

## Getting Started

### Development

1. Clone the repository:
```bash
git clone https://github.com/[username]/boxiii.git
cd boxiii
```

2. Setup Builder Backend:
```bash
cd builder/backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
# Copy .env.example to .env and add your API keys
cp ../../.env.example ../../.env
# Start API server
python api_server.py
```

3. Setup Builder Frontend:
```bash
cd builder/frontend
npm install
npm run dev  # Starts on port 5010
```

4. Setup Viewer:
```bash
cd viewer
npm install
npm start
```

### Docker Deployment

```bash
docker-compose up -d
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