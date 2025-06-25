# CI/CD Implementation Plan for Boxiii

**Date**: 2025-06-25  
**Current Version**: 0.0.1-alpha  
**Status**: Planning Phase  

## 1. Versioning Strategy (Single Developer + Internal Team)

### Semantic Versioning Simplified

For internal tools with a single developer, use a simplified semantic versioning:

```
MAJOR.MINOR.PATCH-STAGE

Examples:
0.1.0-alpha   - Initial alpha release
0.1.1-alpha   - Bug fixes in alpha
0.2.0-beta    - New features, moving to beta
1.0.0         - First stable release
1.1.0         - New features added
1.0.1         - Bug fixes only
```

### Version Bumping Rules

- **PATCH** (0.0.X): Bug fixes, documentation updates, minor tweaks
- **MINOR** (0.X.0): New features, significant improvements, UI changes
- **MAJOR** (X.0.0): Breaking changes, major architectural shifts, database schema changes

### Stage Definitions

- **alpha**: Active development, expect breaking changes
- **beta**: Feature complete, testing phase
- **rc**: Release candidate, final testing
- **(none)**: Stable production release

## 2. Git Branching Strategy (Git Flow Simplified)

### Branch Structure

```
main            → Production (protected, requires PR)
├── develop     → Integration branch for next release
├── feature/*   → New features (merge to develop)
├── bugfix/*    → Bug fixes (merge to develop)
├── hotfix/*    → Emergency fixes (merge to main + develop)
└── release/*   → Release preparation (merge to main)
```

### Workflow Example

```bash
# 1. Start new feature
git checkout develop
git checkout -b feature/ai-model-selector

# 2. Work on feature
git add .
git commit -m "feat: add AI model selector dropdown"

# 3. Merge to develop
git checkout develop
git merge feature/ai-model-selector
git push origin develop

# 4. Create release
git checkout -b release/0.2.0
# Update version numbers, final testing
git checkout main
git merge release/0.2.0
git tag -a v0.2.0 -m "Release version 0.2.0"
git push origin main --tags
```

## 3. GitHub Repository Setup

### Fork Structure

```
your-username/boxiii (main development)
└── your-username/boxiii-production (production fork)
```

### Alternative: Single Repo with Environments

```
boxiii/
├── environments/
│   ├── staging/
│   │   └── values.yaml
│   └── production/
│       └── values.yaml
└── .github/
    └── workflows/
        ├── deploy-staging.yml
        └── deploy-production.yml
```

## 4. CI/CD Pipeline Implementation

### Phase 1: Basic CI (Week 1)

Create `.github/workflows/ci.yml`:

```yaml
name: CI Pipeline

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '22'
    
    - name: Install backend dependencies
      run: |
        cd builder/backend
        pip install -r requirements.txt
        pip install pytest pytest-cov
    
    - name: Install frontend dependencies
      run: |
        cd builder/frontend
        npm install
    
    - name: Run backend tests
      run: |
        cd builder/backend
        pytest tests/ -v
    
    - name: Run frontend tests
      run: |
        cd builder/frontend
        npm test
    
    - name: Build frontend
      run: |
        cd builder/frontend
        npm run build
```

### Phase 2: Docker Build & Registry (Week 2)

Create `.github/workflows/build.yml`:

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    strategy:
      matrix:
        service: [backend, frontend]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Log in to GitHub Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.service }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          type=sha
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: ./builder/${{ matrix.service }}
        file: ./builder/${{ matrix.service }}/Dockerfile.prod
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
```

### Phase 3: Automated Deployment (Week 3)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
        - staging
        - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to VPS
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USER }}
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd /var/www/boxiii
          git pull origin main
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d
          docker-compose -f docker-compose.prod.yml ps
```

## 5. Database Migration Strategy

### Install Alembic

```bash
cd builder/backend
pip install alembic
alembic init alembic
```

### Configure Alembic

Edit `alembic.ini`:
```ini
sqlalchemy.url = postgresql://%(DB_USER)s:%(DB_PASSWORD)s@%(DB_HOST)s/%(DB_NAME)s
```

### Create Initial Migration

```bash
# Generate migration from current database
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head
```

### Deployment Integration

Add to deployment script:
```bash
# Run database migrations
docker-compose exec backend alembic upgrade head
```

## 6. Environment Configuration

### GitHub Secrets Structure

```
Repository Secrets:
├── VPS_HOST
├── VPS_USER
├── VPS_SSH_KEY
├── DB_PASSWORD_STAGING
├── DB_PASSWORD_PRODUCTION
├── JWT_SECRET_STAGING
├── JWT_SECRET_PRODUCTION
├── GEMINI_API_KEY
├── CLAUDE_API_KEY
└── OPENAI_API_KEY
```

### Environment Files

Create `.env.staging` and `.env.production` templates:
```bash
# .env.staging
ENVIRONMENT=staging
DATABASE_URL=postgresql://boxiii:${DB_PASSWORD_STAGING}@db:5432/boxiii_staging
JWT_SECRET=${JWT_SECRET_STAGING}
```

## 7. Monitoring and Rollback

### Health Checks

Add to `docker-compose.prod.yml`:
```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Rollback Strategy

```bash
#!/bin/bash
# rollback.sh
PREVIOUS_VERSION=$1
cd /var/www/boxiii
git fetch --tags
git checkout $PREVIOUS_VERSION
docker-compose -f docker-compose.prod.yml up -d
```

## 8. Implementation Timeline

### Week 1: Foundation
- [ ] Fix database schema mismatch
- [ ] Set up GitHub Actions CI
- [ ] Create test structure
- [ ] Document versioning strategy

### Week 2: Containerization
- [ ] Configure GitHub Container Registry
- [ ] Update deployment scripts
- [ ] Test image push/pull workflow
- [ ] Create staging environment

### Week 3: Automation
- [ ] Implement deployment workflows
- [ ] Add database migrations
- [ ] Set up monitoring
- [ ] Document rollback procedures

### Week 4: Polish
- [ ] Add integration tests
- [ ] Implement blue-green deployment
- [ ] Add performance monitoring
- [ ] Complete documentation

## 9. Version Management

### Version Files

1. `version.txt` in repository root
2. `package.json` for frontend
3. `__version__.py` for backend
4. Git tags for releases

### Automated Version Bumping

Create `.github/workflows/version-bump.yml`:
```yaml
name: Version Bump

on:
  workflow_dispatch:
    inputs:
      version_type:
        description: 'Version type'
        required: true
        type: choice
        options:
        - patch
        - minor
        - major

jobs:
  bump:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Bump version
      run: |
        # Update version files
        # Create git tag
        # Push changes
```

## 10. Quick Start Commands

```bash
# Check current version
cat version.txt

# Start new feature
git checkout develop
git checkout -b feature/new-feature

# Create release
git checkout -b release/0.2.0
# Update version.txt to 0.2.0
git commit -m "chore: bump version to 0.2.0"
git checkout main
git merge release/0.2.0
git tag -a v0.2.0 -m "Release version 0.2.0"
git push origin main --tags

# Deploy to staging
gh workflow run deploy.yml -f environment=staging

# Deploy to production
gh workflow run deploy.yml -f environment=production
```

---

**Next Steps**: Start with Phase 1 (Basic CI) and fix the database schema mismatch immediately.