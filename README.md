# Boxiii - AI-Powered Educational Content Platform

## Current System Status (June 24, 2025)

### 🚀 FULLY FUNCTIONAL BUILDER PLATFORM
The Builder interface is now a complete content management system with full CRUD operations, AI integration readiness, and professional UI/UX.

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

# Start all services with Docker Compose
docker-compose up -d

# Access the Builder interface
# Frontend: http://localhost:3001
# Backend API: http://localhost:5001
# Database: PostgreSQL on localhost:5432
```

## System Architecture

### Builder (Admin/CMS Interface)
**Status**: ✅ **Fully Functional**
- **Frontend**: React + TypeScript + Tailwind CSS v4
- **Backend**: Python FastAPI + SQLAlchemy
- **Database**: PostgreSQL with JSONB storage
- **Ports**: Frontend (3001), Backend (5001), Database (5432)

### Viewer (Public PWA)
**Status**: 🔄 **Planned for Phase 3**
- **Purpose**: Netflix-style content consumption interface
- **Technology**: React PWA with offline capabilities

## Current Features (What Works NOW)

### ✅ Navigation & User Interface
- **5-Tab Navigation**: Dashboard → Generate → Creators → Boxes → Cards
- **Responsive Design**: Professional Tailwind CSS v4 implementation
- **Clickable Dashboard**: Stats link directly to respective management tabs
- **Consistent Icons**: Visual hierarchy with HeroIcons throughout
- **Loading States**: Proper loading indicators and error handling

### ✅ Content Management Hierarchy

#### 1. **Dashboard**
- **Real-time Statistics**: Live counts of Creators, Boxes, and Total Cards
- **Quick Actions**: Direct navigation to all management sections
- **Recent Activity**: Shows latest content creation activity
- **Clickable Stats**: Each statistic links to its respective management tab

#### 2. **Generate Tab**
- **AI Provider Selection**: Gemini, Claude, GPT-4 integration ready
- **Creator Selection**: Dynamic dropdown showing only creators with content sets
- **Content Parameters**: Topic, card count, style customization
- **Form Validation**: Proper error handling and user feedback

#### 3. **Creators Tab**
- **Full CRUD Operations**: Create, Read, Update, Delete creator profiles
- **Platform Integration**: Social media handles and verification
- **Rich Profiles**: Avatars, banners, descriptions, categories
- **Validation System**: Platform handle validation (no spaces/special chars)
- **Modal Interface**: Professional add/edit forms with toast notifications

#### 4. **Boxes Tab** (Content Sets Management)
- **Dual-Pane Interface**: Content sets list + detailed preview
- **Search & Filter**: Real-time filtering by creator and search terms
- **Rich Metadata**: Category, difficulty, time estimates, card counts
- **Content Organization**: Logical grouping of related educational content
- **CRUD Operations**: View details, delete sets (edit placeholder ready)

#### 5. **Cards Tab** (Individual Content Management)
- **Comprehensive Preview**: Full content inspection with metadata
- **Advanced Filtering**: Search by title/summary, filter by creator/set
- **Content Display**: Title, summary, detailed content, tags, domain info
- **Bulk Operations**: Delete functionality with confirmation
- **Export Ready**: Structured data suitable for various export formats

### ✅ Database Architecture
- **PostgreSQL with JSONB**: Flexible content storage with relational integrity
- **Three Core Models**: Creators, ContentSets, ContentCards
- **Proper Relationships**: Foreign key constraints and cascade deletes
- **Migration System**: Schema versioning and automated migrations
- **Data Validation**: API-level and database-level validation

### ✅ API Architecture
- **RESTful Design**: Consistent endpoint structure and HTTP methods
- **Type Safety**: Pydantic models for request/response validation
- **Error Handling**: Proper HTTP status codes and error messages
- **Filtering Support**: Query parameters for content filtering
- **Documentation**: API endpoints documented with proper descriptions

### ✅ Security & Validation
- **Input Validation**: Pydantic schemas prevent invalid data entry
- **Platform Handle Validation**: Prevents spaces and special characters
- **SQL Injection Protection**: SQLAlchemy ORM prevents SQL injection
- **Error Boundary**: Graceful error handling throughout the UI

## Technology Stack

### Frontend (Builder)
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and IDE support
- **Tailwind CSS v4**: Rust-based compilation for optimal performance
- **React Router**: Client-side routing with proper navigation
- **React Hot Toast**: User feedback and notification system
- **HeroIcons**: Consistent icon system throughout the interface
- **Vite**: Fast development server and optimized builds

### Backend (Builder)
- **Python 3.9+**: Modern Python with type hints
- **FastAPI**: High-performance async web framework
- **SQLAlchemy**: ORM with relationship management
- **Pydantic**: Data validation and serialization
- **PostgreSQL**: Primary database with JSONB support
- **Docker**: Containerized deployment and development

### DevOps & Infrastructure
- **Docker Compose**: Multi-service orchestration
- **PostgreSQL 15**: Alpine-based container for optimal performance
- **Volume Mounts**: Development mode with hot reloading
- **Health Checks**: Container health monitoring
- **Network Isolation**: Secure inter-service communication

## Project Structure
```
boxiii/
├── builder/                    # Builder (Admin/CMS) Service
│   ├── frontend/              # React + TypeScript frontend
│   │   ├── src/
│   │   │   ├── pages/         # Main application pages
│   │   │   ├── components/    # Reusable UI components  
│   │   │   └── services/      # API integration layer
│   │   ├── package.json       # Frontend dependencies
│   │   └── vite.config.ts     # Vite configuration
│   ├── backend/               # Python FastAPI backend
│   │   ├── database/          # Database models and migrations
│   │   ├── api_server.py      # Main FastAPI application
│   │   └── requirements.txt   # Python dependencies
│   └── Dockerfile             # Builder container configuration
├── viewer/                    # Viewer (PWA) Service [Planned]
├── database/                  # Database initialization scripts
├── docker-compose.yml         # Multi-service orchestration
├── PROJECT_GOALS.md          # Vision and long-term goals
└── README.md                 # This file
```

## Development Workflow

### Local Development
```bash
# Start development environment
docker-compose up -d

# Frontend development (with hot reload)
cd builder/frontend
npm install
npm run dev

# Backend development (with auto-reload)
cd builder/backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

### Database Management
```bash
# Access PostgreSQL directly
docker exec -it boxiii-db psql -U boxiii_user -d boxiii

# View database logs
docker logs boxiii-db

# Backup database
docker exec boxiii-db pg_dump -U boxiii_user boxiii > backup.sql
```

### Making Changes
1. **Frontend Changes**: Edit files in `builder/frontend/src/`
2. **Backend Changes**: Edit files in `builder/backend/`
3. **Database Changes**: Update models in `builder/backend/database/models.py`
4. **Container Restart**: `docker-compose restart <service-name>`

## Current Data Model

### Creators
- **Profile Information**: Display name, description, categories
- **Platform Integration**: Social media handles and verification status
- **Branding**: Avatar and banner image support
- **Relationships**: One-to-many with ContentSets

### ContentSets (Boxes)
- **Metadata**: Title, description, category, difficulty level
- **Organization**: Card count, estimated time, target audience
- **Content Style**: Educational approach and navigation preferences
- **Relationships**: Belongs to Creator, contains multiple ContentCards

### ContentCards
- **Core Content**: Title, summary, detailed educational content
- **Learning Data**: Tags, difficulty, domain-specific information
- **Organization**: Order index within sets, navigation contexts
- **Relationships**: Belongs to ContentSet and Creator

## API Endpoints

### Creators Management
- `GET /api/creators` - List all creators (with filtering options)
- `GET /api/creators/{creator_id}` - Get specific creator
- `POST /api/creators` - Create new creator
- `PUT /api/creators/{creator_id}` - Update creator
- `DELETE /api/creators/{creator_id}` - Delete creator

### Content Sets (Boxes) Management
- `GET /api/sets` - List all content sets
- `GET /api/sets/{set_id}` - Get specific content set
- `POST /api/sets` - Create new content set
- `PUT /api/sets/{set_id}` - Update content set
- `DELETE /api/sets/{set_id}` - Delete content set

### Content Cards Management
- `GET /api/cards` - List all content cards
- `GET /api/cards?set_id={set_id}` - Get cards in specific set
- `POST /api/cards` - Create new content card
- `PUT /api/cards/{card_id}` - Update content card
- `DELETE /api/cards/{card_id}` - Delete content card

## Business Logic

### Content Generation Workflow
1. **Creator Setup**: Create creator profile with social platforms
2. **Content Planning**: Define content sets with target audience and goals
3. **AI Generation**: Use AI providers to generate educational content
4. **Content Review**: Edit and organize generated content in boxes
5. **Quality Control**: Preview and validate content before publication
6. **Export/Distribution**: Export to various formats or publish to Viewer

### Data Integrity Rules
- **Creator-Content Relationship**: Only creators with content sets appear in Generate dropdown
- **Cascade Deletions**: Deleting creators removes all associated content sets and cards
- **Platform Validation**: Social platform handles cannot contain spaces or special characters
- **Content Organization**: Cards must belong to a content set and creator

## Next Development Priorities

### Phase 2A: Enhanced Content Generation
- [ ] **AI Provider Integration**: Connect Generate tab to actual AI APIs
- [ ] **Content Templates**: Pre-defined educational content structures
- [ ] **Style Matching**: Generate content matching creator's voice and style
- [ ] **Bulk Operations**: Generate multiple content sets efficiently

### Phase 2B: Advanced Management Features
- [ ] **Content Editing**: Rich text editor for detailed content modification
- [ ] **Import/Export**: Multiple format support (JSON, CSV, SCORM)
- [ ] **Content Templates**: Reusable content structures and themes
- [ ] **Version Control**: Track content changes and maintain history

### Phase 3: Viewer PWA Development
- [ ] **Netflix-style Interface**: Content discovery and consumption
- [ ] **Progressive Learning**: Structured learning paths and progress tracking
- [ ] **Offline Capabilities**: Download content for offline access
- [ ] **User Accounts**: Learning progress and bookmark management

## Troubleshooting

### Common Issues
1. **Containers Won't Start**: Check Docker daemon and port conflicts
2. **Database Connection**: Verify PostgreSQL container is healthy
3. **Frontend Build Errors**: Clear node_modules and reinstall dependencies
4. **API Errors**: Check backend container logs for Python errors

### Debug Commands
```bash
# Check container status
docker-compose ps

# View container logs
docker logs boxiii-builder-frontend
docker logs boxiii-builder-backend
docker logs boxiii-db

# Restart specific service
docker-compose restart builder-backend

# Access container shell
docker exec -it boxiii-builder-backend bash
```

## Contributing

### Code Standards
- **TypeScript**: Use strict mode and proper type definitions
- **Python**: Follow PEP 8 and use type hints
- **Git**: Conventional commits with clear descriptions
- **Testing**: Add tests for new functionality
- **Documentation**: Update relevant documentation files

### Development Process
1. **Feature Branch**: Create branch from main for new features
2. **Implementation**: Develop with proper error handling and validation
3. **Testing**: Test functionality locally with Docker Compose
4. **Documentation**: Update README and relevant docs
5. **Pull Request**: Submit PR with detailed description and testing notes

## License

This project is proprietary software developed for educational content creation and management.

---

**Last Updated**: June 24, 2025  
**System Status**: ✅ Builder Fully Functional | 🔄 Viewer In Planning Phase  
**Next Milestone**: AI Provider Integration and Content Generation