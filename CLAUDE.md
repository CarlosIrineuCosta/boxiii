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