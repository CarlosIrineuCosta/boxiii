# Boxiii - AI-Powered Educational Content Platform

A monorepo containing content creation tools and viewing applications for educational content.

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- Python 3.9+ (for development)

### Running the System
```bash
# Clone and navigate to project
git clone https://github.com/CarlosIrineuCosta/boxiii.git
cd boxiii

# Start all services
cd ops/docker
docker-compose up -d

# Access applications:
# Builder (Admin): http://localhost:3001
# Viewer (PWA): http://localhost:3000
# API: http://localhost:5001
```

## Project Structure

```
boxiii/
├── apps/              # Applications
│   ├── builder/       # Content creation system (React + FastAPI)
│   ├── viewer/        # PWA content viewer (React + TypeScript)
│   └── viewer-mobile/ # React Native mobile app (experimental)
├── packages/          # Shared resources
│   ├── database/      # PostgreSQL schemas and migrations
│   ├── schemas/       # JSON validation schemas
│   └── uploads/       # File storage
├── ops/              # Operations
│   ├── docker/       # Docker configurations
│   ├── deploy/       # Deployment scripts
│   └── nginx/        # Web server configs
├── docs/             # Documentation
└── archives/         # Legacy code and docs
```

## Applications

### Builder (Content Management)
**Status**: Fully Functional
- **Purpose**: Create and manage educational content
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: FastAPI + PostgreSQL + SQLAlchemy
- **Features**: Full CRUD operations, AI integration, admin interface

### Viewer (Public PWA)
**Status**: Fully Functional
- **Purpose**: View educational content on any device
- **Technology**: React 19.1 + Vite + TypeScript
- **Features**: PWA support, offline capability, touch gestures

### Viewer Mobile (React Native)
**Status**: Experimental
- **Purpose**: Native mobile app experience
- **Technology**: React Native + Expo
- **Status**: Development environment setup in progress

## Database

**System**: PostgreSQL with JSONB storage
- **Models**: Creators, ContentSets, ContentCards
- **Features**: Flexible schema, full-text search, JSON validation
- **Location**: `packages/database/`

## Development

### Local Development
```bash
# Builder backend
cd apps/builder/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py

# Builder frontend
cd apps/builder/frontend
npm install
npm run dev

# Viewer PWA
cd apps/viewer
npm install
npm run dev
```

### Using Docker
```bash
cd ops/docker
docker-compose up -d
```

## Deployment

See `docs/deployment.md` for VPS deployment instructions.

## Documentation

- `docs/architecture.md` - System architecture and design
- `docs/deployment.md` - Production deployment guide
- `docs/monorepo-structure.md` - Project organization details
- `apps/*/README.md` - Application-specific documentation

## Version

Current: v0.0.1-alpha (Monorepo reorganization complete)