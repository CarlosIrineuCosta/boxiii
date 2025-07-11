# Project Memory for Claude Code

## Project Documentation Requirements

### Essential Documentation Files

1. **README.md** (MUST READ FIRST)
   - Project overview and specifications
   - Setup instructions
   - Usage guidelines
   - Dependencies and requirements

2. **DATABASE.md** (Check if exists)
   - Database schema
   - Connection configurations
   - Migration instructions
   - Data models and relationships

3. **ARCHITECTURE.md** (Check if exists)
   - System architecture overview
   - Component relationships
   - API endpoints
   - Service integrations
   - Design decisions and rationale

### Documentation Workflow

**On Project Start**:
- Always read README.md first
- Look for DATABASE.md and ARCHITECTURE.md
- If these files don't exist, ask to create them
- Review any existing documentation thoroughly

**After Major Changes**:
- Update relevant documentation files
- Create new documentation files if needed
- Document:
  - New features or components
  - Database schema changes
  - Architecture modifications
  - API changes
  - Configuration updates

### Project Structure Standards

```
project-root/
├── README.md              # Project overview and setup
├── DATABASE.md            # Database documentation
├── ARCHITECTURE.md        # System architecture
├── CLAUDE.md             # This file - project memory
├── CLAUDE.local.md       # Personal project preferences (if needed)
├── requirements.txt      # Python dependencies
├── .gitignore           # Git ignore rules
├── venv/                # Virtual environment (excluded from git)
├── src/                 # Source code
├── tests/               # Test files
├── docs/                # Additional documentation
└── config/              # Configuration files
```

### Development Standards

1. **Environment Setup**:
   - Always use Python virtual environments
   - Document all dependencies in requirements.txt
   - Include setup instructions in README.md
   - Use .env files for configuration (with .env.example template)
   - NEVER commit sensitive data or API keys

2. **Database Guidelines**:
   - Start with SQLite for projects under 100K records
   - Use SQLAlchemy for ORM abstraction
   - Design for easy migration to PostgreSQL
   - Include database schema in DATABASE.md

3. **Code Organization**:
   - Follow modular design principles
   - Separate concerns (models, views, controllers)
   - Use clear, descriptive naming conventions
   - API-first design when applicable

4. **Testing Approach**:
   - Use pytest for all testing
   - Create visual checkpoints with print statements
   - Test database connections first
   - Verify API endpoints
   - Check configuration loading
   - Run with `pytest -v` for verbose output

5. **Version Control** (Simplified Git Flow):
   - `main`: Production-ready code only
   - `develop`: Integration and testing
   - `feature/*`: Development branches
   - Write clear commit messages
   - Merge develop to main only when stable

6. **Security Practices**:
   - Use .env files for all secrets
   - Create .env.example with dummy values
   - Add .env to .gitignore immediately
   - Use environment variables for all API keys
   - Validate all user inputs

### Deployment Considerations

- Design for easy transition from local to VPS hosting
- Consider scalability from personal use to client delivery
- Document deployment steps in README.md
- Keep configuration flexible for different environments

### Project-Specific Notes

[This section should be updated with project-specific information as the project develops]

- Technology stack decisions
- Special requirements or constraints
- Integration points
- Performance considerations
- Security requirements

## Boxiii Development Plan

### Current Status (2025-06-25)
- [OK] Database: PostgreSQL with JSONB unified architecture
- [OK] Creator Management: Full CRUD interface implemented
- [OK] Builder Frontend: React + TypeScript with API integration
- [OK] Backend Migration: SQLAlchemy connected to FastAPI
- [OK] Content Generation: AI integration implemented with Gemini 2.5 Flash Lite
- [OK] Complete CRUD: Full REST API endpoints for all resources
- [OK] UI/UX: Custom modals, consistent "Boxes" terminology
- [OK] API Service Layer: Unified, consistent API calls across frontend
- [OK] VPS Deployment: Successfully deployed to Hostinger VPS (v0.0.1-alpha)
- [CRITICAL] Database Schema: Critical mismatch between repository and working schema (see DATABASE_SCHEMA_CRITICAL_ISSUE.md)
- [TODO] CI/CD: Planning phase, implementation roadmap created (see CI_CD_IMPLEMENTATION_PLAN.md)

### Session Summary (2025-06-24)

#### MAJOR ACCOMPLISHMENTS TODAY:
1. **Fixed AI Generation Workflow**: Resolved "Not Found" errors, AI generation now working with Gemini 2.5 Flash Lite
2. **Implemented Missing REST Endpoints**: Added PUT/DELETE for content sets and cards - complete CRUD operations
3. **Fixed Critical System Design Flaw**: Generate Cards now shows ALL creators (was blocking new creator workflow)
4. **Improved UI/UX**: 
   - Replaced ugly browser confirm dialogs with beautiful custom modals
   - Standardized terminology to "Boxes" across all interfaces
   - Professional delete confirmation with box details
5. **Fixed API Service Layer Issues**: Resolved "blank screen bug" from inconsistent API response handling
6. **Comprehensive Documentation**: Added critical system design documentation to prevent future regressions

#### ISSUES IDENTIFIED:
1. **AI Content Duplication**: Card generation AI is creating multiple copies of the same facts/content. Root cause unknown, needs investigation in next session.

#### NEXT SESSION PRIORITIES:
1. Investigate and fix AI content duplication issue
2. Test complete end-to-end workflows
3. Consider implementing model selector dropdown (as documented in PROJECT_GOALS.md)

### Phase 2: Backend Migration & Content Generation (COMPLETED)

#### COMPLETED:
1. **Database Architecture**
   - [OK] PostgreSQL with JSONB for flexible content storage
   - [OK] SQLAlchemy models (Creator, ContentSet, ContentCard)
   - [OK] Database initialization scripts and migrations
   - [OK] Docker compose with shared database

2. **Creator Management Interface**
   - [OK] React frontend with TypeScript
   - [OK] Full CRUD operations (Create, Read, Update, Delete)
   - [OK] API service layer with error handling
   - [OK] Modal components for add/edit
   - [OK] Loading states and user feedback

3. **Frontend Infrastructure**
   - [OK] Tailwind CSS styling
   - [OK] React Router setup
   - [OK] Hot toast notifications
   - [OK] API client with TypeScript interfaces

#### TODO List (COMPLETED):
1. **Backend API Migration**
   - [OK] Update FastAPI endpoints to use SQLAlchemy
   - [OK] Replace JSON file operations with database operations
   - [OK] Implement proper database session management
   - [OK] Add complete REST API endpoints (GET/POST/PUT/DELETE)
   - [TODO] Add JWT authentication middleware (future enhancement)
   - [TODO] File upload handling for avatars/banners (future enhancement)

2. **Content Generation System**
   - [OK] Connect generation interface to database
   - [OK] Implement ContentSet CRUD operations
   - [OK] Implement ContentCard CRUD operations
   - [OK] Update AI generation to save to database
   - [OK] Add generation progress tracking

3. **Integration Testing**
   - [OK] Test Creator CRUD with database
   - [OK] Test content generation flow
   - [OK] Verify complete system workflows
   - [OK] End-to-end testing

### Phase 2.5: Production Infrastructure (IN PROGRESS)

#### Current Deployment Status:
- [OK] **VPS**: Deployed to Hostinger VPS with Docker Compose
- [OK] **Reverse Proxy**: Nginx configured for frontend/backend routing
- [OK] **Database**: PostgreSQL in production with data persistence
- [CRITICAL] **Schema Issue**: Repository schema doesn't match working database
- [TODO] **CI/CD**: Implementation plan created, GitHub Actions pending

#### Deployment Locations:
- **Production VPS**: Hostinger server (manual deployment via SSH)
- **GitHub Repository**: github.com/your-username/boxiii
- **Local Development**: WSL2 Ubuntu on Windows 11
- **Future Staging**: TBD (considering second VPS or Docker Swarm)

#### Authentication & User Management:
- [ ] Implement user registration/login
- [ ] User profile management
- [ ] Session management with JWT
- [ ] Password reset functionality
- [ ] Consider Auth0 or Clerk for managed auth

#### Payment Gateway Integration:
- [ ] Stripe integration for international payments
- [ ] PayPal as secondary option
- [ ] Mercado Pago for Latin American markets
- [ ] Subscription management
- [ ] Usage-based billing for AI generation

### Phase 3: Production Features

- [ ] Analytics dashboard
- [ ] Multi-language support (PT/EN/ES)
- [ ] Team collaboration features
- [ ] API rate limiting
- [ ] Backup and restore functionality
- [ ] Admin panel for platform management

### Technical Debt & Improvements

#### Critical Issues (MUST FIX):
- [ ] Fix database schema mismatch in `database/init/01_schema.sql`
- [ ] Review and update database default values (see DATABASE_DEFAULTS_REVIEW_NEEDED.md)
- [ ] Remove incorrect `database/migration_platform_to_platforms.sql`

#### CI/CD Implementation (HIGH PRIORITY):
- [ ] Set up GitHub Actions for CI/CD
- [ ] Configure GitHub Container Registry
- [ ] Implement database migrations with Alembic
- [ ] Create staging environment
- [ ] Add automated testing pipeline

#### Code Quality:
- [ ] Add comprehensive error handling
- [ ] Implement logging system
- [ ] Add monitoring (Sentry, DataDog)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation updates

### Environment Variables & Configuration

#### Current Production Environment (.env.prod):
```bash
# Database
DB_USER=boxiii
DB_PASSWORD=[CONFIGURED]
DB_NAME=boxiii_db
DB_HOST=db
DB_PORT=5432

# Security
JWT_SECRET=[CONFIGURED]

# AI APIs
GEMINI_API_KEY=[CONFIGURED]
CLAUDE_API_KEY=[CONFIGURED]
OPENAI_API_KEY=[CONFIGURED]

# Email (Future)
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
```

#### CI/CD Secrets (To Configure in GitHub):
```bash
# VPS Access
VPS_HOST=
VPS_USER=
VPS_SSH_KEY=

# Container Registry
GITHUB_TOKEN=[AUTO]

# Environment-specific
DB_PASSWORD_STAGING=
DB_PASSWORD_PRODUCTION=
JWT_SECRET_STAGING=
JWT_SECRET_PRODUCTION=
```

### Versioning & Branching Strategy

#### Current Version: 0.0.1-alpha

#### Branching Model (Simplified Git Flow):
- `main` → Production releases (protected)
- `develop` → Integration branch
- `feature/*` → New features
- `bugfix/*` → Bug fixes
- `hotfix/*` → Emergency production fixes
- `release/*` → Release preparation

#### Version Format:
```
MAJOR.MINOR.PATCH-STAGE

Examples:
0.0.1-alpha   <- Current version
0.1.0-beta    <- Feature complete
1.0.0         <- First stable release
```

### Quick Reference Commands

#### Local Development:
```bash
cd ~/projects/boxiii
source venv/bin/activate
docker-compose up -d
```

#### Production Deployment (Current - Manual):
```bash
ssh user@vps-host
cd /var/www/boxiii
./deploy-vps.sh
```

#### Future CI/CD Deployment:
```bash
# Automatic on push to main
# Manual via GitHub Actions:
gh workflow run deploy.yml -f environment=production
```