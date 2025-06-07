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

### Current Status (2025-01-07)
- Viewer: ✅ Running successfully with existing content
- Builder: 🔄 Needs migration from Gradio to React frontend

### Phase 1: Builder Frontend Development

#### TODO List:
1. **Initialize React App for Builder Frontend**
   - [ ] Create React app with TypeScript in builder/frontend
   - [ ] Set up Tailwind CSS
   - [ ] Configure proxy for Python backend API
   - [ ] Set up routing with React Router

2. **Core UI Components**
   - [ ] Create authentication/login page
   - [ ] Build dashboard with navigation sidebar
   - [ ] Implement creator management interface (CRUD)
   - [ ] Design content generation form with:
     - [ ] LLM provider selection (Gemini, Claude, GPT-4)
     - [ ] Topic/prompt input fields
     - [ ] Generation parameters/settings
     - [ ] Cost estimation display
   - [ ] Create content preview/editor component
   - [ ] Build export management interface

3. **Backend API Migration**
   - [ ] Convert Gradio app to FastAPI endpoints
   - [ ] Implement proper CORS configuration
   - [ ] Create API endpoints:
     - [ ] POST /api/auth/login
     - [ ] GET/POST/PUT/DELETE /api/creators
     - [ ] POST /api/generate/content
     - [ ] POST /api/export
     - [ ] GET /api/stats
   - [ ] Add request validation with Pydantic
   - [ ] Implement JWT authentication

4. **Data Format Updates (per MIGRATION_GUIDE.md)**
   - [ ] Update core_models.py with new schema
   - [ ] Implement clean ID generation
   - [ ] Add set_number sequential generation
   - [ ] Include Portuguese tags (tags_pt)
   - [ ] Generate category-based color schemes
   - [ ] Add hero content flagging
   - [ ] Include stats tracking

5. **Integration Testing**
   - [ ] Test content generation with each LLM provider
   - [ ] Verify export format matches viewer expectations
   - [ ] Test full flow: Create → Generate → Export → View
   - [ ] Validate against JSON schemas

### Phase 2: Alpha Production Preparation

#### Deployment Considerations:
- **Platform**: Cloudflare Pages/Workers
- **Backend**: Consider Cloudflare Workers for API
- **Database**: Start with D1 (Cloudflare's SQLite) or MongoDB Atlas
- **CDN**: Cloudflare for static assets

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

- [ ] Add comprehensive error handling
- [ ] Implement logging system
- [ ] Add monitoring (Sentry, DataDog)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation updates

### Environment Variables Needed

```bash
# Builder Backend
JWT_SECRET=
GEMINI_API_KEY=
CLAUDE_API_KEY=
OPENAI_API_KEY=

# Future Production
STRIPE_API_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
MERCADOPAGO_ACCESS_TOKEN=
MONGODB_URI=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
```